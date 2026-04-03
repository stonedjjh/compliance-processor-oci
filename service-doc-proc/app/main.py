import uuid
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
from .database import engine, SessionLocal
from sqlalchemy.orm import Session
from app.database import get_db
from . import models


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


@app.post("/api/v1/documents/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_id = str(uuid.uuid4())

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


@app.get("/api/v1/documents/{id}")
def get_document(id: str, db: Session = Depends(get_db)):
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


@app.post("/api/v1/documents/{id}/process")
def process_document(id: str):
    return {
        "status": "UP",
        "service": "document-processor",
        "message": f"Procesamiento iniciado para el documento {id}",
    }
