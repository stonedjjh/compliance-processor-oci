from app.internal import mongodb
from typing import cast


async def mongodb_add_register(log_record: dict):
    """Función auxiliar para agregar un registro a MongoDB.
    Esto se separa para mantener el controller limpio y facilitar pruebas unitarias.
    (log_record: dict) -> None
    """
    try:
        payload = cast(
            mongodb.AuditEvent,
            {
                "event_type": log_record.get("event_type", "unknown"),
                "document_id": log_record.get("document_id", "unknown"),
                "details": log_record.get("details", {}),
            },
        )

        if "user_id" in log_record:
            payload["user_id"] = log_record["user_id"]

        await mongodb.add_register(payload)
    except Exception as e:
        print(f"Error al registrar en MongoDB: {e}")
