#!/usr/bin/env python3
"""
scrape_initial.py
Scrapes Nepali job boards and upserts results into the NepalJobAI database.

Sources:
  - merojob.com
  - froxjob.com
  - kumarijob.com
  - jobsnepal.com
  - linkedin.com (Nepal, last 24h — best-effort; LinkedIn blocks bots heavily)

Run manually:
    cd backend && python scripts/scrape_initial.py

Render cron (render.yaml):
    schedule: "15 0 * * *"   # 00:15 UTC = 06:00 NPT daily
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import random
import sys
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import httpx
from bs4 import BeautifulSoup
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("scraper")

# ---------------------------------------------------------------------------
# Skill taxonomy — normalise aliases to canonical names
# ---------------------------------------------------------------------------
SKILL_ALIASES: dict[str, str] = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python3": "Python",
    "reactjs": "React",
    "react.js": "React",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "angularjs": "Angular",
    "django rest framework": "Django REST Framework",
    "drf": "Django REST Framework",
    "fastapi": "FastAPI",
    "flask": "Flask",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "GCP",
    "git": "Git",
    "github": "GitHub",
    "figma": "Figma",
    "ui/ux": "UI/UX",
    "ux": "UX Design",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "nlp": "NLP",
    "data science": "Data Science",
    "data analysis": "Data Analysis",
    "power bi": "Power BI",
    "tableau": "Tableau",
    "excel": "Excel",
    "java": "Java",
    "spring boot": "Spring Boot",
    "c#": "C#",
    ".net": ".NET",
    "php": "PHP",
    "laravel": "Laravel",
    "wordpress": "WordPress",
    "seo": "SEO",
    "digital marketing": "Digital Marketing",
    "content writing": "Content Writing",
}

KNOWN_SKILLS: set[str] = {
    "Python", "JavaScript", "TypeScript", "React", "Next.js", "Vue.js",
    "Angular", "Node.js", "Django", "Django REST Framework", "FastAPI",
    "Flask", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker",
    "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "Figma",
    "UI/UX", "UX Design", "Machine Learning", "Deep Learning", "NLP",
    "Data Science", "Data Analysis", "Power BI", "Tableau", "Excel",
    "Java", "Spring Boot", "C#", ".NET", "PHP", "Laravel", "WordPress",
    "SEO", "Digital Marketing", "Content Writing", "HTML", "CSS",
    "GraphQL", "REST API", "Microservices", "Linux", "Bash",
    "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn",
    "Kotlin", "Swift", "Flutter", "React Native", "Android", "iOS",
    "DevOps", "CI/CD", "Terraform", "Ansible", "Nginx",
}


def normalise_skill(raw: str) -> str:
    cleaned = raw.strip().lower()
    return SKILL_ALIASES.get(cleaned, raw.strip())


def extract_skills_from_text(text: str) -> list[str]:
    """Best-effort skill extraction from a free-text job description."""
    text_lower = text.lower()
    found: list[str] = []
    for canonical in KNOWN_SKILLS:
        if canonical.lower() in text_lower:
            found.append(canonical)
    return found


# ---------------------------------------------------------------------------
# Scraped job record
# ---------------------------------------------------------------------------
@dataclass
class ScrapedJob:
    source: str
    title: str
    company: str
    apply_url: str
    description: Optional[str] = None
    required_skills: list[str] = field(default_factory=list)
    district: Optional[str] = None
    area: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    apply_by: Optional[str] = None


# ---------------------------------------------------------------------------
# Robots.txt helper
# ---------------------------------------------------------------------------
_robots_cache: dict[str, RobotFileParser] = {}


def _robots(base_url: str, client: httpx.Client) -> RobotFileParser:
    if base_url not in _robots_cache:
        rp = RobotFileParser()
        robots_url = base_url.rstrip("/") + "/robots.txt"
        try:
            resp = client.get(robots_url, timeout=10)
            rp.parse(resp.text.splitlines())
        except Exception:
            pass  # if robots.txt is unreachable, be conservative and allow
        _robots_cache[base_url] = rp
    return _robots_cache[base_url]


def _allowed(url: str, client: httpx.Client, ua: str = "*") -> bool:
    parsed = urlparse(url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    rp = _robots(base, client)
    return rp.can_fetch(ua, url)


def _delay() -> None:
    """1–2 second polite delay between requests."""
    time.sleep(random.uniform(1.0, 2.0))


_HEADERS: dict[str, str] = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; NepalJobAI-scraper/1.0; "
        "+https://nepaljobai.vercel.app/about)"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


# ---------------------------------------------------------------------------
# Scrapers
# ---------------------------------------------------------------------------

def scrape_merojob(client: httpx.Client) -> list[ScrapedJob]:
    """Scrape merojob.com/jobs — parse job cards from listing pages."""
    source = "merojob"
    base = "https://merojob.com"
    results: list[ScrapedJob] = []

    for page in range(1, 6):  # scrape up to 5 pages
        url = f"{base}/jobs/?page={page}"
        if not _allowed(url, client):
            log.warning("merojob: robots.txt disallows %s", url)
            break
        try:
            resp = client.get(url, headers=_HEADERS, timeout=20, follow_redirects=True)
            resp.raise_for_status()
        except httpx.HTTPError as exc:
            log.warning("merojob page %d: %s", page, exc)
            break

        soup = BeautifulSoup(resp.text, "html.parser")

        # Merojob job cards are inside <div class="media-body"> within job list
        cards = soup.select("div.card-jobs, article.job-listing, div.job-card, div.media")
        if not cards:
            # Fall back: look for any <a> links to job detail pages
            cards = soup.select("a[href*='/job/']")

        if not cards:
            log.info("merojob page %d: no cards found, stopping", page)
            break

        for card in cards:
            try:
                # Title
                title_el = card.select_one("h1 a, h2 a, h3 a, .job-title a, strong a")
                if not title_el:
                    title_el = card if card.name == "a" else card.select_one("a")
                if not title_el:
                    continue
                title = title_el.get_text(strip=True)
                href = title_el.get("href", "")
                if not href:
                    continue
                job_url = urljoin(base, href)

                # Company
                company_el = card.select_one(".company-name, .employer, span.text-muted")
                company = company_el.get_text(strip=True) if company_el else "Unknown"

                # Location
                loc_el = card.select_one(".location, .job-location, span[class*='locat']")
                location = loc_el.get_text(strip=True) if loc_el else None

                # Skills from description text
                desc_el = card.select_one(".job-description, p")
                description = desc_el.get_text(strip=True) if desc_el else ""
                skills = extract_skills_from_text(description)

                results.append(ScrapedJob(
                    source=source,
                    title=title,
                    company=company,
                    apply_url=job_url,
                    description=description or None,
                    required_skills=skills,
                    area=location,
                ))
            except Exception as exc:
                log.debug("merojob card parse error: %s", exc)

        _delay()

    log.info("merojob: found %d jobs", len(results))
    return results


def scrape_froxjob(client: httpx.Client) -> list[ScrapedJob]:
    """Scrape froxjob.com."""
    source = "froxjob"
    base = "https://froxjob.com"
    results: list[ScrapedJob] = []

    for page in range(1, 6):
        url = f"{base}/jobs?page={page}"
        if not _allowed(url, client):
            log.warning("froxjob: robots.txt disallows %s", url)
            break
        try:
            resp = client.get(url, headers=_HEADERS, timeout=20, follow_redirects=True)
            resp.raise_for_status()
        except httpx.HTTPError as exc:
            log.warning("froxjob page %d: %s", page, exc)
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select("div.job-list-item, div.job-box, article, div.job_listing")

        if not cards:
            log.info("froxjob page %d: no cards found, stopping", page)
            break

        for card in cards:
            try:
                title_el = card.select_one("h2 a, h3 a, .job-title a, a.title")
                if not title_el:
                    continue
                title = title_el.get_text(strip=True)
                href = title_el.get("href", "")
                if not href:
                    continue
                job_url = urljoin(base, href)

                company_el = card.select_one(".company, .employer-name, .company-name")
                company = company_el.get_text(strip=True) if company_el else "Unknown"

                loc_el = card.select_one(".location, .job-location, .city")
                location = loc_el.get_text(strip=True) if loc_el else None

                desc_el = card.select_one(".description, p.summary")
                description = desc_el.get_text(strip=True) if desc_el else ""
                skills = extract_skills_from_text(description)

                results.append(ScrapedJob(
                    source=source,
                    title=title,
                    company=company,
                    apply_url=job_url,
                    description=description or None,
                    required_skills=skills,
                    area=location,
                ))
            except Exception as exc:
                log.debug("froxjob card parse error: %s", exc)

        _delay()

    log.info("froxjob: found %d jobs", len(results))
    return results


def scrape_kumarijob(client: httpx.Client) -> list[ScrapedJob]:
    """Scrape kumarijob.com."""
    source = "kumarijob"
    base = "https://www.kumarijob.com"
    results: list[ScrapedJob] = []

    for page in range(1, 6):
        url = f"{base}/jobs?page={page}"
        if not _allowed(url, client):
            log.warning("kumarijob: robots.txt disallows %s", url)
            break
        try:
            resp = client.get(url, headers=_HEADERS, timeout=20, follow_redirects=True)
            resp.raise_for_status()
        except httpx.HTTPError as exc:
            log.warning("kumarijob page %d: %s", page, exc)
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select("div.job-listing, div.job-item, article.job, li.job-list")

        if not cards:
            log.info("kumarijob page %d: no cards found, stopping", page)
            break

        for card in cards:
            try:
                title_el = card.select_one("h2 a, h3 a, .position a, a.job-title")
                if not title_el:
                    continue
                title = title_el.get_text(strip=True)
                href = title_el.get("href", "")
                if not href:
                    continue
                job_url = urljoin(base, href)

                company_el = card.select_one(".company, .employer, .org-name")
                company = company_el.get_text(strip=True) if company_el else "Unknown"

                loc_el = card.select_one(".location, .district, .area")
                location = loc_el.get_text(strip=True) if loc_el else None

                deadline_el = card.select_one(".deadline, .apply-by, time")
                apply_by = deadline_el.get_text(strip=True) if deadline_el else None

                desc_el = card.select_one(".desc, .summary, p")
                description = desc_el.get_text(strip=True) if desc_el else ""
                skills = extract_skills_from_text(description)

                results.append(ScrapedJob(
                    source=source,
                    title=title,
                    company=company,
                    apply_url=job_url,
                    description=description or None,
                    required_skills=skills,
                    area=location,
                    apply_by=apply_by,
                ))
            except Exception as exc:
                log.debug("kumarijob card parse error: %s", exc)

        _delay()

    log.info("kumarijob: found %d jobs", len(results))
    return results


def scrape_jobsnepal(client: httpx.Client) -> list[ScrapedJob]:
    """Scrape jobsnepal.com."""
    source = "jobsnepal"
    base = "https://www.jobsnepal.com"
    results: list[ScrapedJob] = []

    for page in range(1, 6):
        url = f"{base}/job-search?page={page}"
        if not _allowed(url, client):
            log.warning("jobsnepal: robots.txt disallows %s", url)
            break
        try:
            resp = client.get(url, headers=_HEADERS, timeout=20, follow_redirects=True)
            resp.raise_for_status()
        except httpx.HTTPError as exc:
            log.warning("jobsnepal page %d: %s", page, exc)
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select("div.job-listing, div.job-post, article.job, div.listing-item")

        if not cards:
            log.info("jobsnepal page %d: no cards found, stopping", page)
            break

        for card in cards:
            try:
                title_el = card.select_one("h2 a, h3 a, .job-title a, a[href*='/job/']")
                if not title_el:
                    continue
                title = title_el.get_text(strip=True)
                href = title_el.get("href", "")
                if not href:
                    continue
                job_url = urljoin(base, href)

                company_el = card.select_one(".company-name, .employer, .org")
                company = company_el.get_text(strip=True) if company_el else "Unknown"

                loc_el = card.select_one(".location, .job-location")
                location = loc_el.get_text(strip=True) if loc_el else None

                deadline_el = card.select_one(".deadline, time, .apply-date")
                apply_by = deadline_el.get_text(strip=True) if deadline_el else None

                desc_el = card.select_one("p.desc, .description, .job-excerpt")
                description = desc_el.get_text(strip=True) if desc_el else ""
                skills = extract_skills_from_text(description)

                results.append(ScrapedJob(
                    source=source,
                    title=title,
                    company=company,
                    apply_url=job_url,
                    description=description or None,
                    required_skills=skills,
                    area=location,
                    apply_by=apply_by,
                ))
            except Exception as exc:
                log.debug("jobsnepal card parse error: %s", exc)

        _delay()

    log.info("jobsnepal: found %d jobs", len(results))
    return results


def scrape_linkedin(client: httpx.Client) -> list[ScrapedJob]:
    """
    Scrape LinkedIn Jobs filtered to Nepal, last 24 hours.

    NOTE: LinkedIn aggressively blocks bots. This scraper uses the public
    (non-auth) search endpoint and falls back gracefully when blocked (HTTP 429
    or redirect to login). Results may be empty in production — consider using
    the LinkedIn Jobs API (requires partner access) for reliable data.
    """
    source = "linkedin"
    base = "https://www.linkedin.com"
    url = (
        f"{base}/jobs/search"
        "?location=Nepal"
        "&f_TPR=r86400"  # last 24 hours
        "&f_JT=F"        # full-time
        "&position=1&pageNum=0"
    )

    results: list[ScrapedJob] = []

    if not _allowed(url, client):
        log.warning("linkedin: robots.txt disallows scraping, skipping")
        return results

    try:
        resp = client.get(url, headers=_HEADERS, timeout=20, follow_redirects=True)
        if resp.status_code in (429, 999):
            log.warning("linkedin: rate-limited (HTTP %d), skipping", resp.status_code)
            return results
        if "authwall" in str(resp.url) or "login" in str(resp.url):
            log.warning("linkedin: redirected to auth wall, skipping")
            return results
        resp.raise_for_status()
    except httpx.HTTPError as exc:
        log.warning("linkedin: request failed: %s", exc)
        return results

    soup = BeautifulSoup(resp.text, "html.parser")
    cards = soup.select("div.base-card, li.jobs-search__results-list > div, div.job-search-card")

    for card in cards:
        try:
            title_el = card.select_one("h3.base-search-card__title, h3, a.base-card__full-link")
            if not title_el:
                continue
            title = title_el.get_text(strip=True)

            link_el = card.select_one("a.base-card__full-link, a[href*='/jobs/view/']")
            job_url = link_el.get("href", "").split("?")[0] if link_el else ""
            if not job_url:
                continue

            company_el = card.select_one("h4.base-search-card__subtitle, .job-search-card__company-name")
            company = company_el.get_text(strip=True) if company_el else "Unknown"

            loc_el = card.select_one("span.job-search-card__location, .base-search-card__metadata")
            location = loc_el.get_text(strip=True) if loc_el else None

            desc_el = card.select_one("p.job-search-card__snippet, p")
            description = desc_el.get_text(strip=True) if desc_el else ""
            skills = extract_skills_from_text(description)

            results.append(ScrapedJob(
                source=source,
                title=title,
                company=company,
                apply_url=job_url,
                description=description or None,
                required_skills=skills,
                area=location,
            ))
        except Exception as exc:
            log.debug("linkedin card parse error: %s", exc)

    _delay()
    log.info("linkedin: found %d jobs", len(results))
    return results


# ---------------------------------------------------------------------------
# Database upsert
# ---------------------------------------------------------------------------

async def upsert_jobs(jobs: list[ScrapedJob], session: AsyncSession) -> int:
    """Insert jobs, skipping duplicates by apply_url."""
    from app.models.db_models import Job  # local import to avoid circular deps

    # Fetch existing URLs in one query
    existing_result = await session.execute(
        select(Job.apply_url).where(Job.apply_url.isnot(None))
    )
    existing_urls: set[str] = {row[0] for row in existing_result.fetchall()}

    inserted = 0
    for scraped in jobs:
        if not scraped.apply_url or scraped.apply_url in existing_urls:
            continue

        job = Job(
            id=str(uuid.uuid4()),
            source=scraped.source,
            title=scraped.title,
            company=scraped.company,
            description=scraped.description,
            required_skills=json.dumps([normalise_skill(s) for s in scraped.required_skills]),
            salary_min=scraped.salary_min,
            salary_max=scraped.salary_max,
            district=scraped.district,
            area=scraped.area,
            apply_url=scraped.apply_url,
            apply_by=scraped.apply_by,
            is_active=True,
        )
        session.add(job)
        existing_urls.add(scraped.apply_url)
        inserted += 1

    await session.commit()
    return inserted


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def main() -> None:
    database_url = os.environ.get(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./nepaljobai.db",
    )
    # Normalise postgres:// → postgresql+asyncpg://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif database_url.startswith("postgresql://") and "+asyncpg" not in database_url:
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(database_url, echo=False)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    log.info("Starting scrape run — %s", datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"))

    # All scrapers run synchronously (httpx sync client) in a thread pool
    # so they don't block the event loop
    scrapers = [
        ("merojob",   scrape_merojob),
        ("froxjob",   scrape_froxjob),
        ("kumarijob", scrape_kumarijob),
        ("jobsnepal", scrape_jobsnepal),
        ("linkedin",  scrape_linkedin),
    ]

    total_inserted = 0
    with httpx.Client() as client:
        for name, scraper_fn in scrapers:
            log.info("── %s ──", name)
            try:
                scraped_jobs = await asyncio.get_event_loop().run_in_executor(
                    None, scraper_fn, client
                )
                async with SessionLocal() as session:
                    inserted = await upsert_jobs(scraped_jobs, session)
                log.info("%s: %d new jobs inserted", name, inserted)
                total_inserted += inserted
            except Exception as exc:
                log.error("%s scraper failed: %s", name, exc, exc_info=True)

    log.info("Scrape complete — %d total new jobs inserted", total_inserted)
    await engine.dispose()


if __name__ == "__main__":
    # Allow running from repo root or from backend/
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    asyncio.run(main())
