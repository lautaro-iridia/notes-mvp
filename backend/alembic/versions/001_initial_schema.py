"""Initial schema

Revision ID: 001
Revises:
Create Date: 2025-01-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# pgvector is optional - only used for semantic search feature
try:
    from pgvector.sqlalchemy import Vector
    HAS_PGVECTOR = True
except ImportError:
    HAS_PGVECTOR = False
    Vector = None

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _check_extension_available(conn, extension_name: str) -> bool:
    """Check if a PostgreSQL extension is available."""
    result = conn.execute(sa.text(
        "SELECT 1 FROM pg_available_extensions WHERE name = :name"
    ), {"name": extension_name})
    return result.fetchone() is not None


def upgrade() -> None:
    # Get connection to check available extensions
    conn = op.get_bind()

    # Create vector extension only if available (Railway doesn't have it)
    if _check_extension_available(conn, 'vector'):
        op.execute('CREATE EXTENSION IF NOT EXISTS vector')

    # uuid-ossp is standard in PostgreSQL
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('display_name', sa.String(100), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # Create categories table
    op.create_table(
        'categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('color', sa.String(20), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'name', name='unique_user_category_name'),
    )
    op.create_index('ix_categories_user_id', 'categories', ['user_id'])

    # Create notes table
    # Build columns list - embedding is optional (requires pgvector)
    notes_columns = [
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('type', sa.String(20), nullable=False, server_default='note'),
        sa.Column('is_pinned', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('color', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    ]

    # Add embedding column only if pgvector is available
    # Using 1024 dimensions (compatible with text-embedding-3-small)
    if HAS_PGVECTOR and _check_extension_available(conn, 'vector'):
        notes_columns.append(sa.Column('embedding', Vector(1024), nullable=True))

    notes_columns.extend([
        sa.CheckConstraint("type IN ('note', 'thought', 'idea')", name='valid_note_type'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    ])

    op.create_table('notes', *notes_columns)
    op.create_index('ix_notes_user_id', 'notes', ['user_id'])

    # Create note_categories table
    op.create_table(
        'note_categories',
        sa.Column('note_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['note_id'], ['notes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('note_id', 'category_id'),
    )

    # Create note_links table
    op.create_table(
        'note_links',
        sa.Column('source_note_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('target_note_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.CheckConstraint('source_note_id != target_note_id', name='no_self_links'),
        sa.ForeignKeyConstraint(['source_note_id'], ['notes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['target_note_id'], ['notes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('source_note_id', 'target_note_id'),
    )


def downgrade() -> None:
    op.drop_table('note_links')
    op.drop_table('note_categories')
    op.drop_index('ix_notes_user_id', table_name='notes')
    op.drop_table('notes')
    op.drop_index('ix_categories_user_id', table_name='categories')
    op.drop_table('categories')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
    op.execute('DROP EXTENSION IF EXISTS "uuid-ossp"')
    # Only drop vector extension if it exists
    conn = op.get_bind()
    if _check_extension_available(conn, 'vector'):
        op.execute('DROP EXTENSION IF EXISTS vector')
