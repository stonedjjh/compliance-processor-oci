from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Servicio de Procesamiento de Documentos Activo"}

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "UP"
    assert "Jefe" in response.json()["message"]

def test_upload_file():
    # Como el endpoint no recibe parámetros aún, un POST vacío debería bastar
    response = client.post("/upload")
    assert response.status_code == 200
    assert response.json() == {"status": "Recibido"}