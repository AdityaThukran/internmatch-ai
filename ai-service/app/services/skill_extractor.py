"""
Comprehensive skill extraction from text.

Provides a large skill dictionary, case-insensitive matching with common
variations, and skill categorisation.
"""

from __future__ import annotations

import re
from typing import Dict, List

# ---------------------------------------------------------------------------
# Skill Database – maps canonical skill name → category
# ---------------------------------------------------------------------------

SKILL_DATABASE: Dict[str, str] = {
    # Programming Languages
    "Python": "Programming Languages",
    "Java": "Programming Languages",
    "JavaScript": "Programming Languages",
    "TypeScript": "Programming Languages",
    "C": "Programming Languages",
    "C++": "Programming Languages",
    "C#": "Programming Languages",
    "Go": "Programming Languages",
    "Rust": "Programming Languages",
    "Ruby": "Programming Languages",
    "PHP": "Programming Languages",
    "Swift": "Programming Languages",
    "Kotlin": "Programming Languages",
    "R": "Programming Languages",
    "MATLAB": "Programming Languages",
    "Scala": "Programming Languages",
    "Perl": "Programming Languages",
    "Dart": "Programming Languages",
    "Lua": "Programming Languages",
    "Haskell": "Programming Languages",
    "Shell": "Programming Languages",
    "Bash": "Programming Languages",

    # Web Development – Frontend
    "HTML": "Web Development",
    "CSS": "Web Development",
    "React": "Web Development",
    "React.js": "Web Development",
    "Angular": "Web Development",
    "Vue.js": "Web Development",
    "Svelte": "Web Development",
    "Next.js": "Web Development",
    "Remix": "Web Development",
    "Tailwind CSS": "Web Development",
    "Bootstrap": "Web Development",
    "jQuery": "Web Development",
    "Sass": "Web Development",
    "LESS": "Web Development",
    "Webpack": "Web Development",
    "Vite": "Web Development",

    # Web Development – Backend
    "Node.js": "Web Development",
    "Express.js": "Web Development",
    "Django": "Web Development",
    "Flask": "Web Development",
    "FastAPI": "Web Development",
    "Spring Boot": "Web Development",
    "Ruby on Rails": "Web Development",
    "Laravel": "Web Development",
    "ASP.NET": "Web Development",
    ".NET": "Web Development",
    "REST API": "Web Development",
    "GraphQL": "Web Development",
    "Microservices": "Web Development",

    # Mobile Development
    "Flutter": "Mobile Development",
    "React Native": "Mobile Development",
    "Android": "Mobile Development",
    "iOS": "Mobile Development",
    "SwiftUI": "Mobile Development",
    "Jetpack Compose": "Mobile Development",

    # Databases
    "SQL": "Database",
    "MySQL": "Database",
    "PostgreSQL": "Database",
    "MongoDB": "Database",
    "Redis": "Database",
    "SQLite": "Database",
    "Oracle": "Database",
    "Cassandra": "Database",
    "DynamoDB": "Database",
    "Firebase": "Database",
    "Supabase": "Database",
    "Neo4j": "Database",
    "Elasticsearch": "Database",

    # AI / ML / Data Science
    "Machine Learning": "AI/ML",
    "Deep Learning": "AI/ML",
    "NLP": "AI/ML",
    "Computer Vision": "AI/ML",
    "Data Science": "AI/ML",
    "Data Analysis": "AI/ML",
    "Data Engineering": "AI/ML",
    "TensorFlow": "AI/ML",
    "PyTorch": "AI/ML",
    "Keras": "AI/ML",
    "Scikit-learn": "AI/ML",
    "Pandas": "AI/ML",
    "NumPy": "AI/ML",
    "OpenCV": "AI/ML",
    "Hugging Face": "AI/ML",
    "LangChain": "AI/ML",
    "Generative AI": "AI/ML",
    "LLM": "AI/ML",
    "Transformers": "AI/ML",
    "NLTK": "AI/ML",
    "SpaCy": "AI/ML",
    "XGBoost": "AI/ML",
    "Matplotlib": "AI/ML",
    "Seaborn": "AI/ML",

    # Cloud & DevOps
    "AWS": "Cloud",
    "Azure": "Cloud",
    "GCP": "Cloud",
    "Google Cloud": "Cloud",
    "Heroku": "Cloud",
    "Vercel": "Cloud",
    "Netlify": "Cloud",
    "DigitalOcean": "Cloud",
    "Docker": "DevOps",
    "Kubernetes": "DevOps",
    "CI/CD": "DevOps",
    "Jenkins": "DevOps",
    "Terraform": "DevOps",
    "Ansible": "DevOps",
    "GitHub Actions": "DevOps",
    "GitLab CI": "DevOps",
    "Nginx": "DevOps",
    "Apache": "DevOps",

    # Tools & Platforms
    "Git": "Tools",
    "GitHub": "Tools",
    "GitLab": "Tools",
    "Bitbucket": "Tools",
    "Linux": "Tools",
    "JIRA": "Tools",
    "Confluence": "Tools",
    "Slack": "Tools",
    "VS Code": "Tools",
    "Postman": "Tools",

    # Big Data & Streaming
    "Hadoop": "Big Data",
    "Spark": "Big Data",
    "Kafka": "Big Data",
    "RabbitMQ": "Big Data",
    "Airflow": "Big Data",
    "Flink": "Big Data",

    # Design & UX
    "Figma": "Design",
    "UI/UX": "Design",
    "Adobe XD": "Design",
    "Sketch": "Design",
    "Photoshop": "Design",
    "Illustrator": "Design",
    "Canva": "Design",

    # Data Visualisation / BI
    "Power BI": "Data Visualization",
    "Tableau": "Data Visualization",
    "Excel": "Data Visualization",
    "Google Sheets": "Data Visualization",
    "Looker": "Data Visualization",

    # Project Management / Methodologies
    "Agile": "Project Management",
    "Scrum": "Project Management",
    "Kanban": "Project Management",
    "Waterfall": "Project Management",

    # Game Development
    "Unity": "Game Development",
    "Unreal Engine": "Game Development",
    "Godot": "Game Development",

    # Blockchain / Web3
    "Blockchain": "Blockchain",
    "Solidity": "Blockchain",
    "Web3": "Blockchain",
    "Ethereum": "Blockchain",
    "Smart Contracts": "Blockchain",

    # Cybersecurity
    "Cybersecurity": "Cybersecurity",
    "Penetration Testing": "Cybersecurity",
    "Ethical Hacking": "Cybersecurity",
    "OWASP": "Cybersecurity",
    "Cryptography": "Cybersecurity",

    # Testing
    "Jest": "Testing",
    "Mocha": "Testing",
    "Cypress": "Testing",
    "Selenium": "Testing",
    "JUnit": "Testing",
    "PyTest": "Testing",

    # Electrical & Electronics Engineering / Embedded Systems
    "Circuit Design": "Electrical Engineering",
    "MATLAB": "Electrical Engineering",
    "Simulink": "Electrical Engineering",
    "Power Systems": "Electrical Engineering",
    "Control Systems": "Electrical Engineering",
    "Power Electronics": "Electrical Engineering",
    "Embedded Systems": "Electrical Engineering",
    "PCB Design": "Electrical Engineering",
    "Microcontrollers": "Electrical Engineering",
    "Arduino": "Electrical Engineering",
    "Raspberry Pi": "Electrical Engineering",
    "VLSI": "Electrical Engineering",
    "Verilog": "Electrical Engineering",
    "VHDL": "Electrical Engineering",
    "PLC": "Electrical Engineering",
    "SCADA": "Electrical Engineering",
    "Sensors": "Electrical Engineering",
    "IoT": "Electrical Engineering",
    "Internet of Things": "Electrical Engineering",
    "AutoCAD Electrical": "Electrical Engineering",
    "Robotics": "Robotics & Hardware",
    "ROS": "Robotics & Hardware",
    "ROS2": "Robotics & Hardware",
}

# ---------------------------------------------------------------------------
# Variation / alias map  →  canonical name
# ---------------------------------------------------------------------------

_VARIATIONS: Dict[str, str] = {
    "reactjs": "React.js",
    "react js": "React.js",
    "react.js": "React.js",
    "react": "React",
    "nodejs": "Node.js",
    "node js": "Node.js",
    "node.js": "Node.js",
    "expressjs": "Express.js",
    "express js": "Express.js",
    "express.js": "Express.js",
    "nextjs": "Next.js",
    "next js": "Next.js",
    "next.js": "Next.js",
    "vuejs": "Vue.js",
    "vue js": "Vue.js",
    "vue.js": "Vue.js",
    "angularjs": "Angular",
    "angular js": "Angular",
    "tailwindcss": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "tailwind": "Tailwind CSS",
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",
    "fastapi": "FastAPI",
    "fast api": "FastAPI",
    "scikit-learn": "Scikit-learn",
    "scikit learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "sci-kit learn": "Scikit-learn",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    "py torch": "PyTorch",
    "keras": "Keras",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "opencv": "OpenCV",
    "open cv": "OpenCV",
    "nlp": "NLP",
    "natural language processing": "NLP",
    "computer vision": "Computer Vision",
    "cv": "Computer Vision",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "dl": "Deep Learning",
    "deep learning": "Deep Learning",
    "data science": "Data Science",
    "data analysis": "Data Analysis",
    "data analytics": "Data Analysis",
    "data engineering": "Data Engineering",
    "rest api": "REST API",
    "restful api": "REST API",
    "restful": "REST API",
    "graphql": "GraphQL",
    "microservices": "Microservices",
    "micro services": "Microservices",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "ci cd": "CI/CD",
    "continuous integration": "CI/CD",
    "github actions": "GitHub Actions",
    "gitlab ci": "GitLab CI",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "gcp": "GCP",
    "google cloud platform": "GCP",
    "google cloud": "Google Cloud",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "linux": "Linux",
    "html": "HTML",
    "html5": "HTML",
    "css": "CSS",
    "css3": "CSS",
    "sass": "Sass",
    "scss": "Sass",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "python": "Python",
    "java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    "golang": "Go",
    "go lang": "Go",
    "rust": "Rust",
    "ruby": "Ruby",
    "php": "PHP",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "r lang": "R",
    "matlab": "MATLAB",
    "simulink": "Simulink",
    "embedded systems": "Embedded Systems",
    "embedded system": "Embedded Systems",
    "embedded c": "Embedded Systems",
    "pcb design": "PCB Design",
    "pcb": "PCB Design",
    "circuit design": "Circuit Design",
    "power systems": "Power Systems",
    "power system": "Power Systems",
    "control systems": "Control Systems",
    "control system": "Control Systems",
    "power electronics": "Power Electronics",
    "microcontrollers": "Microcontrollers",
    "microcontroller": "Microcontrollers",
    "arduino": "Arduino",
    "raspberry pi": "Raspberry Pi",
    "vlsi": "VLSI",
    "verilog": "Verilog",
    "vhdl": "VHDL",
    "plc": "PLC",
    "scada": "SCADA",
    "iot": "IoT",
    "internet of things": "IoT",
    "robotics": "Robotics",
    "ros": "ROS",
    "ros2": "ROS2",
    "scala": "Scala",
    "perl": "Perl",
    "dart": "Dart",
    "lua": "Lua",
    "haskell": "Haskell",
    "shell": "Shell",
    "bash": "Bash",
    "sql": "SQL",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "sqlite": "SQLite",
    "oracle": "Oracle",
    "cassandra": "Cassandra",
    "dynamodb": "DynamoDB",
    "firebase": "Firebase",
    "supabase": "Supabase",
    "elasticsearch": "Elasticsearch",
    "elastic search": "Elasticsearch",
    "neo4j": "Neo4j",
    "hadoop": "Hadoop",
    "spark": "Spark",
    "apache spark": "Spark",
    "kafka": "Kafka",
    "apache kafka": "Kafka",
    "rabbitmq": "RabbitMQ",
    "rabbit mq": "RabbitMQ",
    "airflow": "Airflow",
    "apache airflow": "Airflow",
    "flink": "Flink",
    "apache flink": "Flink",
    "jenkins": "Jenkins",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "nginx": "Nginx",
    "apache": "Apache",
    "flutter": "Flutter",
    "react native": "React Native",
    "react-native": "React Native",
    "android": "Android",
    "ios": "iOS",
    "swiftui": "SwiftUI",
    "jetpack compose": "Jetpack Compose",
    "figma": "Figma",
    "ui/ux": "UI/UX",
    "uiux": "UI/UX",
    "ui ux": "UI/UX",
    "user experience": "UI/UX",
    "user interface": "UI/UX",
    "adobe xd": "Adobe XD",
    "sketch": "Sketch",
    "photoshop": "Photoshop",
    "illustrator": "Illustrator",
    "canva": "Canva",
    "power bi": "Power BI",
    "powerbi": "Power BI",
    "tableau": "Tableau",
    "excel": "Excel",
    "ms excel": "Excel",
    "microsoft excel": "Excel",
    "google sheets": "Google Sheets",
    "looker": "Looker",
    "agile": "Agile",
    "scrum": "Scrum",
    "kanban": "Kanban",
    "jira": "JIRA",
    "confluence": "Confluence",
    "postman": "Postman",
    "vs code": "VS Code",
    "vscode": "VS Code",
    "visual studio code": "VS Code",
    "unity": "Unity",
    "unreal engine": "Unreal Engine",
    "unreal": "Unreal Engine",
    "godot": "Godot",
    "blockchain": "Blockchain",
    "solidity": "Solidity",
    "web3": "Web3",
    "web 3": "Web3",
    "ethereum": "Ethereum",
    "smart contracts": "Smart Contracts",
    "smart contract": "Smart Contracts",
    "cybersecurity": "Cybersecurity",
    "cyber security": "Cybersecurity",
    "penetration testing": "Penetration Testing",
    "pen testing": "Penetration Testing",
    "ethical hacking": "Ethical Hacking",
    "owasp": "OWASP",
    "cryptography": "Cryptography",
    "jest": "Jest",
    "mocha": "Mocha",
    "cypress": "Cypress",
    "selenium": "Selenium",
    "junit": "JUnit",
    "pytest": "PyTest",
    "django": "Django",
    "flask": "Flask",
    "laravel": "Laravel",
    "asp.net": "ASP.NET",
    "aspnet": "ASP.NET",
    ".net": ".NET",
    "dotnet": ".NET",
    "dot net": ".NET",
    "ruby on rails": "Ruby on Rails",
    "rails": "Ruby on Rails",
    "ror": "Ruby on Rails",
    "bootstrap": "Bootstrap",
    "jquery": "jQuery",
    "webpack": "Webpack",
    "vite": "Vite",
    "svelte": "Svelte",
    "remix": "Remix",
    "heroku": "Heroku",
    "vercel": "Vercel",
    "netlify": "Netlify",
    "digitalocean": "DigitalOcean",
    "digital ocean": "DigitalOcean",
    "hugging face": "Hugging Face",
    "huggingface": "Hugging Face",
    "langchain": "LangChain",
    "lang chain": "LangChain",
    "generative ai": "Generative AI",
    "gen ai": "Generative AI",
    "genai": "Generative AI",
    "llm": "LLM",
    "large language model": "LLM",
    "large language models": "LLM",
    "transformers": "Transformers",
    "nltk": "NLTK",
    "spacy": "SpaCy",
    "xgboost": "XGBoost",
    "matplotlib": "Matplotlib",
    "seaborn": "Seaborn",
    "bitbucket": "Bitbucket",
    "slack": "Slack",
}

# Pre-sort variations by length (longest first) so that longer phrases are
# matched before shorter sub-strings (e.g. "react native" before "react").
_SORTED_VARIATIONS: list[tuple[str, str]] = sorted(
    _VARIATIONS.items(), key=lambda kv: len(kv[0]), reverse=True
)


def extract_skills_from_text(text: str) -> List[str]:
    """
    Extract skills from arbitrary text using case-insensitive matching
    against the skill database and known variations / aliases.

    Returns a deduplicated list of canonical skill names.
    """
    if not text:
        return []

    found: set[str] = set()
    text_lower = text.lower()

    # ----- Phase 1: match known variations (longest-first) -----
    for alias, canonical in _SORTED_VARIATIONS:
        # Build a regex that ensures whole-word / boundary matching.
        # We escape the alias so that special chars (e.g. "c++", ".net") work.
        pattern = r"(?<![a-zA-Z0-9_\-])" + re.escape(alias) + r"(?![a-zA-Z0-9_])"
        if re.search(pattern, text_lower):
            found.add(canonical)

    # ----- Phase 2: match canonical names directly -----
    for canonical_name in SKILL_DATABASE:
        name_lower = canonical_name.lower()
        pattern = r"(?<![a-zA-Z0-9_\-])" + re.escape(name_lower) + r"(?![a-zA-Z0-9_])"
        if re.search(pattern, text_lower):
            found.add(canonical_name)

    # Special handling for single-letter / short languages that cause false
    # positives: "C" and "R".  Only accept them when they appear in contexts
    # that clearly refer to the programming language.
    _short_lang_contexts = {
        "C": [
            r"\bc programming\b", r"\bc language\b", r"\bc/c\+\+\b",
            r"\bc,\s*c\+\+", r"\bprogramming in c\b", r"\bgnu c\b",
            r"\bansi c\b",
        ],
        "R": [
            r"\br programming\b", r"\br language\b", r"\br studio\b",
            r"\brstudio\b", r"\bcran\b", r"\btidyverse\b",
            r"\bggplot\b", r"\bdplyr\b", r"\br shiny\b",
        ],
    }

    for lang, patterns in _short_lang_contexts.items():
        if lang in found:
            # Keep the match only if a supporting context is present
            if not any(re.search(p, text_lower) for p in patterns):
                # Check if the raw text contains "C " / "R " near programming keywords
                generic_ctx = re.search(
                    rf"(?:proficient|skilled|experienced|knowledge|expertise|familiar|worked)\s+(?:in|with)\s+{lang.lower()}\b",
                    text_lower,
                )
                if not generic_ctx:
                    found.discard(lang)

    return sorted(found)


def categorize_skills(skills: List[str]) -> Dict[str, List[str]]:
    """
    Group a list of canonical skill names by their category.

    Skills not found in the database are placed under "Other".
    """
    categories: Dict[str, List[str]] = {}
    for skill in skills:
        category = SKILL_DATABASE.get(skill, "Other")
        categories.setdefault(category, []).append(skill)

    # Sort each category list for deterministic output
    for cat in categories:
        categories[cat] = sorted(categories[cat])

    return categories
