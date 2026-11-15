import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add current dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.matching_engine import MatchingEngine
from app.services.skill_extractor import extract_skills_from_text, categorize_skills
from app.services.resume_processor import ResumeProcessor

app = Flask(__name__)
CORS(app)

engine = MatchingEngine()
processor = ResumeProcessor()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "AI Internship Matcher (NLP & Semantic Engine)",
        "model_loaded": getattr(engine, '_model_available', False)
    })

@app.route('/api/match', methods=['POST'])
def match():
    try:
        data = request.get_json(force=True) or {}
        profile = data.get('profile', {})
        internships = data.get('internships', [])

        if not internships:
            return jsonify({"results": []})

        results = engine.match_profile_with_internships(profile, internships)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/extract-resume', methods=['POST'])
def extract_resume():
    try:
        data = request.get_json(force=True) or {}
        file_path = data.get('file_path')
        if not file_path or not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        extracted = processor.process_resume(file_path)
        return jsonify(extracted)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/skills/extract', methods=['GET'])
def extract_skills():
    text = request.args.get('text', '')
    skills = extract_skills_from_text(text)
    categorized = categorize_skills(skills)
    return jsonify({"skills": skills, "categorized": categorized})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting AI Recommendation Service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
