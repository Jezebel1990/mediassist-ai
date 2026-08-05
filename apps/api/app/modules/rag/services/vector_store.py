"""FAISS vector store — create, update, persist and load."""

from __future__ import annotations

from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document as LangChainDocument

from app.core.settings import Settings, get_settings
from app.modules.rag.services.embeddings import EmbeddingService

_INDEX_NAME = "index"


class VectorStoreService:
    """
    Manages the FAISS index lifecycle.

    Never recreates the index automatically — call `reindex` explicitly.
    First-time creation happens only when no persisted index exists.
    """

    def __init__(
        self,
        settings: Settings | None = None,
        embeddings: EmbeddingService | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._embeddings = embeddings or EmbeddingService(self._settings)
        self._index_dir = self._settings.faiss_dir
        self._store: FAISS | None = None

    @property
    def index_path(self) -> Path:
        return self._index_dir

    def index_exists(self) -> bool:
        faiss_file = self._index_dir / f"{_INDEX_NAME}.faiss"
        pkl_file = self._index_dir / f"{_INDEX_NAME}.pkl"
        return faiss_file.exists() and pkl_file.exists()

    def create_index(self, documents: list[LangChainDocument]) -> FAISS:
        """Create a brand-new FAISS index from documents and persist it."""
        if not documents:
            raise ValueError("Não é possível criar índice sem documentos.")

        self._index_dir.mkdir(parents=True, exist_ok=True)
        self._store = FAISS.from_documents(
            documents,
            self._embeddings.get_embeddings(),
        )
        self.persist_index()
        return self._store

    def load_index(self) -> FAISS:
        """Load an existing persisted FAISS index."""
        if not self.index_exists():
            raise FileNotFoundError(
                f"Índice FAISS não encontrado em {self._index_dir}"
            )

        self._store = FAISS.load_local(
            str(self._index_dir),
            self._embeddings.get_embeddings(),
            index_name=_INDEX_NAME,
            allow_dangerous_deserialization=True,
        )
        return self._store

    def get_store(self) -> FAISS:
        """Return the in-memory store, loading from disk when needed."""
        if self._store is None:
            return self.load_index()
        return self._store

    def persist_index(self) -> None:
        """Persist the in-memory index to disk."""
        if self._store is None:
            raise RuntimeError("Nenhum índice carregado para persistir.")

        self._index_dir.mkdir(parents=True, exist_ok=True)
        self._store.save_local(str(self._index_dir), index_name=_INDEX_NAME)

    def update_index(self, documents: list[LangChainDocument]) -> FAISS:
        """
        Add documents to the existing index.

        If no index exists yet, creates one (first time only — not a recreate).
        Never deletes or rebuilds an existing index.
        """
        if not documents:
            raise ValueError("Nenhum documento para adicionar ao índice.")

        if self._store is None:
            if self.index_exists():
                self.load_index()
            else:
                return self.create_index(documents)

        assert self._store is not None
        self._store.add_documents(documents)
        self.persist_index()
        return self._store

    def reindex(self, documents: list[LangChainDocument]) -> FAISS:
        """Explicitly rebuild the FAISS index from scratch."""
        self._store = None
        return self.create_index(documents)

    def clear_index(self) -> None:
        """Remove the persisted FAISS index from memory and disk."""
        self._store = None
        faiss_file = self._index_dir / f"{_INDEX_NAME}.faiss"
        pkl_file = self._index_dir / f"{_INDEX_NAME}.pkl"
        if faiss_file.exists():
            faiss_file.unlink()
        if pkl_file.exists():
            pkl_file.unlink()

    def similarity_search(
        self,
        query: str,
        k: int | None = None,
    ) -> list[LangChainDocument]:
        """Semantic search over the persisted FAISS index."""
        top_k = k if k is not None else self._settings.rag_top_k
        store = self.get_store()
        return store.similarity_search(query, k=top_k)
