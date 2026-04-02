from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Ignore extra env variables
    )

    # Application
    app_name: str = "Iridia Notes API"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://iridia:iridia_secret@localhost:5432/iridia_notes"

    # Authentication
    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Google OAuth2
    google_client_id: str = ""
    google_allowed_domain: str = ""  # vacío = acepta cualquier cuenta Google

    # Iris Agent (LLM)
    anthropic_api_key: str = ""

    # Observabilidad — Langfuse
    langfuse_public_key: str = ""
    langfuse_secret_key: str = ""
    langfuse_host: str = "https://cloud.langfuse.com"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
