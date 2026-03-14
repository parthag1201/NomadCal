"""
Database connection setup.

Two things are configured here:
1. `engine`       — the connection to PostgreSQL (async, for performance)
2. `get_db()`     — a FastAPI dependency that gives each request its own DB session
                     and auto-closes it when the request finishes

Usage in a router:
    from app.core.database import get_db
    @router.get("/items")
    async def list_items(db: AsyncSession = Depends(get_db)):
        ...
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

# create_async_engine creates a connection pool to PostgreSQL
# echo=True prints SQL queries to console (helpful for debugging, turn off in prod)
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
)

# sessionmaker creates a factory for database sessions
# expire_on_commit=False means objects stay usable after commit (important for async)
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# Base class for all our models — every table inherits from this
class Base(DeclarativeBase):
    pass


# FastAPI dependency — provides a DB session per request, auto-closes after
async def get_db():
    async with async_session() as session:
        yield session
