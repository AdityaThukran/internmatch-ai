"""
Matching engine – score a user profile against internship listings.

Uses sentence-transformers embeddings when available, and falls back to
basic text-overlap heuristics otherwise.
"""

from __future__ import annotations

import logging
import math
import re
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)


class MatchingEngine:
    """Score profiles against internship listings."""

    def __init__(self) -> None:
        self._model: Any = None
        self._model_available: bool = False

        try:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer("all-MiniLM-L6-v2")
            self._model_available = True
            logger.info("Sentence-transformers model loaded successfully.")
        except Exception as exc:
            logger.warning(
                "Could not load sentence-transformers model (%s). "
                "Falling back to text-overlap scoring.",
                exc,
            )
            self._model = None
            self._model_available = False

    # ------------------------------------------------------------------ #
    # Embedding helpers
    # ------------------------------------------------------------------ #

    def get_embedding(self, text: str) -> Optional[np.ndarray]:
        """Return the sentence embedding for *text*, or None if unavailable."""
        if not self._model_available or self._model is None:
            return None
        try:
            embedding = self._model.encode(text, convert_to_numpy=True)
            return np.asarray(embedding, dtype=np.float32)
        except Exception as exc:
            logger.warning("Embedding failed: %s", exc)
            return None

    @staticmethod
    def cosine_similarity_score(vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Cosine similarity between two vectors.  Returns 0 on degenerate input."""
        if vec1 is None or vec2 is None:
            return 0.0
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return float(np.dot(vec1, vec2) / (norm1 * norm2))

    # ------------------------------------------------------------------ #
    # Component scores
    # ------------------------------------------------------------------ #

    @staticmethod
    def skill_overlap_score(
        profile_skills: List[str],
        internship_skills: List[str],
    ) -> Tuple[float, List[str], List[str]]:
        """
        Jaccard-style skill overlap.

        Returns (score_0_to_1, matched_skills, missing_skills).
        """
        if not profile_skills and not internship_skills:
            return 0.5, [], []  # neutral when neither side specifies skills

        p_set = {s.lower().strip() for s in profile_skills if s}
        i_set = {s.lower().strip() for s in internship_skills if s}

        if not i_set:
            return 0.5, [], []  # internship didn't list skills

        matched = p_set & i_set
        missing = i_set - p_set

        # Jaccard coefficient
        union = p_set | i_set
        jaccard = len(matched) / len(union) if union else 0.0

        # Also compute a recall-style score (how many required skills does the
        # candidate have) and blend it with Jaccard for a more useful metric.
        recall = len(matched) / len(i_set) if i_set else 0.0

        blended = 0.4 * jaccard + 0.6 * recall

        # Restore original casing for display
        i_lookup = {s.lower().strip(): s for s in internship_skills}
        p_lookup = {s.lower().strip(): s for s in profile_skills}

        matched_display = sorted(
            p_lookup.get(m, i_lookup.get(m, m)) for m in matched
        )
        missing_display = sorted(i_lookup.get(m, m) for m in missing)

        return blended, matched_display, missing_display

    @staticmethod
    def location_score(
        profile_location: str,
        internship_location: str,
        internship_mode: str,
    ) -> float:
        """
        Score based on location match and remote preference.

        Returns a value between 0 and 1.
        """
        mode_lower = (internship_mode or "").lower().strip()

        # Remote internships are always a full match
        if mode_lower in ("remote", "work from home", "wfh"):
            return 1.0

        if not profile_location or not internship_location:
            return 0.5  # unknown – neutral score

        p_loc = profile_location.lower().strip()
        i_loc = internship_location.lower().strip()

        # Exact match
        if p_loc == i_loc:
            return 1.0

        # Substring containment (e.g. "Bangalore" in "Bangalore, India")
        if p_loc in i_loc or i_loc in p_loc:
            return 0.9

        # City-level tokens overlap
        p_tokens = set(re.split(r"[\s,/\-]+", p_loc))
        i_tokens = set(re.split(r"[\s,/\-]+", i_loc))
        overlap = p_tokens & i_tokens
        if overlap:
            return 0.7

        # Hybrid mode gives partial credit even if location doesn't match
        if mode_lower == "hybrid":
            return 0.4

        return 0.2  # different location, onsite

    def _text_overlap_score(self, text_a: str, text_b: str) -> float:
        """
        Fallback semantic similarity using word-level overlap.

        This is used when sentence-transformers is unavailable.
        """
        if not text_a or not text_b:
            return 0.0

        # Tokenise
        stop_words = {
            "a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
            "for", "of", "with", "by", "from", "is", "are", "was", "were",
            "be", "been", "being", "have", "has", "had", "do", "does", "did",
            "will", "would", "shall", "should", "may", "might", "can", "could",
            "it", "its", "this", "that", "these", "those", "i", "we", "you",
            "he", "she", "they", "me", "us", "him", "her", "them", "my", "our",
            "your", "his", "their", "not", "no", "nor", "so", "if", "as",
            "about", "up", "out", "into", "over", "after", "also", "such",
        }

        def _tokens(text: str) -> set[str]:
            words = re.findall(r"[a-zA-Z0-9#+.]+", text.lower())
            return {w for w in words if w not in stop_words and len(w) > 1}

        tokens_a = _tokens(text_a)
        tokens_b = _tokens(text_b)

        if not tokens_a or not tokens_b:
            return 0.0

        intersection = tokens_a & tokens_b
        union = tokens_a | tokens_b

        return len(intersection) / len(union) if union else 0.0

    @staticmethod
    def _interest_score(interests: List[str], description: str) -> float:
        """
        Score how well the user's interests align with the internship
        description keywords.
        """
        if not interests or not description:
            return 0.0

        desc_lower = description.lower()
        matches = 0
        for interest in interests:
            interest_lower = interest.lower().strip()
            if not interest_lower:
                continue
            # Check for whole-word occurrence
            pattern = re.escape(interest_lower)
            if re.search(rf"\b{pattern}\b", desc_lower):
                matches += 1
            else:
                # Partial token matching (any word of the interest)
                tokens = interest_lower.split()
                if any(t in desc_lower for t in tokens if len(t) > 2):
                    matches += 0.5

        return min(matches / max(len(interests), 1), 1.0)

    # ------------------------------------------------------------------ #
    # Main matching logic
    # ------------------------------------------------------------------ #

    def calculate_match(self, profile: Dict[str, Any], internship: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate weighted match score between a profile and an internship.

        Weights:
          - skill_score:    40%
          - semantic_score: 35%
          - location_score: 15%
          - interest_score: 10%

        Returns a dict with internship_id, match_score (0-100), matched_skills,
        missing_skills, and score_breakdown.
        """
        # --- Skill score (40%) ---
        profile_skills: list[str] = profile.get("skills", [])
        internship_skills: list[str] = internship.get("skills", [])
        skill_sc, matched_skills, missing_skills = self.skill_overlap_score(
            profile_skills, internship_skills
        )

        # --- Semantic score (35%) ---
        # Build a profile text blob from skills, bio, interests
        profile_text_parts = list(profile_skills)
        if profile.get("bio"):
            profile_text_parts.append(profile["bio"])
        if profile.get("interests"):
            profile_text_parts.extend(profile["interests"])
        profile_text = " ".join(profile_text_parts)

        internship_text_parts = [
            internship.get("title", ""),
            internship.get("description", ""),
        ]
        internship_text_parts.extend(internship_skills)
        internship_text = " ".join(internship_text_parts)

        emb_profile = self.get_embedding(profile_text)
        emb_internship = self.get_embedding(internship_text)

        if emb_profile is not None and emb_internship is not None:
            semantic_sc = max(0.0, self.cosine_similarity_score(emb_profile, emb_internship))
        else:
            # Fallback: text overlap
            semantic_sc = self._text_overlap_score(profile_text, internship_text)

        # --- Location score (15%) ---
        loc_sc = self.location_score(
            profile.get("location", ""),
            internship.get("location", ""),
            internship.get("mode", ""),
        )

        # --- Interest score (10%) ---
        int_sc = self._interest_score(
            profile.get("interests", []),
            internship.get("description", "") + " " + internship.get("title", ""),
        )

        # --- Weighted total ---
        total = (
            0.40 * skill_sc
            + 0.35 * semantic_sc
            + 0.15 * loc_sc
            + 0.10 * int_sc
        )
        match_score = round(min(total * 100, 100), 2)

        # Clamp individual component display to 0-100
        def _pct(v: float) -> float:
            return round(min(v * 100, 100), 2)

        internship_id = internship.get("_id", internship.get("id", ""))

        return {
            "internship_id": internship_id,
            "match_score": match_score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "score_breakdown": {
                "skill_score": _pct(skill_sc),
                "semantic_score": _pct(semantic_sc),
                "location_score": _pct(loc_sc),
                "interest_score": _pct(int_sc),
            },
        }

    def match_profile_with_internships(
        self,
        profile: Dict[str, Any],
        internships: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Match a profile against every internship in the list.

        Returns results sorted by match_score descending.
        """
        results: list[dict[str, Any]] = []
        for internship in internships:
            try:
                result = self.calculate_match(profile, internship)
                results.append(result)
            except Exception as exc:
                logger.error(
                    "Error matching internship %s: %s",
                    internship.get("_id", "unknown"),
                    exc,
                )
                # Still include a zero-score entry so the caller knows it failed
                results.append(
                    {
                        "internship_id": internship.get("_id", internship.get("id", "unknown")),
                        "match_score": 0.0,
                        "matched_skills": [],
                        "missing_skills": [],
                        "score_breakdown": {
                            "skill_score": 0.0,
                            "semantic_score": 0.0,
                            "location_score": 0.0,
                            "interest_score": 0.0,
                        },
                        "error": str(exc),
                    }
                )

        results.sort(key=lambda r: r["match_score"], reverse=True)
        return results
