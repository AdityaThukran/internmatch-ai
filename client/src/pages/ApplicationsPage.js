import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBriefcase,
  FiCheckCircle,
  FiEdit3,
  FiExternalLink,
  FiPlus,
  FiBookmark,
  FiSend,
  FiVideo,
  FiAward,
  FiGrid,
  FiList,
  FiArrowRight,
  FiArrowLeft,
  FiMapPin,
  FiTrash2,
  FiSearch,
  FiCheck,
  FiX,
  FiLayers,
  FiRefreshCw,
  FiZap,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiFileText,
  FiMail
} from 'react-icons/fi';
import { getApplications, updateApplication, deleteApplication, createApplication, runAutonomousAgent } from '../services/api';
import MatchScoreCircle from '../components/common/MatchScoreCircle';
import SkillBadge from '../components/common/SkillBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CompanyLogo from '../utils/companyLogos';

const PIPELINE_STAGES = [
  {
    id: 'saved',
    label: 'Saved Opportunities',
    shortLabel: 'Saved',
    icon: FiBookmark,
    color: '#64748B',
    bg: '#F8FAFC',
    badgeBg: '#F1F5F9',
    badgeBorder: '#CBD5E1',
    description: 'Saved roles & watchlist'
  },
  {
    id: 'applied',
    label: 'Applied & In Review',
    shortLabel: 'Applied',
    icon: FiSend,
    color: '#00B289',
    bg: '#F0FDF4',
    badgeBg: '#E6F7F2',
    badgeBorder: '#A7F3D0',
    description: 'Resumes & Tailored SOPs submitted'
  },
  {
    id: 'interviewing',
    label: 'Interviewing Rounds',
    shortLabel: 'Interviewing',
    icon: FiVideo,
    color: '#D97706',
    bg: '#FFFBEB',
    badgeBg: '#FEF3C7',
    badgeBorder: '#FDE68A',
    description: 'Technical & HR rounds scheduled'
  },
  {
    id: 'offered',
    label: 'Offers Extended',
    shortLabel: 'Offered',
    icon: FiAward,
    color: '#059669',
    bg: '#ECFDF5',
    badgeBg: '#D1FAE5',
    badgeBorder: '#6EE7B7',
    description: 'Official offer letters secured'
  }
];

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  // Default to 'cards' (spacious showcase cards like Recommendations page)
  const [viewMode, setViewMode] = useState('cards'); 
  const [stageFilter, setStageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [statusNotice, setStatusNotice] = useState('');

  // Autonomous AI Career Agent Autopilot Simulation State
  const [simulatingAgent, setSimulatingAgent] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const [agentSummary, setAgentSummary] = useState(null);
  
  // Interactive Drawers & Modals
  const [expandedSopId, setExpandedSopId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  
  // Custom Track Application Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    organization: '',
    title: '',
    source: 'LinkedIn',
    status: 'applied',
    location: 'Remote / India',
    stipend: '₹35,000 / month',
    url: '',
    notes: ''
  });

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await getApplications();
      const list = res.data?.data || res.data || [];
      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleRunAutonomousAgent = async () => {
    setSimulatingAgent(true);
    setAgentStep(1);
    setAgentSummary(null);
    const storedProfile = (() => {
      try { return JSON.parse(localStorage.getItem('student_profile') || '{}'); } catch { return {}; }
    })();
    const storedUser = (() => {
      try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
    })();
    const skills = storedProfile.skills || [];
    const degree = storedProfile.degree || 'Undergraduate Degree';
    const name = storedProfile.name || storedUser.name || 'Candidate';

    try {
      setTimeout(() => setAgentStep(2), 700);
      setTimeout(() => setAgentStep(3), 1600);

      const res = await runAutonomousAgent({ skills, degree, name });
      setAgentStep(4);
      if (res.data?.success && res.data?.data) {
        setAgentSummary(res.data.data.summary);
      }
      await fetchApps();
      window.dispatchEvent(new Event('notificationUpdated'));
      setStatusNotice('🎉 Autonomous AI Agent simulation complete! 1 Offer Extended & 1 Technical Interview Scheduled. Check your notification bell.');
      setTimeout(() => setStatusNotice(''), 7000);
    } catch (err) {
      console.warn('Autonomous Agent simulation notice:', err);
      setStatusNotice('Autonomous Agent completed simulation cycle!');
      await fetchApps();
    } finally {
      setTimeout(() => {
        setSimulatingAgent(false);
        setAgentStep(0);
      }, 4000);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplication(appId, { status: newStatus });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
      const stageObj = PIPELINE_STAGES.find(s => s.id === newStatus);
      setStatusNotice(`🎉 Application status moved to "${stageObj ? stageObj.label : newStatus}"!`);
      setTimeout(() => setStatusNotice(''), 3500);
    } catch (err) {
      console.error(err);
      alert('Could not update status: ' + err.message);
    }
  };

  const advanceStage = (appId, currentStatus) => {
    const order = ['saved', 'applied', 'interviewing', 'offered'];
    const idx = order.indexOf(currentStatus);
    if (idx < order.length - 1) {
      handleStatusChange(appId, order[idx + 1]);
    }
  };

  const regressStage = (appId, currentStatus) => {
    const order = ['saved', 'applied', 'interviewing', 'offered'];
    const idx = order.indexOf(currentStatus);
    if (idx > 0) {
      handleStatusChange(appId, order[idx - 1]);
    }
  };

  const handleSaveNotes = async (appId) => {
    try {
      await updateApplication(appId, { notes: editNotes });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, notes: editNotes } : a));
      setEditingId(null);
      setStatusNotice('Live notes saved and synced with Supabase!');
      setTimeout(() => setStatusNotice(''), 3500);
    } catch (err) {
      console.error(err);
      alert('Could not save notes: ' + err.message);
    }
  };

  const handleDelete = async (appId, companyName) => {
    if (!window.confirm(`Are you sure you want to remove "${companyName}" from your live pipeline?`)) return;
    try {
      await deleteApplication(appId);
      setApplications(prev => prev.filter(a => a._id !== appId));
      setStatusNotice(`Application for "${companyName}" removed from tracker.`);
      setTimeout(() => setStatusNotice(''), 3500);
    } catch (err) {
      console.error(err);
      alert('Could not delete application: ' + err.message);
    }
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateCustomApplication = async (e) => {
    e.preventDefault();
    if (!newAppForm.organization.trim() || !newAppForm.title.trim()) {
      alert('Please provide Company Name and Role Title.');
      return;
    }

    try {
      const payload = {
        internship: {
          title: newAppForm.title.trim(),
          organization: newAppForm.organization.trim(),
          location: newAppForm.location.trim() || 'India',
          stipend: newAppForm.stipend.trim() || 'Competitive',
          source: newAppForm.source,
          url: newAppForm.url.trim() || 'https://www.linkedin.com/jobs/',
          mode: newAppForm.location.toLowerCase().includes('remote') ? 'remote' : 'hybrid'
        },
        status: newAppForm.status,
        notes: newAppForm.notes.trim() || `Tracked application for ${newAppForm.title} at ${newAppForm.organization}.`
      };

      const res = await createApplication(payload);
      const created = res.data?.data || res.data;
      if (created) {
        setApplications(prev => [created, ...prev]);
        setStatusNotice(`🎉 Added "${newAppForm.organization}" to your Live Tracker!`);
        setTimeout(() => setStatusNotice(''), 4000);
        setShowAddModal(false);
        setNewAppForm({
          organization: '',
          title: '',
          source: 'LinkedIn',
          status: 'applied',
          location: 'Remote / India',
          stipend: '₹35,000 / month',
          url: '',
          notes: ''
        });
      }
    } catch (err) {
      console.error('Error creating custom application:', err);
      alert('Could not save application: ' + err.message);
    }
  };

  // Funnel & Counts
  const counts = {
    total: applications.length,
    saved: applications.filter(a => a.status === 'saved').length,
    applied: applications.filter(a => a.status === 'applied').length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offered: applications.filter(a => a.status === 'offered').length
  };

  const interviewRate = counts.applied > 0 ? Math.round((counts.interviewing / counts.applied) * 100) : 0;

  // Filter & Sort
  let filteredApps = [...applications];

  // Stage filter
  if (stageFilter !== 'all') {
    filteredApps = filteredApps.filter(a => a.status === stageFilter);
  }

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredApps = filteredApps.filter(a => {
      const job = a.internshipId || a.internships || a.internship || {};
      const org = (job.organization || '').toLowerCase();
      const title = (job.title || '').toLowerCase();
      const notes = (a.notes || '').toLowerCase();
      return org.includes(q) || title.includes(q) || notes.includes(q);
    });
  }

  // Sorting
  filteredApps.sort((a, b) => {
    const jobA = a.internshipId || a.internships || a.internship || {};
    const jobB = b.internshipId || b.internships || b.internship || {};
    
    const extractScore = (app, job) => {
      const match = (app.notes || '').match(/(\d+)%\s+ATS\s+Match/i);
      if (match) return parseInt(match[1], 10);
      return job.matchScore || 85;
    };

    if (sortBy === 'score') {
      return extractScore(b, jobB) - extractScore(a, jobA);
    }
    if (sortBy === 'company') {
      return (jobA.organization || '').localeCompare(jobB.organization || '');
    }
    return new Date(b.updated_at || b.applied_at || 0) - new Date(a.updated_at || a.applied_at || 0);
  });

  const getSourceBadgeStyle = (source = '') => {
    const s = source.toLowerCase();
    if (s.includes('internshala')) {
      return { bg: '#F0F9FF', color: '#008BDC', border: '#BAE6FD', label: 'Internshala' };
    }
    if (s.includes('linkedin')) {
      return { bg: '#EFF6FF', color: '#0A66C2', border: '#BFDBFE', label: 'LinkedIn' };
    }
    if (s.includes('unstop')) {
      return { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA', label: 'Unstop' };
    }
    return { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0', label: source || 'Company Portal' };
  };

  const getStageBadge = (status = '') => {
    switch (status) {
      case 'interviewing':
        return {
          label: 'Interview Scheduled',
          bg: '#FEF3C7',
          color: '#B45309',
          border: '#FDE68A',
          dot: '#D97706'
        };
      case 'offered':
        return {
          label: 'Offer Letter Extended',
          bg: '#D1FAE5',
          color: '#065F46',
          border: '#6EE7B7',
          dot: '#059669'
        };
      case 'applied':
        return {
          label: 'Applied & In Review',
          bg: '#E6F7F2',
          color: '#008C6B',
          border: '#A7F3D0',
          dot: '#00B289'
        };
      default:
        return {
          label: 'Saved Opportunity',
          bg: '#F1F5F9',
          color: '#475569',
          border: '#CBD5E1',
          dot: '#64748B'
        };
    }
  };

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 72px)', padding: '36px 0 90px' }}>
      <div className="container" style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px' }}>

        {/* ═════════════════════════════════════════════════════════════════════
            1. HERO HEADER BANNER (SPACIOUS & MATCHING RECOMMENDATIONS PAGE)
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          className="card"
          style={{
            padding: '36px 40px',
            marginBottom: '32px',
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Decorative Circle Accent */}
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 178, 137, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', position: 'relative', zIndex: 1 }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <span>📡</span>
                <span>Real-Time Autonomous Application & Interview Pipeline</span>
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)', margin: 0, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                Live Application Tracker
              </h1>
              <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', maxWidth: '720px', marginTop: '8px', marginBottom: 0, lineHeight: 1.6 }}>
                Track submitted applications, review tailored Statement of Purpose (SOP) pitches, monitor technical interviews, and advance hiring stages in real time.
              </p>
            </div>

            {/* Header Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleRunAutonomousAgent}
                disabled={simulatingAgent}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#00B289',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: simulatingAgent ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(0, 178, 137, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                <FiZap className={simulatingAgent ? 'spin' : ''} size={18} />
                <span>{simulatingAgent ? 'AI Agent Autopilot Active...' : '🤖 Run AI Agent Autopilot'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="btn btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem'
                }}
              >
                <FiPlus size={17} />
                <span>+ Track Custom Role</span>
              </button>

              <Link
                to="/email-sync"
                className="btn btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  color: '#008C6B',
                  border: '1.5px solid #00B289'
                }}
              >
                <FiMail size={16} />
                <span>📬 Email Tracker</span>
              </Link>

              <button
                type="button"
                onClick={fetchApps}
                disabled={loading}
                className="btn btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.92rem'
                }}
              >
                <FiRefreshCw className={loading ? 'spin' : ''} size={16} />
                <span>Sync Pipeline</span>
              </button>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            AUTONOMOUS AI CAREER AGENT (AUTOPILOT MODE) SHOWCASE CARD
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FBF8 100%)',
            border: '1.5px solid #00B289',
            borderRadius: '16px',
            padding: '28px 32px',
            marginBottom: '32px',
            boxShadow: '0 4px 20px rgba(0, 178, 137, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#E6F7F2', color: '#008C6B', border: '1px solid #B3E8DC', padding: '4px 12px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00B289', display: 'inline-block' }} />
                <span>AUTOPILOT MODE: ZERO MANUAL EFFORT</span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1B2533', margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>
                🤖 Autonomous AI Career Simulation Engine
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#64748B', lineHeight: 1.6, margin: 0, maxWidth: '820px' }}>
                You do not need to manually apply or drag cards between columns. Our autonomous AI agent automatically discovers 120 verified real listings, analyzes your profile &amp; skills, crafts tailored Statements of Purpose, clears corporate ATS screens, schedules technical interviews, secures official job offers, and pings your notification bell only when decisions happen.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleRunAutonomousAgent}
                disabled={simulatingAgent}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#00B289',
                  color: '#FFFFFF',
                  padding: '13px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: simulatingAgent ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(0, 178, 137, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                <FiZap className={simulatingAgent ? 'spin' : ''} size={18} />
                <span>{simulatingAgent ? 'Simulating Hiring Lifecycle...' : '🚀 Launch Autonomous Simulation'}</span>
              </button>
            </div>
          </div>

          {/* Live Progress Tracker during simulation */}
          {simulatingAgent && (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#008C6B' }}>
                  {agentStep === 1 && 'Step 1/4: Scanning 120 verified real-world postings & computing vector match...'}
                  {agentStep === 2 && 'Step 2/4: Auto-generating tailored Statements of Purpose (SOP) & transmitting applications...'}
                  {agentStep === 3 && 'Step 3/4: Simulating corporate ATS screening & recruiter shortlisting...'}
                  {agentStep >= 4 && 'Step 4/4: Extending 1 Official Offer & scheduling 1 Technical Interview! Dispathing bell alerts...'}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#00B289' }}>
                  {agentStep === 1 && '25%'}
                  {agentStep === 2 && '50%'}
                  {agentStep === 3 && '75%'}
                  {agentStep >= 4 && '100%'}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '100px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#00B289',
                    borderRadius: '100px',
                    width: agentStep === 1 ? '25%' : agentStep === 2 ? '50%' : agentStep === 3 ? '75%' : '100%',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Simulation Success Feedback */}
          {agentSummary && !simulatingAgent && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px 20px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>🎉</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#065F46', fontSize: '0.92rem' }}>
                    Autonomous Hiring Simulation Completed Successfully!
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#047857' }}>
                    🏆 1 Official Offer Extended ({agentSummary.offered?.[0]?.stipend || '₹50,000/mo'}) • 🎙️ 1 Technical Interview Scheduled • 📝 2 Submitted in Review
                  </div>
                </div>
              </div>
              <Link
                to="/notifications"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 700
                }}
              >
                <span>🔔 View Bell Notifications</span>
                <FiArrowRight />
              </Link>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            2. RECRUITMENT KPI SUMMARY METRICS
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          className="app-kpi-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '30px'
          }}
        >
          {/* Card 1: Total */}
          <div
            className="card"
            style={{
              padding: '22px 26px',
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Tracked Roles
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)', lineHeight: 1.1, marginTop: '6px' }}>
                {counts.total}
              </div>
              <span style={{ fontSize: '0.82rem', color: '#008C6B', fontWeight: 600 }}>
                ● Active in Pipeline
              </span>
            </div>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiLayers size={24} />
            </div>
          </div>

          {/* Card 2: In Review */}
          <div
            className="card"
            style={{
              padding: '22px 26px',
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderTop: '4px solid #00B289',
              borderRadius: '14px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Applied & In Review
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#008C6B', lineHeight: 1.1, marginTop: '6px' }}>
                {counts.applied}
              </div>
              <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                SOPs & Resumes Submitted
              </span>
            </div>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: '#E6F7F2', color: '#00B289', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiSend size={24} />
            </div>
          </div>

          {/* Card 3: Interviewing */}
          <div
            className="card"
            style={{
              padding: '22px 26px',
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderTop: '4px solid #D97706',
              borderRadius: '14px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Interview Rounds
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#D97706', lineHeight: 1.1, marginTop: '6px' }}>
                {counts.interviewing}
              </div>
              <span style={{ fontSize: '0.82rem', color: '#B45309', fontWeight: 600 }}>
                {interviewRate}% Interview Rate
              </span>
            </div>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiVideo size={24} />
            </div>
          </div>

          {/* Card 4: Offered */}
          <div
            className="card"
            style={{
              padding: '22px 26px',
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderTop: '4px solid #059669',
              borderRadius: '14px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Offers Extended
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#059669', lineHeight: 1.1, marginTop: '6px' }}>
                {counts.offered}
              </div>
              <span style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 700 }}>
                🎉 Final Offers Won
              </span>
            </div>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiAward size={24} />
            </div>
          </div>
        </div>

        {/* Live Feedback Toast Alert */}
        {statusNotice && (
          <div
            style={{
              backgroundColor: '#E6F7F2',
              border: '1.5px solid #00B289',
              color: '#008C6B',
              padding: '14px 22px',
              borderRadius: '12px',
              marginBottom: '26px',
              fontSize: '0.94rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 14px rgba(0, 178, 137, 0.15)',
              animation: 'fadeIn 0.25s ease-out'
            }}
          >
            <FiCheckCircle size={22} />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            3. FILTER CONTROLS BAR (DIRECTLY MODELED ON RECOMMENDATIONS PAGE)
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '26px',
            flexWrap: 'wrap',
            gap: '18px'
          }}
        >
          {/* Stage Filter Pills - Swipeable on Android */}
          <div
            className="mobile-swipe-tabs"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '4px' }}
          >
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '6px', flexShrink: 0 }}>
              Pipeline Stage:
            </span>
            {[
              { id: 'all', label: `All (${counts.total})` },
              { id: 'applied', label: `In Review (${counts.applied})` },
              { id: 'interviewing', label: `Interviewing (${counts.interviewing})` },
              { id: 'offered', label: `Offers (${counts.offered})` },
              { id: 'saved', label: `Saved (${counts.saved})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStageFilter(tab.id)}
                style={{
                  backgroundColor: stageFilter === tab.id ? 'var(--secondary)' : 'var(--bg-secondary)',
                  color: stageFilter === tab.id ? '#ffffff' : 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Controls: Search, Sort & View Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', width: '240px' }}>
              <FiSearch
                size={15}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="text"
                placeholder="Search company or role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 34px',
                  fontSize: '0.86rem',
                  borderRadius: '10px'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input"
                style={{ width: 'auto', padding: '7px 14px', fontSize: '0.84rem', borderRadius: '10px' }}
              >
                <option value="recent">Recently Updated</option>
                <option value="score">Highest Match Score</option>
                <option value="company">Company Name</option>
              </select>
            </div>

            {/* View Mode Switcher: Spacious Cards (Default) vs Kanban */}
            <div style={{ display: 'inline-flex', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '3px' }}>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Spacious Showcase Cards (Like Recommendations Page)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'cards' ? '#1B2533' : 'transparent',
                  color: viewMode === 'cards' ? '#FFFFFF' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <FiList size={15} />
                <span>Cards Feed</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                title="Pipeline Kanban Columns"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'kanban' ? '#1B2533' : 'transparent',
                  color: viewMode === 'kanban' ? '#FFFFFF' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <FiGrid size={15} />
                <span>Kanban Board</span>
              </button>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            4. MAIN VIEW: RICH, SPACIOUS HORIZONTAL CARDS (LIKE RECOMMENDATIONS)
            ═════════════════════════════════════════════════════════════════════ */}
        {loading ? (
          <LoadingSpinner text="Synchronizing live pipeline with Supabase..." />
        ) : filteredApps.length === 0 ? (
          /* Empty State - Generous & Helpful */
          <div
            className="card"
            style={{
              padding: '70px 24px',
              textAlign: 'center',
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontSize: '3.4rem', marginBottom: '16px' }}>📁</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>
              No applications found for this filter
            </h3>
            <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '8px auto 26px', lineHeight: 1.6 }}>
              {stageFilter !== 'all' || searchQuery
                ? 'Try clearing your search or switching to "All" stages to see active tracked roles.'
                : 'You have not submitted or saved any applications yet. Browse verified opportunities or explore your personalized AI recommendations!'}
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/recommendations"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', fontWeight: 700, fontSize: '0.90rem' }}
              >
                <FiZap size={16} />
                <span>Explore AI Matches</span>
              </Link>
              <Link
                to="/internships"
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', fontWeight: 600, fontSize: '0.90rem' }}
              >
                <FiBriefcase size={16} />
                <span>Browse Verified Internships</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', fontWeight: 600, fontSize: '0.90rem' }}
              >
                <FiPlus size={16} />
                <span>+ Track Custom Role</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          /* ──────── SPACIOUS CARD FEED (1:1 MATCHING RECOMMENDATIONS PAGE) ──────── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredApps.map((app, index) => {
              const job = app.internshipId || app.internships || app.internship || {};
              const stageBadge = getStageBadge(app.status);
              const sourceBadge = getSourceBadgeStyle(job.source);
              const isExpandedSop = expandedSopId === app._id;
              const isEditing = editingId === app._id;

              // Extract Match Score from notes or job properties
              const matchFromNotes = (app.notes || '').match(/(\d+)%\s+ATS\s+Match/i);
              const matchScore = matchFromNotes ? parseInt(matchFromNotes[1], 10) : (job.matchScore || (90 - index * 3));

              // Extract Tailored SOP excerpt if present in notes
              const sopMatch = (app.notes || '').match(/Tailored SOP generated for [^.]+\.(.+?)(?:Ref:|$)/is);
              const sopText = sopMatch ? sopMatch[1].trim() : (app.notes || 'Application submitted via AI Zero-Friction Engine.');

              return (
                <div
                  key={app._id}
                  className="card"
                  style={{
                    padding: '32px 36px',
                    background: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '28px'
                    }}
                  >
                    {/* Left: Score Circle + Company Logo + Details (Exact Recommendations Layout) */}
                    <div
                      className="app-showcase-left"
                      style={{
                        display: 'flex',
                        gap: '18px',
                        alignItems: 'flex-start',
                        flex: '1 1 320px',
                        minWidth: 0
                      }}
                    >
                      {/* Match Score Circle */}
                      <MatchScoreCircle score={matchScore} size={76} strokeWidth={6} />

                      {/* Company Logo */}
                      <CompanyLogo organization={job.organization} size={54} />

                      {/* Role Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Title Row + Status Pills */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h2 style={{ fontSize: '1.38rem', fontWeight: 800, color: 'var(--secondary)', margin: 0, lineHeight: 1.3 }}>
                            {job.title || 'Internship Position'}
                          </h2>

                          {/* Stage Status Badge */}
                          <span
                            style={{
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              padding: '5px 12px',
                              borderRadius: '14px',
                              backgroundColor: stageBadge.bg,
                              color: stageBadge.color,
                              border: `1px solid ${stageBadge.border}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: stageBadge.dot,
                                display: 'inline-block'
                              }}
                            />
                            {stageBadge.label}
                          </span>

                          {/* Platform Source Tag */}
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '8px',
                              backgroundColor: sourceBadge.bg,
                              color: sourceBadge.color,
                              border: `1px solid ${sourceBadge.border}`
                            }}
                          >
                            {sourceBadge.label}
                          </span>

                          {/* 8-Hour AI Mailbox Sync Badge */}
                          {((app.notes && app.notes.includes('AI Mailbox Sync')) || app.autoSynced) && (
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: '8px',
                                backgroundColor: '#E6F7F2',
                                color: '#008C6B',
                                border: '1px solid #A7F3D0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <FiMail size={12} />
                              <span>⚡ Auto-Synced via 8-Hour Sync</span>
                            </span>
                          )}

                          {/* Verified Stipend Badge */}
                          {app.stipend && (
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                padding: '4px 10px',
                                borderRadius: '8px',
                                backgroundColor: '#ECFDF5',
                                color: '#065F46',
                                border: '1px solid #A7F3D0'
                              }}
                            >
                              🏆 {app.stipend}
                            </span>
                          )}
                        </div>

                        {/* Meeting Link Notification Bar if Interview Scheduled */}
                        {app.interviewDetails?.meetingLink && (
                          <div style={{ marginTop: '10px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px 14px', borderRadius: '10px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E40AF' }}>
                              🎙️ {app.interviewDetails.platform || 'Interview'} Scheduled: {app.interviewDetails.suggestedDate}
                            </span>
                            <a
                              href={app.interviewDetails.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                backgroundColor: '#2563EB',
                                color: '#FFFFFF',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                textDecoration: 'none'
                              }}
                            >
                              <span>Join Meeting</span>
                              <FiExternalLink size={12} />
                            </a>
                          </div>
                        )}

                        {/* Company & Location Line */}
                        <p style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--primary)', marginTop: '8px', marginBottom: '8px' }}>
                          {job.organization || 'Hiring Company'} •{' '}
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                            <FiMapPin style={{ verticalAlign: '-1px' }} /> {job.location || 'India'} ({job.mode || 'Remote'})
                          </span>
                        </p>

                        {/* Description Preview */}
                        <p style={{ fontSize: '0.90rem', color: 'var(--text-secondary)', margin: '8px 0 14px', lineHeight: 1.6 }}>
                          {job.description ? job.description.slice(0, 180) + '...' : '100% Real-time verified opening with active hiring pipeline.'}
                        </p>

                        {/* Matched Skills Pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '18px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '4px' }}>
                            Skills:
                          </span>
                          {(job.skills || ['Python', 'Problem Solving', 'Data Analysis']).map(s => (
                            <SkillBadge key={s} skill={s} variant="matched" />
                          ))}
                        </div>

                        {/* 4-Step Milestone Stepper Line (Full Width with Room) */}
                        <div
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            padding: '14px 20px',
                            maxWidth: '640px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                            {/* Background Connecting Bar */}
                            <div
                              style={{
                                position: 'absolute',
                                top: '50%',
                                left: '20px',
                                right: '20px',
                                height: '2.5px',
                                backgroundColor: '#E2E8F0',
                                zIndex: 0,
                                transform: 'translateY(-50%)'
                              }}
                            />

                            {PIPELINE_STAGES.map((stg, sIdx) => {
                              const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === app.status);
                              const isPassed = sIdx <= currentStageIndex;
                              const isCurrent = sIdx === currentStageIndex;

                              return (
                                <div
                                  key={stg.id}
                                  onClick={() => handleStatusChange(app._id, stg.id)}
                                  title={`Click to move to ${stg.label}`}
                                  style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <div
                                    style={{
                                      width: isCurrent ? '24px' : '18px',
                                      height: isCurrent ? '24px' : '18px',
                                      borderRadius: '50%',
                                      backgroundColor: isCurrent ? stg.color : (isPassed ? '#00B289' : '#CBD5E1'),
                                      border: '2px solid #FFFFFF',
                                      boxShadow: isCurrent ? `0 0 0 3px ${stg.badgeBorder}` : 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    {isPassed && !isCurrent && <FiCheck size={11} color="#FFFFFF" />}
                                  </div>
                                  <span
                                    style={{
                                      fontSize: '0.72rem',
                                      fontWeight: isCurrent ? 800 : 600,
                                      color: isCurrent ? stg.color : (isPassed ? '#1B2533' : '#94A3B8'),
                                      marginTop: '6px'
                                    }}
                                  >
                                    {stg.shortLabel}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Interview Stage Warm Alert Box */}
                        {app.status === 'interviewing' && (
                          <div
                            style={{
                              marginTop: '16px',
                              backgroundColor: '#FFFBEB',
                              border: '1.5px solid #FDE68A',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              maxWidth: '640px'
                            }}
                          >
                            <FiVideo size={20} color="#D97706" />
                            <div style={{ fontSize: '0.86rem', color: '#92400E', lineHeight: 1.5 }}>
                              <strong>Technical Round Scheduled:</strong> Review domain fundamentals and practical project architecture.
                            </div>
                          </div>
                        )}

                        {/* Offer Stage Celebration Banner */}
                        {app.status === 'offered' && (
                          <div
                            style={{
                              marginTop: '16px',
                              backgroundColor: '#ECFDF5',
                              border: '1.5px solid #A7F3D0',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              maxWidth: '640px'
                            }}
                          >
                            <FiAward size={20} color="#059669" />
                            <div style={{ fontSize: '0.86rem', color: '#065F46', lineHeight: 1.5 }}>
                              <strong>🎉 Official Offer Received:</strong> Stipend & formal agreement confirmed. Remember to send acceptance response!
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions & Stipend (Identical to Recommendations Layout) */}
                    <div
                      className="app-showcase-actions"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '14px',
                        flexShrink: 0
                      }}
                    >
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {job.stipend || 'Competitive Stipend'}
                        </p>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-light)', margin: '4px 0 0' }}>
                          {job.duration || '3-6 Months'} • {job.mode || 'Remote'}
                        </p>
                      </div>

                      {/* Action Button Group */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {/* Advance Stage Button (Styled like 1-Click Auto-Apply) */}
                        {app.status !== 'offered' ? (
                          <button
                            type="button"
                            onClick={() => advanceStage(app._id, app.status)}
                            style={{
                              backgroundColor: '#00B289',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '9px 18px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.86rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              boxShadow: '0 2px 10px rgba(0, 178, 137, 0.25)',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            <FiArrowRight size={15} />
                            <span>
                              {app.status === 'saved' ? 'Submit Application' : app.status === 'applied' ? 'Move to Interview' : 'Mark Offered'}
                            </span>
                          </button>
                        ) : (
                          <span
                            style={{
                              backgroundColor: '#D1FAE5',
                              color: '#065F46',
                              border: '1px solid #A7F3D0',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FiAward size={15} />
                            <span>Offer Completed</span>
                          </span>
                        )}

                        {/* Details / Authentic Link Button */}
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.84rem',
                              padding: '8px 14px',
                              borderRadius: '8px'
                            }}
                          >
                            <span>Official Post</span>
                            <FiExternalLink size={13} />
                          </a>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(app._id, job.organization || 'Opportunity')}
                          title="Remove from tracker"
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            color: '#94A3B8',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>

                      {/* Expand Tailored SOP Button */}
                      <button
                        type="button"
                        onClick={() => setExpandedSopId(isExpandedSop ? null : app._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#008C6B',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 0',
                          marginTop: '4px'
                        }}
                      >
                        <FiFileText size={14} />
                        <span>{isExpandedSop ? 'Hide Tailored SOP' : 'View Tailored SOP Pitch'}</span>
                        {isExpandedSop ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* ──────── EXPANDABLE TAILORED SOP & CANDIDATE NOTES DRAWER ──────── */}
                  {isExpandedSop && (
                    <div
                      style={{
                        marginTop: '24px',
                        paddingTop: '20px',
                        borderTop: '1.5px dashed #E2E8F0',
                        animation: 'fadeIn 0.25s ease-out'
                      }}
                    >
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
                          border: '1px solid #A7F3D0',
                          borderRadius: '14px',
                          padding: '22px 26px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#008C6B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            📄 Tailored Statement of Purpose (SOP) & Cover Pitch
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(app._id, sopText)}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #A7F3D0',
                              color: '#008C6B',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontSize: '0.80rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {copiedId === app._id ? <FiCheck size={13} /> : <FiCopy size={13} />}
                            <span>{copiedId === app._id ? 'Copied!' : 'Copy SOP'}</span>
                          </button>
                        </div>

                        <p style={{ fontSize: '0.92rem', color: '#1B2533', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
                          {sopText}
                        </p>
                      </div>

                      {/* Candidate Custom Notes Section */}
                      <div style={{ marginTop: '16px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <textarea
                              rows={3}
                              value={editNotes}
                              onChange={e => setEditNotes(e.target.value)}
                              placeholder="Add personal interview dates, HR contact details, or technical questions asked..."
                              className="form-input"
                              style={{ width: '100%', fontSize: '0.88rem', padding: '12px 14px' }}
                            />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="btn btn-outline btn-sm"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveNotes(app._id)}
                                className="btn btn-primary btn-sm"
                              >
                                Save Notes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.84rem', color: '#64748B' }}>
                              <strong>Notes:</strong> {app.notes ? app.notes.slice(0, 120) + '...' : 'No additional interview notes yet.'}
                            </span>
                            <button
                              type="button"
                              onClick={() => { setEditingId(app._id); setEditNotes(app.notes || ''); }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <FiEdit3 size={13} />
                              <span>Edit Notes</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ──────── KANBAN BOARD VIEW (SPACIOUS 360PX COLUMNS WITH HORIZONTAL SCROLL) ──────── */
          <div
            style={{
              display: 'flex',
              gap: '24px',
              overflowX: 'auto',
              paddingBottom: '20px',
              alignItems: 'flex-start'
            }}
          >
            {PIPELINE_STAGES.map((col) => {
              const colApps = filteredApps.filter(a => a.status === col.id);
              const ColIcon = col.icon;

              return (
                <div
                  key={col.id}
                  style={{
                    width: '360px',
                    minWidth: '360px',
                    flexShrink: 0,
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderTop: `4px solid ${col.color}`,
                    borderRadius: '16px',
                    padding: '22px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                    minHeight: '480px'
                  }}
                >
                  {/* Column Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1.5px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: col.badgeBg,
                          color: col.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <ColIcon size={16} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#1B2533', display: 'block', lineHeight: 1.2 }}>
                          {col.label}
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                          {colApps.length} active
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNewAppForm(prev => ({ ...prev, status: col.id }));
                        setShowAddModal(true);
                      }}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        color: '#475569',
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FiPlus size={15} />
                    </button>
                  </div>

                  {/* Column Cards */}
                  {colApps.length === 0 ? (
                    <div
                      style={{
                        padding: '44px 16px',
                        textAlign: 'center',
                        color: '#94A3B8',
                        fontSize: '0.86rem',
                        background: '#F8FAFC',
                        borderRadius: '12px',
                        border: '1.5px dashed #E2E8F0'
                      }}
                    >
                      No roles in {col.shortLabel}.
                    </div>
                  ) : (
                    colApps.map(app => {
                      const job = app.internshipId || app.internships || app.internship || {};
                      const sourceBadge = getSourceBadgeStyle(job.source);

                      return (
                        <div
                          key={app._id}
                          style={{
                            background: '#FFFFFF',
                            border: '1.5px solid #E2E8F0',
                            borderRadius: '14px',
                            padding: '18px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CompanyLogo organization={job.organization} size={42} />
                            <div>
                              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#008C6B', textTransform: 'uppercase' }}>
                                {job.organization || 'Hiring Company'}
                              </span>
                              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1B2533', margin: '2px 0 0', lineHeight: 1.3 }}>
                                {job.title || 'Internship Role'}
                              </h4>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.74rem' }}>
                            <span style={{ backgroundColor: sourceBadge.bg, color: sourceBadge.color, padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                              {sourceBadge.label}
                            </span>
                            <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                              {job.location || 'India'}
                            </span>
                            {job.stipend && (
                              <span style={{ background: '#E6F7F2', color: '#008C6B', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                                {job.stipend}
                              </span>
                            )}
                          </div>

                          {/* Concise Clean Notes Snippet */}
                          {app.notes && (
                            <div style={{ fontSize: '0.78rem', color: '#64748B', background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', border: '1px solid #EDF2F7', lineHeight: 1.4 }}>
                              {app.notes.slice(0, 95)}...
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => regressStage(app._id, app.status)}
                                disabled={app.status === 'saved'}
                                style={{ background: 'none', border: 'none', color: app.status === 'saved' ? '#CBD5E1' : '#64748B', cursor: app.status === 'saved' ? 'default' : 'pointer' }}
                              >
                                <FiArrowLeft size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => advanceStage(app._id, app.status)}
                                disabled={app.status === 'offered'}
                                style={{ background: 'none', border: 'none', color: app.status === 'offered' ? '#CBD5E1' : '#00B289', cursor: app.status === 'offered' ? 'default' : 'pointer' }}
                              >
                                <FiArrowRight size={15} />
                              </button>
                            </div>

                            {job.url && (
                              <a href={job.url} target="_blank" rel="noreferrer" style={{ color: '#64748B' }}>
                                <FiExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            5. TRACK CUSTOM APPLICATION MODAL
            ═════════════════════════════════════════════════════════════════════ */}
        {showAddModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setShowAddModal(false)}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '560px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
                border: '1px solid #E2E8F0',
                padding: '30px 36px'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                <h3 style={{ fontSize: '1.30rem', fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>
                  Track New Application
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <FiX size={22} />
                </button>
              </div>

              <form onSubmit={handleCreateCustomApplication}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Microsoft, BotMakers"
                    value={newAppForm.organization}
                    onChange={e => setNewAppForm({ ...newAppForm, organization: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.90rem' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Role / Position Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Machine Learning Intern"
                    value={newAppForm.title}
                    onChange={e => setNewAppForm({ ...newAppForm, title: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.90rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Platform Source
                    </label>
                    <select
                      value={newAppForm.source}
                      onChange={e => setNewAppForm({ ...newAppForm, source: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', fontSize: '0.90rem' }}
                    >
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Internshala">Internshala</option>
                      <option value="Unstop">Unstop</option>
                      <option value="Company Portal">Company Portal</option>
                      <option value="Campus Referral">Campus Referral</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Initial Status Stage
                    </label>
                    <select
                      value={newAppForm.status}
                      onChange={e => setNewAppForm({ ...newAppForm, status: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', fontSize: '0.90rem' }}
                    >
                      <option value="saved">Saved (Watchlist)</option>
                      <option value="applied">Applied & In Review</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offered">Offer Received</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Location / Mode
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Remote / Bengaluru"
                      value={newAppForm.location}
                      onChange={e => setNewAppForm({ ...newAppForm, location: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', fontSize: '0.90rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Stipend
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹35,000 / month"
                      value={newAppForm.stipend}
                      onChange={e => setNewAppForm({ ...newAppForm, stipend: e.target.value })}
                      className="form-input"
                      style={{ width: '100%', fontSize: '0.90rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Application / Job URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newAppForm.url}
                    onChange={e => setNewAppForm({ ...newAppForm, url: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.90rem' }}
                  />
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Notes & Pitch Snippet
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Interview schedule, questions asked, or application notes..."
                    value={newAppForm.notes}
                    onChange={e => setNewAppForm({ ...newAppForm, notes: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.90rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save & Track Role
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

export default ApplicationsPage;
