import uuid
from fastapi import FastAPI, File, UploadFile, Depends
from .database import engine, SessionLocal
from sqlalchemy.orm import Session
from . import models


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Document Processing Service")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
def get_document(id: str):
    return {
        "status": "UP",
        "service": "document-processor",
        "message": f"Detalle del documento {id} obtenido",
    }


@app.post("/api/v1/documents/{id}/process")
def process_document(id: str):
    return {
        "status": "UP",
        "service": "document-processor",
        "message": f"Procesamiento iniciado para el documento {id}",
    }
