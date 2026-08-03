from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class DocumentStatusEnum(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PROCESSED = "processed"
    INDEXED = "indexed"
    FAILED = "failed"


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    original_filename: str
    extension: str
    content_type: str | None = None
    file_size: int
    status: DocumentStatusEnum
    chunk_count: int = 0
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime
    processed_at: datetime | None = None


class UploadResponse(BaseModel):
    uploaded: list[DocumentResponse]
    rejected: list[str] = Field(default_factory=list)


class ProcessRequest(BaseModel):
    """Optional document IDs. When empty, all `uploaded` documents are processed."""

    document_ids: list[str] = Field(default_factory=list)


class ProcessResultItem(BaseModel):
    document_id: str
    filename: str
    status: DocumentStatusEnum
    chunk_count: int = 0
    error_message: str | None = None


class ProcessResponse(BaseModel):
    processed: list[ProcessResultItem]
    message: str


class ReindexResponse(BaseModel):
    documents_indexed: int
    total_chunks: int
    message: str


class DocumentsListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int


class DocumentsStatusResponse(BaseModel):
    total: int
    uploaded: int
    processing: int
    processed: int
    indexed: int
    failed: int
    index_exists: bool
    index_path: str
    last_indexed_at: datetime | None = None
    model_name: str = ""
