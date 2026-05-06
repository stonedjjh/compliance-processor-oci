from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app import schemas
from app.api.v1.controllers import auth_controller
from app.internal import database
from app.internal.auth import get_api_key  # Tu validación S2S existente

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    dependencies=[Depends(get_api_key)]  # Protegemos todas las rutas con la X-API-KEY
)

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: schemas.UserCreate, 
    db: Session = Depends(database.get_db)
):
    """
    Endpoint para el registro de nuevos analistas.
    Solo accesible si la petición incluye una X-API-KEY válida.
    """
    return await auth_controller.register_user(user_data, db)

@router.post("/validate-credentials")
async def validate(
    credentials: schemas.UserLogin, 
    db: Session = Depends(database.get_db)
):
    """
    Endpoint que valida la identidad del usuario contra PostgreSQL.
    Retorna la data del usuario para que el BFF firme el JWT.
    """
    return await auth_controller.validate_user_credentials(credentials, db)