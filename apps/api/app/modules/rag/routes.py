import logging

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, status

from app.modules.rag.schemas import RAGQueryRequest, RAGQueryResponse
from app.modules.rag.services.rag_service import (
    RAGIndexNotReadyError,
    RAGService,
    RAGServiceError,
)
from app.services.llm_service import LLMServiceError

logger = logging.getLogger(__name__)

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
        logger.warning("Tentativa de consulta RAG sem índice FAISS: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Base de Conhecimento ainda não possui um índice ativo.",
        ) from exc
    except LLMServiceError as exc:
        logger.exception("Falha no serviço LLM durante consulta RAG: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço de IA indisponível no momento. Tente novamente em alguns instantes.",
        ) from exc
    except RAGServiceError as exc:
        logger.warning("Falha no serviço RAG: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não foi possível concluir a busca semântica.",
        ) from exc
    except Exception as exc:
        logger.exception("Erro inesperado na consulta RAG: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocorreu um erro ao processar sua solicitação.",
        ) from exc

    return RAGQueryResponse(
        answer=result.answer,
        sources=result.sources,
        context_used=result.context_used,
        model_name=result.model_name,
    )
