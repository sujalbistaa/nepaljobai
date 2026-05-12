"""
Pydantic v2 request/response schemas.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


# ── User ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    clerk_id: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_startup: bool = False


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserOut(BaseModel):
    id: str
    clerk_id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    avatar_url: Optional[str]
    is_startup: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Profile ───────────────────────────────────────────────────────────────────

class ProfileOut(BaseModel):
    id: str
    user_id: str
    parsed_skills: Optional[List[str]] = None
    district: Optional[str] = None
    area: Optional[str] = None
    experience_years: Optional[float] = None
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Profile skills (GET / PATCH) ──────────────────────────────────────────────

class ProfileSkillsOut(BaseModel):
    skills: List[str]
    experience_years: Optional[float] = None


class ProfileSkillsUpdate(BaseModel):
    skills: List[str]
    experience_years: Optional[float] = None


# ── Resume ────────────────────────────────────────────────────────────────────

class ResumeParseResponse(BaseModel):
    skills: List[str]
    experience_years: Optional[float] = None
    raw_text: str
    language_detected: str = "en"


# ── Job ───────────────────────────────────────────────────────────────────────

class JobOut(BaseModel):
    id: str
    title: str
    company: str
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    district: Optional[str] = None
    area: Optional[str] = None
    apply_url: Optional[str] = None
    apply_by: Optional[str] = None
    source: str
    scraped_at: datetime

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: List[JobOut]


# ── Match ─────────────────────────────────────────────────────────────────────

class MatchRequest(BaseModel):
    skills: List[str] = Field(..., min_length=1)
    top_k: int = Field(default=10, ge=1, le=500)


class MatchResult(BaseModel):
    job: JobOut
    score: float = Field(..., ge=0.0, le=1.0)
    score_pct: int
    missing_skills: List[str]


class MatchResponse(BaseModel):
    results: List[MatchResult]
    total_jobs_scanned: int


# ── Roadmap ───────────────────────────────────────────────────────────────────

class RoadmapResource(BaseModel):
    label: str
    url: str


class RoadmapWeek(BaseModel):
    week: int
    title: str
    skill: str
    phase: str  # foundation | build | ship
    goal: str = ""
    daily_tasks: List[str] = []
    project: str = ""
    tips: str = ""
    estimated_hours: int = 10
    resources: List[RoadmapResource] = []


class RoadmapRequest(BaseModel):
    skills: List[str]
    target_role: str
    missing_skills: List[str]
    weeks: int = 8


class RoadmapResponse(BaseModel):
    id: str
    target_job_title: str
    weeks: List[RoadmapWeek]
    share_token: Optional[str] = None


# ── Scrape ────────────────────────────────────────────────────────────────────

class ScrapeStatusResponse(BaseModel):
    task_id: str
    status: str
    jobs_found: Optional[int] = None