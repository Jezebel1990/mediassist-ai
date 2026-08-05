"""Pydantic schemas for the Chat API."""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=4000)


class ChatSource(BaseModel):
    """A unique document cited in the answer, with optional consulted pages."""

    document: str
    pages: list[int] = Field(default_factory=list)


class ChatResponse(BaseModel):
    success: bool = True
    answer: str
    sources: list[ChatSource] = Field(default_factory=list)
