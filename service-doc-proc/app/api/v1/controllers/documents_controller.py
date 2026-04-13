"""
Document API Controller
"""

import uuid
from fastapi import HTTPException, status, UploadFile, Depends, Query
from sqlalchemy.orm import Session
from app import schemas
from .mongo_controller import mongodb_add_register
from .storage_controller import storage_upload
from .db_relationals_controller import db_create_document, db_get_documents
from app.internal import models, database
from app.utils.validators import validate_file_upload
from app.utils.notifier import DocumentLog, notify_document_processed


async def handle_upload(file: UploadFile, db: Session):
    """Maneja la lógica de subida de archivos, validación, almacenamiento y registro en DB.
    También se encarga de la auditoría de eventos relacionados con la subida.
    (file: UploadFile, db: Session) -> dict
    """
    filename = file.filename
    if not filename:
        raise HTTPException(status_code=400, detail="Nombre de archivo no válido")

    file_id = str(uuid.uuid4())
    content = await file.read()

    # =========================================================================
    # VALIDACIÓN DE ARCHIVO
    # IMPORTANTE: Si cambias las extensiones permitidas, debes actualizar
    # los casos de prueba en tests/test_main.py (MIME types y contenido).
    # =========================================================================
    validate_file_upload(content, filename, allowed_extensions=[".txt"])

    try:
        unique_filename = f"{uuid.uuid4()}-{filename}"
        metadata = schemas.DocumentMetadata(
            filename=unique_filename,
            content_type=file.content_type or "application/octet-stream",
            file_content=content,
        )
        storage_path = await storage_upload(metadata)

        try:
            original_filename = filename.encode("latin-1").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            original_filename = filename

        new_doc = models.Document(
            id=file_id,
            filename=original_filename,
            content_type=file.content_type,
            status="Recibido",
            storage_path=storage_path,
        )

        db_create_document(db, new_doc)
        log_record = {
            "event_type": "DOCUMENT_UPLOADED",
            "document_id": file_id,
            "details": {"filename": original_filename, "status": "SUCCESS"},
        }

        await mongodb_add_register(log_record)

        log_record = DocumentLog(
            str(file_id), "Recibido", "Archivo Guardado", original_filename
        )
        await notify_document_processed(log_record)

        return {
            "message": "Archivo subido y registrado exitosamente",
            "id": file_id,
            "status": "Recibido",
            "filename": original_filename,
            "storage_path": storage_path,
        }

    except Exception as e:
        await mongodb_add_register(
            {
                "event_type": "DOCUMENT_UPLOAD_FAILED",
                "document_id": file_id,
                "details": {"error": str(e), "filename": filename},
            }
        )
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


async def get_documents(
    skip: int = Query(0, ge=0),
    limit: schemas.PageLimit = schemas.PageLimit.MEDIUM,
    db: Session = Depends(database.get_db),
):

    try:
        return db_get_documents(skip, limit, db)
    except Exception as e:
        print(f"Error al obtener documentos: {e}")
        raise HTTPException(
            status_code=500, detail="Error al consultar la base de datos"
        )


async def get_by_id(id: uuid.UUID, db: Session):
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


async def process_document(id: uuid.UUID, db: Session):
    # db_document = db.query(models.Document).filter(models.Document.id == id).first()
    db_document = await get_by_id(id, db)

    if db_document.status == "PROCESSED":
        return {
            "status": db_document.status,
            "message": "El documento ya fue procesado previamente.",
            "file_id": id,
        }

    print("Intento guardar en mogodb")
    try:
        db_document.status = "PROCESSED"
        db.commit()
        db.refresh(db_document)

        # 3. Auditoría de Éxito
        await mongodb_add_register(
            {
                "event_type": "DOCUMENT_PROCESSED",
                "document_id": str(id),
                "details": {"status": "PROCESSED", "executor": "system_v1"},
            }
        )

        log_record = DocumentLog(
            str(id),
            "PROCESSED",
            "Análisis de cumplimiento finalizado",
            db_document.filename,
        )
        await notify_document_processed(log_record)

        return db_document

    except Exception as e:
        db.rollback()  # Crucial: si falla el commit, volvemos atrás
        print(f"Error en procesamiento de {id}: {e}")

        # 4. Auditoría de Fallo
        await mongodb_add_register(
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
