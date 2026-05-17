from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.config import settings
from app.db.base import Base


def _normalise_url(url: str) -> str:
    """
    Ensure the async driver prefix is present.
    Neon / Render supply plain  postgresql://  but asyncpg needs  postgresql+asyncpg://
    """
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url  # sqlite+aiosqlite:// or already has driver prefix


_db_url = _normalise_url(settings.database_url)
_is_sqlite = _db_url.startswith("sqlite")

connect_args = {"check_same_thread": False} if _is_sqlite else {}

engine = create_async_engine(
    _db_url,
    echo=settings.debug,
    connect_args=connect_args,
    poolclass=StaticPool if _is_sqlite else None,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def init_db() -> None:
    """Create all tables on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    """FastAPI dependency — yields a DB session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
