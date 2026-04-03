import uuid
from fastapi import (
    FastAPI,
    File,
    UploadFile,
    Depends,
    HTTPException,
    status,
    Path,
    Query,
)
from .internal.database import engine, get_db
from sqlalchemy.orm import Session
from .internal import models, database
from app.utils.validators import validate_file_upload
from . import schemas


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

    return db.query(models.Document).offset(skip).limit(limit.value).all()


@app.get(
    "/api/v1/documents/{id}",
    response_model=schemas.DocumentOut,
    status_code=status.HTTP_200_OK,
)
async def get_document(id: uuid.UUID, db: Session = Depends(database.get_db)):
    db_document = db.query(models.Document).filter(models.Document.id == id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return db_document


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

    return db_document
