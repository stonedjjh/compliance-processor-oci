"""add_user_id_to_documents

Revision ID: ffd5d738da7e
Revises: 810532d9622e
Create Date: 2026-05-08 10:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid
from app.internal.auth_utils import hash_password

# revision identifiers, used by Alembic.
revision: str = "ffd5d738da7e"
down_revision: Union[str, Sequence[str], None] = "810532d9622e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- PASO 1: Agregar la columna temporalmente como opcional (nullable=True) ---
    op.add_column(
        "documents", sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True)
    )

    # --- PASO 2: Data Backfilling (Crear usuario Legacy y actualizar documentos huérfanos) ---
    bind = op.get_bind()

    legacy_email = "legancy@example.com"
    hashed_pwd = hash_password("Test123*")
    legacy_id = str(uuid.uuid4())

    # Insertamos al usuario Legacy. Usamos ON CONFLICT DO NOTHING.
    bind.execute(
        sa.text(f"""
        INSERT INTO users (id, email, full_name, hashed_password, is_active, must_change_password)
        VALUES ('{legacy_id}', '{legacy_email}', 'Usuario Legacy (Migracion)', '{hashed_pwd}', true, false)
        ON CONFLICT (email) DO NOTHING;
    """)
    )

    # Obtenemos el ID real del usuario Legacy en la base de datos
    result = bind.execute(
        sa.text(f"SELECT id FROM users WHERE email = '{legacy_email}'")
    )
    real_legacy_id = result.scalar()

    # Asignamos todos los documentos existentes al usuario Legacy
    bind.execute(
        sa.text(
            f"UPDATE documents SET user_id = '{real_legacy_id}' WHERE user_id IS NULL;"
        )
    )

    # --- PASO 3: Ahora sí, aplicar la regla estricta (nullable=False) y crear la llave foránea ---
    op.alter_column(
        "documents",
        "user_id",
        existing_type=postgresql.UUID(as_uuid=True),
        nullable=False,
    )
    op.create_foreign_key(
        "fk_documents_user_id", "documents", "users", ["user_id"], ["id"]
    )


def downgrade() -> None:
    op.drop_constraint("fk_documents_user_id", "documents", type_="foreignkey")
    op.drop_column("documents", "user_id")
