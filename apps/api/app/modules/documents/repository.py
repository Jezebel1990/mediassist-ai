from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentStatus


class DocumentRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def create(
        self,
        *,
        original_filename: str,
        stored_filename: str,
        file_path: str,
        extension: str,
        content_type: str | None,
        file_size: int,
    ) -> Document:
        document = Document(
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            extension=extension,
            content_type=content_type,
            file_size=file_size,
            status=DocumentStatus.UPLOADED,
        )
        self._db.add(document)
        self._db.commit()
        self._db.refresh(document)
        return document

    def get_by_id(self, document_id: str) -> Document | None:
        return self._db.get(Document, document_id)

    def list_all(self) -> list[Document]:
        statement = select(Document).order_by(Document.created_at.desc())
        return list(self._db.scalars(statement).all())

    def list_by_ids(self, document_ids: Sequence[str]) -> list[Document]:
        if not document_ids:
            return []
        statement = select(Document).where(Document.id.in_(list(document_ids)))
        return list(self._db.scalars(statement).all())

    def list_by_status(self, status: DocumentStatus) -> list[Document]:
        statement = (
            select(Document)
            .where(Document.status == status)
            .order_by(Document.created_at.asc())
        )
        return list(self._db.scalars(statement).all())

    def count_by_status(self) -> dict[DocumentStatus, int]:
        statement = select(Document.status, func.count()).group_by(Document.status)
        rows = self._db.execute(statement).all()
        counts = {status: 0 for status in DocumentStatus}
        for status, count in rows:
            counts[status] = int(count)
        return counts

    def save(self, document: Document) -> Document:
        self._db.add(document)
        self._db.commit()
        self._db.refresh(document)
        return document
