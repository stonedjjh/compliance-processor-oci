import uuid
import os
from fastapi import (
    FastAPI,
    File,
    UploadFile,
    Depends,
    HTTPException,
    status,
    Query,
)
from fastapi.responses import JSONResponse
from .internal.database import engine, get_db, check_postgres_connection
from sqlalchemy.orm import Session
from .internal import models, database
from app.utils.validators import validate_file_upload
from . import schemas
from .internal import mongodb
from datetime import datetime, timezone

from app.utils.storage import StorageManager, storage_manager

from fastapi import Security
from fastapi.security.api_key import APIKeyHeader
from app.utils.notifier import notify_document_processed

from sqlalchemy import desc

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


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Document Processing Service")


@app.get("/")
def read_root():
    return {"message": "Servicio de Procesamiento de Documentos Activo"}


# Endpoint para verificar el estado del servicio
@app.get("/api/v1/health", status_code=status.HTTP_200_OK)
async def health_check(db: Session = Depends(get_db)):
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


@app.post(
    "/api/v1/documents/upload",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Security(get_api_key)],
)
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):

    filename = file.filename
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nombre de archivo no válido",
        )

    file_id = str(uuid.uuid4())

    content = await file.read()
    validate_file_upload(content, filename, allowed_extensions=[".txt"])

    try:
        storage = StorageManager()
        unique_filename = f"{uuid.uuid4()}-{file.filename}"
        storage_path = storage.upload_file(
            content, unique_filename, file.content_type or "application/octet-stream"
        )

        try:
            original_filename = file.filename.encode('latin-1').decode('utf-8')
        except (UnicodeEncodeError, UnicodeDecodeError):
            original_filename = file.filename

        
        new_doc = models.Document(
            id=file_id,
            filename=original_filename,
            content_type=file.content_type,
            status="Recibido",
            storage_path=storage_path,
        )

        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)

        await mongodb.add_register(
            {
                "event_type": "DOCUMENT_UPLOADED",
                "document_id": file_id,
                "details": {"filename": filename, "status": "SUCCESS"},
            }
        )

        await notify_document_processed(
            document_id=str(file_id),
            status="Recibido",
            message="Archivo Guardado",
            filename=original_filename
        )

    except Exception as e:
        if "db" in locals():
            db.rollback()
        print(f"DEBUG - Error en Upload: {str(e)}")
        print(f"Error en base de datos relacional: {e}")
        try:
            await mongodb.add_register(
                {
                    "event_type": "DOCUMENT_UPLOAD_FAILED",
                    "document_id": file_id,
                    "details": {"error": str(e), "filename": filename},
                }
            )
        except Exception as e:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al registrar el documento en la base de datos principal",
        )

    return {
        "message": "Archivo subido y registrado exitosamente",
        "id": file_id,
        "status": "Recibido",
        "filename": original_filename,
        "storage_path": storage_path,
    }


@app.get(
    "/api/v1/documents",
    response_model=list[schemas.DocumentOut],
    status_code=status.HTTP_200_OK,
    dependencies=[Security(get_api_key)],
)
async def get_documents(
    skip: int = Query(0, ge=0),
    limit: schemas.PageLimit = schemas.PageLimit.MEDIUM,
    db: Session = Depends(database.get_db),
):
    try:
        return db.query(models.Document).order_by(desc(models.Document.created_at)).offset(skip).limit(limit.value).all()
    except Exception as e:
        print(f"Error al obtener documentos: {e}")
        raise HTTPException(
            status_code=500, detail="Error al consultar la base de datos"
        )


@app.get(
    "/api/v1/documents/{id}",
    response_model=schemas.DocumentOut,
    status_code=status.HTTP_200_OK,
    dependencies=[Security(get_api_key)],
)
async def get_document(id: uuid.UUID, db: Session = Depends(database.get_db)):
    try:
        db_document = db.query(models.Document).filter(models.Document.id == id).first()
        if not db_document:
            raise HTTPException(status_code=404, detail="Documento no encontrado")
        return db_document
    except HTTPException:
        raise  # Re-lanzamos el 404 tal cual
    except Exception as e:
        print(f"Error al obtener documento {id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@app.post(
    "/api/v1/documents/{id}/process",
    status_code=status.HTTP_200_OK,
    dependencies=[Security(get_api_key)],
)
async def process_document(id: uuid.UUID, db: Session = Depends(database.get_db)):
    db_document = db.query(models.Document).filter(models.Document.id == id).first()

    if not db_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado"
        )

    if db_document.status == "PROCESSED":
        return {
            "status": db_document.status,
            "message": "El documento ya fue procesado previamente.",
            "file_id": id,
        }

    try:
        db_document.status = "PROCESSED"
        db.commit()
        db.refresh(db_document)

        # 3. Auditoría de Éxito
        await mongodb.add_register(
            {
                "event_type": "DOCUMENT_PROCESSED",
                "document_id": str(id),
                "details": {"status": "PROCESSED", "executor": "system_v1"},
            }
        )

        await notify_document_processed(
            document_id=str(id),
            status="PROCESSED",
            message="Análisis de cumplimiento finalizado",
        )

        return db_document

    except Exception as e:
        db.rollback()  # Crucial: si falla el commit, volvemos atrás
        print(f"Error en procesamiento de {id}: {e}")

        # 4. Auditoría de Fallo
        await mongodb.add_register(
            {
                "event_type": "PROCESS_FAILED",
                "document_id": str(id),
                "details": {"error": str(e), "current_status": db_document.status},
            }
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al actualizar el estado del documento",
        )
