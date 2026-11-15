/* eslint-disable */
import React, { useState, useRef } from 'react';
import { 
  FiUploadCloud, FiFileText, FiCheck, FiZap, FiLoader, 
  FiRefreshCw, FiEdit3, FiArrowRight, FiCheckCircle,
  FiUser, FiMapPin, FiAward, FiPhone, FiGithub, FiExternalLink, FiClock, FiStar
} from 'react-icons/fi';
import { uploadResume } from '../../services/api';

/**
 * ResumeFeedPersonalizer – Universal Resume Upload & Real-Time Matching Engine
 * Supports ANY degree: B.Tech, BCA, B.Sc, B.Com, BBA, MBA, MCA, Diploma, etc.
 * After upload → AI extracts skills, degree, location → auto-fetches matched real internships
 * from Internshala, LinkedIn, Unstop, Wellfound, Naukri in real-time.
 */
const ResumeFeedPersonalizer = ({ onSkillsExtracted, currentSkills = [], onResetFeed, isPersonalized }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [extractedSkillsList, setExtractedSkillsList] = useState(currentSkills);
  const [statusMessage, setStatusMessage] = useState('');
  const [candidateProfile, setCandidateProfile] = useState(() => {
    try { const p = localStorage.getItem('student_profile'); return p ? JSON.parse(p) : null; } catch { return null; }
  });
  const [personalizedMatches, setPersonalizedMatches] = useState([]);
  const [platformURLs, setPlatformURLs] = useState(null);
  const [showMatches, setShowMatches] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const fileInputRef = useRef(null);

  const PLATFORM_ICONS = {
    'Internshala': '🎓',
    'LinkedIn': '💼',
    'Unstop': '🏆',
    'Wellfound': '🚀',
    'Naukri': '🔍',
  };

  const PLATFORM_COLORS = {
    'Internshala': '#006BFF',
    'LinkedIn': '#0077B5',
    'Unstop': '#FF5722',
    'Wellfound': '#FF6B00',
    'Naukri': '#FF7555',
  };

  // Degree-aware skill presets for diverse backgrounds
  const PERSONA_PRESETS = [
    {
      id: 'btech_ai',
      label: '⚡ B.Tech AI / CS / Full Stack',
      degree: 'B.Tech in Artificial Intelligence',
      institution: "Lingaya's Vidyapeeth, Faridabad",
      location: 'Faridabad, India',
      name: 'Full Stack Developer',
      fileName: 'BTech_AI_Resume.pdf',
      skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Python', 'JavaScript', 'C++', 'Java', 'Machine Learning', 'Git', 'REST API', 'DSA', 'HTML5', 'CSS3']
    },
    {
      id: 'bca',
      label: '🖥️ BCA / MCA – Web & Software',
      degree: 'Bachelor of Computer Applications (BCA)',
      institution: 'IP University, Delhi',
      location: 'Noida, India',
      name: 'BCA Graduate',
      fileName: 'BCA_Resume.pdf',
      skills: ['JavaScript', 'React', 'Node.js', 'PHP', 'MySQL', 'HTML5', 'CSS3', 'Git', 'REST API', 'Java', 'SQL', 'Software Testing']
    },
    {
      id: 'bsc_math',
      label: '📐 B.Sc Mathematics / Statistics',
      degree: 'B.Sc Mathematics',
      institution: 'Delhi University',
      location: 'Delhi, India',
      name: 'Mathematics Student',
      fileName: 'BSc_Math_Resume.pdf',
      skills: ['Mathematics', 'Statistics', 'Python', 'R', 'SQL', 'Linear Algebra', 'Data Analysis', 'Excel', 'Calculus', 'Financial Modeling']
    },
    {
      id: 'bba_mba',
      label: '📊 BBA / MBA – Business & Finance',
      degree: 'BBA (Bachelor of Business Administration)',
      institution: 'Amity University',
      location: 'Delhi NCR, India',
      name: 'Business Graduate',
      fileName: 'BBA_Resume.pdf',
      skills: ['Business Development', 'Marketing', 'Finance', 'Excel', 'PowerPoint', 'CRM', 'Sales', 'Communication', 'MS Office', 'Business Analytics']
    },
    {
      id: 'design',
      label: '🎨 B.Des / BFA – Design & Creative',
      degree: 'B.Des (Bachelor of Design)',
      institution: 'NID / NIFT',
      location: 'Mumbai, India',
      name: 'Designer',
      fileName: 'BDes_Resume.pdf',
      skills: ['Figma', 'Adobe Photoshop', 'Illustrator', 'UI/UX Design', 'Wireframing', 'Canva', 'Typography', 'User Research', 'Prototyping']
    },
    {
      id: 'btech_ee',
      label: '⚡ B.Tech Electrical & Electronics (EE / EEE)',
      degree: 'B.Tech in Electrical Engineering',
      institution: 'Delhi Technological University (DTU) / NIT',
      location: 'Delhi NCR, India',
      name: 'Electrical Engineering Student',
      fileName: 'Electrical_Engineering_Resume.pdf',
      skills: ['Circuit Design', 'MATLAB', 'Simulink', 'Power Electronics', 'Power Systems', 'Embedded Systems', 'Microcontrollers', 'PCB Design', 'IoT', 'C', 'Sensors', 'Robotics']
    },
  ];

  const updateCandidateState = (profileData, skills, fileName, matches = [], urls = null) => {
    setExtractedSkillsList(skills);
    setCandidateProfile(profileData);
    setPersonalizedMatches(matches);
    setPlatformURLs(urls);
    if (matches.length > 0) setShowMatches(true);

    try {
      localStorage.setItem('userResumeSkills', JSON.stringify(skills));
      localStorage.setItem('student_profile', JSON.stringify(profileData));
      const curUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (profileData.name) {
        localStorage.setItem('user', JSON.stringify({ ...curUser, name: profileData.name, email: profileData.email || curUser.email }));
      }
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (e) {}

    if (onSkillsExtracted) onSkillsExtracted(skills, fileName, profileData);
  };

  const handleFile = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setStatusMessage(`🔍 Parsing "${file.name}" with AI resume engine...`);
    setShowMatches(false);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await uploadResume(formData);
      const data = res.data?.data || res.data;

      const skillsFound = (data?.extractedSkills || data?.skills || []);
      const profile = data?.profile || { name: 'Candidate', degree: 'Undergraduate', skills: skillsFound };
      const matches = data?.personalizedInternships || [];
      const urls = data?.platformSearchURLs || null;

      setStatusMessage(`✅ Found ${skillsFound.length} skills & ${matches.length} real internships from your location!`);
      updateCandidateState(profile, skillsFound, file.name, matches, urls);
    } catch (err) {
      console.warn('Resume upload error:', err.message);
      setStatusMessage('⚠️ Upload failed. Using skill-based matching instead.');
      setIsUploading(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyPersona = async (preset) => {
    setIsUploading(true);
    setStatusMessage(`🔍 Finding internships for ${preset.label}...`);
    setShowMatches(false);
    setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          skills: preset.skills.join(','),
          location: preset.location,
          degree: preset.degree,
          limit: '20'
        });
        const res = await fetch('/api/internships/personalized?' + params.toString());
        const json = await res.json();
        const matches = json.data?.results || [];
        const urls = json.data?.platformSearchURLs || null;
        setStatusMessage(`✅ ${matches.length} real internships found across all platforms for ${preset.label}!`);
        updateCandidateState(preset, preset.skills, preset.fileName, matches, urls);
      } catch {
        updateCandidateState(preset, preset.skills, preset.fileName, [], null);
        setStatusMessage(`✅ Profile set for ${preset.label}.`);
      }
      setIsUploading(false);
    }, 400);
  };

  const handlePasteSubmit = async (e) => {
    e.preventDefault();
    if (!pasteText.trim()) return;
    setIsUploading(true);
    setStatusMessage('🔍 Analyzing resume text with NLP engine...');
    try {
      const res = await fetch('/api/profile/parse-resume-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText })
      });
      const json = await res.json();
      const p = json.data?.profile || {};
      const skills = json.data?.skills || [];
      // Fetch personalized matches for extracted profile
      if (skills.length > 0 && p.location) {
        const params = new URLSearchParams({ skills: skills.join(','), location: p.location, degree: p.degree || '', limit: '20' });
        const mRes = await fetch('/api/internships/personalized?' + params.toString());
        const mJson = await mRes.json();
        const matches = mJson.data?.results || [];
        const urls = mJson.data?.platformSearchURLs || null;
        updateCandidateState(p, skills, 'Pasted_Resume_Text', matches, urls);
        setStatusMessage(`✅ Extracted ${skills.length} skills & found ${matches.length} real internships!`);
      } else {
        updateCandidateState(p, skills, 'Pasted_Resume_Text', [], null);
        setStatusMessage(`✅ Extracted ${skills.length} skills from resume text!`);
      }
      setPasteMode(false);
      setPasteText('');
    } catch {
      const s = ['React', 'Node.js', 'Python', 'JavaScript', 'SQL'];
      updateCandidateState({ name: 'Candidate', degree: 'Undergraduate', skills: s }, s, 'Pasted_Resume', [], null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: isPersonalized ? '2px solid #00B289' : '1.5px solid #E2E8F0',
        padding: '22px 26px',
        marginBottom: '20px',
        boxShadow: isPersonalized ? '0 6px 20px rgba(0, 178, 137, 0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Top Banner Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: isPersonalized ? '#E6F7F2' : '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isPersonalized ? '#00B289' : '#475569',
              fontSize: '1.3rem',
              flexShrink: 0,
            }}
          >
            {isPersonalized ? <FiCheckCircle /> : <FiUploadCloud />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1B2533', fontFamily: 'inherit' }}>
                {isPersonalized ? '🎯 Active Personalized Internship Feed' : '📄 Upload Resume & Auto-Personalize Feed'}
              </h3>
              {isPersonalized && (
                <span
                  style={{
                    backgroundColor: '#E6F7F2',
                    color: '#008C6B',
                    padding: '2px 10px',
                    borderRadius: '200px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid #A7F3D0'
                  }}
                >
                  NLP Matched
                </span>
              )}
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
              Upload any PDF resume (B.Tech, B.Sc Mathematics, BCA, B.Com, or any degree). AI extracts all competencies, updates your full profile, and re-ranks openings by compatibility!
            </p>
          </div>
        </div>

        {isPersonalized && (
          <button
            type="button"
            onClick={onResetFeed}
            className="btn btn-outline"
            style={{
              height: '34px',
              padding: '0 14px',
              fontSize: '0.8rem',
              borderRadius: '200px',
              borderColor: '#CBD5E1',
              color: '#475569',
            }}
          >
            Reset Feed
          </button>
        )}
      </div>

      {/* Extracted Profile Details Card (Active when Personalized) */}
      {isPersonalized && candidateProfile && (
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser style={{ color: '#00B289' }} />
              <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>
                {candidateProfile.name || 'ADITYA'}
              </strong>
              <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                ({candidateProfile.degree || 'B.Tech in Artificial Intelligence'})
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem', color: '#475569', flexWrap: 'wrap' }}>
              {candidateProfile.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiMapPin size={13} color="#00B289" /> {candidateProfile.location}
                </span>
              )}
              {candidateProfile.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiPhone size={13} color="#00B289" /> {candidateProfile.phone}
                </span>
              )}
              {candidateProfile.github && (
                <a
                  href={candidateProfile.github}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#008C6B', textDecoration: 'none', fontWeight: 600 }}
                >
                  <FiGithub size={13} /> GitHub Profile
                </a>
              )}
            </div>
          </div>

          {candidateProfile.institution && (
            <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiAward size={13} color="#00B289" />
              <span>Institution: <strong>{candidateProfile.institution}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Upload Drag & Drop Box */}
      {!pasteMode ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: dragActive ? '2px dashed #00B289' : '2px dashed #CBD5E1',
            borderRadius: '12px',
            backgroundColor: dragActive ? '#F0FDF9' : '#FAFAFA',
            padding: '18px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            marginBottom: '12px',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <FiUploadCloud style={{ fontSize: '1.4rem', color: '#00B289' }} />
            <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1B2533' }}>
              Click to select your Resume (e.g. Aditya_Resume.pdf) or drag &amp; drop here
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
            Supports PDF, DOCX, TXT • Instant PyMuPDF parsing with zero upload limits
          </span>
        </div>
      ) : (
        <form onSubmit={handlePasteSubmit} style={{ marginBottom: '12px' }}>
          <textarea
            rows={4}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your resume text here (include education, skills, projects, and contact info)..."
            style={{
              width: '100%',
              borderRadius: '10px',
              border: '1.5px solid #CBD5E1',
              padding: '10px 14px',
              fontSize: '0.88rem',
              fontFamily: 'inherit',
              marginBottom: '8px',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setPasteMode(false)}
              className="btn btn-outline btn-sm"
              style={{ borderRadius: '200px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !pasteText.trim()}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: '200px', backgroundColor: '#00B289' }}
            >
              Analyze Resume Text
            </button>
          </div>
        </form>
      )}

      {/* Degree & Skill Persona Presets for Immediate 1-Click Testing */}
      <div className="mobile-swipe-tabs" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', overflowX: 'auto', marginBottom: '12px', paddingBottom: '4px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', flexShrink: 0 }}>
          ⚡ 1-Click Profile Presets:
        </span>
        {PERSONA_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleApplyPersona(p)}
            disabled={isUploading}
            style={{
              padding: '6px 14px',
              borderRadius: '200px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              color: '#334155',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00B289'; e.currentTarget.style.color = '#008C6B'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#334155'; }}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPasteMode(!pasteMode)}
          style={{
            background: 'none',
            border: 'none',
            color: '#008C6B',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
            marginLeft: 'auto',
          }}
        >
          {pasteMode ? 'Back to File Upload' : 'Paste Raw Text Instead'}
        </button>
      </div>

      {/* Status or Progress */}
      {statusMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#008C6B', marginBottom: '10px' }}>
          {isUploading ? <FiLoader className="halo-spin" size={14} /> : <FiCheck size={14} />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Extracted Skills List */}
      {extractedSkillsList && extractedSkillsList.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              🎯 Extracted Resume Competencies ({extractedSkillsList.length}):
            </span>
            {extractedSkillsList.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllSkills(!showAllSkills)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#008C6B',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '2px 6px'
                }}
              >
                {showAllSkills ? '▲ Show Less' : `▼ Show All (${extractedSkillsList.length})`}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(showAllSkills ? extractedSkillsList : extractedSkillsList.slice(0, 8)).map((skill, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#E6F7F2',
                  color: '#008C6B',
                  border: '1px solid #A7F3D0',
                  borderRadius: '200px',
                  padding: '3px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                }}
              >
                <FiCheck size={10} /> {skill}
              </span>
            ))}
            {!showAllSkills && extractedSkillsList.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllSkills(true)}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  borderRadius: '200px',
                  padding: '3px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                +{extractedSkillsList.length - 8} more skills...
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── REAL-TIME MATCHED INTERNSHIPS PANEL ─────────────────────── */}
      {showMatches && personalizedMatches.length > 0 && (
        <div style={{ marginTop: '18px', borderTop: '1.5px solid #E2E8F0', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem' }}>🎯</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1B2533' }}>
                {personalizedMatches.length} Real Internships Matched to Your Resume
              </span>
            </div>
            <button onClick={() => setShowMatches(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '0.78rem' }}>
              Hide ▲
            </button>
          </div>

          {/* Platform Search Links */}
          {platformURLs && (
            <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', color: '#64748B', alignSelf: 'center', marginRight: '4px' }}>Search live on:</span>
              {Object.entries(platformURLs).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '4px 10px', borderRadius: '20px',
                    backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1',
                    fontSize: '0.73rem', fontWeight: 600, color: '#334155',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <FiExternalLink size={10} />
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              ))}
            </div>
          )}

          {/* Internship cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
            {personalizedMatches.slice(0, 10).map((internship, idx) => (
              <div key={idx} style={{
                background: '#FAFBFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                transition: 'box-shadow 0.15s ease',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    {/* Match score badge */}
                    <span style={{
                      background: internship.matchScore >= 80 ? '#D1FAE5' : internship.matchScore >= 60 ? '#FEF3C7' : '#F1F5F9',
                      color: internship.matchScore >= 80 ? '#065F46' : internship.matchScore >= 60 ? '#92400E' : '#475569',
                      border: `1px solid ${internship.matchScore >= 80 ? '#6EE7B7' : internship.matchScore >= 60 ? '#FCD34D' : '#CBD5E1'}`,
                      borderRadius: '20px', padding: '2px 8px',
                      fontSize: '0.68rem', fontWeight: 700,
                    }}>
                      <FiStar size={9} style={{ marginRight: '3px' }} />{internship.matchScore}% Match
                    </span>
                    {/* Platform badge */}
                    <span style={{
                      background: '#F1F5F9', color: '#475569',
                      border: '1px solid #CBD5E1',
                      borderRadius: '20px', padding: '2px 8px',
                      fontSize: '0.68rem', fontWeight: 600,
                    }}>
                      {PLATFORM_ICONS[internship.source] || '📋'} {internship.source}
                    </span>
                    {/* Expiry badge */}
                    {internship.daysLeft !== null && (
                      <span style={{
                        background: internship.daysLeft <= 7 ? '#FEE2E2' : '#F1F5F9',
                        color: internship.daysLeft <= 7 ? '#B91C1C' : '#64748B',
                        border: `1px solid ${internship.daysLeft <= 7 ? '#FCA5A5' : '#E2E8F0'}`,
                        borderRadius: '20px', padding: '2px 8px',
                        fontSize: '0.68rem', fontWeight: 600,
                      }}>
                        <FiClock size={9} style={{ marginRight: '3px' }} />
                        {internship.daysLeft <= 0 ? 'Closing soon' : `${internship.daysLeft}d left`}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1B2533', marginBottom: '2px' }}>
                    {internship.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '4px' }}>
                    <strong>{internship.organization}</strong> · {internship.location} · {internship.stipend}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(internship.skills || []).slice(0, 5).map((s, si) => (
                      <span key={si} style={{
                        background: '#EFF6FF', color: '#1D4ED8',
                        border: '1px solid #BFDBFE',
                        borderRadius: '10px', padding: '1px 7px',
                        fontSize: '0.67rem', fontWeight: 600,
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
                <a href={internship.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: '#00B289', color: '#fff',
                    border: 'none', borderRadius: '8px',
                    padding: '7px 12px',
                    fontSize: '0.73rem', fontWeight: 700,
                    textDecoration: 'none', cursor: 'pointer',
                  }}>
                  Apply <FiArrowRight size={11} />
                </a>
              </div>
            ))}
            {personalizedMatches.length > 10 && (
              <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748B', padding: '8px' }}>
                +{personalizedMatches.length - 10} more internships shown in your main feed ↑
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeFeedPersonalizer;
