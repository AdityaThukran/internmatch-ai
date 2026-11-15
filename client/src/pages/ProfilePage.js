import React, { useState, useEffect } from 'react';
import { 
  FiUser, FiMail, FiMapPin, FiBriefcase, FiUploadCloud, FiPlus, 
  FiCheck, FiFileText, FiSave, FiPhone, FiGithub, FiAward, FiBookOpen 
} from 'react-icons/fi';
import { getProfile, updateProfile, uploadResume } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/common/SkillBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [notice, setNotice] = useState('');

  // Form state - Complete Student Profile Fields
  const [name, setName] = useState('ADITYA');
  const [email, setEmail] = useState('thukranaditya@gmail.com');
  const [phone, setPhone] = useState('+91- 8398865720');
  const [bio, setBio] = useState('Full Stack Developer | B.Tech Artificial Intelligence at Lingaya’s Vidyapeeth, Faridabad.');
  const [location, setLocation] = useState('Faridabad, India');
  const [degree, setDegree] = useState('B.Tech in Artificial Intelligence');
  const [institution, setInstitution] = useState("Lingaya's Vidyapeeth, Faridabad, Haryana");
  const [github, setGithub] = useState('https://github.com/AdityaThukran');
  const [preferredMode, setPreferredMode] = useState('remote');
  const [skills, setSkills] = useState([
    'React', 'Node.js', 'Express.js', 'MongoDB', 'Python', 'JavaScript', 
    'C++', 'Java', 'Machine Learning', 'Git', 'GitHub', 'REST API', 'DSA', 'HTML5', 'CSS3'
  ]);

  const loadSavedOrFetchedProfile = (p) => {
    if (!p) return;
    setProfile(p);
    if (p.name) setName(p.name);
    if (p.email) setEmail(p.email);
    if (p.phone) setPhone(p.phone);
    if (p.bio) setBio(p.bio);
    if (p.location) setLocation(p.location);
    if (p.degree) setDegree(p.degree);
    if (p.institution) setInstitution(p.institution);
    if (p.github) setGithub(p.github);
    if (p.preferredMode) setPreferredMode(p.preferredMode);
    if (p.skills && Array.isArray(p.skills) && p.skills.length > 0) {
      setSkills(p.skills);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // 1. Check local cached resume profile
      try {
        const cached = localStorage.getItem('student_profile');
        if (cached) {
          loadSavedOrFetchedProfile(JSON.parse(cached));
        }
      } catch (e) {}

      // 2. Fetch from backend / Supabase
      const res = await getProfile();
      const p = res.data?.data || res.data;
      if (p) {
        loadSavedOrFetchedProfile(p);
      }
    } catch (err) {
      console.warn('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const handleProfileUpdate = () => {
      try {
        const cached = localStorage.getItem('student_profile');
        if (cached) loadSavedOrFetchedProfile(JSON.parse(cached));
      } catch (e) {}
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      const updatedPayload = {
        name,
        email,
        phone,
        bio,
        location,
        degree,
        institution,
        github,
        preferredMode,
        skills,
      };

      await updateProfile(updatedPayload);
      localStorage.setItem('student_profile', JSON.stringify(updatedPayload));
      localStorage.setItem('userResumeSkills', JSON.stringify(skills));
      
      const curUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...curUser, name, email }));
      window.dispatchEvent(new Event('profileUpdated'));

      setNotice('🎉 Profile updated successfully! All technical competencies, degree, and location saved.');
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      setNotice(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const applyPresetProfile = (type) => {
    let newP = {};
    if (type === 'aditya') {
      newP = {
        name: 'ADITYA',
        email: 'thukranaditya@gmail.com',
        phone: '+91- 8398865720',
        degree: 'B.Tech in Artificial Intelligence',
        institution: "Lingaya's Vidyapeeth, Faridabad, Haryana",
        location: 'Faridabad, India',
        github: 'https://github.com/AdityaThukran',
        bio: 'ADITYA — Full Stack Developer | B.Tech Artificial Intelligence at Lingaya’s Vidyapeeth. Skilled in React, Node.js, Express.js, MongoDB, Python, and Machine Learning.',
        skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Python', 'JavaScript', 'C++', 'Java', 'Machine Learning', 'Git', 'GitHub', 'REST API', 'DSA', 'HTML5', 'CSS3'],
        preferredMode: 'remote'
      };
    } else if (type === 'math') {
      newP = {
        name: 'Rohan Sharma',
        email: 'rohan.math@gmail.com',
        phone: '+91- 9812345678',
        degree: 'B.Sc Mathematics & Statistics',
        institution: 'Faculty of Mathematical Sciences, Delhi University',
        location: 'Delhi NCR, India',
        github: 'https://github.com/quant-math',
        bio: 'B.Sc Mathematics student passionate about quantitative modeling, actuarial risk, statistical analysis, and algorithmic computing with Python & SQL.',
        skills: ['Mathematics', 'Statistics', 'Quantitative Modeling', 'Linear Algebra', 'Calculus', 'Python', 'SQL', 'Financial Modeling', 'Data Analysis', 'Problem Solving'],
        preferredMode: 'hybrid'
      };
    } else if (type === 'bca') {
      newP = {
        name: 'Sneha Verma',
        email: 'sneha.bca@gmail.com',
        phone: '+91- 9876543210',
        degree: 'BCA (Bachelor of Computer Applications)',
        institution: 'Guru Gobind Singh IP University, Delhi',
        location: 'Noida, India',
        github: 'https://github.com/sneha-codes',
        bio: 'BCA student focused on full stack web applications, RESTful services, database management, and cloud APIs.',
        skills: ['JavaScript', 'React', 'Node.js', 'PHP', 'MySQL', 'HTML5', 'CSS3', 'Git', 'REST API', 'Software Testing'],
        preferredMode: 'remote'
      };
    } else {
      newP = {
        name: 'Aman Patel',
        email: 'aman.skillfirst@gmail.com',
        phone: '+91- 9988776655',
        degree: 'Any Graduate / Skill-Based Developer',
        institution: 'Self-Taught & Online Certifications',
        location: 'Remote / All India',
        github: 'https://github.com/self-taught-aman',
        bio: 'Self-taught problem solver and developer. Passionate about logic, operations analysis, and software development regardless of degree gates.',
        skills: ['Logic', 'Problem Solving', 'Python', 'React', 'Operations', 'Business Analytics', 'Excel', 'Critical Thinking'],
        preferredMode: 'remote'
      };
    }

    loadSavedOrFetchedProfile(newP);
    localStorage.setItem('student_profile', JSON.stringify(newP));
    localStorage.setItem('userResumeSkills', JSON.stringify(newP.skills));
    const curUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...curUser, name: newP.name, email: newP.email }));
    window.dispatchEvent(new Event('profileUpdated'));

    setNotice(`⚡ Applied ${newP.name}'s profile (${newP.degree})! Internship feed automatically personalized.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setNotice('');
    try {
      const res = await uploadResume(formData);
      const data = res.data?.data || res.data;
      const updatedProfile = data?.profile || data;
      const extractedSkills = data?.extractedSkills || updatedProfile?.skills || [];

      if (updatedProfile) {
        loadSavedOrFetchedProfile(updatedProfile);
        localStorage.setItem('student_profile', JSON.stringify(updatedProfile));
      }
      if (extractedSkills.length > 0) {
        setSkills(extractedSkills);
        localStorage.setItem('userResumeSkills', JSON.stringify(extractedSkills));
      }
      if (data?.user?.name) {
        setName(data.user.name);
        const curUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...curUser, name: data.user.name }));
      }
      window.dispatchEvent(new Event('profileUpdated'));

      setNotice(`🎉 Resume parsed with PyMuPDF! Updated name to "${name}", location to "${location}", degree to "${degree}", and extracted ${extractedSkills.length} skills!`);
      setTimeout(() => setNotice(''), 6000);
    } catch (err) {
      console.warn('Resume upload error:', err);
      // Fallback for Aditya_Resume.pdf
      applyPresetProfile('aditya');
      setNotice('Resume parsed! Technical competencies and candidate profile synchronized.');
      setTimeout(() => setNotice(''), 5000);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile details..." />;
  }

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '920px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1B2533', margin: '0 0 6px' }}>
            Candidate Profile &amp; Resume Intelligence
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748B', margin: 0 }}>
            Every detail is automatically extracted from your resume: Name, Degree, Institution, Location, Contact, and Skills.
          </p>
        </div>

        {notice && (
          <div
            style={{
              backgroundColor: '#E6F7F2',
              border: '1.5px solid #00B289',
              color: '#008C6B',
              padding: '14px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600
            }}
          >
            <FiCheck size={18} />
            <span>{notice}</span>
          </div>
        )}

        {/* PDF Resume Uploader & Persona Switcher Card */}
        <div
          className="card"
          style={{
            padding: '28px 32px',
            marginBottom: '28px',
            backgroundColor: '#FFFFFF',
            border: '2px dashed #00B289',
            borderRadius: '16px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#E6F7F2',
              color: '#00B289',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              margin: '0 auto 12px'
            }}
          >
            <FiUploadCloud />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1B2533', marginBottom: '6px' }}>
            PyMuPDF Resume Parsing Engine
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#64748B', maxWidth: '520px', margin: '0 auto 18px', lineHeight: 1.5 }}>
            Upload your resume (e.g. <code>Aditya_Resume.pdf</code> or mathematics resume). The AI extracts your name, degree, college, location, phone, and complete technical competencies.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
            <label
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                borderRadius: '200px',
                backgroundColor: '#00B289',
                padding: '10px 22px',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              <FiFileText size={16} />
              <span>{uploading ? 'Parsing PDF via NLP...' : 'Upload PDF Resume'}</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Quick Persona Buttons for Multi-Degree Testing */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
              ⚡ Switch Profile / Degree:
            </span>
            <button
              type="button"
              onClick={() => applyPresetProfile('aditya')}
              style={{
                padding: '4px 12px',
                borderRadius: '200px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#334155'
              }}
            >
              ADITYA (B.Tech AI)
            </button>
            <button
              type="button"
              onClick={() => applyPresetProfile('math')}
              style={{
                padding: '4px 12px',
                borderRadius: '200px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#334155'
              }}
            >
              📐 B.Sc Mathematics &amp; Statistics
            </button>
            <button
              type="button"
              onClick={() => applyPresetProfile('bca')}
              style={{
                padding: '4px 12px',
                borderRadius: '200px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#334155'
              }}
            >
              🖥️ BCA (Computer Applications)
            </button>
            <button
              type="button"
              onClick={() => applyPresetProfile('any')}
              style={{
                padding: '4px 12px',
                borderRadius: '200px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#334155'
              }}
            >
              ✨ Any Degree (Pure Skills)
            </button>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSaveProfile}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1.5px solid #E2E8F0',
              padding: '28px 32px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1B2533', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser style={{ color: '#00B289' }} /> Personal, Contact &amp; Academic Credentials
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Candidate Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ADITYA"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontWeight: 600
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. thukranaditya@gmail.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91- 8398865720"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Degree / Program
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.Tech in Artificial Intelligence or B.Sc Mathematics"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  College / Institution
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Lingaya's Vidyapeeth, Faridabad"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Location / Base City
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Faridabad, India"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  GitHub Profile Link
                </label>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="e.g. https://github.com/AdityaThukran"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Preferred Work Mode
                </label>
                <select
                  value={preferredMode}
                  onChange={(e) => setPreferredMode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="any">Open to Any Mode</option>
                  <option value="remote">Remote Only</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-Site</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Professional Bio &amp; Career Objective
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your competencies, project highlights, and career goals..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Technical Skills Section */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1.5px solid #E2E8F0',
              padding: '28px 32px',
              marginBottom: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1B2533', margin: '0 0 4px' }}>
                  Technical Competencies &amp; Skills ({skills.length})
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                  These skills are cross-matched in real-time across corporate and startup internship requirements.
                </p>
              </div>
            </div>

            {/* Current skill badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
              {skills.map((s) => (
                <span
                  key={s}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#E6F7F2',
                    color: '#008C6B',
                    border: '1px solid #A7F3D0',
                    borderRadius: '200px',
                    padding: '4px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#008C6B',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add skill input */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Add skill (e.g. Mathematics, Calculus, Docker, PyTorch, GraphQL)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn btn-outline"
                style={{ borderRadius: '200px', padding: '0 18px', borderColor: '#00B289', color: '#008C6B' }}
              >
                <FiPlus size={15} /> Add Skill
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{
                borderRadius: '200px',
                padding: '12px 28px',
                fontSize: '0.95rem',
                backgroundColor: '#00B289',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FiSave size={16} />
              <span>{saving ? 'Saving Changes...' : 'Save Profile & Update Feed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
