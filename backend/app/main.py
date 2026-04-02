from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agent.runtime import register_agent_endpoint
from app.api.v1 import router as api_router
from app.config import get_settings

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Routes (including /api/copilotkit) must be registered before ASGI startup,
    # which is why register_agent_endpoint() is called below at module level.
    # This is safe as long as graph init uses only sync/in-memory resources
    # (MemorySaver + ChatAnthropic client). If a future version requires async
    # resources (e.g. AsyncSqliteSaver), refactor to initialize the graph here
    # and inject it into the SDK via a dependency.
    yield


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

# Register Iris agent endpoint (requires ANTHROPIC_API_KEY)
register_agent_endpoint(app)


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
