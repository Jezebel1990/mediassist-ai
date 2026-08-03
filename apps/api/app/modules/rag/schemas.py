"""Pydantic schemas for the RAG query API."""

from pydantic import BaseModel, Field


class RAGQueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=4000)
    top_k: int | None = Field(default=None, ge=1, le=20)
    model_name: str | None = Field(
        default=None,
        description="Optional OpenRouter model override (defaults to MODEL_NAME).",
    )


class RAGQueryResponse(BaseModel):
    answer: str
    sources: list[str] = Field(default_factory=list)
    context_used: bool = False
    model_name: str = ""
