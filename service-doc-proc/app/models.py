from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from .database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    filename = Column(String, nullable=False)
    content_type = Column(String)
    status = Column(String, default="Recibido")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
