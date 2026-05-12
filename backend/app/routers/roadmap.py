import asyncio
import json
import re
import secrets

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.session import get_db
from app.models.db_models import Roadmap
from app.models.schemas import RoadmapRequest, RoadmapResource, RoadmapResponse, RoadmapWeek

router = APIRouter()

_FALLBACK_MODELS = [
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-4-26b-a4b-it:free",
]

ROADMAP_SYSTEM = """Career coach for Nepal's tech job market. Output ONLY a raw JSON object — zero markdown, zero prose.

Required JSON shape (all keys mandatory):
{"weeks":[{"week":1,"title":"5-word title","skill":"skill name","phase":"foundation","goal":"one sentence goal","daily_tasks":["Day 1-2: task","Day 3-4: task","Day 5-6: task","Day 7: project"],"project":"build X project","tips":"tip for Leapfrog/Khalti/eSewa/F1Soft","estimated_hours":12,"resources":[{"label":"Name","url":"https://url"}]}]}

Phase: foundation=first third, build=middle third, ship=last third.
Use real URLs only (MDN, freeCodeCamp, roadmap.sh, CS50, official docs)."""


async def _call_llm(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nepaljobai.np",
        "X-Title": "NepalJobAI - Roadmap",
    }
    body = {
        "messages": [
            {"role": "system", "content": ROADMAP_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 4096,
        "temperature": 0.4,
    }

    models = [settings.openrouter_model] + [m for m in _FALLBACK_MODELS if m != settings.openrouter_model]
    last_error = "Failed to reach LLM"

    async with httpx.AsyncClient(timeout=90) as client:
        for model in models:
            try:
                res = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json={**body, "model": model},
                )
                if res.status_code == 429:
                    retry_after = res.json().get("error", {}).get("metadata", {}).get("retry_after_seconds", 0)
                    if retry_after and retry_after <= 15:
                        await asyncio.sleep(retry_after + 1)
                        res = await client.post(
                            "https://openrouter.ai/api/v1/chat/completions",
                            headers=headers,
                            json={**body, "model": model},
                        )
                    if res.status_code == 429:
                        last_error = f"Model {model} rate-limited"
                        continue

                res.raise_for_status()
                msg = res.json()["choices"][0]["message"]
                return msg.get("content") or msg.get("reasoning") or ""
            except httpx.HTTPStatusError as e:
                last_error = f"LLM HTTP {e.response.status_code}"
            except Exception as exc:
                last_error = str(exc)

    raise HTTPException(status_code=502, detail=last_error)


def _extract_json(raw: str) -> dict:
    raw = raw.strip()
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)
    raw = re.sub(r"^[^{\[]*", "", raw)

    # Happy path
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Truncated JSON: trim to last complete week object and close the structure
    for end_marker in ("},", "}", "}]"):
        pos = raw.rfind(end_marker)
        if pos > 0:
            candidate = raw[: pos + 1] + "]}"  # close weeks array + outer object
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                pass

    raise ValueError("Could not parse LLM response as JSON")


def _first(w: dict, *keys: str, default="") -> str:
    for k in keys:
        if w.get(k):
            return str(w[k])
    return default


def _list_field(w: dict, *keys: str) -> list[str]:
    for k in keys:
        v = w.get(k)
        if isinstance(v, list) and v:
            return [str(x) for x in v]
        if isinstance(v, str) and v:
            return [v]
    return []


def _parse_weeks(raw: str, target_weeks: int) -> list[RoadmapWeek]:
    data = _extract_json(raw)
    # Support both {"weeks":[...]} and a bare list
    weeks_data = data.get("weeks") or data.get("roadmap") or (data if isinstance(data, list) else [])

    weeks = []
    for i, w in enumerate(weeks_data[:target_weeks]):
        resources = []
        for r in w.get("resources", []):
            if isinstance(r, dict):
                resources.append(RoadmapResource(label=r.get("label", "Resource"), url=r.get("url", "#")))
            elif isinstance(r, str):
                host = r.replace("https://", "").replace("http://", "").split("/")[0]
                resources.append(RoadmapResource(label=host, url=r))

        weeks.append(RoadmapWeek(
            week=int(w.get("week", i + 1)),
            title=_first(w, "title", "focus", "skill", default=f"Week {i + 1}"),
            skill=_first(w, "skill", "focus", "title", default=""),
            phase=_first(w, "phase", default="foundation"),
            goal=_first(w, "goal", "objective", "summary", default=""),
            daily_tasks=_list_field(w, "daily_tasks", "tasks", "schedule", "activities"),
            project=_first(w, "project", "deliverable", "outcome", default=""),
            tips=_first(w, "tips", "tip", "nepal_tip", "advice", default=""),
            estimated_hours=int(w.get("estimated_hours", w.get("hours", 10)) or 10),
            resources=resources,
        ))

    return weeks


@router.post("/generate_roadmap", response_model=RoadmapResponse)
async def generate_roadmap(
    payload: RoadmapRequest,
    clerk_id: str = "",
    db: AsyncSession = Depends(get_db),
):
    target_weeks = min(max(payload.weeks, 1), 12)
    existing = ", ".join(payload.skills) if payload.skills else "none listed"
    missing = ", ".join(payload.missing_skills) if payload.missing_skills else "determine based on the role"

    prompt = (
        f"Create a {target_weeks}-week learning roadmap for someone targeting "
        f"'{payload.target_role}' in Kathmandu's tech job market.\n\n"
        f"Existing skills: {existing}\n"
        f"Key skills to learn: {missing}\n\n"
        f"Generate exactly {target_weeks} weeks. Make each week specific, actionable, "
        f"and tailored to Nepal's job market. Focus only on skills they don't have yet."
    )

    raw = await _call_llm(prompt)

    try:
        weeks = _parse_weeks(raw, target_weeks)
    except Exception:
        raise HTTPException(status_code=502, detail="Failed to parse roadmap from LLM")

    if not weeks:
        raise HTTPException(status_code=502, detail="LLM returned empty roadmap")

    share_token = secrets.token_urlsafe(12)
    roadmap = Roadmap(
        target_job_title=payload.target_role,
        weeks_json=json.dumps([w.model_dump() for w in weeks]),
        share_token=share_token,
    )

    if clerk_id:
        from app.models.db_models import User
        result = await db.execute(select(User).where(User.clerk_id == clerk_id))
        user = result.scalar_one_or_none()
        if user:
            roadmap.user_id = user.id
            db.add(roadmap)
            await db.flush()
            await db.refresh(roadmap)

    return RoadmapResponse(
        id=str(roadmap.id) if getattr(roadmap, "id", None) else "preview",
        target_job_title=payload.target_role,
        weeks=weeks,
        share_token=share_token,
    )


@router.get("/roadmap/{share_token}", response_model=RoadmapResponse)
async def get_shared_roadmap(share_token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Roadmap).where(Roadmap.share_token == share_token))
    roadmap = result.scalar_one_or_none()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    weeks = []
    for w in json.loads(roadmap.weeks_json or "[]"):
        parsed_resources = []
        for r in w.get("resources", []):
            if isinstance(r, dict):
                parsed_resources.append(RoadmapResource(**r))
            elif isinstance(r, str):
                host = r.replace("https://", "").replace("http://", "").split("/")[0]
                parsed_resources.append(RoadmapResource(label=host, url=r))
        w["resources"] = parsed_resources
        weeks.append(RoadmapWeek(**w))

    return RoadmapResponse(
        id=roadmap.id,
        target_job_title=roadmap.target_job_title or "",
        weeks=weeks,
        share_token=roadmap.share_token,
    )
