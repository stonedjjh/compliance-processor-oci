from fastapi import FastAPI

app = FastAPI(title="Document Processing Service")

@app.get("/")
def read_root():
    return {"message": "Servicio de Procesamiento de Documentos Activo"}

@app.post("/upload")
async def upload_file():    
    return {"status": "Recibido"}

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "document-processor",
        "message": "Activo y en servicio, Jefe. ¡Vamos con todo!"
    }