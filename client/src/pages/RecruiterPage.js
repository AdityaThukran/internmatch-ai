/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBriefcase,
  FiUsers,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiFilter,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiMail,
  FiPhone,
  FiExternalLink,
  FiTrash2,
  FiEdit3,
  FiChevronRight,
  FiAward,
  FiTrendingUp,
  FiX,
  FiSend
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getInternships, getApplications, updateApplication } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const INITIAL_MOCK_APPLICANTS = [
  {
    id: 'app_rec_1',
    candidateName: 'Rahul Sharma',
    candidateEmail: 'rahul.sharma.sample@email.com',
    candidatePhone: '+91 98765 43210',
    degree: 'B.Tech Electrical Engineering',
    institution: 'Sample Institute of Technology, New Delhi',
    location: 'New Delhi, India',
    appliedRole: 'Embedded Systems & Automation Intern',
    organization: 'Siemens Industrial Automation',
    appliedAt: '2026-11-14T18:30:00.000Z',
    matchScore: 94,
    skills: ['Power Systems', 'PLC', 'SCADA', 'MATLAB/Simulink', 'Arduino', 'C++'],
    status: 'interviewing',
    notes: 'Candidate cleared technical round 1. Scheduled for client interview.',
    bio: 'Motivated final-year Electrical Engineering student with hands-on experience in power systems, embedded systems, and industrial automation.'
  },
  {
    id: 'app_rec_2',
    candidateName: 'Aditya',
    candidateEmail: 'thukranaditya@gmail.com',
    candidatePhone: '+91- 8398865720',
    degree: 'B.Tech in Artificial Intelligence',
    institution: "Lingaya's Vidyapeeth, Faridabad",
    location: 'Faridabad, India',
    appliedRole: 'Full Stack AI Engineering Intern',
    organization: 'Google Cloud AI & Workspaces',
    appliedAt: '2026-11-15T09:15:00.000Z',
    matchScore: 97,
    skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Python', 'Machine Learning', 'REST API'],
    status: 'under_review',
    notes: 'Strong portfolio with Airbnb and Zerodha full-stack clones. High GitHub activity.',
    bio: "ADITYA — Full Stack Developer | B.Tech Artificial Intelligence at Lingaya's Vidyapeeth. Skilled in React, Node.js, Express.js, MongoDB, and Python."
  },
  {
    id: 'app_rec_3',
    candidateName: 'Priya Patel',
    candidateEmail: 'priya.patel.cs@gmail.com',
    candidatePhone: '+91 98112 34567',
    degree: 'B.Tech Computer Science & Engineering',
    institution: 'Delhi Technological University (DTU)',
    location: 'Delhi, India',
    appliedRole: 'Frontend React & UI Engineer Intern',
    organization: 'Razorpay Software',
    appliedAt: '2026-11-13T12:00:00.000Z',
    matchScore: 89,
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'HTML5', 'CSS3'],
    status: 'offered',
    notes: 'Offer letter extended at ₹35,000/month stipend. Awaiting joining confirmation.',
    bio: 'Passionate frontend developer crafting responsive web apps and scalable design systems.'
  },
  {
    id: 'app_rec_4',
    candidateName: 'Aman Verma',
    candidateEmail: 'aman.verma.tech@gmail.com',
    candidatePhone: '+91 97234 56789',
    degree: 'BCA (Computer Applications)',
    institution: 'IP University, Delhi NCR',
    location: 'Noida, India',
    appliedRole: 'Backend Cloud & Node.js Intern',
    organization: 'Zomato Engineering',
    appliedAt: '2026-11-12T15:40:00.000Z',
    matchScore: 82,
    skills: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'Docker', 'Git'],
    status: 'applied',
    notes: 'Application received. Pending initial resume review.',
    bio: 'Backend developer focused on microservices, high-throughput REST APIs, and database caching.'
  }
];

const STAGES = [
  { key: 'applied', label: 'Applied', color: '#64748B', bg: '#F1F5F9' },
  { key: 'under_review', label: 'Under Review', color: '#D97706', bg: '#FEF3C7' },
  { key: 'interviewing', label: 'Interviewing', color: '#2563EB', bg: '#EFF6FF' },
  { key: 'offered', label: 'Offered', color: '#059669', bg: '#D1FAE5' },
  { key: 'rejected', label: 'Rejected', color: '#DC2626', bg: '#FEE2E2' }
];

const RecruiterPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants' | 'postings'
  const [postedJobs, setPostedJobs] = useState([]);
  const [applicants, setApplicants] = useState(INITIAL_MOCK_APPLICANTS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState('');

  // Form State for Posting New Internship
  const [newJob, setNewJob] = useState({
    title: '',
    organization: user?.company || 'Corporate Tech Partner',
    location: 'Bengaluru / Remote',
    mode: 'remote',
    type: 'Internship',
    stipend: '₹35,000 / month',
    duration: '3 Months',
    deadline: '2026-12-31',
    skills: 'React, Node.js, Python, MongoDB',
    eligibility: 'B.Tech CSE/ECE/AI, BCA, MCA 2024-2027 graduates',
    description: 'We are seeking an ambitious software engineering intern to work alongside our core engineering team on real-world web platforms, API microservices, and AI features.'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch live corporate listings
      const res = await getInternships({ limit: 50 });
      const list = res.data?.data?.internships || res.data?.internships || res.data?.data?.results || [];
      if (Array.isArray(list) && list.length > 0) {
        setPostedJobs(list.slice(0, 8));
      }
    } catch (err) {
      console.warn('Recruiter load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Load cached recruiter applicants if saved in localStorage
    const savedApps = localStorage.getItem('recruiter_applicants');
    if (savedApps) {
      try {
        setApplicants(JSON.parse(savedApps));
      } catch (e) {}
    }
  }, []);

  const handleStageChange = (appId, newStage) => {
    const updated = applicants.map((app) => {
      if (app.id === appId) {
        return { ...app, status: newStage };
      }
      return app;
    });
    setApplicants(updated);
    localStorage.setItem('recruiter_applicants', JSON.stringify(updated));
    setNotice(`Updated candidate stage to "${STAGES.find((s) => s.key === newStage)?.label}"!`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleUpdateNotes = (appId, newNotes) => {
    const updated = applicants.map((app) => {
      if (app.id === appId) {
        return { ...app, notes: newNotes };
      }
      return app;
    });
    setApplicants(updated);
    localStorage.setItem('recruiter_applicants', JSON.stringify(updated));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.organization) return;

    const skillsArray = typeof newJob.skills === 'string'
      ? newJob.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : newJob.skills;

    const jobPayload = {
      ...newJob,
      skills: skillsArray,
      _id: 'job_rec_' + Date.now(),
      id: 'job_rec_' + Date.now(),
      postedAt: new Date().toISOString(),
      isActive: true
    };

    setPostedJobs([jobPayload, ...postedJobs]);
    setIsModalOpen(false);
    setNotice(`🎉 Internship "${jobPayload.title}" published live! Students can now discover and 1-Click apply.`);
    setTimeout(() => setNotice(''), 6000);

    // Reset form
    setNewJob({
      title: '',
      organization: user?.company || 'Corporate Tech Partner',
      location: 'Bengaluru / Remote',
      mode: 'remote',
      type: 'Internship',
      stipend: '₹35,000 / month',
      duration: '3 Months',
      deadline: '2026-12-31',
      skills: 'React, Node.js, Python, MongoDB',
      eligibility: 'B.Tech CSE/ECE/AI, BCA, MCA 2024-2027 graduates',
      description: 'We are seeking an ambitious software engineering intern to work alongside our core engineering team on real-world web platforms, API microservices, and AI features.'
    });
  };

  // Filter applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appliedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStage = stageFilter === 'all' || app.status === stageFilter;
    const matchesJob = jobFilter === 'all' || app.appliedRole.toLowerCase().includes(jobFilter.toLowerCase());
    return matchesSearch && matchesStage && matchesJob;
  });

  if (loading) {
    return <LoadingSpinner text="Loading Recruiter ATS & Corporate Dashboard..." />;
  }

  const inReviewCount = applicants.filter((a) => a.status === 'under_review').length;
  const interviewingCount = applicants.filter((a) => a.status === 'interviewing').length;
  const offeredCount = applicants.filter((a) => a.status === 'offered').length;

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '36px 0 80px', fontFamily: "'Inter', sans-serif" }}>
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Header Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FBF8 100%)',
            borderRadius: '20px',
            border: '1.5px solid #E2E8F0',
            padding: '36px 40px',
            marginBottom: '32px',
            boxShadow: '0 4px 20px rgba(0, 178, 137, 0.07)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#E6F7F2',
                color: '#008C6B',
                border: '1px solid #B3E8DC',
                padding: '5px 14px',
                borderRadius: '100px',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: '12px'
              }}
            >
              <span>🏢</span> Corporate Recruiter &amp; Talent Acquisition Portal
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1B2533', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
              Welcome, {user?.name || 'Hiring Manager'}
            </h1>
            <p style={{ fontSize: '0.96rem', color: '#64748B', maxWidth: '640px', lineHeight: 1.6, margin: 0 }}>
              Review verified engineering candidates, track applicant hiring stages, and publish real-time internships directly to university talent pools.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#00B289',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '100px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.94rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 178, 137, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              <FiPlus style={{ strokeWidth: 3 }} />
              <span>Post New Internship</span>
            </button>
          </div>
        </div>

        {/* Global Notice Toast */}
        {notice && (
          <div
            style={{
              backgroundColor: '#E6F7F2',
              border: '1.5px solid #00B289',
              color: '#008C6B',
              padding: '14px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 700
            }}
          >
            <FiCheckCircle size={20} />
            <span>{notice}</span>
          </div>
        )}

        {/* KPI Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', padding: '22px 24px', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Active Postings</span>
              <span style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#E6F7F2', color: '#00B289', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                <FiBriefcase />
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1B2533' }}>{postedJobs.length}</div>
            <div style={{ fontSize: '0.82rem', color: '#008C6B', fontWeight: 600, marginTop: '4px' }}>Live in Candidate Directory</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '22px 24px', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Applicants</span>
              <span style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                <FiUsers />
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1B2533' }}>{applicants.length}</div>
            <div style={{ fontSize: '0.82rem', color: '#2563EB', fontWeight: 600, marginTop: '4px' }}>Verified Student Resumes</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '22px 24px', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>In Interviews</span>
              <span style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                <FiClock />
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1B2533' }}>{interviewingCount + inReviewCount}</div>
            <div style={{ fontSize: '0.82rem', color: '#D97706', fontWeight: 600, marginTop: '4px' }}>{interviewingCount} in Round 1/2, {inReviewCount} in Review</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '22px 24px', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Offers Extended</span>
              <span style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                <FiAward />
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1B2533' }}>{offeredCount}</div>
            <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>Candidates Selected</div>
          </div>
        </div>

        {/* Tab Switcher & Filters */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px'
          }}
        >
          {/* Main Tabs */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#E2E8F0', padding: '4px', borderRadius: '12px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('applicants')}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'applicants' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'applicants' ? '#008C6B' : '#475569',
                boxShadow: activeTab === 'applicants' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              🎯 Candidate Applicants ATS ({applicants.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('postings')}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'postings' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'postings' ? '#008C6B' : '#475569',
                boxShadow: activeTab === 'postings' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              📋 Manage Posted Openings ({postedJobs.length})
            </button>
          </div>

          {/* Search & Filter Inputs */}
          {activeTab === 'applicants' && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search candidate name or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 14px 8px 34px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.86rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>

              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              >
                <option value="all">All Hiring Stages</option>
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ================= TAB 1: APPLICANTS ATS TRACKER ================= */}
        {activeTab === 'applicants' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((app) => {
                const currentStage = STAGES.find((s) => s.key === app.status) || STAGES[0];
                return (
                  <div
                    key={app.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1.5px solid #E2E8F0',
                      padding: '24px 28px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Top Row: Candidate Identity, Applied Role & Match Score */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '16px',
                        marginBottom: '16px',
                        paddingBottom: '16px',
                        borderBottom: '1px solid #F1F5F9'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1B2533', margin: 0 }}>
                            {app.candidateName}
                          </h3>
                          <span
                            style={{
                              backgroundColor: '#E6F7F2',
                              color: '#008C6B',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              padding: '2px 10px',
                              borderRadius: '100px',
                              border: '1px solid #B3E8DC'
                            }}
                          >
                            ⚡ {app.matchScore}% S-BERT Match
                          </span>
                        </div>

                        <div style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
                          {app.degree} • <span style={{ color: '#008C6B' }}>{app.institution}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                          Applied for: <strong style={{ color: '#1E293B' }}>{app.appliedRole}</strong> ({app.organization})
                        </div>
                      </div>

                      {/* Stage Dropdown Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>Stage:</span>
                        <select
                          value={app.status}
                          onChange={(e) => handleStageChange(app.id, e.target.value)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '100px',
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            backgroundColor: currentStage.bg,
                            color: currentStage.color,
                            border: `1.5px solid ${currentStage.color}`,
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {STAGES.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Middle Row: Candidate Bio & Skills */}
                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.55, margin: '0 0 14px' }}>
                      {app.bio}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {app.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: '#F1F5F9',
                            color: '#334155',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: '6px'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Bottom Row: Contact & Hiring Notes */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '14px',
                        paddingTop: '14px',
                        borderTop: '1px solid #F8FAFC',
                        fontSize: '0.84rem',
                        color: '#64748B'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <FiMail style={{ color: '#00B289' }} /> {app.candidateEmail}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <FiPhone style={{ color: '#00B289' }} /> {app.candidatePhone}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <FiMapPin style={{ color: '#00B289' }} /> {app.location}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          to="/profile"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#008C6B',
                            fontWeight: 700,
                            textDecoration: 'none',
                            fontSize: '0.84rem'
                          }}
                        >
                          <FiFileText /> View Full Profile / Resume
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px dashed #CBD5E1',
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: '#64748B'
                }}
              >
                <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>No applicants found</p>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>Try clearing your search query or stage filters.</p>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: MANAGE POSTED OPENINGS ================= */}
        {activeTab === 'postings' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {postedJobs.map((job) => {
              const jobApps = applicants.filter((a) => a.appliedRole.toLowerCase().includes(job.title.toLowerCase()) || a.organization === job.organization);
              return (
                <div
                  key={job._id || job.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px solid #E2E8F0',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span
                        style={{
                          backgroundColor: '#E6F7F2',
                          color: '#008C6B',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase'
                        }}
                      >
                        {job.mode || 'Remote'}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#008C6B' }}>
                        👤 {jobApps.length} Applicants
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#1B2533', margin: '0 0 4px' }}>
                      {job.title}
                    </h3>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#00B289', marginBottom: '12px' }}>
                      {job.organization}
                    </div>

                    <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5, marginBottom: '14px' }}>
                      {(job.description || '').slice(0, 140)}...
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {(job.skills || []).slice(0, 4).map((s, idx) => (
                        <span key={idx} style={{ backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                      {job.stipend || 'Competitive Stipend'}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('applicants');
                        setJobFilter(job.title);
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#E6F7F2',
                        color: '#008C6B',
                        border: '1px solid #B3E8DC',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      View Applicants
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= MODAL: POST NEW INTERNSHIP ================= */}
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                maxWidth: '680px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '32px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                position: 'relative'
              }}
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  backgroundColor: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                <FiX size={20} />
              </button>

              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#008C6B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  New Opening
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1B2533', margin: '4px 0 6px' }}>
                  Post an Internship Opportunity
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
                  Published listings are immediately indexed into candidate AI recommendations and the searchable directory.
                </p>
              </div>

              <form onSubmit={handleCreateJob}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Internship Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Full Stack Developer Intern"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Company / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Razorpay / Google"
                      value={newJob.organization}
                      onChange={(e) => setNewJob({ ...newJob, organization: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Work Mode *
                    </label>
                    <select
                      value={newJob.mode}
                      onChange={(e) => setNewJob({ ...newJob, mode: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="remote">Remote Only</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-Site</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Monthly Stipend
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹35,000 / month"
                      value={newJob.stipend}
                      onChange={(e) => setNewJob({ ...newJob, stipend: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3-6 Months"
                      value={newJob.duration}
                      onChange={(e) => setNewJob({ ...newJob, duration: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Required Technical Skills * (comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React, Node.js, Python, MongoDB, REST API"
                    value={newJob.skills}
                    onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Eligibility Criteria
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech CSE/ECE/AI, BCA, MCA 2024-2027 graduates"
                    value={newJob.eligibility}
                    onChange={(e) => setNewJob({ ...newJob, eligibility: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Job Description &amp; Responsibilities *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the internship duties, engineering stack, and perks..."
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '100px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 24px',
                      borderRadius: '100px',
                      border: 'none',
                      backgroundColor: '#00B289',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0, 178, 137, 0.35)'
                    }}
                  >
                    🚀 Publish Internship Live
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RecruiterPage;
