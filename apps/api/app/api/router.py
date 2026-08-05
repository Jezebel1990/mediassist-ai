from fastapi import APIRouter

from app.api.routes import auth, health
from app.modules.chat.routes import router as chat_router
from app.modules.documents.routes import router as documents_router
from app.modules.rag.routes import router as rag_router

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(documents_router)
api_router.include_router(rag_router)
api_router.include_router(chat_router)
