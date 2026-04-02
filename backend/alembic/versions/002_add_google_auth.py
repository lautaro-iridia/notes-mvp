"""Add Google OAuth2 support

Revision ID: 002
Revises: 001
Create Date: 2026-04-01

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add google_id column (nullable, unique)
    op.add_column('users', sa.Column('google_id', sa.String(255), nullable=True))
    op.create_index('ix_users_google_id', 'users', ['google_id'], unique=True)

    # Make hashed_password nullable (Google-only users don't have a password)
    op.alter_column('users', 'hashed_password', nullable=True)


def downgrade() -> None:
    # Restore hashed_password as NOT NULL (requires existing rows to have a value)
    op.alter_column('users', 'hashed_password', nullable=False)
    op.drop_index('ix_users_google_id', table_name='users')
    op.drop_column('users', 'google_id')
