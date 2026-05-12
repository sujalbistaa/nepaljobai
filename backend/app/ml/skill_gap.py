"""
Skill gap analysis and cosine similarity utilities.
"""

import math
from typing import List, Dict, Tuple


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """
    Cosine similarity between two equal-length float vectors.
    Returns value in [0.0, 1.0].
    """
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0

    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(a ** 2 for a in vec_a))
    mag_b = math.sqrt(sum(b ** 2 for b in vec_b))

    if mag_a == 0 or mag_b == 0:
        return 0.0

    # Clamp to [0, 1] — cosine can return slightly negative for orthogonal vecs
    raw = dot / (mag_a * mag_b)
    return max(0.0, min(1.0, (raw + 1) / 2))


def compute_skill_gap(
    user_skills: List[str],
    required_skills: List[str],
) -> Dict:
    """
    Compare user skills against job requirements.
    Returns matched, missing, and a simple overlap score.
    """
    user_set = {s.lower().strip() for s in user_skills}
    required_set = {s.lower().strip() for s in required_skills}

    matched = [s for s in required_skills if s.lower().strip() in user_set]
    missing = [s for s in required_skills if s.lower().strip() not in user_set]
    extra = [s for s in user_skills if s.lower().strip() not in required_set]

    overlap_score = len(matched) / len(required_set) if required_set else 1.0

    return {
        "matched": matched,
        "missing": missing,
        "extra_skills": extra,
        "overlap_score": round(overlap_score, 4),
        "overlap_pct": round(overlap_score * 100),
    }


def estimate_weeks_to_learn(skill: str) -> int:
    """
    Rough estimate of weeks needed to learn a skill from scratch.
    Used in roadmap generation.
    """
    EASY = {"git", "html", "css", "figma", "excel", "notion", "canva"}
    MEDIUM = {
        "python", "javascript", "typescript", "react", "sql",
        "rest apis", "fastapi", "flask", "node", "vue",
    }
    HARD = {
        "docker", "kubernetes", "aws", "machine learning",
        "pytorch", "tensorflow", "rust", "golang",
    }

    s = skill.lower().strip()
    if s in EASY:
        return 1
    if s in MEDIUM:
        return 3
    if s in HARD:
        return 6
    return 2


def rank_missing_by_priority(
    missing_skills: List[str],
    target_role: str,
) -> List[Tuple[str, int]]:
    """
    Sort missing skills by estimated learning time (easiest first).
    Returns list of (skill, weeks) tuples.
    """
    ranked = [(s, estimate_weeks_to_learn(s)) for s in missing_skills]
    return sorted(ranked, key=lambda x: x[1])