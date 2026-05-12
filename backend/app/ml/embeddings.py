"""
Embedding wrapper.
Uses HuggingFace Inference API in prod, falls back to a local mock in dev.
"""

import json
import os
from typing import List

import httpx

from app.config import settings


async def get_embedding(text: str) -> List[float]:
    """
    Return a float vector for the given text.
    If HF_API_TOKEN is set, calls HF Inference API.
    Otherwise returns a deterministic mock vector (dev/demo mode).
    """
    if settings.hf_api_token:
        return await _hf_embedding(text)
    return _mock_embedding(text)


async def _hf_embedding(text: str) -> List[float]:
    url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{settings.hf_embedding_model}"
    headers = {"Authorization": f"Bearer {settings.hf_api_token}"}

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, headers=headers, json={"inputs": text})
        response.raise_for_status()
        data = response.json()

    # HF returns nested list for batched input — flatten if needed
    if isinstance(data, list) and isinstance(data[0], list):
        return data[0]
    return data


def _mock_embedding(text: str) -> List[float]:
    """
    Deterministic 384-dim mock embedding based on text hash.
    Good enough for cosine similarity demos without HF credits.
    """
    import hashlib
    import math

    seed = int(hashlib.md5(text.lower().encode()).hexdigest(), 16)
    dims = 384
    vec = []
    for i in range(dims):
        val = math.sin(seed * (i + 1) * 0.0001) * math.cos(seed * 0.00003 * i)
        vec.append(round(val, 6))

    # Normalize to unit vector
    magnitude = math.sqrt(sum(v ** 2 for v in vec)) or 1.0
    return [round(v / magnitude, 6) for v in vec]