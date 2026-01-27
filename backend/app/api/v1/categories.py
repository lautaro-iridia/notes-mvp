import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import and_, select

from app.core.deps import CurrentUser, DbSession
from app.models.category import Category
from app.schemas import CategoryCreate, CategoryRead, CategoryUpdate

router = APIRouter()


@router.get("", response_model=list[CategoryRead])
async def list_categories(
    current_user: CurrentUser,
    db: DbSession,
) -> list[Category]:
    result = await db.execute(
        select(Category)
        .where(Category.user_id == current_user.id)
        .order_by(Category.name)
    )
    return list(result.scalars().all())


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> Category:
    # Check if category with same name already exists
    result = await db.execute(
        select(Category).where(
            and_(
                Category.user_id == current_user.id,
                Category.name == category_data.name,
            )
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una categoría con ese nombre",
        )

    category = Category(
        user_id=current_user.id,
        name=category_data.name,
        color=category_data.color,
    )
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return category


@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(
    category_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> Category:
    result = await db.execute(
        select(Category).where(
            and_(Category.id == category_id, Category.user_id == current_user.id)
        )
    )
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )

    return category


@router.patch("/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: uuid.UUID,
    category_data: CategoryUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> Category:
    result = await db.execute(
        select(Category).where(
            and_(Category.id == category_id, Category.user_id == current_user.id)
        )
    )
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )

    update_data = category_data.model_dump(exclude_unset=True)

    # Check for name conflict if name is being updated
    if "name" in update_data and update_data["name"] != category.name:
        result = await db.execute(
            select(Category).where(
                and_(
                    Category.user_id == current_user.id,
                    Category.name == update_data["name"],
                )
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una categoría con ese nombre",
            )

    for field, value in update_data.items():
        setattr(category, field, value)

    await db.flush()
    await db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    result = await db.execute(
        select(Category).where(
            and_(Category.id == category_id, Category.user_id == current_user.id)
        )
    )
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )

    await db.delete(category)
