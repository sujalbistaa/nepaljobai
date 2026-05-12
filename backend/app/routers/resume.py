import json
import base64
from pathlib import Path

import fitz  # PyMuPDF
import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.db.session import get_db
from app.models.db_models import Profile, User
from app.models.schemas import ResumeParseResponse, ProfileSkillsOut, ProfileSkillsUpdate
from app.ml.embeddings import get_embedding

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf",
    "text/plain",
}

MAX_SIZE_MB = 10


async def extract_text_from_pdf(contents: bytes) -> str:
    """Extract raw text from PDF bytes using PyMuPDF."""
    try:
        doc = fitz.open(stream=contents, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to read PDF: {str(e)}")


async def extract_skills_with_llm(raw_text: str) -> dict:
    """
    Send extracted resume text to Llama 3.3 70B via OpenRouter.
    Returns structured dict with skills and experience_years.
    """
    if not settings.openrouter_api_key:
        # Fallback to basic keyword extraction if no API key
        return _keyword_fallback(raw_text)

    prompt = f"""You are a resume parser. Extract information from this resume text and return ONLY a valid JSON object with no explanation, no markdown, no backticks.

Resume text:
{raw_text[:4000]}

Return this exact JSON structure:
{{
  "skills": ["skill1", "skill2", "skill3"],
  "experience_years": 2.5,
  "name": "Full Name or null",
  "current_role": "Job Title or null"
}}

Rules:
- skills: list of technical and professional skills found (max 20)
- experience_years: total years of work experience as a float, or null if not found
- Extract only real skills mentioned in the resume
- Include programming languages, frameworks, tools, soft skills
- Return ONLY the JSON, nothing else"""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openrouter_api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://nepaljobai.np",
                    "X-Title": "NepalJobAI",
                },
                json={
                    "model": settings.openrouter_model,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                    "temperature": 0.1,
                    "max_tokens": 500,
                },
            )
            response.raise_for_status()
            data = response.json()

        raw_response = data["choices"][0]["message"]["content"].strip()

        # Strip markdown code fences if model adds them
        if raw_response.startswith("```"):
            raw_response = raw_response.split("```")[1]
            if raw_response.startswith("json"):
                raw_response = raw_response[4:]
        raw_response = raw_response.strip()

        parsed = json.loads(raw_response)
        return parsed

    except json.JSONDecodeError:
        # LLM returned non-JSON — fall back to keyword extraction
        return _keyword_fallback(raw_text)
    except Exception as e:
        print(f"[resume] LLM call failed: {e} — falling back to keyword extraction")
        return _keyword_fallback(raw_text)


def _keyword_fallback(text: str) -> dict:
    """
    Basic keyword-based skill extraction as fallback.
    No API needed.
    """
    KNOWN_SKILLS = [
        "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
        "React", "Next.js", "Vue", "Angular", "Node.js", "Express", "FastAPI",
        "Django", "Flask", "Spring Boot", "Laravel",
        "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite",
        "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Linux", "Git",
        "REST APIs", "GraphQL", "Figma", "Adobe XD", "Photoshop",
        "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow",
        "Pandas", "NumPy", "Scikit-learn", "Excel", "Power BI", "Tableau",
        "Communication", "Leadership", "Teamwork", "Problem Solving",
        "HTML", "CSS", "Tailwind", "Bootstrap", "CI/CD", "Agile", "Scrum",
    ]

    text_lower = text.lower()
    found = [skill for skill in KNOWN_SKILLS if skill.lower() in text_lower]

    # Rough experience years from text
    experience_years = None
    import re
    matches = re.findall(r"(\d+)\+?\s*years?", text_lower)
    if matches:
        experience_years = float(max(int(m) for m in matches))

    return {
        "skills": found if found else ["Communication", "Problem Solving"],
        "experience_years": experience_years,
        "name": None,
        "current_role": None,
    }


def _detect_language(text: str) -> str:
    """Simple heuristic — check for Devanagari characters."""
    devanagari = sum(1 for c in text if "\u0900" <= c <= "\u097F")
    return "ne" if devanagari > 20 else "en"


@router.get("/profile/{clerk_id}", response_model=ProfileSkillsOut)
async def get_profile(clerk_id: str, db: AsyncSession = Depends(get_db)):
    user_result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile_result = await db.execute(select(Profile).where(Profile.user_id == user.id))
    profile = profile_result.scalar_one_or_none()
    if not profile:
        return ProfileSkillsOut(skills=[], experience_years=None)

    skills = json.loads(profile.parsed_skills) if profile.parsed_skills else []
    return ProfileSkillsOut(skills=skills, experience_years=profile.experience_years)


@router.patch("/profile/{clerk_id}", response_model=ProfileSkillsOut)
async def update_profile(
    clerk_id: str,
    payload: ProfileSkillsUpdate,
    db: AsyncSession = Depends(get_db),
):
    user_result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile_result = await db.execute(select(Profile).where(Profile.user_id == user.id))
    profile = profile_result.scalar_one_or_none()

    embedding = await get_embedding(" ".join(payload.skills))

    if profile:
        profile.parsed_skills = json.dumps(payload.skills)
        profile.embedding_json = json.dumps(embedding)
        if payload.experience_years is not None:
            profile.experience_years = payload.experience_years
    else:
        profile = Profile(
            user_id=user.id,
            parsed_skills=json.dumps(payload.skills),
            embedding_json=json.dumps(embedding),
            experience_years=payload.experience_years,
        )
        db.add(profile)

    await db.flush()
    return ProfileSkillsOut(skills=payload.skills, experience_years=profile.experience_years)


@router.post("/upload_resume", response_model=ResumeParseResponse)
async def upload_resume(
    file: UploadFile = File(...),
    clerk_id: str = "",
    db: AsyncSession = Depends(get_db),
):
    # Validate content type
    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES and not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=415,
            detail=f"Only PDF files are supported. Got: {content_type}",
        )

    # Read file
    contents = await file.read()
    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    # Extract text from PDF
    raw_text = await extract_text_from_pdf(contents)

    if not raw_text or len(raw_text) < 20:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from PDF. Make sure it is not a scanned image.",
        )

    # Extract skills via LLM
    llm_result = await extract_skills_with_llm(raw_text)

    skills = llm_result.get("skills", [])
    experience_years = llm_result.get("experience_years")
    language = _detect_language(raw_text)

    # Persist to DB if user is logged in
    if clerk_id:
        user_result = await db.execute(
            select(User).where(User.clerk_id == clerk_id)
        )
        user = user_result.scalar_one_or_none()

        if user:
            profile_result = await db.execute(
                select(Profile).where(Profile.user_id == user.id)
            )
            profile = profile_result.scalar_one_or_none()

            embedding = await get_embedding(" ".join(skills))

            if profile:
                profile.raw_resume_text = raw_text
                profile.parsed_skills = json.dumps(skills)
                profile.embedding_json = json.dumps(embedding)
                profile.experience_years = experience_years
            else:
                profile = Profile(
                    user_id=user.id,
                    raw_resume_text=raw_text,
                    parsed_skills=json.dumps(skills),
                    embedding_json=json.dumps(embedding),
                    experience_years=experience_years,
                )
                db.add(profile)

            await db.flush()

    return ResumeParseResponse(
        skills=skills,
        experience_years=experience_years,
        raw_text=raw_text[:500] + "..." if len(raw_text) > 500 else raw_text,
        language_detected=language,
    )