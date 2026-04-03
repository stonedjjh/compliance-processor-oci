import uuid
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


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Document Processing Service")


@app.get("/")
def read_root():
    return {"message": "Servicio de Procesamiento de Documentos Activo"}


# Endpoint para verificar el estado del servicio
@app.get("/api/v1/health")
async def health_check(db: Session = Depends(get_db)):
    # Verificamos ambos corazones
    postgres_ok = check_postgres_connection(db)
    mongo_ok = await mongodb.check_connection()

    # Determinamos el estado general
    is_healthy = postgres_ok and mongo_ok
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
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@app.post("/api/v1/documents/upload", status_code=status.HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):

    filename = file.filename
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nombre de archivo no válido",
        )

    file_id = str(uuid.uuid4())

    content = await file.read()
    validate_file_upload(content, filename, allowed_extensions=[".pdf", ".docx"])

    try:
        # 1. Preparar objeto
        new_doc = models.Document(
            id=file_id,
            filename=file.filename,
            content_type=file.content_type,
            status="Recibido",
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

    except Exception as e:
        db.rollback()
        print(f"Error en base de datos relacional: {e}")
        await mongodb.add_register(
            {
                "event_type": "DOCUMENT_UPLOAD_FAILED",
                "document_id": file_id,
                "details": {"error": str(e), "filename": filename},
            }
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al registrar el documento en la base de datos principal",
        )

    return {
        "message": "Archivo registrado en BD",
        "id": file_id,
        "status": "Recibido",
        "filename": file.filename,
    }


@app.get(
    "/api/v1/documents",
    response_model=list[schemas.DocumentOut],
    status_code=status.HTTP_200_OK,
)
async def get_documents(
    skip: int = Query(0, ge=0),
    limit: schemas.PageLimit = schemas.PageLimit.MEDIUM,
    db: Session = Depends(database.get_db),
):

    try:
        return db.query(models.Document).offset(skip).limit(limit.value).all()
    except Exception as e:
        print(f"Error al obtener documentos: {e}")
        raise HTTPException(
            status_code=500, detail="Error al consultar la base de datos"
        )


@app.get(
    "/api/v1/documents/{id}",
    response_model=schemas.DocumentOut,
    status_code=status.HTTP_200_OK,
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


@app.post("/api/v1/documents/{id}/process", status_code=status.HTTP_200_OK)
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
