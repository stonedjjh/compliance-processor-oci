from fastapi.testclient import TestClient
from app.main import app

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


# Prueba de carga de archivo con un PDF simulado
# Aqui aplique TDD para asegurar que el endpoint de carga de archivos funcione correctamente
def test_upload_file():
    # Simulamos un PDF real
    file_content = b"%PDF-1.4 prueba de contenido"
    file_name = "documento_importante.pdf"

    response = client.post(
        "/api/v1/documents/upload",
        files={"file": (file_name, file_content, "application/pdf")},
    )

    assert response.status_code == 201
    data = response.json()
    assert "file_id" in data
    assert data["filename"] == file_name
    assert data["status"] == "Recibido"


def test_upload_and_get_document_strict():
    # 1. Subimos un archivo con un nombre único
    file_content = b"%PDF-1.4 contenido real"
    file_name = "mi_documento_corporativo.pdf"

    response_upload = client.post(
        "/api/v1/documents/upload",
        files={"file": (file_name, file_content, "application/pdf")},
    )

    assert response_upload.status_code == 201
    document_id = response_upload.json()["file_id"]

    # 2. Consultamos el detalle
    get_response = client.get(f"/api/v1/documents/{document_id}")
    assert get_response.status_code == 200

    detail_data = get_response.json()

    assert detail_data["filename"] == file_name
    assert detail_data["status"] == "Recibido"  # El estado inicial en BD
    assert "file_id" in detail_data


def test_get_documents():
    response = client.get("/api/v1/documents")
    assert response.status_code == 200
    assert "Listado" in response.json()["message"]


def test_process_document():
    doc_id = "proc-456"
    response = client.post(f"/api/v1/documents/{doc_id}/process")
    assert response.status_code == 200
    # para evitar problemas de capitalizado o mayusculas, convertimos a minúsculas
    assert "iniciado" in response.json()["message"].lower()
    assert doc_id in response.json()["message"]
