from fastapi import FastAPI

app = FastAPI(title="Document Processing Service")


@app.get("/")
def read_root():
    return {"message": "Servicio de Procesamiento de Documentos Activo"}


# Endpoint para verificar el estado del servicio
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "UP",
        "service": "document-processor",
        "message": "Activo y en servicio, Jefe. ¡Vamos con todo!",
    }


@app.post("/api/v1/document/upload")
async def upload_file():
    return {"status": "Recibido"}


@app.get("/api/v1/documents")
def get_documents():
    return {
        "status": "UP",
        "service": "document-processor",
        "message": "Listado de documentos obtenido",
    }


@app.get("/api/v1/documents/{id}")
def get_document(id: str):
    return {
        "status": "UP",
        "service": "document-processor",
        "message": f"Detalle del documento {id} obtenido",
    }


@app.post("/api/v1/documents/{id}/process")
def process_document(id: str):
    return {
        "status": "UP",
        "service": "document-processor",
        "message": f"Procesamiento iniciado para el documento {id}",
    }
