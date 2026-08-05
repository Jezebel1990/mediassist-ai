"""Chat HTTP endpoints — primary surface for the Assistente Inteligente UI."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status

from app.modules.chat.schemas import ChatRequest, ChatResponse
from app.modules.chat.service import (
    FRIENDLY_ERROR_ANSWER,
    NOT_FOUND_ANSWER,
    ChatService,
)
from app.modules.rag.services.rag_service import (
    RAGIndexNotReadyError,
    RAGServiceError,
)
from app.services.llm_service import LLMServiceError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
)
def chat(payload: ChatRequest) -> ChatResponse:
    """
    Answer a clinical knowledge question using retrieval-augmented generation.

    Flow: question → Retriever (FAISS) → LangChain prompt → OpenRouter → answer.

    Valid questions always return HTTP 200 with a friendly `answer`, even when
    the knowledge base has no matching context. HTTP 4xx/5xx are reserved for
    real API failures (invalid payload, unexpected internal errors).
    """
    service = ChatService()
    try:
        result = service.ask(payload.question)
    except RAGIndexNotReadyError as exc:
        # No index yet ≡ no knowledge available — still a successful chat turn.
        logger.info("Chat asked with empty/missing FAISS index: %s", exc)
        return ChatResponse(success=True, answer=NOT_FOUND_ANSWER, sources=[])
    except LLMServiceError as exc:
        logger.exception("OpenRouter / LLM failure during chat: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=FRIENDLY_ERROR_ANSWER,
        ) from exc
    except RAGServiceError as exc:
        message = str(exc)
        if "vazia" in message.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=FRIENDLY_ERROR_ANSWER,
            ) from exc
        logger.exception("RAG / LangChain failure during chat: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=FRIENDLY_ERROR_ANSWER,
        ) from exc
    except Exception as exc:  # noqa: BLE001 — unexpected failures
        logger.exception("Unexpected chat failure: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=FRIENDLY_ERROR_ANSWER,
        ) from exc

    return ChatResponse(
        success=result.success,
        answer=result.answer,
        sources=result.sources,
    )
