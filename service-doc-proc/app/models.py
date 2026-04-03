from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from .database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    content_type = Column(String)
    status = Column(String, default="Recibido")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
