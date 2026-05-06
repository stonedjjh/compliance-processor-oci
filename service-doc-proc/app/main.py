from fastapi import FastAPI
from .api.v1.routers import documents, healthcheck, auth

import logging
from contextlib import asynccontextmanager
import asyncio
import subprocess


async def run_db_migrations():
    # Ejecuta Alembic como subproceso
    proc = await asyncio.create_subprocess_exec(
        "alembic", "upgrade", "head", stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        logging.error(f"Error al aplicar migraciones: {stderr.decode()}")
    else:
        logging.info(f"Migraciones aplicadas:\n{stdout.decode()}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await run_db_migrations()  # Ahora es asíncrono y no bloquea Uvicorn
    yield
    logging.info("Cerrando aplicación: Limpiando recursos...")


# Inicializamos FastAPI con el manejador de lifespan
app = FastAPI(title="Document Processing Service", lifespan=lifespan, version="1.0")

# Registro de rutas
app.include_router(documents.router, prefix="/api/v1")
app.include_router(healthcheck.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"message": "Servicio de Procesamiento de Documentos Activo"}
