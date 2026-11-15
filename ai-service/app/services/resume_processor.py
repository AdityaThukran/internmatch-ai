"""
Resume processing – extract text, skills, education, experience, and profile details from PDFs.
Supports both PyMuPDF (fitz) and pypdf.
"""

from __future__ import annotations

import base64
import io
import os
import re
from typing import Any, Dict, List

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import pypdf
except ImportError:
    pypdf = None

from app.services.skill_extractor import extract_skills_from_text


class ResumeProcessor:
    """Parse a PDF resume and extract structured profile data."""

    # ------------------------------------------------------------------ #
    # Text extraction
    # ------------------------------------------------------------------ #

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract all text from a PDF file using fitz or pypdf."""
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"PDF not found at: {file_path}")

        text_parts: list[str] = []

        # 1. Try PyMuPDF (fitz)
        if fitz is not None:
            try:
                with fitz.open(file_path) as doc:
                    for page in doc:
                        pt = page.get_text("text")
                        if pt:
                            text_parts.append(pt)
                if text_parts:
                    return "\n".join(text_parts)
            except Exception:
                pass

        # 2. Try pypdf
        if pypdf is not None:
            try:
                reader = pypdf.PdfReader(file_path)
                for page in reader.pages:
                    pt = page.extract_text()
                    if pt:
                        text_parts.append(pt)
                if text_parts:
                    return "\n".join(text_parts)
            except Exception as e:
                print(f"[pypdf error]: {e}")

        # 3. Fallback: try raw read (ONLY for genuine non-PDF plain text/markdown files)
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                # NEVER treat raw binary PDF content (%PDF-) as text
                if content and not content.startswith("%PDF"):
                    return content
        except Exception:
            pass

        return "\n".join(text_parts)

    @staticmethod
    def extract_text_from_base64(b64_content: str) -> str:
        """Decode base64 PDF content and extract text."""
        try:
            pdf_bytes = base64.b64decode(b64_content)
        except Exception as exc:
            raise ValueError(f"Invalid base64 content: {exc}") from exc

        text_parts: list[str] = []

        if fitz is not None:
            try:
                with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
                    for page in doc:
                        pt = page.get_text("text")
                        if pt:
                            text_parts.append(pt)
                if text_parts:
                    return "\n".join(text_parts)
            except Exception:
                pass

        if pypdf is not None:
            try:
                reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
                for page in reader.pages:
                    pt = page.extract_text()
                    if pt:
                        text_parts.append(pt)
                if text_parts:
                    return "\n".join(text_parts)
            except Exception:
                pass

        return "\n".join(text_parts)

    # ------------------------------------------------------------------ #
    # Personal & Contact Information Extraction
    # ------------------------------------------------------------------ #

    @staticmethod
    def extract_contact_info(text: str) -> Dict[str, Any]:
        """Extract name, email, phone, location, links, degree and institution."""
        info: Dict[str, Any] = {
            "name": "",
            "title": "",
            "email": "",
            "phone": "",
            "location": "",
            "github": "",
            "linkedin": "",
            "degree": "",
            "institution": ""
        }

        # 1. Email
        email_match = re.search(r"([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)", text)
        if email_match:
            info["email"] = email_match.group(1).strip()

        # 2. Phone
        phone_match = re.search(r"(?:\+?\d{1,3}[-\s]*)?(?:\(?\d{3,5}\)?[-\s]*)?\d{3,5}[-\s]*\d{4,5}", text)
        if phone_match:
            phone_str = phone_match.group(0).strip()
            # Clean up whitespace
            phone_str = re.sub(r"\s+", " ", phone_str)
            if len(re.sub(r"\D", "", phone_str)) >= 10:
                info["phone"] = phone_str

        # 3. GitHub
        github_match = re.search(r"(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_-]+)", text, re.IGNORECASE)
        if github_match:
            info["github"] = f"https://github.com/{github_match.group(1)}"

        # 4. LinkedIn
        linkedin_match = re.search(r"(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9_-]+)", text, re.IGNORECASE)
        if linkedin_match:
            info["linkedin"] = f"https://linkedin.com/in/{linkedin_match.group(1)}"

        # 5. Location
        # Look for common city/country or location indicators
        loc_patterns = [
            r"(?:Faridabad|Delhi|Gurugram|Noida|Bengaluru|Bangalore|Hyderabad|Mumbai|Pune|Chennai|Kolkata|Chandigarh|Jaipur|Ahmedabad|Lucknow)[,\s]+(?:Haryana|Delhi|NCR|Karnataka|Telangana|Maharashtra|Tamil Nadu|India)?",
            r"(?:Location|Address|Living in|Based in)[:\s]+([A-Za-z\s,]+)",
            r"([A-Z][a-zA-Z\s]+,\s*India)"
        ]
        for lp in loc_patterns:
            lm = re.search(lp, text, re.IGNORECASE)
            if lm:
                loc_cand = lm.group(0).strip()
                # Clean up prefixes
                loc_cand = re.sub(r"^(?:Location|Address|Living in|Based in)[:\s]+", "", loc_cand, flags=re.IGNORECASE)
                info["location"] = loc_cand.strip()
                break

        # 6. Candidate Name & Title from Top Lines
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        if lines:
            # First line is usually candidate name
            first_line = lines[0]
            # Strip emojis or symbols
            first_line_clean = re.sub(r"[^\w\s]", "", first_line).strip()
            if len(first_line_clean) > 1 and len(first_line_clean.split()) <= 4:
                info["name"] = first_line_clean

            # Second line is often title/role
            if len(lines) > 1:
                second_line = lines[1]
                if not re.search(r"@[a-zA-Z0-9-]+\.", second_line) and not re.search(r"\d{10}", second_line):
                    info["title"] = second_line.strip()

        # 7. Degree & Institution Detection
        if re.search(r"\b(?:Bachelor\s+of\s+Computer\s+Applications|BCA|B\.C\.A\.?)\b", text, re.IGNORECASE):
            info["degree"] = "Bachelor of Computer Applications (BCA)"
        elif re.search(r"\b(?:Master\s+of\s+Computer\s+Applications|MCA|M\.C\.A\.?)\b", text, re.IGNORECASE):
            info["degree"] = "Master of Computer Applications (MCA)"
        elif re.search(r"\b(?:B\.?\s*Sc(?:\s+in)?\s+Mathematics|BSc\s+Mathematics)\b", text, re.IGNORECASE):
            info["degree"] = "B.Sc Mathematics"
        elif re.search(r"\b(?:B\.?\s*Sc(?:\s+in)?\s+Computer\s+Science|BSc\s+CS)\b", text, re.IGNORECASE):
            info["degree"] = "B.Sc Computer Science"
        elif re.search(r"\b(?:B\.?\s*Tech(?:\s+in)?\s+Artificial\s+Intelligence|B\.Tech\s+AI)\b", text, re.IGNORECASE):
            info["degree"] = "B.Tech in Artificial Intelligence"
        elif re.search(r"\b(?:B\.?\s*Tech(?:\s+in)?\s+Computer\s+Science|B\.Tech\s+CSE?)\b", text, re.IGNORECASE):
            info["degree"] = "B.Tech in Computer Science"
        elif re.search(r"\b(?:B\.?\s*Tech|B\.?\s*E\.?)\s*(?:in)?\s*(?:Electrical\s+(?:and\s+Electronics\s+)?Engineering|EEE|EE)\b", text, re.IGNORECASE) or re.search(r"\b(?:Electrical\s+(?:and\s+Electronics\s+)?Engineering)\b", text, re.IGNORECASE):
            info["degree"] = "B.Tech in Electrical Engineering"
        elif re.search(r"\b(?:B\.?\s*Tech|B\.?\s*E\.?)\s*(?:in)?\s*(?:Electronics\s+(?:and\s+Communication\s+)?Engineering|ECE)\b", text, re.IGNORECASE) or re.search(r"\b(?:Electronics\s+(?:and\s+Communication\s+)?Engineering)\b", text, re.IGNORECASE):
            info["degree"] = "B.Tech in Electronics & Communication Engineering"
        elif re.search(r"\b(?:B\.?\s*Tech|B\.?\s*E\.?)\s*(?:in)?\s*(?:Mechanical\s+Engineering|ME)\b", text, re.IGNORECASE) or re.search(r"\b(?:Mechanical\s+Engineering)\b", text, re.IGNORECASE):
            info["degree"] = "B.Tech in Mechanical Engineering"
        elif re.search(r"\b(?:B\.?\s*Tech|B\.?\s*E\.?)\s*(?:in)?\s*(?:Civil\s+Engineering|CE)\b", text, re.IGNORECASE) or re.search(r"\b(?:Civil\s+Engineering)\b", text, re.IGNORECASE):
            info["degree"] = "B.Tech in Civil Engineering"
        else:
            deg_match = re.search(r"(B\.?\s*Tech|B\.?\s*E\.?|B\.?\s*Sc|B\.?\s*A\.?|B\.?\s*Com|BCA|BBA|M\.?\s*Tech|M\.?\s*Sc|MCA|MBA)(?:\s+(?:in|of))?\s+([A-Za-z\s&]+?)(?:\s+\d{4}|\s*–|\s*-|\n|$)", text, re.IGNORECASE)
            if deg_match:
                full_deg = f"{deg_match.group(1).strip()} in {deg_match.group(2).strip()}"
                info["degree"] = full_deg
            elif re.search(r"\bB\.?\s*Tech\b", text, re.IGNORECASE):
                info["degree"] = "B.Tech (Engineering)"
            elif re.search(r"\bB\.?\s*Sc\b", text, re.IGNORECASE):
                info["degree"] = "B.Sc (Science)"
            elif re.search(r"\bB\.?\s*Com\b", text, re.IGNORECASE):
                info["degree"] = "B.Com (Commerce)"
            elif re.search(r"\bBBA\b", text, re.IGNORECASE):
                info["degree"] = "Bachelor of Business Administration (BBA)"

        inst_match = re.search(r"(Delhi University|Guru Gobind Singh Indraprastha University|GGSIPU|IP University|Lingaya's Vidyapeeth|IIT|NIT|BITS|DTU|Amity|Manipal|SRM|VIT|Christ University|Symbiosis|IGNOU|[A-Z][a-zA-Z\s&']+(?:University|Vidyapeeth|College|Institute|Academy))", text, re.IGNORECASE)
        if inst_match:
            info["institution"] = inst_match.group(0).strip()

        return info

    # ------------------------------------------------------------------ #
    # Skill extraction (delegates to skill_extractor module)
    # ------------------------------------------------------------------ #

    @staticmethod
    def extract_skills(text: str) -> List[str]:
        """Extract skills from resume text."""
        skills = extract_skills_from_text(text)
        
        # Add high-confidence pattern scanning for specific resume headers
        skill_section_match = re.search(r"(?:TECHNICAL SKILLS|SKILLS|CORE COMPETENCIES|Languages:)([\s\S]*?)(?:PROJECTS|EXPERIENCE|EDUCATION|RELEVANT COURSEWORK|ACHIEVEMENTS|$)", text, re.IGNORECASE)
        if skill_section_match:
            sec_text = skill_section_match.group(1)
            # Find tokens
            raw_tokens = re.split(r"[,•|\n;:]", sec_text)
            for tok in raw_tokens:
                cand = tok.strip()
                cand_clean = re.sub(r"^(?:Languages|Frontend|Backend|Database|Stack|Tools & Others|Tools)\s*:", "", cand, flags=re.IGNORECASE).strip()
                if 2 <= len(cand_clean) <= 25 and not re.search(r"[\d@/\\]", cand_clean):
                    if cand_clean.lower() not in [s.lower() for s in skills]:
                        # Check against common known skills
                        if cand_clean in ["C", "C++", "Python", "Java", "JavaScript", "HTML5", "CSS3", "React.js", "Node.js", "Express.js", "MongoDB", "MERN Stack", "Git", "GitHub", "DSA", "REST API", "Machine Learning"]:
                            skills.append(cand_clean)

        return list(dict.fromkeys(skills))

    # ------------------------------------------------------------------ #
    # Education extraction
    # ------------------------------------------------------------------ #

    @staticmethod
    def extract_education(text: str) -> List[Dict[str, Any]]:
        education: list[dict[str, Any]] = []
        degree_patterns = [
            r"(?:Bachelor(?:'s)?|B\.?\s*Tech|B\.?\s*E\.?|B\.?\s*Sc|B\.?\s*S\.?|B\.?\s*A\.?|B\.?\s*Com|BCA|BBA)",
            r"(?:Master(?:'s)?|M\.?\s*Tech|M\.?\s*E\.?|M\.?\s*Sc|M\.?\s*S\.?|M\.?\s*A\.?|M\.?\s*Com|MCA|MBA)",
            r"(?:Ph\.?\s*D\.?|Doctorate|Doctor of Philosophy)",
            r"(?:Diploma|Associate(?:'s)?|Higher Secondary|HSC|SSC|12th|10th|Class XII|Class X)",
        ]
        combined_degree_pattern = "|".join(degree_patterns)

        lines = text.split("\n")
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            degree_match = re.search(combined_degree_pattern, line, re.IGNORECASE)

            if degree_match:
                entry: dict[str, Any] = {}
                entry["degree"] = degree_match.group(0).strip()
                context_lines = lines[i : min(i + 5, len(lines))]
                context = " ".join(l.strip() for l in context_lines)

                field_match = re.search(r"(?:in|of)\s+([A-Za-z][A-Za-z &/,]+?)(?:\s*[,\-\(]|\s+from|\s+at|\s*$)", context, re.IGNORECASE)
                if field_match:
                    entry["field"] = field_match.group(1).strip()

                inst_match = re.search(r"(?:from|at|,)\s+([A-Z][A-Za-z &'.]+(?:University|Vidyapeeth|Institute|College|School|Academy|Polytechnic)[A-Za-z &'.]*)", context, re.IGNORECASE)
                if inst_match:
                    entry["institution"] = inst_match.group(1).strip()
                elif i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    if next_line and not re.search(combined_degree_pattern, next_line, re.IGNORECASE):
                        if re.match(r"[A-Z]", next_line) and len(next_line.split()) >= 2:
                            entry["institution"] = next_line

                year_match = re.findall(r"((?:19|20)\d{2})", context)
                if year_match:
                    years = sorted(set(year_match))
                    if len(years) >= 2:
                        entry["start_year"] = years[0]
                        entry["end_year"] = years[-1]
                    else:
                        entry["year"] = years[0]

                education.append(entry)
                i += 3
            else:
                i += 1

        seen: set[str] = set()
        unique: list[dict[str, Any]] = []
        for e in education:
            key = str((e.get("degree", ""), e.get("institution", "")))
            if key not in seen:
                seen.add(key)
                unique.append(e)

        return unique

    # ------------------------------------------------------------------ #
    # Experience extraction
    # ------------------------------------------------------------------ #

    @staticmethod
    def extract_experience(text: str) -> List[Dict[str, Any]]:
        experience: list[dict[str, Any]] = []
        title_patterns = [
            r"(?:Software|Frontend|Backend|Full[\s-]?Stack|Web|Mobile|Data|ML|AI|Cloud|DevOps|QA|Test|Security|System|Network|Database|Product|Project|Research|Business|Marketing|Sales|Content|Technical|Junior|Senior|Lead|Principal|Staff|Intern|Associate|Assistant|Manager|Director|VP|Head|Chief)\s+"
            r"(?:Engineer|Developer|Analyst|Scientist|Architect|Designer|Administrator|Consultant|Specialist|Coordinator|Executive|Officer|Intern|Trainee|Fellow|Associate)",
            r"(?:SDE|SWE|SSE|SE|MTS|SMTS)\s*[-–]?\s*(?:I{1,3}|[123])?",
            r"(?:Software|Web|Application)\s+Developer",
            r"(?:Data|Business|System|Research|Financial|Quality)\s+Analyst",
            r"(?:UI|UX|UI/UX|Product|Graphic|Visual|Web)\s+Designer",
            r"Intern(?:ship)?",
        ]
        combined_title_pattern = "|".join(f"(?:{p})" for p in title_patterns)

        lines = text.split("\n")
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            title_match = re.search(combined_title_pattern, line, re.IGNORECASE)
            if title_match:
                entry: dict[str, Any] = {"title": title_match.group(0).strip()}
                context_lines = lines[max(0, i - 1) : min(i + 4, len(lines))]
                context = " ".join(l.strip() for l in context_lines)

                company_match = re.search(r"(?:at|@|\||–|—|-|,)\s+([A-Z][A-Za-z0-9 &.']+?)(?:\s*[,\|]|\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})|\s*$)", context, re.IGNORECASE)
                if company_match:
                    comp = company_match.group(1).strip()
                    if len(comp) > 1 and comp.lower() not in ("present", "current"):
                        entry["company"] = comp

                experience.append(entry)
                i += 3
            else:
                i += 1

        seen: set[str] = set()
        unique: list[dict[str, Any]] = []
        for e in experience:
            key = str((e.get("title", ""), e.get("company", "")))
            if key not in seen:
                seen.add(key)
                unique.append(e)

        return unique

    # ------------------------------------------------------------------ #
    # Orchestrator
    # ------------------------------------------------------------------ #

    def process_resume(self, file_path: str | None = None, file_content: str | None = None) -> Dict[str, Any]:
        """Full pipeline: extract text → profile info, skills, education, experience."""
        if file_content:
            raw_text = self.extract_text_from_base64(file_content)
        elif file_path:
            raw_text = self.extract_text_from_pdf(file_path)
        else:
            raise ValueError("Either file_path or file_content must be provided.")

        contact_info = self.extract_contact_info(raw_text)
        skills = self.extract_skills(raw_text)
        education = self.extract_education(raw_text)
        experience = self.extract_experience(raw_text)

        # Build comprehensive bio
        bio_parts = []
        if contact_info.get("name"):
            bio_parts.append(f"{contact_info['name']}")
        if contact_info.get("title"):
            bio_parts.append(f"— {contact_info['title']}")
        if skills:
            bio_parts.append(f"skilled in {', '.join(skills[:5])}")

        bio = " ".join(bio_parts) if bio_parts else "Student seeking internship opportunities"

        return {
            "name": contact_info.get("name") or "Student Candidate",
            "title": contact_info.get("title") or (f"{contact_info.get('degree', 'Student')} Candidate"),
            "email": contact_info.get("email") or "",
            "phone": contact_info.get("phone") or "",
            "location": contact_info.get("location") or "India",
            "github": contact_info.get("github") or "",
            "linkedin": contact_info.get("linkedin") or "",
            "degree": contact_info.get("degree") or (education[0].get("degree") if education else "Undergraduate Degree"),
            "institution": contact_info.get("institution") or (education[0].get("institution") if education else "University / College"),
            "skills": skills,
            "education": education,
            "experience": experience,
            "bio": bio,
            "raw_text": raw_text,
        }
