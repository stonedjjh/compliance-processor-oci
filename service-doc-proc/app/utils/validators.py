import os
from typing import List, Optional
from fastapi import HTTPException, status

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_file_size(file_content: bytes):
    """Valida que el archivo no exceda el límite permitido."""
    size = len(file_content)
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"El archivo excede el límite de {MAX_FILE_SIZE // (1024 * 1024)}MB",
        )


def validate_file_extension(
    filename: str, allowed_extensions: Optional[List[str]] = None
):
    """Valida si la extensión está permitida. Soporta '*' para permitir todas."""
    if not allowed_extensions or "*" in allowed_extensions:
        return

    extension = os.path.splitext(filename)[1].lower()
    allowed_lower = [ext.lower() for ext in allowed_extensions]

    if extension not in allowed_lower:
        allowed_str = ", ".join(allowed_extensions)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Extensión {extension} no permitida. Permitidas: {allowed_str}",
        )


def validate_file_upload(
    file_content: bytes, filename: str, allowed_extensions: Optional[List[str]] = None
):
    """Orquestador de validaciones para el endpoint de carga."""
    validate_file_size(file_content)
    validate_file_extension(filename, allowed_extensions)
