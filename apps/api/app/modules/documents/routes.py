import logging
from typing import Annotated

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Body, Depends, File, HTTPException, UploadFile, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.documents.schemas import (
    DeleteDocumentResponse,
    DocumentResponse,
    DocumentsListResponse,
    DocumentsStatusResponse,
    ProcessRequest,
    ProcessResponse,
    ReindexResponse,
    UpdateDocumentRequest,
    UploadResponse,
)
from app.modules.documents.service import (
    DocumentNotFoundError,
    DocumentService,
    InvalidDocumentNameError,
    NoDocumentsToProcessError,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_documents(
    files: list[UploadFile] = File(..., description="Um ou mais arquivos"),
    db: Session = Depends(get_db),
) -> UploadResponse:
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Envie ao menos um arquivo.",
        )

    try:
        service = DocumentService(db)
        return await service.upload(files)
    except Exception as exc:
        logger.exception("Erro ao realizar upload de arquivos: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível enviar os arquivos.",
        ) from exc


@router.post(
    "/process",
    response_model=ProcessResponse,
    status_code=status.HTTP_200_OK,
)
def process_documents(
    payload: Annotated[ProcessRequest | None, Body()] = None,
    db: Session = Depends(get_db),
) -> ProcessResponse:
    service = DocumentService(db)
    try:
        return service.process(payload)
    except DocumentNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except NoDocumentsToProcessError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Erro ao processar documentos: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível processar os documentos.",
        ) from exc


@router.post(
    "/reindex",
    response_model=ReindexResponse,
    status_code=status.HTTP_200_OK,
)
def reindex_documents(db: Session = Depends(get_db)) -> ReindexResponse:
    service = DocumentService(db)
    try:
        return service.reindex()
    except NoDocumentsToProcessError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Erro ao reindexar documentos: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível atualizar a base.",
        ) from exc


@router.get(
    "",
    response_model=DocumentsListResponse,
    status_code=status.HTTP_200_OK,
)
def list_documents(db: Session = Depends(get_db)) -> DocumentsListResponse:
    try:
        return DocumentService(db).list_documents()
    except Exception as exc:
        logger.exception("Erro ao listar documentos: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível carregar os documentos.",
        ) from exc


@router.get(
    "/status",
    response_model=DocumentsStatusResponse,
    status_code=status.HTTP_200_OK,
)
def documents_status(db: Session = Depends(get_db)) -> DocumentsStatusResponse:
    try:
        return DocumentService(db).get_status()
    except Exception as exc:
        logger.exception("Erro ao obter status dos documentos: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível carregar o status da base.",
        ) from exc


@router.put(
    "/{document_id}",
    response_model=DocumentResponse,
    status_code=status.HTTP_200_OK,
)
def update_document(
    document_id: str,
    payload: UpdateDocumentRequest,
    db: Session = Depends(get_db),
) -> DocumentResponse:
    service = DocumentService(db)
    try:
        return service.rename(document_id, payload)
    except DocumentNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except InvalidDocumentNameError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Erro ao atualizar documento %s: %s", document_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar.",
        ) from exc


@router.delete(
    "/{document_id}",
    response_model=DeleteDocumentResponse,
    status_code=status.HTTP_200_OK,
)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
) -> DeleteDocumentResponse:
    service = DocumentService(db)
    try:
        return service.delete(document_id)
    except DocumentNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Erro ao excluir documento %s: %s", document_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível excluir o documento. Tente novamente.",
        ) from exc
