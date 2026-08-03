"""Isolated document loaders and Factory for automatic selection."""

from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

import pandas as pd
from langchain_community.document_loaders import (
    CSVLoader,
    DataFrameLoader,
    Docx2txtLoader,
    JSONLoader,
    PyPDFLoader,
    UnstructuredHTMLLoader,
    UnstructuredMarkdownLoader,
    UnstructuredPowerPointLoader,
)
from langchain_core.documents import Document as LangChainDocument


class BaseDocumentLoader(ABC):
    """Contract for every isolated file loader."""

    @abstractmethod
    def load(self, file_path: Path) -> list[LangChainDocument]:
        raise NotImplementedError


class PdfDocumentLoader(BaseDocumentLoader):
    def load(self, file_path: Path) -> list[LangChainDocument]:
        return PyPDFLoader(str(file_path)).load()


class CsvDocumentLoader(BaseDocumentLoader):
    def load(self, file_path: Path) -> list[LangChainDocument]:
        return CSVLoader(file_path=str(file_path)).load()


class DocxDocumentLoader(BaseDocumentLoader):
    def load(self, file_path: Path) -> list[LangChainDocument]:
        return Docx2txtLoader(str(file_path)).load()


class JsonDocumentLoader(BaseDocumentLoader):
    def load(self, file_path: Path) -> list[LangChainDocument]:
        return JSONLoader(
            file_path=str(file_path),
            jq_schema=".",
            text_content=False,
        ).load()


class HtmlDocumentLoader(BaseDocumentLoader):
    def load(self, file_path: Path) -> list[LangChainDocument]:
        return UnstructuredHTMLLoader(str(file_path)).load()


class MarkdownDocumentLoader(BaseDocumentLoader):
    def load(self, file_path: Path) -> list[LangChainDocument]:
        return UnstructuredMarkdownLoader(str(file_path)).load()


class XlsxDocumentLoader(BaseDocumentLoader):
    """Loads spreadsheets via pandas + DataFrameLoader."""

    def load(self, file_path: Path) -> list[LangChainDocument]:
        dataframe = pd.read_excel(file_path)
        page_content_column = self._resolve_page_content_column(dataframe)
        return DataFrameLoader(
            dataframe,
            page_content_column=page_content_column,
        ).load()

    @staticmethod
    def _resolve_page_content_column(dataframe: pd.DataFrame) -> str:
        if dataframe.empty:
            raise ValueError("Planilha XLSX vazia — nada para indexar.")
        # Prefer a text-like column; fall back to the first column.
        for candidate in ("content", "text", "description", "body"):
            if candidate in dataframe.columns:
                return candidate
        return str(dataframe.columns[0])


class PptxDocumentLoader(BaseDocumentLoader):
    def load(self, file_path: Path) -> list[LangChainDocument]:
        return UnstructuredPowerPointLoader(str(file_path)).load()


SUPPORTED_EXTENSIONS: frozenset[str] = frozenset(
    {
        ".pdf",
        ".csv",
        ".docx",
        ".xlsx",
        ".pptx",
        ".json",
        ".html",
        ".htm",
        ".md",
        ".markdown",
    }
)


class DocumentLoaderFactory:
    """Factory Pattern — picks the correct isolated loader by file extension."""

    _registry: dict[str, type[BaseDocumentLoader]] = {
        ".pdf": PdfDocumentLoader,
        ".csv": CsvDocumentLoader,
        ".docx": DocxDocumentLoader,
        ".xlsx": XlsxDocumentLoader,
        ".pptx": PptxDocumentLoader,
        ".json": JsonDocumentLoader,
        ".html": HtmlDocumentLoader,
        ".htm": HtmlDocumentLoader,
        ".md": MarkdownDocumentLoader,
        ".markdown": MarkdownDocumentLoader,
    }

    @classmethod
    def get_loader(cls, file_path: Path | str) -> BaseDocumentLoader:
        path = Path(file_path)
        extension = path.suffix.lower()
        loader_cls = cls._registry.get(extension)
        if loader_cls is None:
            supported = ", ".join(sorted(SUPPORTED_EXTENSIONS))
            raise UnsupportedDocumentTypeError(
                f"Formato '{extension}' não suportado. Use: {supported}"
            )
        return loader_cls()

    @classmethod
    def is_supported(cls, file_path: Path | str) -> bool:
        return Path(file_path).suffix.lower() in cls._registry

    @classmethod
    def detect_type(cls, file_path: Path | str) -> str:
        extension = Path(file_path).suffix.lower()
        if extension not in cls._registry:
            raise UnsupportedDocumentTypeError(
                f"Não foi possível identificar o tipo do documento: {extension}"
            )
        return extension


class UnsupportedDocumentTypeError(Exception):
    """Raised when no loader is registered for the given file type."""
