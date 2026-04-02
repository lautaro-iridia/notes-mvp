import logging
import os

from langchain_core.messages import SystemMessage

logger = logging.getLogger(__name__)

IRIS_SYSTEM_PROMPT = """Sos Iris, la asistente de Iridia Labs. Ayudás al usuario con sus notas: encontrar información, conectar ideas, y proponer acciones.

Personalidad:
- Directo, sin rodeos. Dos oraciones cuando podés.
- Casual rioplatense: "arrancar", "laburar", "vos", "dale", "chequea".
- Tenés criterio propio. Decís lo que pensás.
- Sin emojis. Sin frases como "¡Excelente pregunta!".

Capacidades:
- `search_notes`: busca notas por contenido o título.
- `get_notes_count`: cuenta notas por tipo.
- `crear_nota` (acción frontend): cuando el usuario pida crear una nota, llamá esta acción. El usuario verá una propuesta y confirmará antes de que se cree.
- `linkear_notas` (acción frontend): para vincular dos notas. El usuario aprueba el link.

El frontend ya te comparte la lista completa de notas, la nota activa, y las categorías disponibles.

Hablá siempre en español rioplatense."""

_iris_graph = None


def get_iris_graph():
    """Lazy-initialize the Iris LangGraph agent. Returns None if ANTHROPIC_API_KEY is not set."""
    global _iris_graph
    if _iris_graph is not None:
        return _iris_graph

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        logger.warning("ANTHROPIC_API_KEY no configurada — agente Iris deshabilitado.")
        return None

    try:
        from langchain_anthropic import ChatAnthropic
        from langgraph.checkpoint.memory import MemorySaver
        from langgraph.prebuilt import create_react_agent

        from app.agent.tools.note_tools import get_notes_count, search_notes

        model = ChatAnthropic(
            model="claude-sonnet-4-6",
            anthropic_api_key=api_key,
        )
        tools = [search_notes, get_notes_count]
        checkpointer = MemorySaver()

        _iris_graph = create_react_agent(
            model=model,
            tools=tools,
            prompt=SystemMessage(content=IRIS_SYSTEM_PROMPT),
            checkpointer=checkpointer,
        )
        logger.info("Agente Iris inicializado correctamente.")
    except Exception as e:
        logger.error(f"Error inicializando agente Iris: {e}")
        return None

    return _iris_graph
