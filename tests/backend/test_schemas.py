"""
Tests for Pydantic schema validation.
Focus on edge cases and common validation errors.
"""
import pytest
from datetime import datetime
from uuid import uuid4

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../backend'))

from pydantic import ValidationError
from app.schemas.note import NoteCreate, NoteUpdate, NoteImport, ImportRequest, CategoryImport
from app.schemas.user import UserCreate
from app.schemas.category import CategoryCreate


class TestNoteSchemas:
    """Test Note schema validation."""

    def test_note_create_valid(self):
        """Valid note creation should work."""
        note = NoteCreate(
            title="Test Note",
            content="Some content",
            type="note",
        )
        assert note.title == "Test Note"
        assert note.type == "note"

    def test_note_create_minimal(self):
        """Note with only title should work."""
        note = NoteCreate(title="Just a title")
        assert note.title == "Just a title"
        assert note.content is None
        assert note.type == "note"  # default
        assert note.is_pinned is False  # default

    def test_note_create_all_types(self):
        """All note types should be valid."""
        for note_type in ["note", "thought", "idea"]:
            note = NoteCreate(title="Test", type=note_type)
            assert note.type == note_type

    def test_note_create_invalid_type(self):
        """Invalid note type should raise error."""
        with pytest.raises(ValidationError) as exc_info:
            NoteCreate(title="Test", type="invalid")

        assert "type" in str(exc_info.value)

    def test_note_create_title_too_long(self):
        """Title over 500 chars should fail."""
        with pytest.raises(ValidationError):
            NoteCreate(title="x" * 501)

    def test_note_create_title_max_length(self):
        """Title at exactly 500 chars should work."""
        note = NoteCreate(title="x" * 500)
        assert len(note.title) == 500

    def test_note_create_empty_title(self):
        """Empty title is technically allowed by schema (no min_length)."""
        # Note: Application logic should validate non-empty titles
        note = NoteCreate(title="")
        assert note.title == ""

    def test_note_create_with_categories(self):
        """Note with category IDs should work."""
        cat_id = uuid4()
        note = NoteCreate(title="Test", category_ids=[cat_id])
        assert note.category_ids == [cat_id]

    def test_note_update_partial(self):
        """NoteUpdate should allow partial updates."""
        update = NoteUpdate(title="New Title")
        assert update.title == "New Title"
        assert update.content is None
        assert update.type is None

    def test_note_update_empty(self):
        """Empty NoteUpdate should be valid."""
        update = NoteUpdate()
        data = update.model_dump(exclude_unset=True)
        assert len(data) == 0

    def test_note_update_all_fields(self):
        """NoteUpdate with all fields should work."""
        cat_id = uuid4()
        update = NoteUpdate(
            title="Updated",
            content="New content",
            type="idea",
            is_pinned=True,
            color="#FF0000",
            category_ids=[cat_id],
        )
        assert update.title == "Updated"
        assert update.is_pinned is True


class TestNoteImportSchemas:
    """Test import-related schemas (localStorage migration)."""

    def test_note_import_valid(self):
        """Valid import data should work."""
        note = NoteImport(
            id="local-123",
            title="Imported Note",
            content="Content",
            type="note",
        )
        assert note.id == "local-123"

    def test_note_import_with_timestamps(self):
        """Import with timestamps should preserve them."""
        now = datetime.now()
        note = NoteImport(
            id="local-123",
            title="Test",
            created_at=now,
            updated_at=now,
        )
        assert note.created_at == now

    def test_note_import_with_links(self):
        """Import with linked note IDs should work."""
        note = NoteImport(
            id="local-123",
            title="Test",
            linked_note_ids=["local-456", "local-789"],
        )
        assert len(note.linked_note_ids) == 2

    def test_import_request_valid(self):
        """Valid import request should work."""
        request = ImportRequest(
            notes=[
                NoteImport(id="1", title="Note 1"),
                NoteImport(id="2", title="Note 2"),
            ],
            categories=[
                CategoryImport(id="cat1", name="Category", color="#FF0000"),
            ],
        )
        assert len(request.notes) == 2
        assert len(request.categories) == 1

    def test_import_request_empty_notes(self):
        """Import with empty notes list should work."""
        request = ImportRequest(notes=[])
        assert len(request.notes) == 0


class TestUserSchemas:
    """Test User schema validation."""

    def test_user_create_valid(self):
        """Valid user creation should work."""
        user = UserCreate(
            email="test@example.com",
            password="SecurePass123!",
            display_name="Test User",
        )
        assert user.email == "test@example.com"

    def test_user_create_without_display_name(self):
        """User without display name should work."""
        user = UserCreate(
            email="test@example.com",
            password="password123",
        )
        assert user.display_name is None

    def test_user_create_invalid_email(self):
        """Invalid email should fail."""
        with pytest.raises(ValidationError) as exc_info:
            UserCreate(email="not-an-email", password="password")

        assert "email" in str(exc_info.value).lower()

    def test_user_create_email_formats(self):
        """Various valid email formats should work."""
        valid_emails = [
            "simple@example.com",
            "user.name@example.com",
            "user+tag@example.com",
            "user@subdomain.example.com",
        ]
        for email in valid_emails:
            user = UserCreate(email=email, password="password123")
            assert user.email == email


class TestCategorySchemas:
    """Test Category schema validation."""

    def test_category_create_valid(self):
        """Valid category creation should work."""
        category = CategoryCreate(name="Work", color="#3498db")
        assert category.name == "Work"
        assert category.color == "#3498db"

    def test_category_create_name_too_long(self):
        """Category name over 100 chars should fail."""
        with pytest.raises(ValidationError):
            CategoryCreate(name="x" * 101, color="#000000")

    def test_category_create_name_max_length(self):
        """Category name at exactly 100 chars should work."""
        category = CategoryCreate(name="x" * 100, color="#000000")
        assert len(category.name) == 100


class TestSchemaEdgeCases:
    """Edge cases for schema validation."""

    def test_note_with_unicode_content(self):
        """Note with unicode content should work."""
        note = NoteCreate(
            title="Notas en español",
            content="Contenido con áéíóú y ñ",
        )
        assert "ñ" in note.content

    def test_note_with_emoji(self):
        """Note with emoji should work."""
        note = NoteCreate(
            title="Fun Note 🎉",
            content="Some emoji content 👍 🚀",
        )
        assert "🎉" in note.title

    def test_note_with_markdown(self):
        """Note with markdown content should work."""
        markdown_content = """
# Header
**Bold** and *italic*
- List item
```code block```
"""
        note = NoteCreate(title="Markdown Test", content=markdown_content)
        assert "**Bold**" in note.content

    def test_note_with_very_long_content(self):
        """Note with very long content should work."""
        long_content = "x" * 100000
        note = NoteCreate(title="Long Note", content=long_content)
        assert len(note.content) == 100000

    def test_user_email_domain_normalized(self):
        """Email domain is normalized to lowercase by email-validator."""
        user = UserCreate(email="Test@Example.COM", password="password")
        # email-validator normalizes domain but preserves local part case
        assert user.email == "Test@example.com"
