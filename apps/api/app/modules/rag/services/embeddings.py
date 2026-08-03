"""HuggingFace embeddings factory for the knowledge base."""

from __future__ import annotations

from langchain_huggingface import HuggingFaceEmbeddings

from app.core.settings import Settings, get_settings

_embeddings_cache: dict[str, HuggingFaceEmbeddings] = {}


class EmbeddingService:
    """
    Provides HuggingFace sentence-transformer embeddings.

    Instances are cached per model name so FAISS load/create share one model.
    """

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()

    @property
    def model_name(self) -> str:
        return self._settings.embedding_model_name

    def get_embeddings(self) -> HuggingFaceEmbeddings:
        name = self.model_name
        if name not in _embeddings_cache:
            _embeddings_cache[name] = HuggingFaceEmbeddings(model_name=name)
        return _embeddings_cache[name]
