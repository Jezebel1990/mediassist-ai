from typing import Annotated

from fastapi import APIRouter, Body, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.documents.schemas import (
    DocumentsListResponse,
    DocumentsStatusResponse,
    ProcessRequest,
    ProcessResponse,
    ReindexResponse,
    UploadResponse,
)
from app.modules.documents.service import (
    DocumentNotFoundError,
    DocumentService,
    NoDocumentsToProcessError,
)

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

    service = DocumentService(db)
    return await service.upload(files)


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


@router.get(
    "",
    response_model=DocumentsListResponse,
    status_code=status.HTTP_200_OK,
)
def list_documents(db: Session = Depends(get_db)) -> DocumentsListResponse:
    return DocumentService(db).list_documents()


@router.get(
    "/status",
    response_model=DocumentsStatusResponse,
    status_code=status.HTTP_200_OK,
)
def documents_status(db: Session = Depends(get_db)) -> DocumentsStatusResponse:
    return DocumentService(db).get_status()
