"""
Módulo de configuración para la aplicación de procesamiento de documentos de cumplimiento.
Este módulo centraliza la gestión de las variables de entorno necesarias para la conexión a
los servicios externos como PostgreSQL, MongoDB y MinIO (u otro servicio de almacenamiento
compatible con S3).
"""

import os


class Settings:
    # Postgres
    DATABASE_URL = os.getenv("DATABASE_URL")

    # MongoDB
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://admin:password@mongodb:27017")

    # MinIO / OCI Simulation
    STORAGE_USER = os.getenv("STORAGE_ROOT_USER")
    STORAGE_PASS = os.getenv("STORAGE_ROOT_PASSWORD")
    STORAGE_HOST = os.getenv("STORAGE_HOST")
    STORAGE_PORT = os.getenv("STORAGE_PORT")

    # Forzamos que sea un string limpio por si el .env trae basura
    STORAGE_ENDPOINT = (
        str(os.getenv("STORAGE_ENDPOINT", f"http://minio:{STORAGE_PORT}"))
        .strip()
        .replace('"', "")
        .replace("'", "")
    )
    STORAGE_BUCKET = os.getenv("STORAGE_BUCKET_NAME", "compliance-documents")
    STORAGE_REGION = os.getenv("STORAGE_REGION", "us-east-1")


settings = Settings()
