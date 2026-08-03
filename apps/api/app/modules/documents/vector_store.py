"""Compatibility shim — FAISS lives in the RAG module."""

from app.modules.rag.services.vector_store import VectorStoreService

__all__ = ["VectorStoreService"]
