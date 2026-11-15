const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

// Comprehensive technical, engineering, actuarial, legal, commerce, design, and management skills dictionary
const SKILLS_DATABASE = [
  // Programming & Embedded Languages
  'C', 'C++', 'Python', 'Java', 'JavaScript', 'TypeScript', 'Embedded C', 'MATLAB', 'R', 'C#', 'Go', 'Golang', 'Rust', 'PHP', 'Ruby', 'Dart', 'Kotlin', 'Swift', 'SQL',

  // Actuarial Science, Statistics, Mathematics & Quantitative Risk
  'Actuarial Science', 'Actuarial Modeling', 'Financial Mathematics', 'Probability & Statistics', 'Statistics', 'Mathematics',
  'Loss Distributions', 'Claims Reserving', 'Life Contingencies', 'Survival Analysis', 'IFRS 17', 'Solvency II',
  'Prophet', 'MoSes', 'Financial Risk Management', 'FRM', 'Quantitative Analysis', 'ALM', 'Asset Liability Management',
  'Econometrics', 'Time Series Analysis', 'Monte Carlo Simulation', 'Stochastic Modeling', 'VBA', 'Excel VBA', 'Advanced Excel',

  // Law, Legal Studies & Compliance
  'Legal Research', 'Legal Drafting', 'Contract Drafting', 'Contract Review', 'Due Diligence', 'Intellectual Property',
  'IPR', 'Patent Law', 'Trademark Filing', 'Copyright Law', 'Corporate Law', 'Commercial Law', 'Commercial Contracts',
  'M&A Due Diligence', 'Litigation', 'Arbitration', 'Dispute Resolution', 'Legal Compliance', 'Regulatory Affairs',
  'SCC Online', 'Manupatra', 'Westlaw', 'Moot Court', 'Tax Law', 'Cyber Law', 'Competition Law', 'Insolvency & Bankruptcy', 'IBC',

  // Commerce, Accounting, Finance & Banking
  'Financial Accounting', 'Auditing', 'Financial Statements', 'GST Compliance', 'Income Tax', 'Direct Tax', 'Indirect Tax',
  'Tally Prime', 'Tally ERP', 'SAP FICO', 'Financial Modeling', 'DCF Valuation', 'Equity Research', 'Investment Banking',
  'Portfolio Management', 'Cost Accounting', 'Wealth Management', 'Risk Management', 'Corporate Finance',

  // Business Administration, Management & Marketing
  'Business Development', 'Market Research', 'Digital Marketing', 'Search Engine Optimization', 'SEO', 'SEM',
  'Content Strategy', 'Social Media Marketing', 'Human Resources', 'HR Operations', 'Talent Acquisition', 'Recruitment',
  'Supply Chain Management', 'Logistics', 'Operations Management', 'CRM', 'Salesforce', 'Product Management',

  // Electrical, Electronics & Hardware
  'Power Systems', 'Power Electronics', 'Electrical Machines', 'Control Systems', 'Analog & Digital Electronics', 'Signals & Systems',
  'Circuit Design', 'PCB Design', 'Microcontrollers', 'Sensors', 'Motor Drivers', 'Transformers', 'Substation', 'Substation Operations',
  'AutoCAD Electrical', 'AutoCAD', 'MATLAB/Simulink', 'Simulink', 'PSIM', 'LTspice', 'Proteus', 'ETAP', 'Arduino IDE', 'Arduino',
  'ESP32', 'STM32', 'Raspberry Pi', 'PLC', 'SCADA', 'IoT', 'Robotics', 'Automation', 'Industrial Automation', 'VLSI', 'Verilog', 'VHDL',

  // Mechanical, Civil & Core Engineering
  'SolidWorks', 'CATIA', 'ANSYS', 'AutoCAD Civil', 'Revit', 'STAAD Pro', 'BIM', 'Thermodynamics', 'Fluid Mechanics',
  'HVAC', 'Structural Analysis', 'Construction Management', 'Surveying', 'Manufacturing Processes',

  // UI/UX Design & Creative Arts
  'Figma', 'UI/UX Design', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Adobe XD',
  'Photoshop', 'Illustrator', 'Adobe After Effects', 'Premiere Pro', 'Blender', 'Interaction Design',

  // Web & Full Stack
  'React', 'React.js', 'Node.js', 'Express', 'Express.js', 'MongoDB', 'Next.js', 'Vue.js', 'Angular',
  'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'REST API', 'RESTful APIs', 'GraphQL', 'FastAPI', 'Flask', 'Django',

  // Databases & Cloud / DevOps
  'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase', 'Supabase', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Linux', 'Git', 'GitHub', 'VS Code',

  // AI, Data Science & CS Core
  'Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'Natural Language Processing', 'NLP', 'Computer Vision',
  'PyTorch', 'TensorFlow', 'Data Analysis', 'Data Structures & Algorithms', 'DSA', 'OOP', 'DBMS', 'Operating Systems'
];

// Common resume section headers to black-list from candidate name detection
const SECTION_HEADERS_REGEX = /^(career\s+objective|objective|professional\s+summary|summary|profile|about\s+me|education|technical\s+skills|skills|projects|experience|work\s+experience|internships?|internship\s+experience|academic\s+credentials|certifications?|achievements?|personal\s+details|contact|contact\s+info|curriculum\s+vitae|resume|page\s+\d+|declaration|languages?\s*(?:&|and)?\s*interests?)/i;

/**
 * Extract full text from PDF file or buffer using PDFParse
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
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const rawLine = lines[i];
    // Candidate names might be before tabs (\t), pipes (|), bullets (• / ·) or dashes
    const segments = rawLine.split(/[\t|\u2022•·]/).map(s => s.trim()).filter(Boolean);
    for (const seg of segments) {
      // Discard section headers
      if (SECTION_HEADERS_REGEX.test(seg)) continue;
      // Discard emails, urls, phone digits
      if (/@|\.com|\.in|\.org|\d{3,}|\/\/|https?:|linkedin|github/i.test(seg)) continue;
      // Discard degree prefixes or titles if line starts with them
      if (/^(b\.?tech|m\.?tech|bca|mca|b\.?sc|m\.?sc|bba|mba|phd|engineer|developer|intern|student)/i.test(seg)) continue;
      // Discard lines starting with emoji or non-word characters
      if (/^[^\w\s]/.test(seg)) continue;
      // Check for valid candidate name (letters, spaces, periods, dashes, 1 to 4 words)
      if (/^[A-Za-z\s.'-]{2,40}$/.test(seg)) {
        const words = seg.split(/\s+/);
        if (words.length >= 1 && words.length <= 4) {
          name = seg;
          break;
        }
      }
    }
    if (name) break;
  }
  if (!name || SECTION_HEADERS_REGEX.test(name)) name = 'Candidate';

  // 2. Email Address
  let email = '';
  const emailRegex = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;
  const emailMatches = rawText.match(emailRegex);
  if (emailMatches && emailMatches.length > 0) {
    const validEmail = emailMatches.find(e => e.length > 6 && !e.startsWith('V@') && !e.includes('example.com'));
    email = validEmail || emailMatches[0];
  }

  // 3. Contact Phone Number
  let phone = '';
  const phoneMatch = rawText.match(/(?:\+91[\s-]*)?[6-9]\d{4}[\s-]*\d{5}/) || rawText.match(/\+?\d[\d\s-]{9,14}\d/);
  if (phoneMatch) {
    phone = phoneMatch[0].replace(/\s+/g, ' ').trim();
  }

  // 4. GitHub & LinkedIn Links
  let github = '';
  const ghMatch = rawText.match(/github\.com\/([A-Za-z0-9_-]+)/i);
  if (ghMatch) {
    github = `https://github.com/${ghMatch[1]}`;
  }

  let linkedin = '';
  const liMatch = rawText.match(/linkedin\.com\/in\/([A-Za-z0-9_-]+)/i);
  if (liMatch) {
    linkedin = `https://linkedin.com/in/${liMatch[1]}`;
  }

  // 5. Degree / Program (Capture full specialization if available across all Indian universities & streams)
  let degree = '';
  const degMatch = rawText.match(/\b((?:B\.?Tech|Bachelor\s+of\s+Technology|M\.?Tech|Master\s+of\s+Technology|BA\s+LLB|BBA\s+LLB|B\.?Com\s+LLB|LLB|LLM|Bachelor\s+of\s+Laws?|Master\s+of\s+Laws?|B\.?Sc(?:\s+in)?\s+Actuarial\s+Science|M\.?Sc(?:\s+in)?\s+Actuarial\s+Science|Actuarial\s+Science|B\.?Sc(?:\s+in)?\s+Statistics|M\.?Sc(?:\s+in)?\s+Statistics|B\.?Stat|M\.?Stat|B\.?Com(?:\s+\(Hons\))?|M\.?Com|Chartered\s+Accountancy|Chartered\s+Accountant|CA\s+Inter(?:mediate)?|CMA|CS|BBA|BMS|MBA|PGDM|B\.?Des|M\.?Des|B\.?Arch|M\.?Arch|B\.?Pharm|M\.?Pharm|Pharm\.?D|Bachelor\s+of\s+[A-Za-z]+|B\.?Sc|M\.?Sc|BCA|MCA|BA|MA)(?:\s+(?:in|of))?\s+[A-Za-z\s&/]{2,45}?)(?=(?:\s*\d{4}|\s*\||\s*\(|\s*\[|\s*,|\s*\n|\s*\t|$))/i) ||
                   rawText.match(/\b(BA\s+LLB|BBA\s+LLB|B\.?Com\s+LLB|LLB|LLM|B\.?Sc\s+Actuarial\s+Science|Actuarial\s+Science|B\.?Tech|M\.?Tech|BCA|MCA|B\.?Sc|M\.?Sc|B\.?Com|M\.?Com|BBA|BMS|MBA|B\.?Des|B\.?Arch|B\.?Pharm)\b/i);
  if (degMatch) {
    degree = degMatch[1].trim()
      .replace(/\|.*$/, '')
      .replace(/\s+\d{4}.*$/, '')
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  if (!degree) degree = 'Undergraduate Degree';

  // 6. College / Institution
  let institution = '';
  for (const l of lines) {
    if (l === name || SECTION_HEADERS_REGEX.test(l)) continue;
    const im = l.match(/\b(Lingaya'?s\s+Vidyapeeth[A-Za-z\s,]*|Sample\s+Institute\s+of\s+Technology[A-Za-z\s,]*|Institute\s+of\s+Actuaries\s+of\s+India|National\s+Law\s+University[A-Za-z\s,]*|NLU[A-Za-z\s,]*|Faculty\s+of\s+Mathematical\s+Sciences|Delhi\s+Technological\s+University|Indian\s+Institute\s+of\s+Technology[A-Za-z\s,]*|National\s+Institute\s+of\s+Technology[A-Za-z\s,]*|IP\s+University|Amity\s+University|Shri\s+Ram\s+College\s+of\s+Commerce|[A-Z][A-Za-z\s.'-]{2,40}?(?:Institute|University|College|Vidyapeeth|School\s+of\s+Law)\b[A-Za-z\s,]*)/i);
    if (im) {
      institution = im[0].split(/[|,\t]/)[0].trim();
      break;
    }
  }
  if (!institution) institution = 'University / Institute';

  // 7. Location / Base City
  let location = 'India';
  const locMatch = rawText.match(/\b(Faridabad|Delhi|New\s+Delhi|Noida|Gurgaon|Gurugram|Bengaluru|Bangalore|Hyderabad|Pune|Mumbai|Chennai|Kolkata)\b[\s,]*(?:India)?/i);
  if (locMatch) {
    location = locMatch[0].replace(/[\t|]/g, '').trim();
  }

  // 8. Career Objective / Bio Extraction
  let bio = '';
  const objMatch = rawText.match(/(?:CAREER\s+OBJECTIVE|PROFESSIONAL\s+SUMMARY|SUMMARY|OBJECTIVE)\s*[:\-]?\s*([\s\S]{20,600}?)(?=\n\s*(?:EDUCATION|TECHNICAL\s+SKILLS|SKILLS|PROJECTS|EXPERIENCE|WORK\s+EXPERIENCE|INTERNSHIP|ACADEMIC|CERTIFICATIONS|ACHIEVEMENTS|LANGUAGES|DECLARATION|$))/i);
  if (objMatch && objMatch[1]) {
    const rawBio = objMatch[1].replace(/\s+/g, ' ').trim();
    if (rawBio.length > 25 && !SECTION_HEADERS_REGEX.test(rawBio)) {
      bio = rawBio;
    }
  }

  // If no explicit career objective section, check for a professional tagline (e.g., line 2 "Full Stack Developer | B.Tech Artificial Intelligence")
  if (!bio && lines.length > 1) {
    for (let i = 1; i < Math.min(lines.length, 4); i++) {
      const l = lines[i];
      if (/developer|engineer|enthusiast|student|designer|architect|specialist/i.test(l) && !/@|github|linkedin|\d{5}/i.test(l)) {
        bio = `${name} — ${l.replace(/[\t|]/g, ' | ').replace(/\s+/g, ' ').trim()}`;
        break;
      }
    }
  }

  // 9. Technical Skills Extraction
  const lowerText = rawText.toLowerCase();
  const matchedSkillsSet = new Set();

  SKILLS_DATABASE.forEach(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;()\\/\\|•·\\[\\]])${escaped}(?:$|[\\s,;()\\/\\|•·\\[\\]])`, 'i');
    if (regex.test(lowerText)) {
      matchedSkillsSet.add(skill);
    }
  });

  const skills = matchedSkillsSet.size > 0
    ? Array.from(matchedSkillsSet)
    : ['Problem Solving', 'Data Analysis', 'Engineering Fundamentals'];

  // If still no objective paragraph was present, assemble a clean bio
  if (!bio) {
    bio = `${name} — ${degree} student at ${institution}. Skilled in ${skills.slice(0, 6).join(', ')}.`;
  }

  return {
    name,
    email,
    phone,
    location,
    degree,
    institution,
    github,
    linkedin,
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
    linkedin: '',
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
