# Phase 2: OpenViking integration for semantic context retrieval.
# Placeholder — will be implemented once OpenViking is in docker-compose.

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool


@tool
async def find_context(query: str, config: RunnableConfig) -> str:
    """[Fase 2] Busca contexto semántico relevante vía OpenViking."""
    return "Búsqueda semántica disponible en Fase 2 con OpenViking."
