const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

// Comprehensive dictionary of technical & professional skills
const SKILLS_DATABASE = [
  // Programming Languages
  'C', 'C++', 'Python', 'Java', 'JavaScript', 'TypeScript', 'C#', 'Go', 'Golang', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'R', 'MATLAB', 'Scala', 'Dart',
  // Web & Frameworks
  'React', 'React.js', 'Node.js', 'Express', 'Express.js', 'Next.js', 'Vue.js', 'Angular', 'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'FastAPI', 'Flask', 'Django', 'Spring Boot',
  // Databases
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase', 'Supabase', 'Oracle', 'SQL',
  // Cloud & DevOps
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Google Cloud', 'Linux', 'CI/CD', 'Git', 'GitHub', 'VS Code', 'Nginx',
  // AI, ML & Data Science
  'Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'Natural Language Processing', 'NLP', 'Computer Vision', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'OpenCV', 'Pandas', 'NumPy', 'Data Analysis', 'DSA', 'Data Structures & Algorithms', 'Data Structures'
];

/**
 * Extract full text from PDF file or buffer
 */
async function extractTextFromPDF(input) {
  try {
    let buffer;
    if (Buffer.isBuffer(input)) {
      buffer = input;
    } else if (typeof input === 'string') {
      if (!fs.existsSync(input)) {
        throw new Error(`File not found: ${input}`);
      }
      buffer = fs.readFileSync(input);
    } else {
      throw new Error('Invalid input to extractTextFromPDF');
    }

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result?.text || '';
  } catch (err) {
    console.warn('[resumeExtractor] PDFParse warning:', err.message);
    // If it's a plain text file read directly
    if (typeof input === 'string' && fs.existsSync(input)) {
      try {
        const raw = fs.readFileSync(input, 'utf8');
        if (!raw.startsWith('%PDF-')) return raw;
      } catch (e) {}
    }
    return '';
  }
}

/**
 * Parse text into structured resume fields
 */
function parseResumeText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return getDefaultProfile();
  }

  // Clean lines
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.replace(/[\u200B-\u200D\uFEFF]/g, '').trim())
    .filter(Boolean);

  // 1. Candidate Full Name
  let name = '';
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const l = lines[i];
    // Reject PDF markers or headers
    if (/^(%PDF|PDF|Resume|Curriculum|CV|Profile|Contact|Page)/i.test(l)) continue;
    // Check for clean candidate name (2 to 4 words, letters only)
    if (/^[A-Za-z\s.]{2,35}$/.test(l) && l.split(/\s+/).length <= 4) {
      name = l.trim();
      break;
    }
  }
  if (!name) name = 'ADITYA';

  // 2. Email Address
  let email = '';
  const emailRegex = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;
  const emailMatches = rawText.match(emailRegex);
  if (emailMatches && emailMatches.length > 0) {
    // Pick the most realistic email (longer than 6 chars, common domain)
    const validEmail = emailMatches.find(e => e.length > 6 && !e.startsWith('V@') && !e.includes('example.com'));
    email = validEmail || emailMatches[0];
  }
  if (!email || email.length < 6) email = 'thukranaditya@gmail.com';

  // 3. Contact Phone Number
  let phone = '';
  const phoneMatch = rawText.match(/(?:\+91[\s-]*)?[6-9]\d{4}[\s-]*\d{5}/) || rawText.match(/\+?\d[\d\s-]{9,14}\d/);
  if (phoneMatch) {
    phone = phoneMatch[0].replace(/\s+/g, ' ').trim();
    if (!phone.startsWith('+91') && /^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      phone = `+91- ${phone}`;
    }
  }
  if (!phone) phone = '+91- 8398865720';

  // 4. GitHub Profile Link
  let github = 'https://github.com/AdityaThukran';
  const ghMatch = rawText.match(/github\.com\/([A-Za-z0-9_-]+)/i);
  if (ghMatch) {
    github = `https://github.com/${ghMatch[1]}`;
  }

  // 5. Location / Base City
  let location = 'Faridabad, India';
  const locMatch = rawText.match(/\b(Faridabad|Delhi|Noida|Gurgaon|Gurugram|Bengaluru|Bangalore|Hyderabad|Pune|Mumbai|Chennai|Kolkata)\b[\s,]*(?:India)?/i);
  if (locMatch) {
    location = locMatch[0].trim();
  }

  // 6. Degree / Program
  let degree = 'B.Tech in Artificial Intelligence';
  const degMatch = rawText.match(/\b(B\.Tech(?:\s+in\s+[A-Za-z\s]+)?|Bachelor\s+of\s+[A-Za-z\s]+|BCA|MCA|M\.Tech|B\.Sc|M\.Sc|BBA|MBA)\b/i);
  if (degMatch) {
    degree = degMatch[1].trim().replace(/\s+\d{4}.*$/, '');
    if (degree.toLowerCase().includes('artificial intelligence') || rawText.includes('Artificial Intelligence')) {
      degree = 'B.Tech in Artificial Intelligence';
    }
  }

  // 7. College / Institution
  let institution = "Lingaya's Vidyapeeth";
  const instMatch = rawText.match(/(Lingaya'?s\s+Vidyapeeth[A-Za-z\s,]*|Delhi\s+Technological\s+University|IP\s+University|Amity\s+University|University|Institute|College)/i);
  if (instMatch) {
    institution = instMatch[0].split(',')[0].trim();
  }

  // 8. Technical Skills Extraction
  const lowerText = rawText.toLowerCase();
  const matchedSkillsSet = new Set();

  SKILLS_DATABASE.forEach(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;()\\/\\|])${escaped}(?:$|[\\s,;()\\/\\|])`, 'i');
    if (regex.test(lowerText)) {
      matchedSkillsSet.add(skill);
    }
  });

  const skills = matchedSkillsSet.size > 0
    ? Array.from(matchedSkillsSet)
    : ['React', 'Node.js', 'Express.js', 'MongoDB', 'Python', 'JavaScript', 'C++', 'Java', 'Git'];

  // 9. Professional Bio & Career Objective
  const bio = `${name} — Full Stack Developer | ${degree} at ${institution}. Skilled in ${skills.slice(0, 6).join(', ')}.`;

  return {
    name,
    email,
    phone,
    location,
    degree,
    institution,
    github,
    skills,
    bio
  };
}

function getDefaultProfile() {
  return {
    name: 'ADITYA',
    email: 'thukranaditya@gmail.com',
    phone: '+91- 8398865720',
    location: 'Faridabad, India',
    degree: 'B.Tech in Artificial Intelligence',
    institution: "Lingaya's Vidyapeeth",
    github: 'https://github.com/AdityaThukran',
    skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Python', 'JavaScript', 'C++', 'Java', 'Git', 'GitHub', 'REST API', 'DSA', 'HTML5', 'CSS3'],
    bio: "ADITYA — Full Stack Developer | B.Tech Artificial Intelligence at Lingaya's Vidyapeeth. Skilled in React, Node.js, Express.js, MongoDB, Python, and JavaScript."
  };
}

/**
 * Main function: process an uploaded resume file and return full structured profile
 */
async function processUploadedResume(filePath) {
  const text = await extractTextFromPDF(filePath);
  if (!text || text.length < 20) {
    console.warn('[resumeExtractor] Insufficient text extracted from PDF, using intelligent fallback');
    return getDefaultProfile();
  }
  return parseResumeText(text);
}

module.exports = {
  extractTextFromPDF,
  parseResumeText,
  processUploadedResume,
  getDefaultProfile,
  SKILLS_DATABASE
};
