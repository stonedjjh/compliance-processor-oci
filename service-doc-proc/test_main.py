from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "message": "Servicio de Procesamiento de Documentos Activo"
    }


def test_health_check():
    # Nueva ruta con v1
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "UP"
    assert "Jefe" in response.json()["message"]


def test_upload_file():
    # Nueva ruta de carga
    response = client.post("/api/v1/document/upload")
    assert response.status_code == 200
    assert response.json() == {"status": "Recibido"}


def test_get_documents():
    response = client.get("/api/v1/documents")
    assert response.status_code == 200
    assert "Listado" in response.json()["message"]


def test_get_single_document():
    doc_id = "test-123"
    response = client.get(f"/api/v1/documents/{doc_id}")
    assert response.status_code == 200
    assert doc_id in response.json()["message"]


def test_process_document():
    doc_id = "proc-456"
    response = client.post(f"/api/v1/documents/{doc_id}/process")
    assert response.status_code == 200
    # para evitar problemas de capitalizado o mayusculas, convertimos a minúsculas
    assert "iniciado" in response.json()["message"].lower()
    assert doc_id in response.json()["message"]
