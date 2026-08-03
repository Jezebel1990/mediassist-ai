"""Central application settings — loaded from environment / .env."""

from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# apps/api — resolved relative to this file so cwd does not matter
_API_ROOT = Path(__file__).resolve().parents[2]

_DEFAULT_DOCUMENTS_PATH = str(_API_ROOT / "storage" / "documents")
_DEFAULT_FAISS_PATH = str(_API_ROOT / "storage" / "faiss")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = Field(default="MediAssist AI API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    debug: bool = Field(default=True, alias="DEBUG")
    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    cors_origins_raw: str = Field(
        default="http://localhost:3000",
        alias="CORS_ORIGINS",
    )
    database_url: str = Field(
        default="sqlite:///./data/mediassist.db",
        alias="DATABASE_URL",
    )

    # Knowledge base paths (FAISS_PATH / DOCUMENTS_PATH preferred)
    documents_path: str = Field(
        default=_DEFAULT_DOCUMENTS_PATH,
        validation_alias=AliasChoices("DOCUMENTS_PATH", "DOCUMENTS_STORAGE_PATH"),
    )
    faiss_path: str = Field(
        default=_DEFAULT_FAISS_PATH,
        validation_alias=AliasChoices("FAISS_PATH", "FAISS_INDEX_PATH"),
    )
    chunk_size: int = Field(default=1000, alias="CHUNK_SIZE")
    chunk_overlap: int = Field(default=200, alias="CHUNK_OVERLAP")
    embedding_model_name: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        alias="EMBEDDING_MODEL_NAME",
    )

    # OpenRouter / LLM — change MODEL_NAME in .env to swap models
    openrouter_api_key: str = Field(default="", alias="OPENROUTER_API_KEY")
    openrouter_base_url: str = Field(
        default="https://openrouter.ai/api/v1",
        alias="OPENROUTER_BASE_URL",
    )
    model_name: str = Field(
        default="openai/gpt-oss-20b:free",
        alias="MODEL_NAME",
    )
    llm_temperature: float = Field(default=0.2, alias="LLM_TEMPERATURE")
    llm_max_tokens: int = Field(default=1024, alias="LLM_MAX_TOKENS")
    rag_top_k: int = Field(default=4, alias="RAG_TOP_K")

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins_raw.split(",")
            if origin.strip()
        ]

    @property
    def documents_dir(self) -> Path:
        return Path(self.documents_path)

    @property
    def faiss_dir(self) -> Path:
        return Path(self.faiss_path)

    # Backward-compatible aliases used by the documents module
    @property
    def documents_storage_path(self) -> str:
        return self.documents_path

    @property
    def faiss_index_path(self) -> str:
        return self.faiss_path


@lru_cache
def get_settings() -> Settings:
    return Settings()
