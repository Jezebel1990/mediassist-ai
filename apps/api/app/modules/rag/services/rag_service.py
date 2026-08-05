"""RAG orchestration — retrieve context and generate an answer via OpenRouter."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field

from langchain_core.documents import Document as LangChainDocument
from langchain_core.messages import HumanMessage, SystemMessage

from app.core.settings import Settings, get_settings
from app.modules.rag.services.retriever import RetrieverService, SourceCitation
from app.services.llm_service import LLMService, LLMServiceError

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """Você é o assistente clínico MediAssist AI.
Responda em português brasileiro de forma clara e objetiva.
Use APENAS o contexto recuperado da base de conhecimento.
Se o contexto for insuficiente, diga claramente que ainda não tem essa informação
disponível na Base de Conhecimento e sugira adicionar documentos na seção
"Base de Conhecimento". Não invente protocolos, dosagens ou políticas.
Quando possível, cite a fonte (nome do documento) mencionada nos trechos.
Ao final da resposta, adicione obrigatoriamente uma linha no formato exato:
[FONTES_UTILIZADAS: N, N, N]
onde N são os números dos Trechos que você efetivamente utilizou para construir a resposta.
Se não utilizou nenhum trecho (contexto insuficiente), escreva: [FONTES_UTILIZADAS:]"""

_NOT_FOUND_ANSWER = (
    "Desculpe, ainda não encontrei essa informação na Base de Conhecimento.\n\n"
    "Você pode adicionar novos documentos para ampliar meu conhecimento."
)

# Regex to extract the [FONTES_UTILIZADAS: ...] marker from the LLM response.
_FONTES_RE = re.compile(
    r"\[FONTES_UTILIZADAS:\s*([\d,\s]*)\]\s*$",
    re.MULTILINE,
)


@dataclass(frozen=True)
class RAGAnswer:
    answer: str
    sources: list[str] = field(default_factory=list)
    citations: list[SourceCitation] = field(default_factory=list)
    context_used: bool = False
    model_name: str = ""


class RAGServiceError(Exception):
    """Base error for RAG operations."""


class RAGIndexNotReadyError(RAGServiceError):
    """Raised when the FAISS index is missing."""


class RAGService:
    """
    End-to-end RAG pipeline for the future Chat screen:

    1. Load FAISS
    2. Semantic search
    3. Build context
    4. Call OpenRouter LLM
    5. Return answer + sources
    """

    def __init__(
        self,
        settings: Settings | None = None,
        retriever: RetrieverService | None = None,
        llm_service: LLMService | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._retriever = retriever or RetrieverService(self._settings)
        self._llm_service = llm_service or LLMService(self._settings)

    @property
    def model_name(self) -> str:
        return self._llm_service.model_name

    def ask(
        self,
        question: str,
        *,
        k: int | None = None,
        model_name: str | None = None,
    ) -> RAGAnswer:
        """Retrieve relevant chunks and generate an answer."""
        question = question.strip()
        if not question:
            raise RAGServiceError("A pergunta não pode ser vazia.")

        try:
            retrieved = self._retriever.retrieve(question, k=k)
        except FileNotFoundError as exc:
            raise RAGIndexNotReadyError(str(exc)) from exc

        llm_service = (
            self._llm_service.with_model(model_name)
            if model_name
            else self._llm_service
        )

        if not retrieved.documents:
            return RAGAnswer(
                answer=_NOT_FOUND_ANSWER,
                sources=[],
                citations=[],
                context_used=False,
                model_name=llm_service.model_name,
            )

        user_prompt = (
            f"Contexto da base de conhecimento:\n\n"
            f"{retrieved.context_text}\n\n"
            f"Pergunta do usuário:\n{question}"
        )

        try:
            llm = llm_service.get_llm()
            response = llm.invoke(
                [
                    SystemMessage(content=_SYSTEM_PROMPT),
                    HumanMessage(content=user_prompt),
                ]
            )
        except LLMServiceError:
            raise
        except Exception as exc:  # noqa: BLE001 — LangChain / provider failures
            logger.exception("LLM invoke failed during RAG ask: %s", exc)
            raise RAGServiceError(f"Falha ao consultar o modelo: {exc}") from exc

        answer = getattr(response, "content", None) or str(response)
        if isinstance(answer, list):
            answer = "".join(
                block.get("text", "") if isinstance(block, dict) else str(block)
                for block in answer
            )

        cleaned = str(answer).strip()
        if not cleaned:
            logger.info("LLM returned an empty answer; using friendly not-found reply.")
            return RAGAnswer(
                answer=_NOT_FOUND_ANSWER,
                sources=[],
                citations=[],
                context_used=False,
                model_name=llm_service.model_name,
            )

        # Extract which chunk indices the LLM declared it actually used.
        # Pass the raw documents list so that [Trecho N] indices map correctly
        # to the same positions used by _format_context (1-based, all chunks).
        used_citations, visible_answer = self._extract_used_citations(
            cleaned, retrieved.documents
        )

        if not used_citations:
            # LLM explicitly indicated no usable chunks or marker is missing.
            return RAGAnswer(
                answer=visible_answer,
                sources=[],
                citations=[],
                context_used=False,
                model_name=llm_service.model_name,
            )

        used_sources: list[str] = []
        seen_sources: set[str] = set()
        for citation in used_citations:
            if citation.document not in seen_sources:
                seen_sources.add(citation.document)
                used_sources.append(citation.document)

        return RAGAnswer(
            answer=visible_answer,
            sources=used_sources,
            citations=used_citations,
            context_used=True,
            model_name=llm_service.model_name,
        )

    @staticmethod
    def _extract_used_citations(
        raw_answer: str,
        documents: list[LangChainDocument],
    ) -> tuple[list[SourceCitation], str]:
        """
        Parse the [FONTES_UTILIZADAS: N, N] marker from the LLM response.

        Returns (used_citations, answer_without_marker).  Chunk indices in the
        marker are 1-based and match the [Trecho N] labels produced by
        RetrieverService._format_context, which enumerates `documents` starting
        at 1.  We derive SourceCitation objects directly from chunk metadata so
        that the index-to-document mapping is always exact.
        """
        match = _FONTES_RE.search(raw_answer)
        # Strip the marker from the visible answer regardless of its content.
        visible = _FONTES_RE.sub("", raw_answer).rstrip()

        if match is None:
            logger.warning(
                "LLM response missing [FONTES_UTILIZADAS] marker; "
                "no sources will be shown."
            )
            return [], visible

        indices_str = match.group(1).strip()
        if not indices_str:
            # Marker present but empty → model found no usable context.
            return [], visible

        used_indices: set[int] = set()
        for part in indices_str.split(","):
            part = part.strip()
            if part.isdigit():
                used_indices.add(int(part))

        # Map 1-based chunk indices directly to documents (same ordering as
        # _format_context).  Build SourceCitation from each chunk's metadata,
        # deduplicating by (document, page) so each unique location appears once.
        used_citations: list[SourceCitation] = []
        seen: set[tuple[str, int | None]] = set()
        for idx in sorted(used_indices):
            pos = idx - 1  # convert to 0-based
            if 0 <= pos < len(documents):
                doc = documents[pos]
                name = RetrieverService._document_name(doc.metadata)  # noqa: SLF001
                page = RetrieverService._extract_page(doc.metadata)   # noqa: SLF001
                key = (name, page)
                if key not in seen:
                    seen.add(key)
                    used_citations.append(SourceCitation(document=name, page=page))
            else:
                logger.debug("LLM referenced out-of-range chunk index %d; skipping.", idx)

        return used_citations, visible
