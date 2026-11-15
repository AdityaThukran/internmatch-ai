"""
Routes for profile-to-internship matching and skill extraction.

POST /api/match
GET  /api/skills/extract
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import MatchRequest, MatchResult
from app.services.matching_engine import MatchingEngine
from app.services.skill_extractor import extract_skills_from_text, categorize_skills

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Matching"])

# Singleton engine – initialised once (loads model or falls back)
_engine = MatchingEngine()


@router.post("/match", response_model=List[MatchResult])
async def match_profile(request: MatchRequest) -> List[Dict[str, Any]]:
    """
    Match a user profile against a list of internships.

    Returns an array of match results sorted by score (descending).
    """
    try:
        # Convert Pydantic models to plain dicts for the engine
        profile_dict = request.profile.model_dump()

        internships_dicts: list[dict[str, Any]] = []
        for intern in request.internships:
            d = intern.model_dump(by_alias=True)
            internships_dicts.append(d)

        results = _engine.match_profile_with_internships(
            profile_dict, internships_dicts
        )
        return results
    except Exception as exc:
        logger.exception("Error during matching")
        raise HTTPException(status_code=500, detail=f"Matching failed: {exc}")


@router.get("/skills/extract")
async def extract_skills(
    text: str = Query(..., min_length=1, description="Text to extract skills from"),
) -> Dict[str, Any]:
    """
    Extract and categorise skills from arbitrary text.

    Query parameters:
      - text: the input text
    """
    try:
        skills = extract_skills_from_text(text)
        categories = categorize_skills(skills)
        return {
            "skills": skills,
            "categories": categories,
            "count": len(skills),
        }
    except Exception as exc:
        logger.exception("Error extracting skills")
        raise HTTPException(status_code=500, detail=f"Skill extraction failed: {exc}")
