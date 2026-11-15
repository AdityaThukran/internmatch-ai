"""
Routes for resume processing.

POST /api/extract-resume
"""

from __future__ import annotations

import logging
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from app.models.schemas import ResumeRequest, ResumeResponse
from app.services.resume_processor import ResumeProcessor

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Resume"])

# Singleton processor (stateless, safe to share)
_processor = ResumeProcessor()


@router.post("/extract-resume", response_model=ResumeResponse)
async def extract_resume(request: ResumeRequest) -> Dict[str, Any]:
    """
    Extract structured data from a PDF resume.

    Accepts either a *file_path* (server-side path to a PDF) **or**
    *file_content* (base64-encoded PDF bytes).
    """
    if not request.file_path and not request.file_content:
        raise HTTPException(
            status_code=400,
            detail="Provide either 'file_path' or 'file_content' (base64).",
        )

    try:
        result = _processor.process_resume(
            file_path=request.file_path,
            file_content=request.file_content,
        )
        return result
    except FileNotFoundError as exc:
        logger.error("File not found: %s", exc)
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        logger.error("Invalid input: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        logger.error("Processing error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected error during resume extraction")
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}")
