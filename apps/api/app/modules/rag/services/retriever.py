"""Semantic retriever over the FAISS knowledge base."""

from __future__ import annotations

from dataclasses import dataclass

from langchain_core.documents import Document as LangChainDocument

from app.core.settings import Settings, get_settings
from app.modules.rag.services.vector_store import VectorStoreService


@dataclass(frozen=True)
class RetrievedContext:
    """Bundled retrieval result ready for LLM prompting."""

    documents: list[LangChainDocument]
    context_text: str
    sources: list[str]


class RetrieverService:
    """Loads FAISS and runs semantic search for RAG."""

    def __init__(
        self,
        settings: Settings | None = None,
        vector_store: VectorStoreService | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._vector_store = vector_store or VectorStoreService(self._settings)

    @property
    def vector_store(self) -> VectorStoreService:
        return self._vector_store

    def retrieve(
        self,
        query: str,
        k: int | None = None,
    ) -> RetrievedContext:
        """
        Execute semantic search and format chunks as a single context string.
        """
        if not self._vector_store.index_exists():
            raise FileNotFoundError(
                "Índice FAISS ainda não existe. "
                "Processe documentos na Base de Conhecimento primeiro."
            )

        documents = self._vector_store.similarity_search(query, k=k)
        sources = self._unique_sources(documents)
        context_text = self._format_context(documents)
        return RetrievedContext(
            documents=documents,
            context_text=context_text,
            sources=sources,
        )

    @staticmethod
    def _unique_sources(documents: list[LangChainDocument]) -> list[str]:
        seen: set[str] = set()
        sources: list[str] = []
        for doc in documents:
            name = (
                doc.metadata.get("original_filename")
                or doc.metadata.get("source")
                or "desconhecido"
            )
            if name not in seen:
                seen.add(name)
                sources.append(str(name))
        return sources

    @staticmethod
    def _format_context(documents: list[LangChainDocument]) -> str:
        if not documents:
            return ""

        parts: list[str] = []
        for index, doc in enumerate(documents, start=1):
            source = (
                doc.metadata.get("original_filename")
                or doc.metadata.get("source")
                or "desconhecido"
            )
            parts.append(f"[Trecho {index} | Fonte: {source}]\n{doc.page_content}")
        return "\n\n".join(parts)
