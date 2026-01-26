import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from pgvector.sqlalchemy import Vector
from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.user import User


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    content: Mapped[str | None] = mapped_column(Text)
    type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="note",
    )
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    color: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    embedding = mapped_column(Vector(1536), nullable=True)

    __table_args__ = (
        CheckConstraint("type IN ('note', 'thought', 'idea')", name="valid_note_type"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="notes")
    categories: Mapped[list["Category"]] = relationship(
        "Category",
        secondary="note_categories",
        back_populates="notes",
    )

    # Self-referential relationships for note links (bidirectional)
    linked_to: Mapped[list["Note"]] = relationship(
        "Note",
        secondary="note_links",
        primaryjoin="Note.id == NoteLink.source_note_id",
        secondaryjoin="Note.id == NoteLink.target_note_id",
        back_populates="linked_from",
    )
    linked_from: Mapped[list["Note"]] = relationship(
        "Note",
        secondary="note_links",
        primaryjoin="Note.id == NoteLink.target_note_id",
        secondaryjoin="Note.id == NoteLink.source_note_id",
        back_populates="linked_to",
    )


class NoteLink(Base):
    __tablename__ = "note_links"

    source_note_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("notes.id", ondelete="CASCADE"),
        primary_key=True,
    )
    target_note_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("notes.id", ondelete="CASCADE"),
        primary_key=True,
    )

    __table_args__ = (
        CheckConstraint(
            "source_note_id != target_note_id",
            name="no_self_links",
        ),
    )
