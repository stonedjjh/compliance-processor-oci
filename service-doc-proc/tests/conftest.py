import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.internal.database import Base, get_db

DATABASE_URL = str(
    os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/compliance_db")
)

engine = create_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_schema():
    with engine.begin() as connection:
        connection.execute(text("CREATE SCHEMA IF NOT EXISTS test_schema"))

    # Configuramos el engine para que use siempre el esquema de test en esta sesión
    engine_test = engine.execution_options(schema_translate_map={None: "test_schema"})

    Base.metadata.create_all(bind=engine_test)

    yield

    with engine.begin() as connection:
        connection.execute(text("DROP SCHEMA IF EXISTS test_schema CASCADE"))


@pytest.fixture
def session():
    connection = engine.connect()
    connection.execute(text("SET search_path TO test_schema"))

    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    connection.close()


@pytest.fixture(autouse=True)
def override_get_db(session):
    def _get_test_db():
        try:
            yield session
        finally:
            pass

    app.dependency_overrides[get_db] = _get_test_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)
