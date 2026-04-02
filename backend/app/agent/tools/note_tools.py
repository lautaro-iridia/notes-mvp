import uuid

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from sqlalchemy import String, case, func, or_, select

from app.database import async_session_maker
from app.models.note import Note


def _escape_ilike(value: str) -> str:
    """Escape SQL LIKE/ILIKE wildcard characters in user-supplied search strings."""
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _get_user_uuid(config: RunnableConfig) -> uuid.UUID | None:
    """Extract and validate the user UUID from the LangGraph thread config."""
    thread_id = config.get("configurable", {}).get("thread_id", "")
    if not thread_id:
        return None
    try:
        return uuid.UUID(thread_id)
    except ValueError:
        return None


@tool
async def search_notes(query: str, config: RunnableConfig) -> str:
    """Busca notas del usuario por título o contenido. Retorna las notas relevantes."""
    user_uuid = _get_user_uuid(config)
    if user_uuid is None:
        return "No se pudo identificar al usuario."

    escaped = _escape_ilike(query)
    pattern = f"%{escaped}%"

    async with async_session_maker() as session:
        stmt = (
            select(Note)
            .where(
                Note.user_id == user_uuid,
                or_(
                    Note.title.ilike(pattern, escape="\\"),
                    Note.content.ilike(pattern, escape="\\"),
                ),
            )
            .limit(10)
        )
        result = await session.execute(stmt)
        notes = result.scalars().all()

    if not notes:
        return f"No encontré notas para '{query}'."

    lines = [f"Encontré {len(notes)} nota(s) para '{query}':"]
    for n in notes:
        preview = (n.content or "")[:120].replace("\n", " ")
        lines.append(f"- [{n.type.upper()}] {n.title}: {preview}...")
    return "\n".join(lines)


@tool
async def get_notes_count(config: RunnableConfig) -> str:
    """Retorna el número total de notas del usuario, desglosado por tipo."""
    user_uuid = _get_user_uuid(config)
    if user_uuid is None:
        return "No se pudo identificar al usuario."

    async with async_session_maker() as session:
        # Single aggregate query — avoids loading all note content into memory
        stmt = (
            select(
                func.count().label("total"),
                func.sum(case((Note.type == "note", 1), else_=0)).label("notes"),
                func.sum(case((Note.type == "thought", 1), else_=0)).label("thoughts"),
                func.sum(case((Note.type == "idea", 1), else_=0)).label("ideas"),
            )
            .where(Note.user_id == user_uuid)
        )
        row = (await session.execute(stmt)).one()

    total = row.total or 0
    return (
        f"Tenés {total} nota(s) en total: "
        f"{row.notes or 0} notas, {row.thoughts or 0} pensamientos, {row.ideas or 0} ideas."
    )
