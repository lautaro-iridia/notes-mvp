import logging

from fastapi import FastAPI

logger = logging.getLogger(__name__)


def register_agent_endpoint(app: FastAPI) -> None:
    """Register the CopilotKit endpoint at /api/copilotkit.

    Uses a local subclass of LangGraphAGUIAgent to fix a bug in copilotkit<=0.1.83
    where dict_repr() calls super().dict_repr() but ag_ui_langgraph.LangGraphAgent
    doesn't implement that method.
    """
    try:
        from copilotkit import CopilotKitRemoteEndpoint, LangGraphAGUIAgent
        from copilotkit.integrations.fastapi import add_fastapi_endpoint

        from app.agent.graphs.iris import get_iris_graph

        iris_graph = get_iris_graph()

        if iris_graph is None:
            logger.warning(
                "Agente Iris no disponible — /api/copilotkit no registrado. "
                "Configurá ANTHROPIC_API_KEY para habilitarlo."
            )
            return

        class _IrisAgent(LangGraphAGUIAgent):
            """Workaround: override dict_repr without calling super() to avoid
            AttributeError in ag_ui_langgraph.LangGraphAgent (missing dict_repr)."""
            def dict_repr(self):
                return {
                    'name': self.name,
                    'description': self.description or '',
                    'type': 'langgraph_agui',
                }

        sdk = CopilotKitRemoteEndpoint(
            agents=[
                _IrisAgent(
                    name="iris",
                    description="Iris, la asistente de Iridia Labs. Ayuda a encontrar, crear y conectar notas.",
                    graph=iris_graph,
                )
            ]
        )

        add_fastapi_endpoint(app, sdk, "/api/copilotkit")
        logger.info("Endpoint /api/copilotkit registrado correctamente.")

    except ImportError as e:
        logger.warning(
            f"CopilotKit o LangGraph no instalados — /api/copilotkit no disponible. ({e})"
        )
