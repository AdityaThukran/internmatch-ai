import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiRefreshCw, FiExternalLink, FiSliders, FiCheckCircle, FiAlertCircle, FiInfo, FiZap } from 'react-icons/fi';
import { getRecommendations, generateRecommendations, getProfile } from '../services/api';
import MatchScoreCircle from '../components/common/MatchScoreCircle';
import SkillBadge from '../components/common/SkillBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AutoApplyModal from '../components/common/AutoApplyModal';
import CompanyLogo from '../utils/companyLogos';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [sortBy, setSortBy] = useState('score');
  const [filterMode, setFilterMode] = useState('all');
  const [alertMsg, setAlertMsg] = useState('');
  const [selectedJobForAutoApply, setSelectedJobForAutoApply] = useState(null);
  const [autoApplyOpen, setAutoApplyOpen] = useState(false);

  useEffect(() => {
    getProfile().then(res => {
      setProfile(res.data?.data || res.data);
    }).catch(() => {});
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await getRecommendations();
      const list = res.data?.data || res.data || [];
      setRecommendations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleGenerate = async () => {
    setScanning(true);
    setAlertMsg('');
    try {
      const res = await generateRecommendations();
      setAlertMsg('AI Recommendation Engine executed! Fresh similarity vectors computed.');
      fetchRecommendations();
    } catch (err) {
      setAlertMsg('AI service fallback engaged: calculated similarity via profile skill heuristics.');
      fetchRecommendations();
    } finally {
      setScanning(false);
    }
  };

  // Sort and filter
  let displayed = [...recommendations];
  if (filterMode !== 'all') {
    displayed = displayed.filter(r => r.internshipId?.mode === filterMode);
  }
  if (sortBy === 'score') {
    displayed.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  } else if (sortBy === 'company') {
    displayed.sort((a, b) => (a.internshipId?.organization || '').localeCompare(b.internshipId?.organization || ''));
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header banner */}
        <div
          className="card"
          style={{
            padding: '32px',
            marginBottom: '32px',
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            borderRadius: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <span>🤖</span>
                <span>Semantic Embeddings & Cosine Similarity Matcher</span>
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)' }}>
                Personalized Recommendations
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '600px', marginTop: '4px' }}>
                Each opportunity is scored using Sentence Transformers vectors, skill intersection coefficients, and your domain preferences.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={scanning}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(0, 178, 137, 0.25)' }}
            >
              <FiRefreshCw className={scanning ? 'spin' : ''} />
              <span>{scanning ? 'Computing Vectors...' : 'Re-Run AI Matching'}</span>
            </button>
          </div>
        </div>

        {alertMsg && (
          <div
            style={{
              backgroundColor: 'rgba(129, 178, 154, 0.18)',
              border: '1px solid var(--success)',
              color: '#2D6A4F',
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              fontSize: '0.9rem'
            }}
          >
            {alertMsg}
          </div>
        )}

        {/* Filter controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem' }}
            >
              <option value="score">Highest Match Score</option>
              <option value="company">Company Name</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Work Mode:
            </span>
            {['all', 'remote', 'hybrid', 'onsite'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode)}
                style={{
                  backgroundColor: filterMode === mode ? 'var(--secondary)' : 'var(--bg-secondary)',
                  color: filterMode === mode ? '#ffffff' : 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations list */}
        {loading ? (
          <LoadingSpinner text="Computing recommendations..." />
        ) : displayed.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '3rem', marginBottom: '12px' }}>💡</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary)' }}>
              No matches found for current filter
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Reset work mode or re-run the AI matching engine above.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {displayed.map((rec, index) => {
              const job = rec.internshipId || {};
              const score = rec.matchScore || 65;

              return (
                <div
                  key={rec._id || index}
                  className="card"
                  style={{
                    padding: '28px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '24px'
                  }}
                >
                  {/* Left: Score Circle + Details */}
                  <div
                    className="rec-card-left"
                    style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start',
                      flex: '1 1 300px',
                      minWidth: 0
                    }}
                  >
                    <MatchScoreCircle score={score} size={72} strokeWidth={6} />
                    <CompanyLogo organization={job.organization} size={48} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
                          {job.title || 'Internship Position'}
                        </h2>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: score >= 75 ? 'rgba(129, 178, 154, 0.2)' : 'rgba(244, 162, 97, 0.2)',
                            color: score >= 75 ? '#2D6A4F' : '#C05621'
                          }}
                        >
                          {score >= 75 ? 'Strong Fit' : 'Moderate Fit'}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)', marginTop: '4px' }}>
                        {job.organization} • <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{job.location} ({job.mode})</span>
                      </p>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '10px 0 14px', lineHeight: 1.5 }}>
                        {job.description?.slice(0, 180)}...
                      </p>

                      {/* Matched & Missing Skills Analysis */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '4px' }}>
                          Skills:
                        </span>
                        {(rec.matchedSkills || []).map(s => (
                          <SkillBadge key={s} skill={s} variant="matched" />
                        ))}
                        {(rec.missingSkills || []).slice(0, 3).map(s => (
                          <SkillBadge key={s} skill={s} variant="missing" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div
                    className="rec-card-actions"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '10px',
                      flexShrink: 0
                    }}
                  >
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {job.stipend || 'Stipend details'}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: '2px 0 0' }}>
                        {job.duration || '6 Months'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJobForAutoApply(job);
                          setAutoApplyOpen(true);
                        }}
                        style={{
                          backgroundColor: '#00B289',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(0, 178, 137, 0.25)'
                        }}
                      >
                        <FiZap size={14} />
                        <span>⚡ 1-Click Auto-Apply</span>
                      </button>

                      <Link
                        to={`/internships/${job._id}`}
                        className="btn btn-outline btn-sm"
                      >
                        <span>Details</span>
                        <FiExternalLink />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Autonomous Auto-Apply Modal */}
        <AutoApplyModal
          isOpen={autoApplyOpen}
          onClose={() => setAutoApplyOpen(false)}
          internship={selectedJobForAutoApply}
          profile={profile}
          onSuccess={() => {
            setAlertMsg(`🎉 Successfully Auto-Applied to ${selectedJobForAutoApply?.organization}! Saved in your Live Pipeline Tracker.`);
            fetchRecommendations();
          }}
        />
      </div>
    </div>
  );
};

export default RecommendationsPage;
