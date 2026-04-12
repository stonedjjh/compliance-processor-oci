"""
Document API Router
"""

import uuid
from fastapi import APIRouter, File, UploadFile, Depends, Security, status
from sqlalchemy.orm import Session
from app.api.v1.controllers import documents_controller
from app.internal.database import get_db
from app.internal.auth import get_api_key
from app import schemas
from app.internal import database


router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", status_code=201, dependencies=[Security(get_api_key)])
async def upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return await documents_controller.handle_upload(file, db)


@router.get(
    "/",
    response_model=list[schemas.DocumentOut],
    status_code=status.HTTP_200_OK,
    dependencies=[Security(get_api_key)],
)
async def list_docs(
    skip: int = 0,
    limit: schemas.PageLimit = schemas.PageLimit.MEDIUM,
    db: Session = Depends(get_db),
):
    return await documents_controller.get_documents(skip, limit, db)


@router.post(
    "/{id}/process",
    response_model=schemas.DocumentOut,
    status_code=status.HTTP_200_OK,
    dependencies=[Security(get_api_key)],
)
async def process_document(id: uuid.UUID, db: Session = Depends(database.get_db)):
    return await documents_controller.process_document(id, db)


@router.get(
    "/{id}",
    response_model=schemas.DocumentOut,
    status_code=status.HTTP_200_OK,
    dependencies=[Security(get_api_key)],
)
async def get_document(id: uuid.UUID, db: Session = Depends(database.get_db)):
    return await documents_controller.get_by_id(id, db)
