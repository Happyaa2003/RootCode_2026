import asyncio
import json
import random
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass


manager = ConnectionManager()


@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    Simulates live GPS vehicle coordinates movement streaming to dispatchers.
    """
    await manager.connect(websocket)
    try:
        # Initial connect ack
        await websocket.send_text(json.dumps({"type": "CONNECTION_ESTABLISHED", "clientCount": len(manager.active_connections)}))
        
        # Base vehicle coordinates for simulation
        sim_vehicles = [
            {"id": "WP-VEH-01", "lat": 6.9600, "lng": 79.8890, "speed": 34.5, "status": "En Route"},
            {"id": "WP-VEH-02", "lat": 6.9420, "lng": 79.8650, "speed": 22.0, "status": "En Route"},
            {"id": "WP-VEH-03", "lat": 6.9800, "lng": 79.9120, "speed": 40.0, "status": "En Route"},
        ]
        
        while True:
            # Jitter positions to simulate real-time driving
            for v in sim_vehicles:
                v["lat"] += (random.random() - 0.5) * 0.0008
                v["lng"] += (random.random() - 0.5) * 0.0008
                v["heading"] = random.randint(0, 360)
                
            await websocket.send_text(json.dumps({
                "type": "FLEET_TELEMETRY_UPDATE",
                "timestamp": asyncio.get_event_loop().time(),
                "vehicles": sim_vehicles
            }))
            await asyncio.sleep(3.0)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
