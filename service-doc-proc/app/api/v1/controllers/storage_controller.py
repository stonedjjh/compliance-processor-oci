from fastapi import HTTPException
from app.utils.storage import StorageManager
from app.schemas import DocumentMetadata


async def storage_upload(metadata: DocumentMetadata) -> str:
    """Función auxiliar para subir archivos a S3 (MinIO) y obtener la ruta lógica.
    Esto se separa para mantener el controller limpio y facilitar pruebas unitarias.
    """
    try:
        storage = StorageManager()
        return storage.upload_file(metadata)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
