import json
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.db_models import Job
from app.models.schemas import MatchRequest, MatchResponse, MatchResult, JobOut
from app.ml.embeddings import get_embedding
from app.ml.skill_gap import cosine_similarity

router = APIRouter()


@router.post("/match_jobs", response_model=MatchResponse)
async def match_jobs(payload: MatchRequest, db: AsyncSession = Depends(get_db)):
    # Embed the user's skills
    query_text = " ".join(payload.skills)
    query_embedding = await get_embedding(query_text)

    # Fetch all active jobs that have embeddings
    result = await db.execute(
        select(Job).where(Job.is_active == True, Job.embedding_json != None)
    )
    jobs = result.scalars().all()

    scored: List[MatchResult] = []

    for job in jobs:
        job_embedding = json.loads(job.embedding_json)  # type: ignore
        score = cosine_similarity(query_embedding, job_embedding)

        job_skills = json.loads(job.required_skills) if job.required_skills else []
        user_skills_lower = {s.lower() for s in payload.skills}
        missing = [s for s in job_skills if s.lower() not in user_skills_lower]

        job_out = JobOut(
            id=job.id,
            title=job.title,
            company=job.company,
            description=job.description,
            required_skills=job_skills,
            salary_min=job.salary_min,
            salary_max=job.salary_max,
            district=job.district,
            area=job.area,
            apply_url=job.apply_url,
            apply_by=job.apply_by,
            source=job.source,
            scraped_at=job.scraped_at,
        )

        scored.append(
            MatchResult(
                job=job_out,
                score=round(score, 4),
                score_pct=round(score * 100),
                missing_skills=missing,
            )
        )

    # Sort by score descending, take top_k
    scored.sort(key=lambda x: x.score, reverse=True)
    top = scored[: payload.top_k]

    return MatchResponse(results=top, total_jobs_scanned=len(jobs))