from pydantic import BaseModel, ConfigDict
from uuid import UUID
from enum import IntEnum
from datetime import datetime


class PageLimit(IntEnum):
    SMALL = 5
    MEDIUM = 10
    LARGE = 50


class DocumentOut(BaseModel):
    id: UUID
    filename: str
    status: str
    storage_path: str | None = None
    content_type: str | None = None
    created_at: datetime     
    model_config = ConfigDict(from_attributes=True)
