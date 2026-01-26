import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


NoteType = Literal["note", "thought", "idea"]


class NoteBase(BaseModel):
    title: str = Field(..., max_length=500)
    content: str | None = None
    type: NoteType = "note"
    is_pinned: bool = False
    color: str | None = None


class NoteCreate(NoteBase):
    category_ids: list[uuid.UUID] = []


class NoteUpdate(BaseModel):
    title: str | None = Field(None, max_length=500)
    content: str | None = None
    type: NoteType | None = None
    is_pinned: bool | None = None
    color: str | None = None
    category_ids: list[uuid.UUID] | None = None


class CategorySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    color: str


class LinkedNoteSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    type: NoteType


class NoteRead(NoteBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    categories: list[CategorySummary] = []
    linked_notes: list[LinkedNoteSummary] = []


class NoteImport(BaseModel):
    """Schema for importing notes from localStorage"""
    id: str  # Original localStorage ID
    title: str
    content: str | None = None
    type: NoteType = "note"
    is_pinned: bool = False
    color: str | None = None
    category_ids: list[str] = []  # Original localStorage category IDs
    linked_note_ids: list[str] = []  # Original localStorage note IDs
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ImportRequest(BaseModel):
    notes: list[NoteImport]
    categories: list["CategoryImport"] = []


class CategoryImport(BaseModel):
    id: str
    name: str
    color: str
