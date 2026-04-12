from fastapi import status
from sqlalchemy.orm import Session
from app.internal.database import check_postgres_connection
from datetime import datetime, timezone
from fastapi.responses import JSONResponse
from app.internal import mongodb
from app.utils.storage import storage_manager


async def health_check(db: Session):
    # Verificamos ambos corazones
    postgres_ok = check_postgres_connection(db)
    mongo_ok = await mongodb.check_connection()
    storage_ok = storage_manager.check_health()

    # Determinamos el estado general
    is_healthy = postgres_ok and mongo_ok and storage_ok
    status_code = (
        status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    )

    return JSONResponse(
        status_code=status_code,
        content={
            "status": "UP" if is_healthy else "DOWN",
            "service": "document-processor",
            "message": "Activo y en servicio, Jefe. ¡Vamos con todo!"
            if is_healthy
            else "Tenemos problemas técnicos, Jefe.",
            "components": {
                "postgres": "OK" if postgres_ok else "ERROR",
                "mongodb": "OK" if mongo_ok else "ERROR",
                "storage": "OK" if storage_ok else "ERROR",
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )
