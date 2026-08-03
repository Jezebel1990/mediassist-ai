"""Centralized OpenRouter LLM client (LangChain ChatOpenAI-compatible)."""

from __future__ import annotations

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI

from app.core.settings import Settings, get_settings


class LLMServiceError(Exception):
    """Raised when the LLM cannot be used."""


class LLMService:
    """
    Factory for the chat model used across MediAssist.

    Backed by OpenRouter. Swap models by changing MODEL_NAME in .env
    (or pass `model_name` when constructing).
    """

    def __init__(
        self,
        settings: Settings | None = None,
        *,
        model_name: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._model_name = model_name or self._settings.model_name
        self._temperature = (
            temperature
            if temperature is not None
            else self._settings.llm_temperature
        )
        self._max_tokens = (
            max_tokens if max_tokens is not None else self._settings.llm_max_tokens
        )
        self._llm: BaseChatModel | None = None

    @property
    def model_name(self) -> str:
        return self._model_name

    def get_llm(self) -> BaseChatModel:
        """Return a cached ChatOpenAI client pointed at OpenRouter."""
        if self._llm is None:
            api_key = self._settings.openrouter_api_key.strip()
            if not api_key:
                raise LLMServiceError(
                    "OPENROUTER_API_KEY não configurada. "
                    "Defina a chave no arquivo .env."
                )

            self._llm = ChatOpenAI(
                model=self._model_name,
                api_key=api_key,
                base_url=self._settings.openrouter_base_url,
                temperature=self._temperature,
                max_tokens=self._max_tokens,
                default_headers={
                    "HTTP-Referer": "https://mediassist.ai",
                    "X-Title": "MediAssist AI",
                },
            )
        return self._llm

    def with_model(self, model_name: str) -> "LLMService":
        """Return a new service instance configured for a different model."""
        return LLMService(
            self._settings,
            model_name=model_name,
            temperature=self._temperature,
            max_tokens=self._max_tokens,
        )
