from fastapi import APIRouter, status, Depends
from sqlalchemy.orm import Session
from app.api.v1.controllers import healthcheck_controller
from app.internal.database import get_db

router = APIRouter(prefix="/health", tags=["health"])


# Endpoint para verificar el estado del servicio
@router.get("", status_code=status.HTTP_200_OK)
async def health_check(db: Session = Depends(get_db)):
    return await healthcheck_controller.health_check(db)
