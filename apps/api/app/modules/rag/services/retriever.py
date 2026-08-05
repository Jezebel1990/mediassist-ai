"""Semantic retriever over the FAISS knowledge base."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from langchain_core.documents import Document as LangChainDocument

from app.core.settings import Settings, get_settings
from app.modules.rag.services.vector_store import VectorStoreService


@dataclass(frozen=True)
class SourceCitation:
    """A document reference recovered from retrieved chunks."""

    document: str
    page: int | None = None


@dataclass(frozen=True)
class RetrievedContext:
    """Bundled retrieval result ready for LLM prompting."""

    documents: list[LangChainDocument]
    context_text: str
    sources: list[str]
    citations: list[SourceCitation] = field(default_factory=list)


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
        citations = self._unique_citations(documents)
        sources = [citation.document for citation in citations]
        # Preserve unique document names while keeping first-seen order.
        seen_names: set[str] = set()
        unique_sources: list[str] = []
        for name in sources:
            if name not in seen_names:
                seen_names.add(name)
                unique_sources.append(name)

        context_text = self._format_context(documents)
        return RetrievedContext(
            documents=documents,
            context_text=context_text,
            sources=unique_sources,
            citations=citations,
        )

    @classmethod
    def _unique_citations(
        cls,
        documents: list[LangChainDocument],
    ) -> list[SourceCitation]:
        seen: set[tuple[str, int | None]] = set()
        citations: list[SourceCitation] = []
        for doc in documents:
            name = cls._document_name(doc.metadata)
            page = cls._extract_page(doc.metadata)
            key = (name, page)
            if key in seen:
                continue
            seen.add(key)
            citations.append(SourceCitation(document=name, page=page))
        return citations

    @staticmethod
    def _document_name(metadata: dict[str, Any]) -> str:
        name = (
            metadata.get("original_filename")
            or metadata.get("source")
            or "desconhecido"
        )
        return str(name)

    @staticmethod
    def _extract_page(metadata: dict[str, Any]) -> int | None:
        """
        Resolve a human-facing page number from loader metadata.

        PyPDFLoader stores a 0-based `page` index; other loaders may omit it.
        """
        raw = metadata.get("page")
        if raw is None:
            raw = metadata.get("page_number")
        if raw is None:
            return None
        try:
            page = int(raw)
        except (TypeError, ValueError):
            return None
        # PyPDFLoader is 0-indexed; normalize to 1-based for the UI.
        if "page" in metadata and "page_number" not in metadata:
            return page + 1
        return page if page > 0 else None

    @classmethod
    def _format_context(cls, documents: list[LangChainDocument]) -> str:
        if not documents:
            return ""

        parts: list[str] = []
        for index, doc in enumerate(documents, start=1):
            source = cls._document_name(doc.metadata)
            page = cls._extract_page(doc.metadata)
            page_label = f", página {page}" if page is not None else ""
            parts.append(
                f"[Trecho {index} | Fonte: {source}{page_label}]\n{doc.page_content}"
            )
        return "\n\n".join(parts)
