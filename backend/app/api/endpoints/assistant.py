"""
AI Delivery Assistant — keyword-matching intent engine.
Parses natural-language queries and returns formatted answers
sourced from the in-memory DataStore and seed dataset.
No external LLM required — works entirely on Koyeb's 0.1 vCPU.
"""

from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.store import store
from app.services.seed_data import get_cached_dataset

router = APIRouter()


class AssistantMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class AskRequest(BaseModel):
    message: str
    history: Optional[List[AssistantMessage]] = None


class AskResponse(BaseModel):
    reply: str
    intent: str
    data: Optional[dict] = None


# ──────────────────────────────────────────────────────────────
# Intent patterns — simple keyword matching for impressive demos
# ──────────────────────────────────────────────────────────────

def _match_intent(msg: str) -> tuple[str, dict]:
    """Matches user message to an intent and returns (intent_name, context_data)."""
    m = msg.lower().strip()

    # ─── KPI / Summary intents ─────────────────────────────
    if any(k in m for k in ["how many order", "total order", "order count", "number of order"]):
        kpis = store.get_kpis()
        return "order_count", {
            "total": kpis.totalOrders,
            "planned": kpis.planned,
            "unassigned": kpis.unassigned,
            "completed": kpis.completed,
        }

    if any(k in m for k in ["at risk", "risk order", "risky", "danger"]):
        kpis = store.get_kpis()
        orders = store.orders
        risk_orders = [o for o in orders if o.status == "At Risk"]
        risk_details = [
            {"id": o.id, "outlet": o.outlet.name, "district": o.district}
            for o in risk_orders[:5]
        ]
        return "at_risk", {
            "count": kpis.atRisk,
            "orders": risk_details,
        }

    if any(k in m for k in ["delay", "late", "behind schedule"]):
        orders = store.orders
        delayed = [o for o in orders if o.delayMinutes and o.delayMinutes > 0]
        delayed.sort(key=lambda o: o.delayMinutes or 0, reverse=True)
        top = [
            {"id": o.id, "outlet": o.outlet.name, "delay": o.delayMinutes}
            for o in delayed[:5]
        ]
        total_delay = sum(o.delayMinutes or 0 for o in delayed)
        return "delays", {
            "count": len(delayed),
            "totalDelayMin": total_delay,
            "avgDelay": round(total_delay / max(len(delayed), 1), 1),
            "top": top,
        }

    if any(k in m for k in ["fleet", "vehicle", "truck", "active vehicle"]):
        kpis = store.get_kpis()
        vehicles = store.vehicles
        active = [v for v in vehicles if v.status == "Active"]
        idle = [v for v in vehicles if v.status == "Idle"]
        return "fleet_status", {
            "activeVehicles": kpis.activeVehicles,
            "totalVehicles": len(vehicles),
            "idle": len(idle),
            "offline": kpis.offline,
        }

    if any(k in m for k in ["driver", "who is driving", "best driver", "worst driver", "most delay"]):
        routes = store.routes
        driver_stats = []
        for r in routes:
            if r.driver:
                delays = sum(
                    s.order.delayMinutes or 0
                    for s in r.stops
                    if s.order.delayMinutes
                )
                on_time = sum(
                    1 for s in r.stops
                    if not s.order.delayMinutes or s.order.delayMinutes == 0
                )
                driver_stats.append({
                    "name": r.driver.name,
                    "route": r.name,
                    "stops": len(r.stops),
                    "totalDelayMin": delays,
                    "onTimeStops": on_time,
                })
        driver_stats.sort(key=lambda d: d["totalDelayMin"], reverse=True)
        return "drivers", {"drivers": driver_stats}

    if any(k in m for k in ["route", "which route", "route info"]):
        routes = store.routes
        route_info = []
        for r in routes:
            route_info.append({
                "id": r.id,
                "name": r.name,
                "driver": r.driver.name if r.driver else "Unassigned",
                "stops": len(r.stops),
                "status": r.status,
                "vehicle": r.vehicle.plate if r.vehicle else "—",
                "estimatedFinish": r.estimatedFinish or "—",
            })
        return "routes", {"routes": route_info}

    if any(k in m for k in ["fuel", "fuel cost", "fuel consumed", "fuel usage"]):
        vehicles = store.vehicles
        total_consumed = sum(v.fuelConsumedL or 0 for v in vehicles)
        total_quota = sum(v.weeklyFuelQuotaL or 0 for v in vehicles)
        pct = round((total_consumed / max(total_quota, 1)) * 100, 1)
        return "fuel", {
            "totalConsumedL": round(total_consumed, 1),
            "totalQuotaL": round(total_quota, 1),
            "usagePct": pct,
        }

    if any(k in m for k in ["cost", "expense", "margin", "profit", "revenue"]):
        kpis = store.get_kpis()
        return "economics", {
            "totalItemValue": kpis.totalItemValue,
            "totalDeliveryCost": kpis.totalDeliveryCost,
            "netMargin": kpis.netDeliveryMargin,
            "avgCostPerDelivery": kpis.avgCostPerDelivery,
            "costPct": kpis.costPercentage,
        }

    if any(k in m for k in ["forecast", "demand", "prediction", "peak"]):
        data = get_cached_dataset()
        cases = data.get("task2aForecastInputs", [])
        scenarios = data.get("task2bPeakScenarios", [])
        return "forecast", {
            "forecastCases": len(cases),
            "peakScenarios": len(scenarios),
        }

    if any(k in m for k in ["kpi", "summary", "dashboard", "overview", "status"]):
        kpis = store.get_kpis()
        return "kpi_summary", {
            "totalOrders": kpis.totalOrders,
            "planned": kpis.planned,
            "unassigned": kpis.unassigned,
            "atRisk": kpis.atRisk,
            "activeVehicles": kpis.activeVehicles,
            "onSchedule": kpis.onSchedule,
            "completed": kpis.completed,
        }

    if any(k in m for k in ["hello", "hi", "hey", "help", "what can you"]):
        return "greeting", {}

    if any(k in m for k in ["thank", "thanks", "great", "nice", "awesome", "good job"]):
        return "thanks", {}

    # ─── Fallback ──────────────────────────────────────────
    return "unknown", {}


def _format_reply(intent: str, data: dict) -> str:
    """Formats a human-readable reply from intent and data with safe fallbacks."""

    if intent == "order_count":
        return (
            f"📦 **Current Order Summary**\n\n"
            f"• **Total Orders:** {data.get('total', 0)}\n"
            f"• **Planned:** {data.get('planned', 0)}\n"
            f"• **Unassigned:** {data.get('unassigned', 0)}\n"
            f"• **Completed:** {data.get('completed', 0)}"
        )

    if intent == "at_risk":
        count = data.get('count', len(data.get('orders', [])))
        lines = [f"⚠️ **{count} orders are currently At Risk**\n"]
        for o in data.get("orders", []):
            lines.append(f"• `{o.get('id', 'N/A')}` → {o.get('outlet', 'Outlet')} ({o.get('district', 'District')})")
        if count > 5:
            lines.append(f"\n_...and {count - 5} more_")
        return "\n".join(lines)

    if intent == "delays":
        count = data.get('count', len(data.get('top', [])))
        lines = [
            f"⏱️ **Delay Report**\n\n"
            f"• **{count} orders** are running late\n"
            f"• **Total delay:** {data.get('totalDelayMin', 0)} minutes\n"
            f"• **Avg delay:** {data.get('avgDelay', 0)} min per order\n\n"
            f"**Top delayed:**"
        ]
        for o in data.get("top", []):
            lines.append(f"• `{o.get('id', 'N/A')}` — {o.get('outlet', 'Outlet')} — **{o.get('delay', 0)}m late**")
        return "\n".join(lines)

    if intent == "fleet_status":
        return (
            f"🚛 **Fleet Status**\n\n"
            f"• **Active:** {data.get('activeVehicles', 0)} vehicles on the road\n"
            f"• **Idle:** {data.get('idle', 0)} at depot\n"
            f"• **Offline:** {data.get('offline', 0)}\n"
            f"• **Total Fleet:** {data.get('totalVehicles', 0)}"
        )

    if intent == "drivers":
        lines = ["👤 **Driver Performance**\n"]
        for d in data.get("drivers", []):
            status = "🟢" if d.get("totalDelayMin", 0) == 0 else "🟡" if d.get("totalDelayMin", 0) < 10 else "🔴"
            lines.append(
                f"{status} **{d.get('name', 'Driver')}** — {d.get('route', 'Route')} — "
                f"{d.get('stops', 0)} stops — {d.get('onTimeStops', 0)} on-time — "
                f"{d.get('totalDelayMin', 0)}m total delay"
            )
        return "\n".join(lines)

    if intent == "routes":
        lines = ["🗺️ **Active Routes**\n"]
        for r in data.get("routes", []):
            lines.append(
                f"• **{r.get('name', 'Route')}** ({r.get('id', '')}) — "
                f"Driver: {r.get('driver', 'Unassigned')} — "
                f"{r.get('stops', 0)} stops — "
                f"Status: {r.get('status', 'Active')} — "
                f"ETA Finish: {r.get('estimatedFinish', 'N/A')}"
            )
        return "\n".join(lines)

    if intent == "fuel":
        return (
            f"⛽ **Fuel Consumption**\n\n"
            f"• **Consumed:** {data.get('totalConsumedL', 0)}L\n"
            f"• **Weekly Quota:** {data.get('totalQuotaL', 0)}L\n"
            f"• **Usage:** {data.get('usagePct', 0)}% of quota"
        )

    if intent == "economics":
        return (
            f"💰 **Financial Summary**\n\n"
            f"• **Total Item Value:** ${data.get('totalItemValue', 0):,.2f}\n"
            f"• **Total Delivery Cost:** ${data.get('totalDeliveryCost', 0):,.2f}\n"
            f"• **Net Margin:** ${data.get('netMargin', 0):,.2f}\n"
            f"• **Avg Cost/Delivery:** ${data.get('avgCostPerDelivery', 0):,.2f}\n"
            f"• **Cost Ratio:** {data.get('costPct', 0):.1f}%"
        )

    if intent == "forecast":
        return (
            f"📈 **Demand Forecast**\n\n"
            f"• **Forecast Inputs:** {data.get('forecastCases', 0)} cases loaded\n"
            f"• **Peak Day Scenarios:** {data.get('peakScenarios', 0)} scenarios available\n\n"
            f"_Navigate to the Forecast page for detailed analysis._"
        )

    if intent == "kpi_summary" or intent == "general_ops":
        return (
            f"📊 **Operations Dashboard KPIs**\n\n"
            f"• Total Orders: **{data.get('totalOrders', data.get('kpis', {}).get('totalOrders', 0))}**\n"
            f"• Planned: **{data.get('planned', data.get('kpis', {}).get('planned', 0))}** | Unassigned: **{data.get('unassigned', data.get('kpis', {}).get('unassigned', 0))}**\n"
            f"• At Risk: **{data.get('atRisk', data.get('kpis', {}).get('atRisk', 0))}** ⚠️\n"
            f"• Active Fleet: **{data.get('activeVehicles', data.get('kpis', {}).get('activeVehicles', 0))}**\n"
            f"• On Schedule: **{data.get('onSchedule', data.get('kpis', {}).get('onSchedule', 0))}** ✅\n"
            f"• Completed: **{data.get('completed', data.get('kpis', {}).get('completed', 0))}** 🏁"
        )

    if intent == "greeting":
        return (
            "👋 **Hi! I'm the WayPilot AI Assistant.**\n\n"
            "I can help you with real-time operations data. Try asking:\n\n"
            "• _\"How many orders are at risk?\"_\n"
            "• _\"Show me driver performance\"_\n"
            "• _\"What's the fleet status?\"_\n"
            "• _\"Show fuel consumption\"_\n"
            "• _\"What are the delivery costs?\"_\n"
            "• _\"Give me a KPI summary\"_\n"
            "• _\"Which orders are delayed?\"_\n"
            "• _\"Show me route info\"_"
        )

    if intent == "thanks":
        return "🙌 You're welcome! Let me know if you need anything else about your fleet operations."

    return (
        "🤔 I didn't quite catch that. Here are some things I can help with:\n\n"
        "• **Orders** — _\"How many orders are at risk?\"_\n"
        "• **Fleet** — _\"What's the fleet status?\"_\n"
        "• **Drivers** — _\"Who has the most delays?\"_\n"
        "• **Routes** — _\"Show route info\"_\n"
        "• **Fuel** — _\"What's the fuel usage?\"_\n"
        "• **Costs** — _\"Show delivery costs\"_\n"
        "• **KPIs** — _\"Give me a dashboard summary\"_"
    )


@router.post("/ask", response_model=AskResponse)
async def ask_assistant(payload: AskRequest):
    """
    RAG-powered AI Assistant endpoint.
    Retrieves real-time ground truth from the DataStore and passes it
    to Google Gemini (gemini-3.8-flash) for reasoning, with automatic fallback.
    """
    try:
        from app.services.rag_service import ask_gemini_rag
        history_list = [h.model_dump() for h in payload.history] if payload.history else None
        reply, intent, data = await ask_gemini_rag(payload.message, history=history_list)
        return AskResponse(reply=reply, intent=intent, data=data)
    except Exception as e:
        # Ultimate fallback to deterministic matching if any service error occurs
        intent, data = _match_intent(payload.message)
        reply = _format_reply(intent, data)
        return AskResponse(reply=reply, intent=intent, data=data)
