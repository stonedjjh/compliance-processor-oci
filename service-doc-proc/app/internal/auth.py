import os
from fastapi import Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader

API_KEY_NAME = "X-API-KEY"
API_KEY_SECRET = os.getenv("API_KEY_SECRET", "mi_clave_secreta_super_segura_123")

api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)


async def get_api_key(api_key_header_value: str = Security(api_key_header)):
    if api_key_header_value == API_KEY_SECRET:
        return api_key_header_value

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="No tienes permisos para acceder a este recurso (API Key inválida)",
    )
