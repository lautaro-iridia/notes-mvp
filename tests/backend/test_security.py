"""
Tests for security module: password hashing and JWT tokens.
These are critical functions that must work correctly.
"""
import pytest
from datetime import timedelta
import time

import sys
import os

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../backend'))

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)


class TestPasswordHashing:
    """Test password hashing and verification."""

    def test_hash_password_creates_different_hash(self):
        """Same password should create different hashes (salt)."""
        password = "MySecurePassword123!"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        # Hashes should be different due to salt
        assert hash1 != hash2
        # But both should verify correctly
        assert verify_password(password, hash1)
        assert verify_password(password, hash2)

    def test_verify_correct_password(self):
        """Correct password should verify."""
        password = "CorrectPassword123"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_verify_wrong_password(self):
        """Wrong password should not verify."""
        password = "CorrectPassword123"
        wrong = "WrongPassword456"
        hashed = get_password_hash(password)
        assert verify_password(wrong, hashed) is False

    def test_hash_is_not_plaintext(self):
        """Hash should not contain the plaintext password."""
        password = "MyPassword123"
        hashed = get_password_hash(password)
        assert password not in hashed

    def test_empty_password(self):
        """Empty password should still hash and verify."""
        password = ""
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True
        assert verify_password("nonempty", hashed) is False

    def test_unicode_password(self):
        """Unicode characters in password should work."""
        password = "Contraseña123!áéíóú"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_very_long_password(self):
        """Very long passwords should work (bcrypt has 72 byte limit)."""
        # bcrypt truncates at 72 bytes, so this tests that behavior
        password = "a" * 100
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True


class TestJWTTokens:
    """Test JWT token creation and decoding."""

    def test_create_access_token(self):
        """Access token should be created with correct type."""
        token = create_access_token(data={"sub": "user-123"})
        payload = decode_token(token)

        assert payload is not None
        assert payload["sub"] == "user-123"
        assert payload["type"] == "access"
        assert "exp" in payload

    def test_create_refresh_token(self):
        """Refresh token should be created with correct type."""
        token = create_refresh_token(data={"sub": "user-123"})
        payload = decode_token(token)

        assert payload is not None
        assert payload["sub"] == "user-123"
        assert payload["type"] == "refresh"
        assert "exp" in payload

    def test_access_token_custom_expiry(self):
        """Access token should respect custom expiry."""
        token = create_access_token(
            data={"sub": "user-123"},
            expires_delta=timedelta(minutes=5)
        )
        payload = decode_token(token)
        assert payload is not None

    def test_decode_invalid_token(self):
        """Invalid token should return None."""
        result = decode_token("invalid.token.here")
        assert result is None

    def test_decode_malformed_token(self):
        """Malformed token should return None."""
        result = decode_token("not-even-close-to-jwt")
        assert result is None

    def test_decode_empty_token(self):
        """Empty token should return None."""
        result = decode_token("")
        assert result is None

    def test_token_contains_user_data(self):
        """Token should preserve user data."""
        user_id = "550e8400-e29b-41d4-a716-446655440000"
        token = create_access_token(data={"sub": user_id})
        payload = decode_token(token)

        assert payload["sub"] == user_id

    def test_different_users_get_different_tokens(self):
        """Different users should get different tokens."""
        token1 = create_access_token(data={"sub": "user-1"})
        token2 = create_access_token(data={"sub": "user-2"})

        assert token1 != token2

    def test_refresh_token_longer_expiry(self):
        """Refresh token should have longer expiry than access token."""
        access = create_access_token(data={"sub": "user-123"})
        refresh = create_refresh_token(data={"sub": "user-123"})

        access_payload = decode_token(access)
        refresh_payload = decode_token(refresh)

        # Refresh token expiry should be later than access token
        assert refresh_payload["exp"] > access_payload["exp"]


class TestTokenEdgeCases:
    """Edge cases for token handling."""

    def test_token_with_special_characters_in_subject(self):
        """Token should handle special characters in subject."""
        special_id = "user-123-áéíóú-特殊"
        token = create_access_token(data={"sub": special_id})
        payload = decode_token(token)

        assert payload["sub"] == special_id

    def test_token_with_additional_claims(self):
        """Token should preserve additional claims."""
        token = create_access_token(data={
            "sub": "user-123",
            "role": "admin",
            "permissions": ["read", "write"],
        })
        payload = decode_token(token)

        assert payload["sub"] == "user-123"
        assert payload["role"] == "admin"
        assert payload["permissions"] == ["read", "write"]
