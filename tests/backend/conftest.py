"""
Pytest configuration and fixtures for backend tests.
"""
import os
import pytest
from datetime import datetime, timezone

# Set test environment variables before importing app modules
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["DATABASE_URL"] = "postgresql+asyncpg://test:test@localhost:5432/test_db"


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "password": "SecurePassword123!",
        "display_name": "Test User",
    }


@pytest.fixture
def sample_note_data():
    """Sample note data for testing."""
    return {
        "title": "Test Note",
        "content": "This is test content",
        "type": "note",
        "is_pinned": False,
        "color": None,
        "category_ids": [],
    }


@pytest.fixture
def sample_category_data():
    """Sample category data for testing."""
    return {
        "name": "Test Category",
        "color": "#FF5733",
    }
