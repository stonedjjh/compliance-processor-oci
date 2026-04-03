from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
from typing import TypedDict, Any

MONGO_URL = os.getenv("MONGO_URL")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "compliance_db")
IS_TESTING = os.getenv("ENV") == "test"

client = AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB_NAME]


class AuditEvent(TypedDict):
    event_type: str
    document_id: str
    details: dict[str, Any]


async def add_register(event: AuditEvent):
    """
    Responsabilidad única: Persistir eventos de auditoría.
    """
    if IS_TESTING:
        print(f"[TEST-MODE] Auditoría simulada: {event['event_type']}")
        return

    # Agregamos el timestamp aquí automáticamente para no repetirlo
    document_to_insert = {**event, "timestamp": datetime.now(timezone.utc)}

    try:
        await db.audit_logs.insert_one(document_to_insert)
    except Exception as e:
        # Si falla Mongo, el 'print' es nuestro último recurso de log
        print(f"CRITICAL: MongoDB Audit Failure: {e} | Event: {event}")


async def check_connection():
    """Verifica si MongoDB responde."""
    try:
        await client.admin.command("ping")
        return True
    except Exception as e:
        print(f"Health Check Fallido en MongoDB: {e}")
        return False
