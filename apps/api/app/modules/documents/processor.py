"""Document processing: type detection, loading and text splitting."""

from __future__ import annotations

from pathlib import Path

from langchain_core.documents import Document as LangChainDocument
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.settings import Settings, get_settings
from app.modules.documents.loaders import DocumentLoaderFactory


class DocumentProcessor:
    """Identifies document type, loads content and splits into chunks."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._splitter = RecursiveCharacterTextSplitter(
            chunk_size=self._settings.chunk_size,
            chunk_overlap=self._settings.chunk_overlap,
        )

    def identify_type(self, file_path: Path | str) -> str:
        return DocumentLoaderFactory.detect_type(file_path)

    def load(self, file_path: Path | str) -> list[LangChainDocument]:
        path = Path(file_path)
        loader = DocumentLoaderFactory.get_loader(path)
        documents = loader.load(path)
        for document in documents:
            document.metadata.setdefault("source", str(path))
            document.metadata.setdefault("extension", path.suffix.lower())
        return documents

    def split(
        self,
        documents: list[LangChainDocument],
    ) -> list[LangChainDocument]:
        return self._splitter.split_documents(documents)

    def process(self, file_path: Path | str) -> list[LangChainDocument]:
        """Full pipeline: identify → load → split."""
        path = Path(file_path)
        self.identify_type(path)
        loaded = self.load(path)
        return self.split(loaded)
