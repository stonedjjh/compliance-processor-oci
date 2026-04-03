import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base


DATABASE_URL = os.getenv("DATABASE_URL")


if not DATABASE_URL:
    raise ValueError("ERROR: La variable de entorno DATABASE_URL no está definida.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_postgres_connection(db):
    """Verifica si PostgreSQL responde."""
    try:
        db.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"Health Check Fallido en Postgres: {e}")
        return False
