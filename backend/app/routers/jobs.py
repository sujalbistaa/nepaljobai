import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.db.session import get_db
from app.models.db_models import Job
from app.models.schemas import JobOut, JobListResponse
from app.ml.mock_data import seed_mock_jobs

router = APIRouter()


@router.get("", response_model=JobListResponse)
async def list_jobs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    district: Optional[str] = Query(default=None),
    area: Optional[str] = Query(default=None),
    salary_min: Optional[int] = Query(default=None),
    salary_max: Optional[int] = Query(default=None),
    skill: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    filters = [Job.is_active == True]

    if district:
        filters.append(Job.district == district)
    if area:
        filters.append(Job.area == area)
    if salary_min:
        filters.append(Job.salary_min >= salary_min)
    if salary_max:
        filters.append(Job.salary_max <= salary_max)
    if skill:
        # Simple substring match on required_skills JSON string
        filters.append(Job.required_skills.ilike(f"%{skill}%"))

    count_result = await db.execute(
        select(func.count()).select_from(Job).where(and_(*filters))
    )
    total = count_result.scalar_one()

    result = await db.execute(
        select(Job)
        .where(and_(*filters))
        .order_by(Job.scraped_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    jobs = result.scalars().all()

    # Deserialize JSON fields
    job_outs = []
    for job in jobs:
        job_dict = {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "description": job.description,
            "required_skills": json.loads(job.required_skills) if job.required_skills else [],
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "district": job.district,
            "area": job.area,
            "apply_url": job.apply_url,
            "apply_by": job.apply_by,
            "source": job.source,
            "scraped_at": job.scraped_at,
        }
        job_outs.append(JobOut(**job_dict))

    return JobListResponse(total=total, page=page, page_size=page_size, results=job_outs)


@router.get("/seed", status_code=201)
async def seed_jobs(
    force: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
):
    """Dev only — seed real jobs from Jobs_Files.json. Use ?force=true to replace existing."""
    count = await seed_mock_jobs(db, force=force)
    return {"seeded": count}


@router.get("/{job_id}", response_model=JobOut)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobOut(
        id=job.id,
        title=job.title,
        company=job.company,
        description=job.description,
        required_skills=json.loads(job.required_skills) if job.required_skills else [],
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        district=job.district,
        area=job.area,
        apply_url=job.apply_url,
        apply_by=job.apply_by,
        source=job.source,
        scraped_at=job.scraped_at,
    )