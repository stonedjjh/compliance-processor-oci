"""
Módulo de gestión de almacenamiento para la aplicación de procesamiento de documentos de cumplimiento.
Este módulo se encarga de la interacción con el servicio de almacenamiento compatible
con S3 (como MinIO), proporcionando funciones para subir archivos y generar rutas lógicas para
su acceso posterior.
"""

import boto3
from botocore.client import Config
from app.internal.config import settings
from botocore.exceptions import ClientError
from ..schemas import DocumentMetadata


class StorageManager:
    def __init__(self):
        endpoint = settings.STORAGE_ENDPOINT.strip()

        self.s3 = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=settings.STORAGE_USER,
            aws_secret_access_key=settings.STORAGE_PASS,
            config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
            region_name=settings.STORAGE_REGION,
        )
        self.bucket = settings.STORAGE_BUCKET
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Verifica si el bucket existe, si no, lo crea."""
        try:
            self.s3.head_bucket(Bucket=self.bucket)
        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            if error_code == "404" or error_code == "NoSuchBucket":
                print(f"INFO: Creando bucket inexistente: {self.bucket}")
                self.s3.create_bucket(Bucket=self.bucket)
            else:
                print(f"ERROR crítico al verificar bucket: {e}")

    def upload_file(self, metadata: DocumentMetadata) -> str:
        """Sube el archivo a MinIO y devuelve la ruta lógica."""
        self.s3.put_object(
            Bucket=self.bucket,
            Key=metadata.filename,
            Body=metadata.file_content,
            ContentType=metadata.content_type,
        )
        return f"{self.bucket}/{metadata.filename}"

    def check_health(self) -> bool:
        try:
            # head_bucket es más rápido y específico que list_buckets
            self.s3.head_bucket(Bucket=self.bucket)
            return True
        except Exception as e:
            # Imprime el error en la consola de Docker para que sepas EXACTAMENTE qué falló
            print(f"DEBUG - Health Check Storage Fallido: {e}")
            return False


storage_manager = StorageManager()
