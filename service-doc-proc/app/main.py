import uuid
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status, Path
from .database import engine
from sqlalchemy.orm import Session
from app.database import get_db
from . import models, database
from app.utils.validators import validate_file_upload


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Document Processing Service")


@app.get("/")
def read_root():
    return {"message": "Servicio de Procesamiento de Documentos Activo"}


# Endpoint para verificar el estado del servicio
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "UP",
        "service": "document-processor",
        "message": "Activo y en servicio, Jefe. ¡Vamos con todo!",
    }


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

    # 1. Creamos el objeto del modelo con la info del archivo
    new_doc = models.Document(
        id=file_id,
        filename=file.filename,
        content_type=file.content_type,
        status="Recibido",
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return {
        "message": "Archivo registrado en BD",
        "file_id": file_id,
        "status": "Recibido",
        "filename": file.filename,
    }


@app.get("/api/v1/documents")
def get_documents():
    return {
        "status": "UP",
        "service": "document-processor",
        "message": "Listado de documentos obtenido",
    }


@app.get("/api/v1/documents/{id}", status_code=status.HTTP_200_OK)
async def get_document(
    id: uuid.UUID = Path(..., description="El UUID del documento a consultar"),
    db: Session = Depends(get_db),
):

    # Buscamos el registro real en la base de datos
    db_document = db.query(models.Document).filter(models.Document.id == id).first()

    if not db_document:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    return {
        "file_id": db_document.id,
        "filename": db_document.filename,
        "status": db_document.status,
        "message": f"Detalle del documento {id} obtenido",
    }


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

    db_document.status = "PROCESSED"
    db.commit()
    db.refresh(db_document)

    return {
        "status": db_document.status,
        "service": "document-processor",
        "message": f"Procesamiento finalizado con éxito para el documento {id}",
        "file_id": id,
    }
