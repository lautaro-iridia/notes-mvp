from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import router as api_router
from app.config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="API para la aplicación de notas Iridia",
    lifespan=lifespan,
    redirect_slashes=False,  # Accept both /notes and /notes/
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router)


@app.get("/health")
async def health_check() -> dict:
    return {"status": "healthy", "service": settings.app_name}


@app.get("/")
async def root() -> dict:
    return {
        "message": "Bienvenido a Iridia Notes API",
        "docs": "/docs",
        "health": "/health",
    }
