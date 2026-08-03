"""RAG orchestration — retrieve context and generate an answer via OpenRouter."""

from __future__ import annotations

from dataclasses import dataclass, field

from langchain_core.messages import HumanMessage, SystemMessage

from app.core.settings import Settings, get_settings
from app.modules.rag.services.retriever import RetrieverService
from app.services.llm_service import LLMService, LLMServiceError

_SYSTEM_PROMPT = """Você é o assistente clínico MediAssist AI.
Responda em português brasileiro de forma clara e objetiva.
Use APENAS o contexto recuperado da base de conhecimento.
Se o contexto for insuficiente, diga que não encontrou a informação na base.
Não invente protocolos, dosagens ou políticas que não estejam no contexto.
Quando possível, cite a fonte (nome do documento) mencionada nos trechos."""


@dataclass(frozen=True)
class RAGAnswer:
    answer: str
    sources: list[str] = field(default_factory=list)
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
                answer=(
                    "Não encontrei trechos relevantes na base de conhecimento "
                    "para responder a essa pergunta."
                ),
                sources=[],
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
        except Exception as exc:  # noqa: BLE001
            raise RAGServiceError(f"Falha ao consultar o modelo: {exc}") from exc

        answer = getattr(response, "content", None) or str(response)
        if isinstance(answer, list):
            answer = "".join(
                block.get("text", "") if isinstance(block, dict) else str(block)
                for block in answer
            )

        return RAGAnswer(
            answer=str(answer).strip(),
            sources=retrieved.sources,
            context_used=True,
            model_name=llm_service.model_name,
        )
