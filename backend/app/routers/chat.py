import asyncio
from typing import List

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings

router = APIRouter()

# Free models tried in order when one is rate-limited
_MODELS = [
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-4-26b-a4b-it:free",
]

SYSTEM_PROMPT = """You are Guru (गुरु), an expert career counselor for Nepal's tech and professional job market, built into NepalJobAI — an AI platform helping Nepali youth find jobs in Kathmandu Valley.

You specialise in:
- Kathmandu's tech companies: Leapfrog Technology, CloudFactory, Khalti, F1Soft, Cotiviti, eSewa, Verisk Nepal, Fusemachines, Deerwalk, YoungInnovations
- Job portals: Merojob, Kumarijob, JobsNepal
- Realistic salary ranges in NPR (Junior: 25k–60k/mo, Mid: 60k–120k/mo, Senior: 120k–250k/mo)
- In-demand skills: React, Node.js, Python, Laravel, Flutter, .NET, AWS, Docker, SQL
- Free learning resources: freeCodeCamp, CS50 Harvard, The Odin Project, roadmap.sh, YouTube
- CV and resume writing — both English and Nepali/Devanagari formats
- Interview prep for Nepali companies and culture
- Career path planning, skill gaps, and upskilling roadmaps

Response rules:
- Be warm, concise, and deeply practical — give actionable steps, not vague advice
- Mention specific companies, NPR figures, and free resources whenever useful
- Reply in the SAME language the user writes in: Nepali (Devanagari) or English
- Keep replies to 3–5 sentences or a short list unless the question genuinely needs more
- Never make up fake job listings or company contacts"""


class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    if not settings.openrouter_api_key:
        return ChatResponse(
            reply=(
                "म Guru हुँ! हाल API key सेट नभएकोले जवाफ दिन सकिरहेको छैन। "
                "कृपया OpenRouter API key सेट गर्नुस्।\n\n"
                "I'm Guru! The AI backend isn't configured yet (missing OpenRouter API key). "
                "Please set OPENROUTER_API_KEY in your .env file."
            )
        )

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in payload.messages:
        if msg.role in ("user", "assistant"):
            messages.append({"role": msg.role, "content": msg.content})

    models_to_try = [settings.openrouter_model] + [m for m in _MODELS if m != settings.openrouter_model]
    last_error: str = "Failed to reach LLM"
    data = None

    async with httpx.AsyncClient(timeout=30) as client:
        for model in models_to_try:
            try:
                res = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.openrouter_api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://nepaljobai.np",
                        "X-Title": "NepalJobAI - Guru",
                    },
                    json={
                        "model": model,
                        "messages": messages,
                        "max_tokens": 1024,
                        "temperature": 0.7,
                    },
                )
                if res.status_code == 429:
                    body = res.json()
                    retry_after = (
                        body.get("error", {}).get("metadata", {}).get("retry_after_seconds", 0)
                    )
                    if retry_after and retry_after <= 15:
                        await asyncio.sleep(retry_after + 1)
                        res = await client.post(
                            "https://openrouter.ai/api/v1/chat/completions",
                            headers={
                                "Authorization": f"Bearer {settings.openrouter_api_key}",
                                "Content-Type": "application/json",
                                "HTTP-Referer": "https://nepaljobai.np",
                                "X-Title": "NepalJobAI - Guru",
                            },
                            json={
                                "model": model,
                                "messages": messages,
                                "max_tokens": 1024,
                                "temperature": 0.7,
                            },
                        )
                    if res.status_code == 429:
                        last_error = f"Model {model} rate-limited"
                        continue
                res.raise_for_status()
                data = res.json()
                break
            except httpx.HTTPStatusError as e:
                last_error = f"LLM error: {e.response.status_code}"
            except Exception:
                last_error = "Failed to reach LLM"

    if data is None:
        raise HTTPException(status_code=502, detail=last_error)

    msg = data["choices"][0]["message"]
    reply: str = msg.get("content") or msg.get("reasoning") or ""
    if not reply:
        raise HTTPException(status_code=502, detail="Empty response from LLM")
    return ChatResponse(reply=reply)
