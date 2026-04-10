"""GET /health — Electron verifica que el backend está listo."""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    version: str


@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="ok", version="1.0.0")
