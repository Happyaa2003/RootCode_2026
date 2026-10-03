"""
RAG (Retrieval-Augmented Generation) Service for WayPilot AI Assistant.
Combines live in-memory telemetry, ground operations data, and Google Gemini API
to answer complex dispatch, routing, SLA, and fleet queries with real-time ground truth.
"""

import json
import logging
from typing import List, Dict, Any, Optional, Tuple
import google.generativeai as genai

from app.core.config import settings
from app.services.store import store
from app.services.seed_data import get_cached_dataset

logger = logging.getLogger(__name__)

# Configure Gemini API if key is present
_gemini_configured = False
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_configured = True
    except Exception as e:
        logger.warning(f"Could not configure Gemini API: {e}")


def retrieve_context(query: str) -> Tuple[str, Dict[str, Any], str]:
    """
    RAG Retrieval Stage:
    Extracts relevant real-time telemetry from the in-memory data store
    and historical seed dataset based on semantic entities in the user query.
    Returns:
        context_text: Formatted string to inject into LLM system prompt.
        context_data: JSON-serializable dictionary for UI cards.
        inferred_intent: High-level classification of the query.
    """
    q = query.lower()
    kpis = store.get_kpis()
    orders = store.orders
    routes = store.routes
    vehicles = store.vehicles
    drivers = store.drivers
    depots = store.depots

    context_lines = []
    data: Dict[str, Any] = {
        "kpis": {
            "totalOrders": kpis.totalOrders,
            "planned": kpis.planned,
            "unassigned": kpis.unassigned,
            "atRisk": kpis.atRisk,
            "activeVehicles": kpis.activeVehicles,
            "onSchedule": kpis.onSchedule,
            "completed": kpis.completed,
            "totalItemValue": kpis.totalItemValue,
            "totalDeliveryCost": kpis.totalDeliveryCost,
            "netMargin": kpis.netDeliveryMargin,
            "costPercentage": kpis.costPercentage,
        }
    }

    # Core Live Operational Snapshot
    context_lines.append("=== LIVE OPERATIONAL SNAPSHOT (GROUND TRUTH) ===")
    context_lines.append(f"• Total Orders: {kpis.totalOrders} (Planned: {kpis.planned}, Unassigned: {kpis.unassigned}, Completed: {kpis.completed})")
    context_lines.append(f"• At-Risk Deliveries: {kpis.atRisk} | On Schedule: {kpis.onSchedule}")
    context_lines.append(f"• Active Fleet: {kpis.activeVehicles} vehicles | Total Vehicles: {len(vehicles)}")
    context_lines.append(f"• Financials: Cargo Value ${kpis.totalItemValue:,.2f} | Delivery Cost ${kpis.totalDeliveryCost:,.2f} | Net Margin ${kpis.netDeliveryMargin:,.2f} ({kpis.costPercentage}% cost ratio)")
    context_lines.append(f"• Depots: {', '.join(d.name for d in depots)}")

    inferred_intent = "general_ops"

    # 1. At Risk / Delays / Exceptions
    if any(k in q for k in ["risk", "delay", "late", "behind", "danger", "exception", "problem", "urgent"]):
        inferred_intent = "at_risk"
        delayed = [o for o in orders if o.status == "At Risk" or (o.delayMinutes and o.delayMinutes > 0)]
        delayed.sort(key=lambda o: (o.delayMinutes or 0), reverse=True)
        top_delayed = delayed[:8]

        context_lines.append("\n=== AT-RISK & DELAYED DELIVERIES ===")
        delays_data = []
        for o in top_delayed:
            assigned_route = next((r.name for r in routes if r.id == o.routeId), "Unassigned")
            context_lines.append(
                f"• Order {o.id} | Outlet: {o.outlet.name} ({o.district}) | Brand: {o.brand} | "
                f"Window: {o.window.start}-{o.window.end} | Delay: {o.delayMinutes or 0}m | Status: {o.status} | Route: {assigned_route}"
            )
            delays_data.append({
                "id": o.id,
                "outlet": o.outlet.name,
                "district": o.district,
                "delayMinutes": o.delayMinutes or 0,
                "status": o.status,
                "route": assigned_route
            })
        data["count"] = len(delayed)
        data["orders"] = delays_data
        data["delayedOrders"] = delays_data

    # 2. Fleet & Fuel Telemetry
    if any(k in q for k in ["fleet", "vehicle", "truck", "van", "fuel", "gas", "diesel", "ev", "reefer"]):
        inferred_intent = "fleet_status"
        total_consumed = sum(v.fuelConsumedL or 0 for v in vehicles)
        total_quota = sum(v.weeklyFuelQuotaL or 0 for v in vehicles)
        active_v = [v for v in vehicles if v.status == "Active"]
        idle_v = [v for v in vehicles if v.status == "Idle"]

        context_lines.append("\n=== FLEET & FUEL TELEMETRY ===")
        context_lines.append(f"• Active Vehicles: {len(active_v)} | Idle: {len(idle_v)} | Total: {len(vehicles)}")
        context_lines.append(f"• Fuel Consumed: {total_consumed:.1f}L / Weekly Quota: {total_quota:.1f}L ({(total_consumed/max(total_quota,1)*100):.1f}% utilized)")
        
        sample_vehicles = vehicles[:6]
        v_list = []
        for v in sample_vehicles:
            depot_name = getattr(v, 'depotId', None) or "Peliyagoda Central"
            context_lines.append(f"• {v.plate} ({v.type}) | Depot: {depot_name} | Status: {v.status} | Fuel: {v.fuelConsumedL}L/{v.weeklyFuelQuotaL}L")
            v_list.append({"plate": v.plate, "type": v.type, "status": v.status, "fuel": v.fuelConsumedL})
        data["activeVehicles"] = len(active_v)
        data["idle"] = len(idle_v)
        data["totalVehicles"] = len(vehicles)
        data["offline"] = kpis.offline
        data["fleetSample"] = v_list

    # 3. Drivers & SLA Performance
    if any(k in q for k in ["driver", "who", "performance", "speed", "nimal", "kamal", "sunil", "roshan"]):
        inferred_intent = "drivers"
        driver_stats = []
        for r in routes:
            if r.driver:
                delays = sum(getattr(s.order, 'delayMinutes', 0) or 0 for s in r.stops)
                on_time = sum(1 for s in r.stops if not getattr(s.order, 'delayMinutes', 0))
                driver_stats.append({
                    "name": r.driver.name,
                    "route": r.name,
                    "stops": len(r.stops),
                    "totalDelayMin": delays,
                    "onTimeStops": on_time,
                })
        driver_stats.sort(key=lambda d: d["totalDelayMin"], reverse=True)
        context_lines.append("\n=== DRIVER SLA & ON-TIME METRICS ===")
        for d in driver_stats:
            context_lines.append(f"• {d['name']} ({d['route']}): {d['stops']} stops, {d['onTimeStops']} on-time, {d['totalDelayMin']}m total delay")
        data["drivers"] = driver_stats

    # 4. Route Planning & Schedules
    if any(k in q for k in ["route", "schedule", "plan", "stops", "turnaround", "capacity"]):
        inferred_intent = "routes"
        context_lines.append("\n=== ACTIVE DISPATCH ROUTES ===")
        route_list = []
        for r in routes[:6]:
            driver_name = r.driver.name if r.driver else "Unassigned"
            plate = r.vehicle.plate if r.vehicle else "No Vehicle"
            context_lines.append(f"• Route {r.name} ({r.id}) | Driver: {driver_name} | Vehicle: {plate} | Stops: {len(r.stops)} | Status: {r.status} | ETA Finish: {r.estimatedFinish or 'N/A'}")
            route_list.append({"id": r.id, "name": r.name, "driver": driver_name, "stops": len(r.stops)})
        data["routes"] = route_list

    # 5. Financials / Costs / Margins
    if any(k in q for k in ["cost", "margin", "profit", "price", "revenue", "money", "expensive", "dollar", "lkr"]):
        inferred_intent = "economics"
        context_lines.append("\n=== ROUTE & CARGO ECONOMICS ===")
        context_lines.append(f"• Total Goods Value: ${kpis.totalItemValue:,.2f}")
        context_lines.append(f"• Total Direct Delivery Cost: ${kpis.totalDeliveryCost:,.2f}")
        context_lines.append(f"• Net Delivery Margin: ${kpis.netDeliveryMargin:,.2f}")
        context_lines.append(f"• Avg Delivery Cost per Drop: ${kpis.avgCostPerDelivery:,.2f}")
        context_lines.append(f"• Cost-to-Value Ratio: {kpis.costPercentage}%")
        data["totalItemValue"] = kpis.totalItemValue
        data["totalDeliveryCost"] = kpis.totalDeliveryCost
        data["netMargin"] = kpis.netDeliveryMargin
        data["avgCostPerDelivery"] = kpis.avgCostPerDelivery
        data["costPct"] = kpis.costPercentage

    # 6. Forecast & Demand Scenarios
    if any(k in q for k in ["forecast", "demand", "peak", "prediction", "scenario", "season", "festive"]):
        inferred_intent = "forecast"
        cached = get_cached_dataset()
        cases = cached.get("task2aForecastInputs", [])
        scenarios = cached.get("task2bPeakScenarios", [])
        context_lines.append("\n=== DEMAND FORECAST & PEAK SCENARIOS ===")
        context_lines.append(f"• Forecast Training Cases: {len(cases)} cases across ISO weeks 14-16 in 2026")
        context_lines.append(f"• Peak Day Scenarios: {len(scenarios)} multi-brand scenarios (Fresh/Style/Tech) with street and rear dock loading rules")
        data["forecastCases"] = len(cases)
        data["peakScenarios"] = len(scenarios)

    # Specific District Search
    for dist in ["colombo", "kandy", "gampaha", "galle", "kurunegala", "kalutara", "matara", "badulla"]:
        if dist in q:
            dist_orders = [o for o in orders if o.district.lower() == dist]
            context_lines.append(f"\n=== DISTRICT HIGHLIGHT: {dist.upper()} ===")
            context_lines.append(f"• {len(dist_orders)} orders in {dist.capitalize()}")
            for o in dist_orders[:5]:
                context_lines.append(f"  - {o.id}: {o.outlet.name} | {o.brand} | Status: {o.status} | Weight: {o.weight}kg")
            data[f"district_{dist}"] = len(dist_orders)

    return "\n".join(context_lines), data, inferred_intent


async def ask_gemini_rag(message: str, history: Optional[List[Dict[str, str]]] = None) -> Tuple[str, str, Dict[str, Any]]:
    """
    RAG Generation Stage:
    1. Retrieves live operational context.
    2. Builds augmented prompt with ground truth and conversation history.
    3. Calls Gemini (gemini-3.8-flash) for reasoning and insight generation.
    4. Seamlessly falls back to deterministic rule-based response if Gemini fails.
    """
    context_text, context_data, inferred_intent = retrieve_context(message)

    # System instruction with strict grounding on retrieved telemetry
    system_instruction = (
        "You are WayPilot AI, the real-time AI Fleet & Dispatch Co-pilot for Sri Lanka's leading "
        "retail FMCG distribution network (serving Peliyagoda Central Depot, Kandy Valley Hub, and 120 retail outlets).\n\n"
        "RULES:\n"
        "1. GROUND TRUTH: Base all factual operational statements strictly on the provided LIVE OPERATIONAL SNAPSHOT and context.\n"
        "2. FORMATTING: Use clean GitHub Markdown with bold headings, bullet points, and appropriate emojis (📦, ⚠️, 🚛, ⏱️, ⛽, 💰, ✅).\n"
        "3. TONE: Professional, alert, actionable, and operations-focused. Directly answer what the dispatcher or logistics planner is asking.\n"
        "4. RECOMMENDATIONS: Where appropriate, suggest proactive operational interventions (e.g. re-assigning at-risk orders, optimizing routes, monitoring driver delays).\n"
        "5. Keep responses concise (typically 2-4 short bulleted sections), avoid unnecessary pleasantries, and highlight urgent delivery alerts prominently."
    )

    prompt_content = f"{context_text}\n\nUSER DISPATCHER QUERY:\n{message}"

    # Try Gemini LLM Generation
    if _gemini_configured and settings.GEMINI_API_KEY:
        import asyncio
        models_to_try = [
            settings.GEMINI_MODEL or "gemini-3.8-flash",
            "gemini-3.5-flash-lite",
        ]

        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_instruction
                )

                def _call_gemini():
                    if history:
                        chat_history = []
                        for turn in history[-4:]:
                            role = "user" if turn.get("role") == "user" else "model"
                            chat_history.append({
                                "role": role,
                                "parts": [turn.get("content", "")]
                            })
                        chat = model.start_chat(history=chat_history)
                        return chat.send_message(prompt_content)
                    else:
                        return model.generate_content(prompt_content)

                # Execute in thread pool with 16s timeout
                response = await asyncio.wait_for(asyncio.to_thread(_call_gemini), timeout=16.0)

                if response and response.text:
                    return response.text.strip(), inferred_intent, context_data
            except Exception as e:
                logger.warning(f"Gemini generation with {model_name} failed: {e}. Trying next fallback...")
                continue

    # Deterministic fallback if Gemini is unreachable or key not active
    from app.api.endpoints.assistant import _format_reply
    reply = _format_reply(inferred_intent, context_data)
    return reply, inferred_intent, context_data
