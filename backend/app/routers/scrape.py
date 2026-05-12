from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.schemas import ScrapeStatusResponse

router = APIRouter()


@router.post("/trigger", response_model=ScrapeStatusResponse)
async def trigger_scrape(db: AsyncSession = Depends(get_db)):
    """
    Trigger a scrape job.
    Celery + BeautifulSoup scraper is wired here when Redis is available.
    Returns a mock task_id for now.
    """
    # TODO: replace with Celery task
    # from app.tasks.scrape import run_scrape
    # task = run_scrape.delay()
    # return ScrapeStatusResponse(task_id=task.id, status="queued")

    return ScrapeStatusResponse(
        task_id="mock-task-001",
        status="queued",
        jobs_found=None,
    )


@router.get("/status/{task_id}", response_model=ScrapeStatusResponse)
async def scrape_status(task_id: str):
    """
    Poll scrape task status.
    Celery result backend wired here when Redis is available.
    """
    # TODO: replace with Celery result check
    # from celery.result import AsyncResult
    # result = AsyncResult(task_id)
    # return ScrapeStatusResponse(task_id=task_id, status=result.status, jobs_found=result.result)

    return ScrapeStatusResponse(
        task_id=task_id,
        status="completed",
        jobs_found=42,
    )