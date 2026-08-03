"""RAG HTTP endpoints — consumed later by the Chat screen."""

from fastapi import APIRouter, HTTPException, status

from app.modules.rag.schemas import RAGQueryRequest, RAGQueryResponse
from app.modules.rag.services.rag_service import (
    RAGIndexNotReadyError,
    RAGService,
    RAGServiceError,
)
from app.services.llm_service import LLMServiceError

router = APIRouter(prefix="/api/rag", tags=["rag"])


@router.post(
    "/query",
    response_model=RAGQueryResponse,
    status_code=status.HTTP_200_OK,
)
def query_rag(payload: RAGQueryRequest) -> RAGQueryResponse:
    """
    Retrieve knowledge-base context and generate an answer.

    The Chat UI will call this endpoint; it is available now for integration tests.
    """
    service = RAGService()
    try:
        result = service.ask(
            payload.question,
            k=payload.top_k,
            model_name=payload.model_name,
        )
    except RAGIndexNotReadyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    except LLMServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except RAGServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return RAGQueryResponse(
        answer=result.answer,
        sources=result.sources,
        context_used=result.context_used,
        model_name=result.model_name,
    )
