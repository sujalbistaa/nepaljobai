"""
Mock data — seeds the DB with real job postings from Jobs_Files.json.
Also provides mock resume parsing for dev/demo mode.
"""

import json
import uuid
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.db_models import Job
from app.models.schemas import ResumeParseResponse
from app.ml.embeddings import get_embedding

_JOBS_FILE = Path(__file__).parent.parent.parent.parent / "Jobs_Files.json"


def _load_real_jobs() -> list[dict]:
    """Load and deduplicate jobs from Jobs_Files.json."""
    with open(_JOBS_FILE, "r", encoding="utf-8") as f:
        raw = json.load(f)

    seen: set[tuple] = set()
    unique = []
    for entry in raw:
        key = (entry["company_name"], entry["job_title"])
        if key in seen:
            continue
        seen.add(key)
        skills = entry["skills_needed"]
        salary = entry["salary_fixed_approx_npr"]
        unique.append({
            "title": entry["job_title"],
            "company": entry["company_name"],
            "description": f"Skills required: {', '.join(skills)}.",
            "required_skills": skills,
            "salary_min": salary,
            "salary_max": salary,
            "district": entry["location"],
            "area": None,
            "apply_url": None,
            "apply_by": entry["day_of_job_closing"],
            "source": "nepaljobai",
        })
    return unique


async def seed_mock_jobs(db: AsyncSession, force: bool = False) -> int:
    """Seed jobs from Jobs_Files.json. If force=True, clears existing jobs first."""
    if force:
        await db.execute(delete(Job))
    else:
        existing = await db.execute(select(Job).limit(1))
        if existing.scalar_one_or_none():
            return 0

    jobs_data = _load_real_jobs()
    inserted = 0
    for job_data in jobs_data:
        skill_text = " ".join(job_data["required_skills"])
        embedding = await get_embedding(skill_text)

        job = Job(
            id=str(uuid.uuid4()),
            source=job_data["source"],
            title=job_data["title"],
            company=job_data["company"],
            description=job_data["description"],
            required_skills=json.dumps(job_data["required_skills"]),
            embedding_json=json.dumps(embedding),
            salary_min=job_data["salary_min"],
            salary_max=job_data["salary_max"],
            district=job_data["district"],
            area=job_data["area"],
            apply_url=job_data["apply_url"],
            apply_by=job_data["apply_by"],
            is_active=True,
        )
        db.add(job)
        inserted += 1

    await db.flush()
    return inserted


async def mock_parse_resume(
    contents: bytes,
    content_type: str,
) -> ResumeParseResponse:
    """
    Mock resume parser — returns plausible skills from file size heuristic.
    Replace with real OCR + HF NER when tokens are available.
    """
    size = len(contents)

    if size < 50000:
        skills = ["Python", "Git", "SQL"]
        experience = 0.5
    elif size < 150000:
        skills = ["Python", "Git", "SQL", "REST APIs", "Linux"]
        experience = 1.5
    else:
        skills = ["Python", "FastAPI", "Git", "SQL", "Docker", "REST APIs", "Linux"]
        experience = 3.0

    raw_text = f"[Mock OCR] Parsed {size} bytes from {content_type}. Detected {len(skills)} skills."

    return ResumeParseResponse(
        skills=skills,
        experience_years=experience,
        raw_text=raw_text,
        language_detected="en",
    )