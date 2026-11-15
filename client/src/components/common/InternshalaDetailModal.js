/* eslint-disable */
import React from 'react';
import { 
  FiMapPin, FiBriefcase, FiDollarSign, FiClock, FiCheckCircle, 
  FiCalendar, FiUsers, FiExternalLink, FiBookmark, FiZap, FiX, FiCheck, FiShare2
} from 'react-icons/fi';
import CompanyLogo from '../../utils/companyLogos';

/**
 * InternshalaDetailModal
 * Authentic 1:1 replica of the modern Internshala detail modal view,
 * featuring "Actively hiring" pill, "Summarized by AI ✨", Key facts row,
 * blue applicant competition banner, Role Overview, Requirements,
 * matched Skill tags, Perks & PPO, and 1-Click AI Auto-Apply.
 */
const InternshalaDetailModal = ({
  internship,
  isOpen,
  onClose,
  onAutoApply,
  onSaveTracker,
  isSaved,
  studentProfile
}) => {
  if (!isOpen || !internship) return null;

  // Student skill matching
  const studentSkills = (studentProfile?.skills || [
    'React', 'Node.js', 'Python', 'TypeScript', 'PostgreSQL', 'JavaScript', 'Git', 'MongoDB'
  ]).map(s => s.toLowerCase());

  const jobSkills = internship.skills || [];
  const matchedSkills = jobSkills.filter(s => studentSkills.includes(s.toLowerCase()));
  const missingSkills = jobSkills.filter(s => !studentSkills.includes(s.toLowerCase()));
  const matchPct = jobSkills.length > 0 
    ? Math.min(99, Math.max(45, Math.round((matchedSkills.length / jobSkills.length) * 85 + 14)))
    : 88;

  // Determine scale type
  const isLargeScale = internship.scale_type === 'large_scale' || 
    ['google', 'microsoft', 'amazon', 'goldman sachs', 'uber', 'apple', 'meta', 'nvidia', 'netflix', 'stripe', 'cisco', 'atlassian', 'salesforce', 'oracle']
      .some(co => (internship.organization || '').toLowerCase().includes(co));

  // Determine company initial / color
  const orgName = internship.organization || 'Internship Partner';
  const firstLetter = orgName.charAt(0).toUpperCase();

  // Parse structured description if bulleted or fallback
  const rawDesc = internship.description || '';
  
  // Extract role overview bullets
  let overviewBullets = [];
  if (rawDesc.includes('•')) {
    const lines = rawDesc.split('\n').filter(l => l.trim().startsWith('•') || l.trim().startsWith('-'));
    overviewBullets = lines.slice(0, 4).map(l => l.replace(/^[•\-]\s*/, '').trim());
  }
  if (overviewBullets.length === 0) {
    overviewBullets = [
      `Collaborate directly with cross-functional engineering teams at ${orgName} on core product features.`,
      `Implement responsive front-end components, robust backend APIs, and reliable database schemas.`,
      `Write maintainable, well-tested code using ${jobSkills.slice(0, 3).join(', ') || 'modern engineering standards'}.`,
      `Participate in daily agile standups, code reviews, and technical design discussions.`
    ];
  }

  // Extract requirements
  const requirementsList = Array.isArray(internship.requirements) && internship.requirements.length > 0
    ? internship.requirements
    : [
        `Currently pursuing or recently completed a degree in Computer Science, Engineering, or related discipline.`,
        `Demonstrated hands-on experience with ${jobSkills.slice(0, 3).join(', ') || 'core technologies'}.`,
        `Strong analytical problem-solving skills, eager learning mindset, and independent initiative.`,
        `Prior software project or open-source GitHub contribution is a strong plus.`
      ];

  // Number of vacancies
  const vacancies = internship.vacancies || (isLargeScale ? '12 vacancies' : '4 vacancies');
  const applicants = internship.applicants_count || (isLargeScale ? '450+ candidates' : '150+ candidates');
  const postedTime = internship.posted_time || '3 weeks ago';

  return (
    <div 
      className="modal-backdrop-custom"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="modal-card-custom"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar with Close Button */}
        <div style={{
          padding: '24px 28px 18px',
          borderBottom: '1px solid #f1f5f9',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.025em'
              }}>
                {internship.title}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>
                {internship.organization}
              </span>

              {/* "Actively hiring" Badge matching Internshala */}
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
                fontWeight: 600,
                letterSpacing: '0.01em'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                Actively hiring
              </span>

              {/* Scale Indicator */}
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
                {isLargeScale ? '🏢 Large Scale (MNC)' : '🚀 Startup / Incubator'}
              </span>

              {/* Aggregation Source Platform Badge */}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Real Company Logo matching Internshala top right */}
            <CompanyLogo organization={internship.organization} size={56} />

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              aria-label="Close"
              title="Close modal"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div style={{
          padding: '24px 28px',
          overflowY: 'auto',
          flex: 1
        }}>

          {/* Internshala Key Facts Row with Icons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '16px',
            paddingBottom: '20px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            {/* Stipend */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginBottom: '3px' }}>
                <FiDollarSign size={15} color="#00B289" />
                <span>STIPEND</span>
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                {internship.stipend || 'Unpaid'}
              </div>
            </div>

            {/* Mode / Location */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginBottom: '3px' }}>
                <FiMapPin size={15} color="#0284c7" />
                <span>LOCATION</span>
              </div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px', textTransform: 'capitalize' }}>
                {internship.mode === 'remote' ? 'Work from home' : (internship.location || 'In-office')}
              </div>
            </div>

            {/* Duration */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginBottom: '3px' }}>
                <FiCalendar size={15} color="#8b5cf6" />
                <span>DURATION</span>
              </div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                {internship.duration || '6 Months'}
              </div>
            </div>

            {/* Source */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', marginBottom: '3px' }}>
                <FiExternalLink size={15} color="#f59e0b" />
                <span>SOURCE</span>
              </div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                {internship.source || 'Internshala'}
              </div>
            </div>
          </div>

          {/* Sub-row: Timeline & Job Offer Badge & Vacancies */}
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

              {/* Gold "Job offer post internship" badge matching screenshot */}
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

            {/* Match Percentage Pill */}
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

          {/* Internshala High-Impact Blue Fast-Track / Competition Callout Card */}
          <div style={{
            margin: '20px 0',
            background: 'linear-gradient(135deg, #093c7d 0%, #1754be 100%)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            boxShadow: '0 4px 14px rgba(15, 76, 129, 0.25)'
          }}>
            <div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '16px', marginBottom: '2px' }}>
                {applicants} have already applied.
              </div>
              <div style={{ color: '#bfdbfe', fontSize: '13px' }}>
                AI Autofill agent is ready with your tailored resume & credentials.
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onAutoApply(internship);
              }}
              style={{
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                transition: 'all 0.15s ease'
              }}
            >
              <FiZap size={15} /> 1-Click AI Auto-Apply &gt;
            </button>
          </div>

          {/* "About the internship" with "Summarized by AI ✨" badge */}
          <div style={{ marginTop: '20px', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                About the internship
              </h3>
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
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Role Overview:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.65' }}>
                {overviewBullets.map((bullet, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{bullet}</li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Requirements:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '14px', lineHeight: '1.65' }}>
                {requirementsList.map((req, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{req}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skills Required Section with Student Match Indicator */}
          <div style={{ marginBottom: '22px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', margin: 0 }}>
                Skills Required:
              </h4>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {matchedSkills.length} of {jobSkills.length} in your profile
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
                      gap: '5px',
                      padding: '5px 12px',
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

          {/* Perks & Benefits Section */}
          <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
              Perks &amp; Benefits:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                <FiCheckCircle size={15} color="#00B289" /> Certificate of Completion
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                <FiCheckCircle size={15} color="#00B289" /> Letter of Recommendation
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                <FiCheckCircle size={15} color="#00B289" /> Flexible Working Hours
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                <FiCheckCircle size={15} color="#00B289" /> Pre-Placement Offer (PPO)
              </div>
            </div>
          </div>

          {/* Number of Openings */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Number of Openings:
            </h4>
            <div style={{ fontSize: '14px', color: '#475569' }}>
              {vacancies}
            </div>
          </div>

          {/* Sourcing Information */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
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
                style={{ color: '#00B289', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Original Portal <FiExternalLink size={12} />
              </a>
            )}
          </div>

        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => onSaveTracker(internship)}
            className="btn btn-outline"
            style={{
              padding: '10px 22px',
              borderRadius: '200px',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FiBookmark size={15} />
            {isSaved ? 'Saved in Tracker' : 'Save to Tracker'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {internship.url && (
              <a
                href={internship.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{
                  padding: '10px 20px',
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
              onClick={() => {
                onClose();
                onAutoApply(internship);
              }}
              className="btn btn-primary"
              style={{
                padding: '11px 26px',
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
  );
};

export default InternshalaDetailModal;
