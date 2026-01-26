from fastapi import APIRouter

from app.api.v1 import auth, notes, categories

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(notes.router, prefix="/notes", tags=["notes"])
router.include_router(categories.router, prefix="/categories", tags=["categories"])
