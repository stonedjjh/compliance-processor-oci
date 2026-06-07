from fastapi.testclient import TestClient
from app.main import app
import os
import pytest
import uuid
from app.internal.database import SessionLocal
from app.models.user import User

client = TestClient(app)
API_KEY_SECRET = os.getenv("API_KEY_SECRET", "mi_clave_super_secreta_123")
BASE_HEADERS = {"X-API-KEY": API_KEY_SECRET}


@pytest.fixture(scope="session", autouse=True)
def set_test_env():
    # Esto sobreescribe la variable en memoria SOLO para el proceso de pytest
    os.environ["ENV"] = "test"
    yield


@pytest.fixture(scope="module")
def test_user_id():
    """Crea un usuario de prueba dinámico para evitar conflictos de llave foránea."""
    email = f"tester_{uuid.uuid4()}@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "TestPassword123*",
            "full_name": "Active Tester",
        },
        headers=BASE_HEADERS,
    )
    return response.json()["id"]


@pytest.fixture
def auth_headers(test_user_id):
    return {"X-API-KEY": API_KEY_SECRET, "X-User-Id": str(test_user_id)}


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
def test_upload_file(auth_headers):
    # Simulamos un PDF real
    file_content = b"%PDF-1.4 prueba de contenido"
    file_name = "documento_importante.txt"

    response = client.post(
        "/api/v1/documents/upload",
        files={"file": (file_name, file_content, "application/txt")},
        headers=auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["filename"] == file_name
    assert data["status"] == "Recibido"


def test_upload_and_get_document_strict(auth_headers):
    # 1. Subimos un archivo con un nombre único
    file_content = b"%PDF-1.4 contenido real"
    file_name = "mi_documento_corporativo.txt"

    response_upload = client.post(
        "/api/v1/documents/upload",
        files={"file": (file_name, file_content, "application/txt")},
        headers=auth_headers,
    )

    assert response_upload.status_code == 201
    document_id = response_upload.json()["id"]

    # 2. Consultamos el detalle
    get_response = client.get(f"/api/v1/documents/{document_id}", headers=auth_headers)
    assert get_response.status_code == 200

    detail_data = get_response.json()

    assert detail_data["filename"] == file_name
    assert detail_data["status"] == "Recibido"  # El estado inicial en BD
    assert "id" in detail_data


def test_get_documents_pagination(auth_headers):
    file_content = b"%PDF-1.4 contenido"
    for i in range(7):
        client.post(
            "/api/v1/documents/upload",
            files={"file": (f"test_{i}.txt", file_content, "application/txt")},
            headers=auth_headers,
        )

    response = client.get("/api/v1/documents?skip=0&limit=5", headers=auth_headers)

    assert response.status_code == 200
    data = response.json().get("data")
    # Esperamos una lista de documentos, no un objeto de estatus
    assert isinstance(data, list)
    assert len(data) == 5


def test_get_documents_empty_pagination(auth_headers):
    # Probamos un salto mayor al número de registros
    response = client.get("/api/v1/documents?skip=100&limit=10", headers=auth_headers)
    assert response.status_code == 200
    assert response.json().get("data") == []


def test_get_documents_invalid_limit(auth_headers):
    # Probamos enviar un límite no permitido (ej. 7)
    response = client.get("/api/v1/documents?skip=0&limit=7", headers=auth_headers)

    assert response.status_code == 422

    # Convertimos a string el detalle porque FastAPI devuelve una lista de errores
    error_detail = str(response.json()["detail"])

    # Buscamos el mensaje estándar de Pydantic para Enums
    assert "5, 10 or 20" in error_detail


def test_process_document_success(auth_headers):
    file_content = b"%PDF-1.4 contenido"
    response_up = client.post(
        "/api/v1/documents/upload",
        files={"file": ("test.txt", file_content, "application/txt")},
        headers=auth_headers,
    )
    doc_id = response_up.json()["id"]

    response_proc = client.post(
        f"/api/v1/documents/{doc_id}/process",
        headers=auth_headers,
    )

    assert response_proc.status_code == 200
    assert response_proc.json()["status"] == "PROCESSED"
    assert response_proc.json()["id"] == doc_id


def test_process_document_already_processed(auth_headers):
    file_content = b"%PDF-1.4 contenido"
    response_up = client.post(
        "/api/v1/documents/upload",
        files={"file": ("test2.txt", file_content, "application/txt")},
        headers=auth_headers,
    )
    doc_id = response_up.json()["id"]

    client.post(f"/api/v1/documents/{doc_id}/process", headers=auth_headers)

    response_re = client.post(
        f"/api/v1/documents/{doc_id}/process", headers=auth_headers
    )

    assert response_re.status_code == 200
    assert "ya fue procesado" in response_re.json()["message"]


def test_upload_file_inactive_user():
    # 1. Crear un usuario inactivo manipulando la base de datos
    email = f"inactive_{uuid.uuid4()}@example.com"
    res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "TestPassword123*", "full_name": "Inactivo"},
        headers=BASE_HEADERS,
    )
    user_id = res.json()["id"]

    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    assert user is not None, "El usuario de prueba no se encontró en la base de datos"
    user.is_active = False
    db.commit()
    db.close()

    # 2. Intentar la acción protegida
    inactive_headers = {"X-API-KEY": API_KEY_SECRET, "X-User-Id": str(user_id)}
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("forbidden.txt", b"contenido", "application/txt")},
        headers=inactive_headers,
    )

    # 3. Validar seguridad
    assert response.status_code == 403
    assert "inactiva" in response.json()["detail"]
