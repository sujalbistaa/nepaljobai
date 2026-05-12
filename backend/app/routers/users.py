from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.db_models import User
from app.models.schemas import UserCreate, UserUpdate, UserOut

router = APIRouter()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.clerk_id == payload.clerk_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="User already exists")

    user = User(**payload.model_dump())
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.post("/ensure", response_model=UserOut, status_code=status.HTTP_200_OK)
async def ensure_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """Create user if not exists, update if exists. Safe to call on every login."""
    result = await db.execute(select(User).where(User.clerk_id == payload.clerk_id))
    user = result.scalar_one_or_none()

    if user:
        for field, value in payload.model_dump(exclude={"clerk_id"}, exclude_unset=True).items():
            if value is not None:
                setattr(user, field, value)
    else:
        user = User(**payload.model_dump())
        db.add(user)

    await db.flush()
    await db.refresh(user)
    return user


@router.get("/{clerk_id}", response_model=UserOut)
async def get_user(clerk_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{clerk_id}", response_model=UserOut)
async def update_user(clerk_id: str, payload: UserUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)

    await db.flush()
    await db.refresh(user)
    return user


@router.delete("/{clerk_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(clerk_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)