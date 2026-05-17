from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.session import get_db, init_db
from app.models.db_models import Job
from app.routers import chat, jobs, matches, resume, roadmap, scrape, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run DB init on startup."""
    await init_db()
    yield


app = FastAPI(
    title="NepalJobAI API",
    description="AI-powered job matching for Nepali youth — NSIH Hackathon 2026",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
_explicit_origins: list[str] = [
    "http://localhost:3000",
    "http://localhost:3001",
]
if settings.frontend_url:
    _explicit_origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_explicit_origins,
    # Covers all Vercel preview URLs (e.g. project-git-branch-team.vercel.app)
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(users.router,   prefix="/api/users",   tags=["users"])
app.include_router(resume.router,  prefix="/api",         tags=["resume"])
app.include_router(matches.router, prefix="/api",         tags=["matches"])
app.include_router(roadmap.router, prefix="/api",         tags=["roadmap"])
app.include_router(jobs.router,    prefix="/api/jobs",    tags=["jobs"])
app.include_router(scrape.router,  prefix="/api/scrape",  tags=["scrape"])
app.include_router(chat.router,    prefix="/api",         tags=["chat"])


@app.get("/health", tags=["health"])
async def health(db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(func.count()).select_from(Job))
    jobs_indexed: int = result.scalar_one()
    return {"status": "ok", "jobs_indexed": jobs_indexed}
