from sqlalchemy.orm import Session
from app.internal import models, database
from fastapi import HTTPException, Depends


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


def db_get_documents(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(database.get_db),
):
    try:
        # 1. Contamos el total real de registros en la DB
        total_records = db.query(models.Document).count()
        # 2. Obtenemos solo la porción solicitada
        items = (
            db.query(models.Document)
            .order_by(models.Document.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        # 3. Devolvemos un objeto con metadata
        return {"total": total_records, "skip": skip, "limit": limit, "data": items}
    except Exception as e:
        print(f"Error al obtener documentos: {e}")
        raise HTTPException(
            status_code=500, detail="Error al consultar la base de datos"
        )
