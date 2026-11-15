from pydantic import BaseModel, Field
from typing import Optional


class ResumeRequest(BaseModel):
    """Request model for resume extraction."""
    file_path: Optional[str] = Field(None, description="Absolute path to the PDF file on the server")
    file_content: Optional[str] = Field(None, description="Base64-encoded PDF file content")


class ProfileData(BaseModel):
    """User profile data for matching."""
    skills: list[str] = Field(default_factory=list, description="List of user skills")
    education: list[dict] = Field(default_factory=list, description="Education history")
    interests: list[str] = Field(default_factory=list, description="List of interests / career goals")
    location: Optional[str] = Field(None, description="User location")
    preferredMode: Optional[str] = Field(None, description="Preferred work mode: remote, onsite, hybrid")
    bio: Optional[str] = Field(None, description="Short bio / summary text")


class InternshipData(BaseModel):
    """Internship listing data."""
    id: str = Field(..., alias="_id", description="Internship ID")
    title: str = Field(..., description="Internship title")
    organization: str = Field("", description="Organization name")
    description: str = Field("", description="Internship description")
    skills: list[str] = Field(default_factory=list, description="Required skills")
    location: str = Field("", description="Internship location")
    mode: str = Field("", description="Work mode: remote, onsite, hybrid")

    class Config:
        populate_by_name = True


class MatchRequest(BaseModel):
    """Request model for matching a profile against internships."""
    profile: ProfileData
    internships: list[InternshipData]


class ScoreBreakdown(BaseModel):
    """Detailed score breakdown."""
    skill_score: float = 0.0
    semantic_score: float = 0.0
    location_score: float = 0.0
    interest_score: float = 0.0


class MatchResult(BaseModel):
    """Result of matching a profile to a single internship."""
    internship_id: str
    match_score: float
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    score_breakdown: dict = Field(default_factory=dict)


class ResumeResponse(BaseModel):
    """Response model for resume extraction."""
    skills: list[str] = Field(default_factory=list)
    education: list[dict] = Field(default_factory=list)
    experience: list[dict] = Field(default_factory=list)
    raw_text: str = ""
