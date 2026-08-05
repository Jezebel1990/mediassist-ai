"""Chat orchestration — thin facade over RAGService for the Chat UI."""

from __future__ import annotations

from dataclasses import dataclass, field

from app.modules.chat.schemas import ChatSource
from app.modules.rag.services.rag_service import (
    RAGAnswer,
    RAGService,
    RAGServiceError,
)

# Friendly answer when the knowledge base has no usable context.
NOT_FOUND_ANSWER = (
    "Desculpe, ainda não encontrei essa informação na Base de Conhecimento.\n\n"
    "Você pode adicionar novos documentos para ampliar meu conhecimento."
)

FRIENDLY_ERROR_ANSWER = (
    "Ocorreu um problema ao processar sua solicitação. "
    "Tente novamente em alguns instantes."
)


@dataclass(frozen=True)
class ChatAnswer:
    answer: str
    sources: list[ChatSource] = field(default_factory=list)
    success: bool = True


class ChatServiceError(Exception):
    """Base error for chat operations."""


class ChatService:
    """
    Maps Chat requests onto the existing RAG pipeline.

    Keeping this facade separate from RAGService allows the Chat API to evolve
    (sessions, streaming, history) without coupling the UI to retrieval internals.
    """

    def __init__(self, rag_service: RAGService | None = None) -> None:
        self._rag = rag_service or RAGService()

    def ask(self, question: str) -> ChatAnswer:
        try:
            result = self._rag.ask(question)
        except RAGServiceError:
            raise
        return self._to_chat_answer(result)

    @staticmethod
    def _to_chat_answer(result: RAGAnswer) -> ChatAnswer:
        sources = ChatService._dedupe_sources(result)
        answer = (result.answer or "").strip() or NOT_FOUND_ANSWER
        return ChatAnswer(answer=answer, sources=sources, success=True)

    @staticmethod
    def _dedupe_sources(result: RAGAnswer) -> list[ChatSource]:
        """
        Collapse citations so each document appears once.

        Pages consulted across chunks are grouped under the same document.
        """
        pages_by_doc: dict[str, list[int]] = {}
        order: list[str] = []

        for citation in result.citations:
            name = citation.document
            if name not in pages_by_doc:
                pages_by_doc[name] = []
                order.append(name)
            if citation.page is not None and citation.page not in pages_by_doc[name]:
                pages_by_doc[name].append(citation.page)

        if not order and result.sources:
            for name in result.sources:
                if name not in pages_by_doc:
                    pages_by_doc[name] = []
                    order.append(name)

        return [
            ChatSource(document=name, pages=sorted(pages_by_doc[name]))
            for name in order
        ]
