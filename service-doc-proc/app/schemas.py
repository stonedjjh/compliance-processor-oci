from pydantic import BaseModel, ConfigDict
from uuid import UUID
from enum import IntEnum


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

    model_config = ConfigDict(from_attributes=True)
