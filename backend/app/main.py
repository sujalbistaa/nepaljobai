from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.session import init_db
from app.routers import resume, matches, roadmap, jobs, scrape, users, chat


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
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
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
async def health():
    return {"status": "ok", "app": "NepalJobAI"}