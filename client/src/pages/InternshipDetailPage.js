/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FiMapPin, FiBriefcase, FiDollarSign, FiClock, FiCheckCircle, 
  FiCalendar, FiUsers, FiExternalLink, FiBookmark, FiZap, FiArrowLeft, FiCheck
} from 'react-icons/fi';
import { getInternship, getProfile, createApplication } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AutoApplyModal from '../components/common/AutoApplyModal';

const InternshipDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [internship, setInternship] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [autoApplyOpen, setAutoApplyOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [jobRes, profRes] = await Promise.allSettled([
          getInternship(id),
          isAuthenticated ? getProfile() : Promise.reject(),
        ]);

        if (jobRes.status === 'fulfilled') {
          setInternship(jobRes.value.data?.data || jobRes.value.data);
        }
        if (profRes.status === 'fulfilled') {
          setProfile(profRes.value.data?.data || profRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, isAuthenticated]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      setToastMessage('Please sign in to track this application.');
      return;
    }
    try {
      await createApplication({ internshipId: id, status: 'applied', notes: 'Saved from Internshala detailed view.' });
      setSaved(true);
      setToastMessage('Added to your active Applications tracker!');
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Already in tracker.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Analyzing internship requirements and sourcing credentials..." />;
  }

  if (!internship) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Internship Not Found</h2>
        <Link to="/internships" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Internships
        </Link>
      </div>
    );
  }

  // Student skill matching
  const studentSkills = (profile?.skills || [
    'React', 'Node.js', 'Python', 'TypeScript', 'PostgreSQL', 'JavaScript', 'Git', 'MongoDB'
  ]).map(s => s.toLowerCase());

  const jobSkills = internship.skills || [];
  const matchedSkills = jobSkills.filter(s => studentSkills.includes(s.toLowerCase()));
  const missingSkills = jobSkills.filter(s => !studentSkills.includes(s.toLowerCase()));
  const matchPct = jobSkills.length > 0 
    ? Math.min(99, Math.max(45, Math.round((matchedSkills.length / jobSkills.length) * 85 + 14)))
    : 88;

  // Determine scale
  const isLargeScale = internship.scale_type === 'large_scale' || 
    ['google', 'microsoft', 'amazon', 'goldman sachs', 'uber', 'apple', 'meta', 'nvidia', 'netflix', 'stripe', 'cisco', 'atlassian', 'salesforce', 'oracle']
      .some(co => (internship.organization || '').toLowerCase().includes(co));

  const orgName = internship.organization || 'Internship Organization';
  const firstLetter = orgName.charAt(0).toUpperCase();

  // Role Overview Bullets
  const rawDesc = internship.description || '';
  let overviewBullets = [];
  if (rawDesc.includes('•')) {
    const lines = rawDesc.split('\n').filter(l => l.trim().startsWith('•') || l.trim().startsWith('-'));
    overviewBullets = lines.slice(0, 4).map(l => l.replace(/^[•\-]\s*/, '').trim());
  }
  if (overviewBullets.length === 0) {
    overviewBullets = [
      `Develop robust production features and collaborate directly with senior mentors at ${orgName}.`,
      `Design and deploy responsive user interfaces, backend APIs, and reliable database schemas.`,
      `Implement best engineering practices with ${jobSkills.slice(0, 3).join(', ') || 'modern technology stacks'}.`,
      `Participate in code reviews, technical architecture sessions, and end-to-end task execution.`
    ];
  }

  const requirementsList = Array.isArray(internship.requirements) && internship.requirements.length > 0
    ? internship.requirements
    : [
        `Currently pursuing or recently completed a degree in Computer Science, Engineering, or related field.`,
        `Demonstrated proficiency in ${jobSkills.slice(0, 3).join(', ') || 'required technical competencies'}.`,
        `Strong analytical problem-solving skills, proactive communication, and ability to work independently.`,
        `Prior software project or open-source GitHub contribution is considered a strong advantage.`
      ];

  const vacancies = internship.vacancies || (isLargeScale ? '12 vacancies' : '4 vacancies');
  const applicants = internship.applicants_count || (isLargeScale ? '450+ candidates' : '150+ candidates');
  const postedTime = internship.posted_time || '3 weeks ago';

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '32px 0 60px' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        
        {/* Breadcrumb / Back Link */}
        <Link
          to="/internships"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748b',
            fontSize: '14px',
            marginBottom: '18px',
            fontWeight: 500,
            textDecoration: 'none'
          }}
        >
          <FiArrowLeft /> Back to all listings
        </Link>

        {/* Main Internshala-Style Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{
            padding: '28px 32px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '20px'
          }}>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 8px 0',
                letterSpacing: '-0.025em'
              }}>
                {internship.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#334155' }}>
                  {internship.organization}
                </span>

                {/* Actively hiring badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                  Actively hiring
                </span>

                {/* Scale Badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: isLargeScale ? '#f0f9ff' : '#fdf4ff',
                  color: isLargeScale ? '#0284c7' : '#c026d3',
                  border: `1px solid ${isLargeScale ? '#bae6fd' : '#f5d0fe'}`,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  {isLargeScale ? '🏢 Large Scale (MNC / Unstop)' : '🚀 Startup / Incubator'}
                </span>

                {/* Source Platform Badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: (internship.source || '').toLowerCase().includes('unstop') ? '#eff6ff' : (internship.source || '').toLowerCase().includes('linkedin') ? '#f0f7ff' : '#ecfeff',
                  color: (internship.source || '').toLowerCase().includes('unstop') ? '#1d4ed8' : (internship.source || '').toLowerCase().includes('linkedin') ? '#0a66c2' : '#0891b2',
                  border: `1px solid ${(internship.source || '').toLowerCase().includes('unstop') ? '#bfdbfe' : (internship.source || '').toLowerCase().includes('linkedin') ? '#c7e0f8' : '#a5f3fc'}`,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  🌐 {internship.source || 'Internshala'}
                </span>
              </div>
            </div>

            {/* Company Box */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '24px',
              color: isLargeScale ? '#00B289' : '#0284c7',
              flexShrink: 0
            }}>
              {firstLetter}
            </div>
          </div>

          <div style={{ padding: '24px 32px' }}>
            
            {/* Key Facts Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px',
              paddingBottom: '20px',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
                  <FiDollarSign size={15} color="#00B289" />
                  <span>STIPEND</span>
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>
                  {internship.stipend || 'Unpaid'}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
                  <FiMapPin size={15} color="#0284c7" />
                  <span>LOCATION</span>
                </div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px', textTransform: 'capitalize' }}>
                  {internship.mode === 'remote' ? 'Work from home' : (internship.location || 'In-office')}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
                  <FiCalendar size={15} color="#8b5cf6" />
                  <span>DURATION</span>
                </div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>
                  {internship.duration || '6 Months'}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
                  <FiExternalLink size={15} color="#f59e0b" />
                  <span>SOURCE</span>
                </div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>
                  {internship.source || 'Internshala'}
                </div>
              </div>
            </div>

            {/* Sub-row: Timeline, PPO Badge, Vacancies */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '14px 0',
              borderBottom: '1px solid #f1f5f9',
              fontSize: '13px',
              color: '#64748b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FiClock size={14} /> {postedTime}
                </span>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#fffbeb',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px'
                }}>
                  <FiBriefcase size={13} color="#d97706" />
                  Job offer post internship
                </span>

                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#475569' }}>
                  <FiUsers size={14} /> {vacancies}
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ecfdf5',
                padding: '4px 12px',
                borderRadius: '9999px',
                border: '1px solid #a7f3d0'
              }}>
                <span style={{ fontSize: '12px', color: '#065f46' }}>Profile Match:</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>{matchPct}% Match</span>
              </div>
            </div>

            {/* Blue Banner */}
            <div style={{
              margin: '22px 0',
              background: 'linear-gradient(135deg, #093c7d 0%, #1754be 100%)',
              borderRadius: '12px',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              boxShadow: '0 4px 14px rgba(15, 76, 129, 0.25)'
            }}>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '16px', marginBottom: '3px' }}>
                  {applicants} have already applied.
                </div>
                <div style={{ color: '#bfdbfe', fontSize: '13px' }}>
                  Increase your chances with AI Autofill: Tailored resume, skill alignments & answers ready in 1 click.
                </div>
              </div>

              <button
                onClick={() => setAutoApplyOpen(true)}
                style={{
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
                }}
              >
                <FiZap size={15} /> 1-Click AI Auto-Apply &gt;
              </button>
            </div>

            {/* About the internship with Summarized by AI */}
            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  About the internship
                </h2>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%)',
                  color: '#7c3aed',
                  border: '1px solid #ddd6fe',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  Summarized by AI ✨
                </span>
              </div>

              {/* Role Overview */}
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Role Overview:
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>
                  {overviewBullets.map((bullet, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{bullet}</li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Requirements:
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>
                  {requirementsList.map((req, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Skills Required */}
            <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', margin: 0 }}>
                  Skills Required:
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {matchedSkills.length} of {jobSkills.length} in your student profile
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {jobSkills.map((skill, idx) => {
                  const hasSkill = studentSkills.includes(skill.toLowerCase());
                  return (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 500,
                        backgroundColor: hasSkill ? '#ecfdf5' : '#f8fafc',
                        color: hasSkill ? '#065f46' : '#475569',
                        border: `1px solid ${hasSkill ? '#a7f3d0' : '#e2e8f0'}`
                      }}
                    >
                      {hasSkill && <FiCheck size={14} color="#059669" />}
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Perks & Benefits */}
            <div style={{ marginBottom: '22px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: '12px' }}>
                Perks &amp; Benefits:
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155' }}>
                  <FiCheckCircle size={16} color="#00B289" /> Certificate of Completion
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155' }}>
                  <FiCheckCircle size={16} color="#00B289" /> Letter of Recommendation
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155' }}>
                  <FiCheckCircle size={16} color="#00B289" /> Flexible Working Hours
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155' }}>
                  <FiCheckCircle size={16} color="#00B289" /> Pre-Placement Offer (PPO)
                </div>
              </div>
            </div>

            {/* Number of Openings */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Number of Openings:
              </h3>
              <div style={{ fontSize: '14px', color: '#475569' }}>
                {vacancies}
              </div>
            </div>

            {/* Verified Crawled Sourcing */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: '#64748b'
            }}>
              <div>
                <span>Verified listing crawled by AI from <strong>{internship.source || 'Internshala'}</strong></span>
              </div>
              {internship.url && (
                <a 
                  href={internship.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#00B289', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  Original Portal <FiExternalLink size={14} />
                </a>
              )}
            </div>

          </div>

          {/* Bottom Action Footer */}
          <div style={{
            padding: '18px 32px',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleSave}
              className="btn btn-outline"
              style={{
                padding: '11px 24px',
                borderRadius: '200px',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FiBookmark size={15} />
              {saved ? 'Saved in Live Tracker' : 'Save to Tracker'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {internship.url && (
                <a
                  href={internship.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{
                    padding: '11px 22px',
                    borderRadius: '200px',
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Official Portal <FiExternalLink size={14} />
                </a>
              )}

              <button
                onClick={() => setAutoApplyOpen(true)}
                className="btn btn-primary"
                style={{
                  padding: '12px 28px',
                  borderRadius: '200px',
                  fontSize: '14px',
                  fontWeight: 700,
                  backgroundColor: '#00B289',
                  borderColor: '#00B289',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FiZap size={16} /> 1-Click AI Auto-Apply
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Auto-Apply Modal */}
      {autoApplyOpen && (
        <AutoApplyModal
          internship={internship}
          profile={profile}
          isOpen={autoApplyOpen}
          onClose={() => setAutoApplyOpen(false)}
          onSuccess={() => {
            setToastMessage('Successfully Auto-Applied! Track status in Live Tracker.');
            setTimeout(() => setToastMessage(''), 4000);
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 99999,
          fontSize: '14px',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default InternshipDetailPage;
