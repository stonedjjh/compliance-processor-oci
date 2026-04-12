from fastapi import FastAPI
from .api.v1.routers import documents, healthcheck
from .internal import database, models

# Inicialización de DB (esto también podría ir a un init_db si queremos ser puristas)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Document Processing Service")

# Registro de rutas
app.include_router(documents.router, prefix="/api/v1")
app.include_router(healthcheck.router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"message": "Servicio de Procesamiento de Documentos Activo"}
