"""
Authentication API Controller
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, models
from app.internal import auth_utils
from .mongo_controller import mongodb_add_register


async def register_user(user_data: schemas.UserCreate, db: Session):
    """
    Maneja el registro de nuevos analistas.
    Valida la existencia previa, hashea la contraseña y audita el evento.
    """

    # 1. Verificar existencia previa
    existing_user = (
        db.query(models.User).filter(models.User.email == user_data.email).first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado",
        )

    try:
        # 2. Preparar el registro con password hasheado
        hashed_pwd = auth_utils.hash_password(user_data.password)

        new_user = models.User(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_pwd,
            is_active=True,
            must_change_password=True,
        )

        # 3. Persistencia en PostgreSQL
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # 4. Auditoría en MongoDB (Siguiendo tu patrón)
        await mongodb_add_register(
            {
                "event_type": "USER_REGISTERED",
                "user_id": str(new_user.id),
                "details": {"email": new_user.email, "status": "SUCCESS"},
            }
        )

        return new_user

    except Exception as e:
        db.rollback()
        await mongodb_add_register(
            {
                "event_type": "USER_REGISTRATION_FAILED",
                "details": {"error": str(e), "email": user_data.email},
            }
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al registrar usuario: {str(e)}",
        )


async def validate_user_credentials(credentials: schemas.UserLogin, db: Session):
    """
    Valida las credenciales del analista contra PostgreSQL.
    No genera JWT (responsabilidad del BFF), solo confirma identidad.
    """
    print("--- DEBUG LOGIN ---")
    print(f"Email: {credentials.email}")
    print(f"Password Length (chars): {len(credentials.password)}")
    # ... resto del código

    try:
        user = (
            db.query(models.User).filter(models.User.email == credentials.email).first()
        )

        if not user:
            # Auditoría de intento fallido por usuario no encontrado
            await mongodb_add_register(
                {
                    "event_type": "LOGIN_ATTEMPT_FAILED",
                    "details": {
                        "email": credentials.email,
                        "reason": "Invalid credentials",
                    },
                }
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            )

        if not user.is_active:
            # Auditoría de intento fallido por cuenta inactiva
            await mongodb_add_register(
                {
                    "event_type": "LOGIN_ATTEMPT_FAILED",
                    "details": {
                        "email": credentials.email,
                        "reason": "Inactive account",
                    },
                }
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="La cuenta se encuentra inactiva. Contacte al administrador.",
            )

        if not auth_utils.verify_password(credentials.password, user.hashed_password):
            # Auditoría de intento fallido por contraseña incorrecta
            await mongodb_add_register(
                {
                    "event_type": "LOGIN_ATTEMPT_FAILED",
                    "details": {
                        "email": credentials.email,
                        "reason": "Invalid password",
                    },
                }
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            )

        # Auditoría de éxito
        await mongodb_add_register(
            {
                "event_type": "LOGIN_SUCCESSFUL",
                "user_id": str(user.id),
                "details": {"email": user.email},
            }
        )

        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": "analyst",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en validación de identidad: {str(e)}",
        )
