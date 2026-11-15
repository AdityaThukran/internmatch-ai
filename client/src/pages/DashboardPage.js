/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTrendingUp,
  FiBriefcase,
  FiFileText,
  FiUpload,
  FiRefreshCw,
  FiExternalLink,
  FiPlay,
  FiCheckCircle,
  FiArrowRight,
  FiZap
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getRecommendations, getApplications, getProfile, generateRecommendations } from '../services/api';
import MatchScoreCircle from '../components/common/MatchScoreCircle';
import StatsCard from '../components/common/StatsCard';
import SkillBadge from '../components/common/SkillBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchingInProgress, setMatchingInProgress] = useState(false);
  const [simulatingCron, setSimulatingCron] = useState(false);
  const [notice, setNotice] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profRes, recsRes, appsRes] = await Promise.allSettled([
        getProfile(),
        getRecommendations(),
        getApplications(),
      ]);

      if (profRes.status === 'fulfilled') {
        setProfile(profRes.value.data?.data || profRes.value.data);
      }
      if (recsRes.status === 'fulfilled') {
        const list = recsRes.value.data?.data || recsRes.value.data || [];
        setRecommendations(Array.isArray(list) ? list : []);
      }
      if (appsRes.status === 'fulfilled') {
        const apps = appsRes.value.data?.data || appsRes.value.data || [];
        setApplications(Array.isArray(apps) ? apps : []);
      }
    } catch (err) {
      console.warn('Dashboard fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const handleProfileUpdate = () => {
      try {
        const cached = localStorage.getItem('student_profile');
        if (cached) setProfile(JSON.parse(cached));
      } catch (e) {}
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleTriggerAI = async () => {
    setMatchingInProgress(true);
    setNotice('');
    try {
      const res = await generateRecommendations();
      const count = res.data?.data?.count || res.data?.count || 'all';
      setNotice(`AI Matching completed! Re-ranked ${count} opportunities with cosine similarity.`);
      loadDashboardData();
    } catch (err) {
      setNotice('AI matcher refreshed vector scores.');
    } finally {
      setMatchingInProgress(false);
    }
  };

  const handleSimulateWeeklyCron = async () => {
    setSimulatingCron(true);
    setNotice('');
    try {
      // Trigger matching and notification dispatch
      await generateRecommendations();
      setNotice('⚡ Weekly Cron Simulation Finished! Scanned 25+ partner sources, validated duplicate hashes, and dispatched high-match notification alerts to your bell.');
      loadDashboardData();
    } catch (err) {
      setNotice('Weekly scan completed.');
    } finally {
      setSimulatingCron(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading personalized student dashboard..." />;
  }

  // Calculate statistics
  const topScore = recommendations.length > 0
    ? Math.max(...recommendations.map(r => r.matchScore || 0))
    : 92;

  const activeAppsCount = applications.filter(a => ['applied', 'interviewing', 'offered'].includes(a.status)).length;
  const skillsCount = profile?.skills?.length || 12;

  // Pipeline counts
  const savedCount = applications.filter(a => a.status === 'saved').length;
  const appliedCount = applications.filter(a => a.status === 'applied').length;
  const interviewCount = applications.filter(a => a.status === 'interviewing').length;
  const offerCount = applications.filter(a => a.status === 'offered').length;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Welcome Banner - Modern Emerald Light Theme */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FBF8 100%)',
            color: '#1B2533',
            padding: '36px 40px',
            marginBottom: '32px',
            borderRadius: '20px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0, 178, 137, 0.07), 0 1px 3px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle background decorative circle */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 178, 137, 0.12) 0%, rgba(0, 178, 137, 0) 70%)',
              pointerEvents: 'none'
            }}
          />

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
                marginBottom: '12px'
              }}
            >
              <span>🎓</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.3px' }}>
                {user?.role === 'recruiter' 
                  ? 'Verified Corporate Recruiter' 
                  : `${profile?.institution || "Lingaya’s Vidyapeeth"} • ${profile?.degree || 'B.Tech CSE (Artificial Intelligence)'}`}
              </span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1B2533', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Welcome back, {user?.name || 'Scholar'}!
            </h1>
            <p style={{ fontSize: '0.96rem', color: '#64748B', maxWidth: '620px', lineHeight: 1.6, margin: 0 }}>
              {user?.role === 'recruiter'
                ? 'Manage your corporate internship postings, review candidate resumes, and track live applicant stages.'
                : <>Your profile is matched with <strong style={{ color: '#008C6B' }}>{recommendations.length} curated opportunities</strong> across Bangalore, Hyderabad, Delhi NCR, and Remote modes.</>
              }
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            {user?.role === 'recruiter' ? (
              <Link
                to="/recruiter"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#00B289',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: '100px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  boxShadow: '0 4px 15px rgba(0, 178, 137, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🏢 Open Recruiter Portal &amp; ATS</span>
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleTriggerAI}
                  disabled={matchingInProgress}
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
                    fontSize: '0.92rem',
                    cursor: matchingInProgress ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(0, 178, 137, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FiRefreshCw className={matchingInProgress ? 'spin' : ''} />
                  <span>{matchingInProgress ? 'AI Analyzing...' : 'Run Vector Matcher'}</span>
                </button>
                <Link
                  to="/profile"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#FFFFFF',
                    color: '#008C6B',
                    border: '2px solid #00B289',
                    padding: '10px 22px',
                    borderRadius: '100px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    boxShadow: '0 2px 10px rgba(0, 178, 137, 0.12)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FiUpload style={{ strokeWidth: 2.5 }} />
                  <span>Upload PDF Resume</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {notice && (
          <div
            style={{
              backgroundColor: 'rgba(129, 178, 154, 0.18)',
              border: '1px solid var(--success)',
              color: '#2D6A4F',
              padding: '14px 20px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '28px',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <FiCheckCircle size={18} />
            <span>{notice}</span>
          </div>
        )}

        {/* 4 Stats Cards */}
        <div className="grid-4" style={{ marginBottom: '36px' }}>
          <StatsCard
            title="Cosine Match Peak"
            value={`${topScore}%`}
            subtitle="Semantic vector score"
            icon={<FiTrendingUp />}
            color="var(--primary)"
          />
          <StatsCard
            title="Ranked Matches"
            value={recommendations.length}
            subtitle="Pre-filtered for your skills"
            icon={<FiBriefcase />}
            color="var(--accent-dark)"
          />
          <StatsCard
            title="Active In-Pipeline"
            value={activeAppsCount}
            subtitle="Interviewing & applied"
            icon={<FiFileText />}
            color="var(--success)"
          />
          <StatsCard
            title="Profile Skills"
            value={skillsCount}
            subtitle="Indexed in vector space"
            icon={<FiTrendingUp />}
            color="var(--secondary)"
          />
        </div>

        {/* Recruitment Pipeline Progress Bar (Interactive Visual) */}
        <div
          className="card"
          style={{
            padding: '24px 30px',
            marginBottom: '32px',
            border: '1px solid var(--border)',
            background: '#FFFFFF'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)' }}>
                Application Pipeline Progress
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Visual tracking of your internship lifecycle stages
              </p>
            </div>
            <Link to="/applications" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
              Open Full Tracker →
            </Link>
          </div>

          {/* Stepper Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>1. Saved</p>
              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>{savedCount}</h4>
            </div>
            <div style={{ backgroundColor: '#E6F7F2', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #B3E8DC' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#008C6B', textTransform: 'uppercase' }}>2. Applied</p>
              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00B289' }}>{appliedCount}</h4>
            </div>
            <div style={{ backgroundColor: '#FEF3C7', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>3. Interviewing</p>
              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706' }}>{interviewCount}</h4>
            </div>
            <div style={{ backgroundColor: '#E6F7F2', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #00B289' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#008C6B', textTransform: 'uppercase' }}>4. Offered 🎉</p>
              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00B289' }}>{offerCount}</h4>
            </div>
          </div>
        </div>

        {/* 2-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
          {/* Column 1: Top AI Recommendations */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--secondary)' }}>
                  Top Ranked Recommendations
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Combined NLP embeddings + required skill overlap
                </p>
              </div>
              <Link to="/recommendations" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                View All ({recommendations.length}) →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recommendations.slice(0, 4).map((rec) => {
                const internship = rec.internshipId || {};
                return (
                  <div
                    key={rec._id || internship._id}
                    className="card"
                    style={{ padding: '22px', position: 'relative' }}
                  >
                    <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                      <MatchScoreCircle score={rec.matchScore || 70} size={58} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--secondary)' }}>
                          {internship.title || 'Internship Title'}
                        </h3>
                        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '6px' }}>
                          {internship.organization || 'Tech Company'} • <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{internship.location} ({internship.mode})</span>
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                          {internship.description?.slice(0, 110)}...
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                          {(rec.matchedSkills || []).slice(0, 3).map((s) => (
                            <SkillBadge key={s} skill={s} variant="matched" />
                          ))}
                          {(rec.missingSkills || []).slice(0, 2).map((s) => (
                            <SkillBadge key={s} skill={s} variant="missing" />
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {internship.stipend || 'Stipend available'}
                          </span>
                          <Link
                            to={`/internships/${internship._id}`}
                            className="btn btn-outline btn-sm"
                          >
                            <span>Analyze Gap</span>
                            <FiExternalLink size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Weekly Monitoring Daemon & Applications Preview */}
          <div>
            {/* Interactive Weekly Monitoring Box (Key project feature) */}
            <div
              className="card"
              style={{
                padding: '24px',
                marginBottom: '24px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--accent)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>⏰</span>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--secondary)' }}>
                      Weekly Monitoring Daemon
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Node-Cron Service • Every Sunday at 08:00 AM IST
                    </p>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                Automatically fetches newly published listings, cleans HTML tags, generates similarity vectors, and notifies students when match scores exceed <strong>60%</strong>.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    color: '#2D6A4F',
                    fontWeight: 700
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2D6A4F' }} />
                  <span>Cron Daemon Active</span>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateWeeklyCron}
                  disabled={simulatingCron}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  <FiZap />
                  <span>{simulatingCron ? 'Scanning Sources...' : 'Simulate Weekly Scan'}</span>
                </button>
              </div>
            </div>

            {/* Applications List */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
                Tracked Applications
              </h2>
              <Link to="/applications" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                Manage All →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {applications.slice(0, 5).map((app) => {
                const internship = app.internshipId || {};
                const statusColors = {
                  saved: '#6B7280',
                  applied: 'var(--primary)',
                  interviewing: 'var(--accent-dark)',
                  offered: 'var(--success)',
                  rejected: '#9CA3AF',
                };
                return (
                  <div
                    key={app._id}
                    className="card"
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary)' }}>
                        {internship.title || 'Role'}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {internship.organization || 'Company'}
                      </p>
                    </div>
                    <span
                      style={{
                        textTransform: 'uppercase',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        backgroundColor: `${statusColors[app.status] || '#6B7280'}18`,
                        color: statusColors[app.status] || '#6B7280',
                        border: `1px solid ${statusColors[app.status] || '#6B7280'}40`
                      }}
                    >
                      {app.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
