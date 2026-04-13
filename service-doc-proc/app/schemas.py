from pydantic import BaseModel, ConfigDict
from uuid import UUID
from enum import IntEnum
from datetime import datetime


class PageLimit(IntEnum):
    SMALL = 5
    MEDIUM = 10
    LARGE = 20


class DocumentOut(BaseModel):
    id: UUID
    filename: str
    status: str
    storage_path: str | None = None
    content_type: str | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DocumentMetadata(BaseModel):
    filename: str
    content_type: str
    file_content: bytes


class DocumentPagination(BaseModel):
    total: int
    skip: int
    limit: int
    data: list[DocumentOut]


class ProcessMessage(BaseModel):
    status: str
    message: str
    file_id: UUID
