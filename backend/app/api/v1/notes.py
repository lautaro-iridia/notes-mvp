import uuid
from typing import Literal

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import and_, delete, or_, select
from sqlalchemy.orm import selectinload

from app.core.deps import CurrentUser, DbSession
from app.models.category import Category
from app.models.note import Note, NoteLink
from app.schemas.note import (
    ImportRequest,
    LinkedNoteSummary,
    NoteCreate,
    NoteRead,
    NoteUpdate,
)

router = APIRouter()


def note_to_read(note: Note) -> NoteRead:
    """Convert Note model to NoteRead schema with linked notes."""
    # Combine both directions of links (bidirectional)
    linked_notes = [
        LinkedNoteSummary(id=n.id, title=n.title, type=n.type)
        for n in note.linked_to
    ] + [
        LinkedNoteSummary(id=n.id, title=n.title, type=n.type)
        for n in note.linked_from
    ]

    return NoteRead(
        id=note.id,
        user_id=note.user_id,
        title=note.title,
        content=note.content,
        type=note.type,
        is_pinned=note.is_pinned,
        color=note.color,
        created_at=note.created_at,
        updated_at=note.updated_at,
        categories=note.categories,
        linked_notes=linked_notes,
    )


@router.get("/", response_model=list[NoteRead])
async def list_notes(
    current_user: CurrentUser,
    db: DbSession,
    type: Literal["note", "thought", "idea"] | None = None,
    category_id: uuid.UUID | None = None,
    search: str | None = Query(None, min_length=1),
    pinned_only: bool = False,
) -> list[NoteRead]:
    query = (
        select(Note)
        .where(Note.user_id == current_user.id)
        .options(
            selectinload(Note.categories),
            selectinload(Note.linked_to),
            selectinload(Note.linked_from),
        )
    )

    if type:
        query = query.where(Note.type == type)

    if category_id:
        query = query.join(Note.categories).where(Category.id == category_id)

    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(Note.title.ilike(search_pattern), Note.content.ilike(search_pattern))
        )

    if pinned_only:
        query = query.where(Note.is_pinned == True)

    # Order: pinned first, then by updated_at desc
    query = query.order_by(Note.is_pinned.desc(), Note.updated_at.desc())

    result = await db.execute(query)
    notes = result.scalars().unique().all()

    return [note_to_read(note) for note in notes]


@router.post("/", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: NoteCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> NoteRead:
    # Get categories if provided
    categories = []
    if note_data.category_ids:
        result = await db.execute(
            select(Category).where(
                and_(
                    Category.id.in_(note_data.category_ids),
                    Category.user_id == current_user.id,
                )
            )
        )
        categories = list(result.scalars().all())

    note = Note(
        user_id=current_user.id,
        title=note_data.title,
        content=note_data.content,
        type=note_data.type,
        is_pinned=note_data.is_pinned,
        color=note_data.color,
        categories=categories,
    )
    db.add(note)
    await db.flush()

    # Re-fetch the note to get fresh data with all relationships
    result = await db.execute(
        select(Note)
        .where(Note.id == note.id)
        .options(
            selectinload(Note.categories),
            selectinload(Note.linked_to),
            selectinload(Note.linked_from),
        )
    )
    note = result.scalar_one()

    return note_to_read(note)


@router.get("/{note_id}", response_model=NoteRead)
async def get_note(
    note_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> NoteRead:
    result = await db.execute(
        select(Note)
        .where(and_(Note.id == note_id, Note.user_id == current_user.id))
        .options(
            selectinload(Note.categories),
            selectinload(Note.linked_to),
            selectinload(Note.linked_from),
        )
    )
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada",
        )

    return note_to_read(note)


@router.patch("/{note_id}", response_model=NoteRead)
async def update_note(
    note_id: uuid.UUID,
    note_data: NoteUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> NoteRead:
    result = await db.execute(
        select(Note)
        .where(and_(Note.id == note_id, Note.user_id == current_user.id))
        .options(
            selectinload(Note.categories),
            selectinload(Note.linked_to),
            selectinload(Note.linked_from),
        )
    )
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada",
        )

    # Update fields
    update_data = note_data.model_dump(exclude_unset=True)

    # Handle categories separately
    if "category_ids" in update_data:
        category_ids = update_data.pop("category_ids")
        if category_ids is not None:
            result = await db.execute(
                select(Category).where(
                    and_(
                        Category.id.in_(category_ids),
                        Category.user_id == current_user.id,
                    )
                )
            )
            note.categories = list(result.scalars().all())

    for field, value in update_data.items():
        setattr(note, field, value)

    await db.flush()

    # Re-fetch the note to get fresh data with all relationships
    result = await db.execute(
        select(Note)
        .where(Note.id == note_id)
        .options(
            selectinload(Note.categories),
            selectinload(Note.linked_to),
            selectinload(Note.linked_from),
        )
    )
    note = result.scalar_one()

    return note_to_read(note)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    result = await db.execute(
        select(Note).where(and_(Note.id == note_id, Note.user_id == current_user.id))
    )
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada",
        )

    await db.delete(note)


@router.patch("/{note_id}/pin", response_model=NoteRead)
async def toggle_pin(
    note_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> NoteRead:
    result = await db.execute(
        select(Note)
        .where(and_(Note.id == note_id, Note.user_id == current_user.id))
        .options(
            selectinload(Note.categories),
            selectinload(Note.linked_to),
            selectinload(Note.linked_from),
        )
    )
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada",
        )

    note.is_pinned = not note.is_pinned
    await db.flush()

    # Re-fetch the note to get fresh data with all relationships
    result = await db.execute(
        select(Note)
        .where(Note.id == note_id)
        .options(
            selectinload(Note.categories),
            selectinload(Note.linked_to),
            selectinload(Note.linked_from),
        )
    )
    note = result.scalar_one()

    return note_to_read(note)


@router.post("/{note_id}/links/{target_id}", status_code=status.HTTP_201_CREATED)
async def link_notes(
    note_id: uuid.UUID,
    target_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    if note_id == target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede vincular una nota consigo misma",
        )

    # Verify both notes exist and belong to user
    result = await db.execute(
        select(Note).where(
            and_(Note.id.in_([note_id, target_id]), Note.user_id == current_user.id)
        )
    )
    notes = result.scalars().all()

    if len(notes) != 2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Una o ambas notas no fueron encontradas",
        )

    # Check if link already exists (in either direction)
    result = await db.execute(
        select(NoteLink).where(
            or_(
                and_(
                    NoteLink.source_note_id == note_id,
                    NoteLink.target_note_id == target_id,
                ),
                and_(
                    NoteLink.source_note_id == target_id,
                    NoteLink.target_note_id == note_id,
                ),
            )
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Las notas ya están vinculadas",
        )

    # Create bidirectional link (store only one direction)
    link = NoteLink(source_note_id=note_id, target_note_id=target_id)
    db.add(link)

    return {"message": "Notas vinculadas exitosamente"}


@router.delete("/{note_id}/links/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unlink_notes(
    note_id: uuid.UUID,
    target_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    # Verify both notes belong to user
    result = await db.execute(
        select(Note).where(
            and_(Note.id.in_([note_id, target_id]), Note.user_id == current_user.id)
        )
    )
    notes = result.scalars().all()

    if len(notes) != 2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Una o ambas notas no fueron encontradas",
        )

    # Delete link in either direction
    await db.execute(
        delete(NoteLink).where(
            or_(
                and_(
                    NoteLink.source_note_id == note_id,
                    NoteLink.target_note_id == target_id,
                ),
                and_(
                    NoteLink.source_note_id == target_id,
                    NoteLink.target_note_id == note_id,
                ),
            )
        )
    )


@router.post("/import", response_model=dict)
async def import_notes(
    import_data: ImportRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Import notes from localStorage format."""
    # Map old IDs to new UUIDs
    category_id_map: dict[str, uuid.UUID] = {}
    note_id_map: dict[str, uuid.UUID] = {}

    # Import categories first
    for cat_data in import_data.categories:
        # Check if category already exists
        result = await db.execute(
            select(Category).where(
                and_(
                    Category.user_id == current_user.id,
                    Category.name == cat_data.name,
                )
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            category_id_map[cat_data.id] = existing.id
        else:
            category = Category(
                user_id=current_user.id,
                name=cat_data.name,
                color=cat_data.color,
            )
            db.add(category)
            await db.flush()
            category_id_map[cat_data.id] = category.id

    # Import notes
    for note_data in import_data.notes:
        # Get mapped category IDs
        categories = []
        if note_data.category_ids:
            mapped_ids = [
                category_id_map[cid]
                for cid in note_data.category_ids
                if cid in category_id_map
            ]
            if mapped_ids:
                result = await db.execute(
                    select(Category).where(Category.id.in_(mapped_ids))
                )
                categories = list(result.scalars().all())

        note = Note(
            user_id=current_user.id,
            title=note_data.title,
            content=note_data.content,
            type=note_data.type,
            is_pinned=note_data.is_pinned,
            color=note_data.color,
            categories=categories,
        )

        # Preserve timestamps if provided
        if note_data.created_at:
            note.created_at = note_data.created_at
        if note_data.updated_at:
            note.updated_at = note_data.updated_at

        db.add(note)
        await db.flush()
        note_id_map[note_data.id] = note.id

    # Create links between notes
    for note_data in import_data.notes:
        if note_data.linked_note_ids:
            source_id = note_id_map.get(note_data.id)
            if source_id:
                for linked_id in note_data.linked_note_ids:
                    target_id = note_id_map.get(linked_id)
                    if target_id and source_id != target_id:
                        # Check if link already exists
                        result = await db.execute(
                            select(NoteLink).where(
                                or_(
                                    and_(
                                        NoteLink.source_note_id == source_id,
                                        NoteLink.target_note_id == target_id,
                                    ),
                                    and_(
                                        NoteLink.source_note_id == target_id,
                                        NoteLink.target_note_id == source_id,
                                    ),
                                )
                            )
                        )
                        if not result.scalar_one_or_none():
                            link = NoteLink(
                                source_note_id=source_id, target_note_id=target_id
                            )
                            db.add(link)

    return {
        "message": "Importación exitosa",
        "notes_imported": len(import_data.notes),
        "categories_imported": len(import_data.categories),
    }
