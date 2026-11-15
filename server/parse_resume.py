import sys
import os
import json

ai_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ai-service'))
sys.path.insert(0, ai_dir)

from app.services.resume_processor import ResumeProcessor

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input provided"}))
        sys.exit(1)

    processor = ResumeProcessor()

    if sys.argv[1] == '--text':
        text = ' '.join(sys.argv[2:])
        contact_info = processor.extract_contact_info(text)
        skills = processor.extract_skills(text)
        education = processor.extract_education(text)
        experience = processor.extract_experience(text)
        res = {
            "name": contact_info.get("name") or "Student Candidate",
            "title": contact_info.get("title") or (f"{contact_info.get('degree', 'Student')} Candidate"),
            "email": contact_info.get("email") or "",
            "phone": contact_info.get("phone") or "",
            "location": contact_info.get("location") or "India",
            "github": contact_info.get("github") or "",
            "linkedin": contact_info.get("linkedin") or "",
            "degree": contact_info.get("degree") or (education[0].get("degree") if education else "Undergraduate"),
            "institution": contact_info.get("institution") or (education[0].get("institution") if education else "College / University"),
            "skills": skills,
            "education": education,
            "experience": experience,
            "bio": f"{contact_info.get('name', 'Candidate')} skilled in {', '.join(skills[:5])}" if skills else "Student seeking internship"
        }
        print(json.dumps(res))
        return

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}"}))
        sys.exit(1)

    try:
        res = processor.process_resume(file_path=file_path)
        clean_res = {k: v for k, v in res.items() if k != 'raw_text'}
        print(json.dumps(clean_res))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
