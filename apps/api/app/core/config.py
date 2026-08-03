"""Backward-compatible re-export of application settings."""

from app.core.settings import Settings, get_settings

__all__ = ["Settings", "get_settings"]
