"""Document business logic — upload, process and indexing."""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

# pyrefly: ignore [missing-import]
from fastapi import UploadFile
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.core.settings import Settings, get_settings
from app.models.document import Document, DocumentStatus
from app.modules.documents.loaders import SUPPORTED_EXTENSIONS, DocumentLoaderFactory
from app.modules.documents.processor import DocumentProcessor
from app.modules.documents.repository import DocumentRepository
from app.modules.documents.schemas import (
    DeleteDocumentResponse,
    DocumentResponse,
    DocumentsListResponse,
    DocumentsStatusResponse,
    ProcessRequest,
    ProcessResponse,
    ProcessResultItem,
    ReindexResponse,
    UpdateDocumentRequest,
    UploadResponse,
)
from app.modules.rag.services.vector_store import VectorStoreService


def _ensure_utc(dt: datetime) -> datetime:
    """Return a UTC-aware datetime regardless of whether *dt* has tzinfo.

    SQLite may return timezone-naive datetimes even when the column is
    declared as DateTime(timezone=True). This helper normalises them so
    that max() comparisons and JSON serialisation are always unambiguous.
    """
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class DocumentServiceError(Exception):
    """Base error for document operations."""


class DocumentNotFoundError(DocumentServiceError):
    """Raised when a requested document does not exist."""


class NoDocumentsToProcessError(DocumentServiceError):
    """Raised when process/reindex has nothing to work on."""


class InvalidDocumentNameError(DocumentServiceError):
    """Raised when a rename payload is invalid."""


_UNSAFE_FILENAME = re.compile(r"[^\w.\-]+", re.UNICODE)
_UNSAFE_DISPLAY_NAME = re.compile(r"[\\/<>:\"|?*\x00-\x1f]+")


def _sanitize_filename(filename: str) -> str:
    name = Path(filename).name
    cleaned = _UNSAFE_FILENAME.sub("_", name).strip("._")
    return cleaned or "document"


def _sanitize_display_name(name: str) -> str:
    cleaned = _UNSAFE_DISPLAY_NAME.sub("", name).strip(" .")
    return cleaned


class DocumentService:
    def __init__(
        self,
        db: Session,
        settings: Settings | None = None,
        processor: DocumentProcessor | None = None,
        vector_store: VectorStoreService | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._documents = DocumentRepository(db)
        self._processor = processor or DocumentProcessor(self._settings)
        self._vector_store = vector_store or VectorStoreService(self._settings)
        self._settings.documents_dir.mkdir(parents=True, exist_ok=True)
        self._settings.faiss_dir.mkdir(parents=True, exist_ok=True)

    async def upload(self, files: list[UploadFile]) -> UploadResponse:
        uploaded: list[DocumentResponse] = []
        rejected: list[str] = []

        for file in files:
            original_name = file.filename or "unnamed"
            extension = Path(original_name).suffix.lower()

            if extension not in SUPPORTED_EXTENSIONS:
                rejected.append(
                    f"{original_name}: formato não suportado ({extension or 'sem extensão'})"
                )
                continue

            stored_name = f"{uuid.uuid4().hex}_{_sanitize_filename(original_name)}"
            destination = self._settings.documents_dir / stored_name

            content = await file.read()
            if len(content) == 0:
                rejected.append(
                    f"{original_name}: o arquivo está vazio e não pode ser processado."
                )
                continue

            destination.write_bytes(content)

            document = self._documents.create(
                original_filename=original_name,
                stored_filename=stored_name,
                file_path=str(destination),
                extension=extension,
                content_type=file.content_type,
                file_size=len(content),
            )
            uploaded.append(DocumentResponse.model_validate(document))

        return UploadResponse(uploaded=uploaded, rejected=rejected)

    def process(self, payload: ProcessRequest | None = None) -> ProcessResponse:
        payload = payload or ProcessRequest()

        if payload.document_ids:
            documents = self._documents.list_by_ids(payload.document_ids)
            found_ids = {doc.id for doc in documents}
            missing = [doc_id for doc_id in payload.document_ids if doc_id not in found_ids]
            if missing:
                raise DocumentNotFoundError(
                    f"Documentos não encontrados: {', '.join(missing)}"
                )
        else:
            documents = self._documents.list_by_status(DocumentStatus.UPLOADED)

        if not documents:
            raise NoDocumentsToProcessError(
                "Nenhum documento pendente para processar."
            )

        results: list[ProcessResultItem] = []

        for document in documents:
            result = self._process_single(document)
            results.append(result)

        indexed_count = sum(
            1 for item in results if item.status.value == DocumentStatus.INDEXED.value
        )
        return ProcessResponse(
            processed=results,
            message=(
                f"{len(results)} documento(s) processado(s); "
                f"{indexed_count} indexado(s) no FAISS."
            ),
        )

    def _process_single(self, document: Document) -> ProcessResultItem:
        document.status = DocumentStatus.PROCESSING
        document.error_message = None
        self._documents.save(document)

        try:
            if not DocumentLoaderFactory.is_supported(document.file_path):
                raise ValueError(
                    f"Formato não suportado: {document.extension}"
                )

            chunks = self._processor.process(document.file_path)
            for chunk in chunks:
                chunk.metadata["document_id"] = document.id
                chunk.metadata["original_filename"] = document.original_filename

            document.chunk_count = len(chunks)
            document.status = DocumentStatus.PROCESSED
            document.processed_at = datetime.now(timezone.utc)
            self._documents.save(document)

            if chunks:
                self._vector_store.update_index(chunks)
                document.status = DocumentStatus.INDEXED
                self._documents.save(document)

            return ProcessResultItem(
                document_id=document.id,
                filename=document.original_filename,
                status=document.status,  # type: ignore[arg-type]
                chunk_count=document.chunk_count,
            )
        except Exception as exc:  # noqa: BLE001 — isolate per-document failures
            document.status = DocumentStatus.FAILED
            document.error_message = str(exc)
            self._documents.save(document)
            return ProcessResultItem(
                document_id=document.id,
                filename=document.original_filename,
                status=document.status,  # type: ignore[arg-type]
                chunk_count=document.chunk_count,
                error_message=str(exc),
            )

    def reindex(self) -> ReindexResponse:
        """Explicitly rebuild the FAISS index from every document still on disk."""
        processable = [
            doc
            for doc in self._documents.list_all()
            if Path(doc.file_path).exists()
        ]
        if not processable:
            raise NoDocumentsToProcessError(
                "Nenhum arquivo encontrado em disco para reindexar."
            )

        all_chunks = []
        indexed_docs = 0
        total_chunks = 0

        for document in processable:
            document.status = DocumentStatus.PROCESSING
            document.error_message = None
            self._documents.save(document)

            try:
                chunks = self._processor.process(document.file_path)
                for chunk in chunks:
                    chunk.metadata["document_id"] = document.id
                    chunk.metadata["original_filename"] = document.original_filename

                document.chunk_count = len(chunks)
                document.processed_at = datetime.now(timezone.utc)
                document.status = DocumentStatus.PROCESSED
                self._documents.save(document)

                all_chunks.extend(chunks)
                total_chunks += len(chunks)
                indexed_docs += 1
            except Exception as exc:  # noqa: BLE001 — isolate per-document failures
                document.status = DocumentStatus.FAILED
                document.error_message = str(exc)
                self._documents.save(document)

        if not all_chunks:
            raise NoDocumentsToProcessError(
                "Reindexação não gerou fragmentos — verifique os documentos."
            )

        self._vector_store.reindex(all_chunks)

        for document in processable:
            if document.status == DocumentStatus.PROCESSED:
                document.status = DocumentStatus.INDEXED
                self._documents.save(document)

        return ReindexResponse(
            documents_indexed=indexed_docs,
            total_chunks=total_chunks,
            message=(
                f"Índice FAISS recriado com {indexed_docs} documento(s) "
                f"e {total_chunks} fragmento(s)."
            ),
        )

    def list_documents(self) -> DocumentsListResponse:
        documents = self._documents.list_all()
        return DocumentsListResponse(
            documents=[DocumentResponse.model_validate(doc) for doc in documents],
            total=len(documents),
        )

    def rename(self, document_id: str, payload: UpdateDocumentRequest) -> DocumentResponse:
        document = self._documents.get_by_id(document_id)
        if document is None:
            raise DocumentNotFoundError(f"Documento não encontrado: {document_id}")

        raw_name = payload.name.strip()
        if not raw_name:
            raise InvalidDocumentNameError("O nome do documento não pode ser vazio.")

        # Never allow changing the extension — strip any suffix the user typed.
        stem = Path(raw_name).stem.strip() or raw_name
        if stem.lower().endswith(document.extension.lower()):
            stem = stem[: -len(document.extension)].rstrip(".")

        stem = _sanitize_display_name(stem)
        if not stem:
            raise InvalidDocumentNameError("O nome do documento não pode ser vazio.")

        new_filename = f"{stem}{document.extension}"
        document.original_filename = new_filename
        self._documents.save(document)

        # Keep FAISS citation metadata in sync when the doc is already indexed.
        if document.status == DocumentStatus.INDEXED and self._vector_store.index_exists():
            try:
                self.reindex()
            except NoDocumentsToProcessError:
                pass

        return DocumentResponse.model_validate(document)

    def delete(self, document_id: str) -> DeleteDocumentResponse:
        document = self._documents.get_by_id(document_id)
        if document is None:
            raise DocumentNotFoundError(f"Documento não encontrado: {document_id}")

        file_path = Path(document.file_path)
        if file_path.exists():
            file_path.unlink()

        self._documents.delete(document)

        remaining = [
            doc
            for doc in self._documents.list_all()
            if Path(doc.file_path).exists()
        ]

        if remaining:
            try:
                self.reindex()
            except NoDocumentsToProcessError:
                self._vector_store.clear_index()
        else:
            self._vector_store.clear_index()

        return DeleteDocumentResponse(
            id=document_id,
            message="Documento excluído com sucesso.",
        )

    def get_status(self) -> DocumentsStatusResponse:
        counts = self._documents.count_by_status()
        total = sum(counts.values())
        all_docs = self._documents.list_all()
        # Track the latest knowledge-base activity (upload, rename, process,
        # reindex, delete→reindex) — never a fixed/hardcoded date.
        # Normalise every timestamp to UTC-aware so max() works correctly
        # even when SQLite returns timezone-naive datetimes.
        activity_timestamps: list[datetime] = []
        for doc in all_docs:
            activity_timestamps.append(_ensure_utc(doc.created_at))
            activity_timestamps.append(_ensure_utc(doc.updated_at))
            if doc.processed_at is not None:
                activity_timestamps.append(_ensure_utc(doc.processed_at))
        last_indexed_at = max(activity_timestamps) if activity_timestamps else None

        by_format: dict[str, int] = {}
        total_chunks = 0
        for doc in all_docs:
            total_chunks += doc.chunk_count or 0
            key = self._format_key(doc.extension)
            by_format[key] = by_format.get(key, 0) + 1

        return DocumentsStatusResponse(
            total=total,
            uploaded=counts[DocumentStatus.UPLOADED],
            processing=counts[DocumentStatus.PROCESSING],
            processed=counts[DocumentStatus.PROCESSED],
            indexed=counts[DocumentStatus.INDEXED],
            failed=counts[DocumentStatus.FAILED],
            total_chunks=total_chunks,
            by_format=by_format,
            index_exists=self._vector_store.index_exists(),
            index_path=str(self._vector_store.index_path),
            last_indexed_at=last_indexed_at,
            model_name=self._settings.model_name,
        )

    @staticmethod
    def _format_key(extension: str) -> str:
        ext = extension.lower().lstrip(".")
        if ext in {"md", "markdown"}:
            return "markdown"
        if ext in {"htm", "html"}:
            return "html"
        return ext
