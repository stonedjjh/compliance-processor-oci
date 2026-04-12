from sqlalchemy.orm import Session
from app.internal import models
from fastapi import HTTPException


def db_create_document(db: Session, new_doc: models.Document):
    """Función auxiliar para crear un registro de documento en la base de datos.
    Esto se separa para mantener el controller limpio y facilitar pruebas unitarias.
    (Session, Document) -> None
    """
    try:
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
