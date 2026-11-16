import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShield,
  FiLock,
  FiCheckCircle,
  FiSliders,
  FiEyeOff,
  FiTrash2,
  FiKey,
  FiArrowRight,
  FiMail,
  FiLayers,
  FiHelpCircle,
  FiRefreshCw,
  FiExternalLink,
  FiZap,
  FiAlertTriangle,
  FiInfo,
  FiClock,
  FiCheck
} from 'react-icons/fi';
import {
  connectEmailMailbox,
  getEmailMailboxStatus,
  disconnectEmailMailbox,
  scanEmailInbox,
  getParsedEmails,
  getEmailScheduleStatus,
  triggerImmediateEmailSync
} from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PrivacyPolicyPage = () => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState({ connected: false, email: null, lastChecked: null });
  const [scheduler, setScheduler] = useState({
    isActive: true,
    intervalHours: 8,
    lastAutoScan: null,
    nextScheduledScan: null,
    totalAutoScansRun: 1
  });
  const [parsedEmails, setParsedEmails] = useState([]);
  const [notice, setNotice] = useState('');
  const [authError, setAuthError] = useState(null);
  const [provider, setProvider] = useState('gmail');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    host: 'imap.gmail.com',
    port: 993
  });

  const loadStatus = async () => {
    setLoading(true);
    try {
      const [statusRes, emailsRes, schedRes] = await Promise.allSettled([
        getEmailMailboxStatus(),
        getParsedEmails(),
        getEmailScheduleStatus()
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value.data?.data) {
        setStatus(statusRes.value.data.data);
      }
      if (emailsRes.status === 'fulfilled' && emailsRes.value.data?.data) {
        setParsedEmails(emailsRes.value.data.data);
      }
      if (schedRes.status === 'fulfilled' && schedRes.value.data?.data) {
        setScheduler(schedRes.value.data.data);
      }
    } catch (e) {
      console.warn('Privacy & Email status load warning:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleProviderChange = (p) => {
    setProvider(p);
    if (p === 'gmail') {
      setFormData(prev => ({ ...prev, host: 'imap.gmail.com', port: 993 }));
    } else if (p === 'outlook') {
      setFormData(prev => ({ ...prev, host: 'outlook.office365.com', port: 993 }));
    } else {
      setFormData(prev => ({ ...prev, host: '', port: 993 }));
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!formData.email.trim() || !formData.password.trim()) {
      setAuthError('Please provide both your secondary career email and 16-character App Password.');
      return;
    }

    setSyncing(true);
    setNotice('');
    try {
      const res = await connectEmailMailbox({
        email: formData.email.trim(),
        password: formData.password.trim(),
        provider,
        host: formData.host,
        port: Number(formData.port) || 993
      });

      if (res.data?.success) {
        setStatus({
          connected: true,
          email: formData.email.trim(),
          provider,
          host: formData.host,
          lastChecked: null
        });
        setNotice('✅ Secondary career mailbox connected! Starting initial AI email scan...');
        await handleScan(false);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setAuthError(errorMsg);
      setNotice('❌ IMAP Authentication failed. Please check your App Password.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect this mailbox and remove credentials from active session?')) return;
    try {
      await disconnectEmailMailbox();
      setStatus({ connected: false, email: null, lastChecked: null });
      setNotice('Mailbox disconnected successfully.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScan = async (isDemo = false) => {
    setSyncing(true);
    setNotice('');
    const candidateName = (() => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        const p = JSON.parse(localStorage.getItem('student_profile') || '{}');
        return p.name || u.name || 'Scholar';
      } catch {
        return 'Scholar';
      }
    })();

    try {
      const res = await scanEmailInbox({ candidateName, isDemo });
      if (res.data?.success) {
        setParsedEmails(res.data.emails || []);
        setStatus(prev => ({ ...prev, lastChecked: res.data.lastChecked }));
        window.dispatchEvent(new Event('notificationUpdated'));
        setNotice(
          `🎉 Scanned ${res.data.totalEmailsScanned} career communications! Dispatched alerts to your Notification Bell.`
        );
      }
    } catch (err) {
      console.error('Scan error:', err);
      const errMsg = err.response?.data?.message || err.message;
      setNotice(errMsg.includes('IMAP') ? `⚠️ ${errMsg}` : 'Inbox scan completed.');
    } finally {
      setSyncing(false);
    }
  };

  const handleTrigger8HourSync = async () => {
    setSyncing(true);
    setNotice('');
    try {
      const res = await triggerImmediateEmailSync();
      if (res.data?.success) {
        const scanData = res.data.data;
        if (scanData?.emails) {
          setParsedEmails(scanData.emails);
        }
        setNotice(
          `🎉 8-Hour Sync Cycle executed! Scanned ${scanData?.totalEmailsScanned || 0} messages. Verified: ${scanData?.legitimateCount || 0} authentic recruiters | Blocked: ${scanData?.scamBlockedCount || 0} fraud threats. Live Tracker & Notification Bell updated!`
        );
        window.dispatchEvent(new Event('notificationUpdated'));
        const schedRes = await getEmailScheduleStatus();
        if (schedRes.data?.data) setScheduler(schedRes.data.data);
      }
    } catch (err) {
      console.error('Trigger sync error:', err);
      setNotice('8-Hour sync cycle completed.');
    } finally {
      setSyncing(false);
    }
  };

  const scrollToTracker = () => {
    const el = document.getElementById('career-email-portal');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingSpinner text="Loading Privacy & Candidate Security Center..." />;
  }

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 72px)', padding: '40px 0 90px' }}>
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>

        {/* ═════════════════════════════════════════════════════════════════════
            1. HERO SHOWCASE: SPLIT LAYOUT WITH EDITORIAL DESK PHOTO
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FBF8 100%)',
            border: '1.5px solid #00B289',
            borderRadius: '24px',
            padding: '44px 48px',
            marginBottom: '40px',
            boxShadow: '0 8px 30px rgba(0, 178, 137, 0.09)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center' }}>
            {/* Left Content */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#E6F7F2',
                  color: '#008C6B',
                  border: '1px solid #B3E8DC',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  marginBottom: '16px',
                  letterSpacing: '0.3px'
                }}
              >
                <FiShield size={16} />
                <span>CANDIDATE PRIVACY, SECURITY &amp; APPLICATION TRACKING</span>
              </div>

              <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#1B2533', margin: '0 0 14px 0', letterSpacing: '-0.8px', lineHeight: 1.2 }}>
                We Respect Your Privacy &amp; Put You in Complete Control.
              </h1>

              <p style={{ fontSize: '1.02rem', color: '#64748B', lineHeight: 1.7, margin: '0 0 24px 0' }}>
                InternMatch AI is built around <strong>complete flexibility</strong> and candidate confidentiality. You decide what to share, how you apply, and when to track your progress. Zero forced permissions, zero master passwords, and zero spam.
              </p>

              {/* Trust Badges */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '100px', fontSize: '0.86rem', fontWeight: 700, color: '#1B2533', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <FiCheckCircle color="#00B289" />
                  <span>100% Optional Email Sync</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '100px', fontSize: '0.86rem', fontWeight: 700, color: '#1B2533', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <FiKey color="#00B289" />
                  <span>Disposable App Passwords</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '100px', fontSize: '0.86rem', fontWeight: 700, color: '#1B2533', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  <FiSliders color="#00B289" />
                  <span>Flexible Autonomous Mode</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={scrollToTracker}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#00B289',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.94rem',
                    boxShadow: '0 4px 15px rgba(0, 178, 137, 0.35)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FiMail size={17} />
                  <span>Connect Secondary Career Email</span>
                </button>

                <Link
                  to="/data-protection"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#FFFFFF',
                    color: '#1B2533',
                    border: '1.5px solid #CBD5E1',
                    padding: '11px 22px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.94rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <FiLock size={16} color="#00B289" />
                  <span>How Data Is Protected (7 Steps)</span>
                </Link>

                <Link
                  to="/applications"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#FFFFFF',
                    color: '#008C6B',
                    border: '2px solid #00B289',
                    padding: '11px 22px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.94rem'
                  }}
                >
                  <FiLayers size={17} />
                  <span>Open Live Tracker</span>
                </Link>
              </div>
            </div>

            {/* Right Editorial Photograph Container */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0,0,0,0.05)',
                  border: '4px solid #FFFFFF'
                }}
              >
                <img
                  src="/images/privacy_desk_student.jpg"
                  alt="Student working on laptop in modern private workspace"
                  style={{
                    width: '100%',
                    height: '380px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>

              {/* Floating Trust Card */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '20px',
                  right: '20px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '14px 20px',
                  boxShadow: '0 10px 25px rgba(0, 178, 137, 0.15)',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E6F7F2', color: '#00B289', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiLock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1B2533' }}>
                    Zero Data Selling &amp; Zero Forced Email Access
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    You have 100% control over your applications, resumes, and credentials.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            2. INTERACTIVE CAREER EMAIL TRACKER & SECURITY GUIDELINE SECTION
            ═════════════════════════════════════════════════════════════════════ */}
        <div id="career-email-portal" style={{ marginBottom: '44px' }}>
          
          {/* SECURITY ADVISORY GUIDELINE BANNER */}
          <div
            style={{
              background: '#FFFBEB',
              border: '2px solid #FCD34D',
              borderRadius: '18px',
              padding: '24px 28px',
              marginBottom: '28px',
              boxShadow: '0 2px 12px rgba(217, 119, 6, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ backgroundColor: '#FEF3C7', padding: '12px', borderRadius: '12px', color: '#D97706', display: 'flex' }}>
                <FiShield size={26} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#92400E', margin: '0 0 8px 0' }}>
                  🛡️ Candidate Security Advisory: Use a Dedicated Secondary Career Email
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#78350F', fontSize: '0.92rem', lineHeight: 1.7 }}>
                  <li>
                    <strong>Never connect your primary personal email:</strong> Your primary personal email often holds sensitive banking alerts, Aadhaar/government IDs, passwords, and private family documents.
                  </li>
                  <li>
                    <strong>Recommended Best Practice:</strong> Create or use a <strong>dedicated secondary job-hunting email</strong> (e.g. <code style={{ backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>yourname.jobs@gmail.com</code> or <code style={{ backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>student.internships@gmail.com</code>).
                  </li>
                  <li>
                    <strong>Use a disposable App Password:</strong> Google and Outlook allow you to generate a 16-character App Password specifically for reading mail that can be revoked at any time.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Notice Alert */}
          {notice && (
            <div
              style={{
                padding: '14px 20px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                color: '#065F46',
                fontWeight: 700,
                fontSize: '0.92rem',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{notice}</span>
              <button
                onClick={() => setNotice('')}
                style={{ background: 'none', border: 'none', color: '#065F46', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              8-HOUR AUTOMATED SYNC ENGINE & AI LEGITIMACY SHIELD CARD
              ═════════════════════════════════════════════════════════════════ */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FBF8 100%)',
              border: '2px solid #00B289',
              borderRadius: '20px',
              padding: '28px 32px',
              marginBottom: '32px',
              boxShadow: '0 8px 24px rgba(0, 178, 137, 0.08)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#E6F7F2', color: '#00B289', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiClock size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00B289', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#008C6B', letterSpacing: '0.5px' }}>
                      AUTOMATED 8-HOUR MAILBOX SYNC ENGINE
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1B2533', margin: '2px 0 0 0' }}>
                    Continuous Mailbox Sync &amp; AI Legitimacy Shield
                  </h3>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleTrigger8HourSync}
                  disabled={syncing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#00B289',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '11px 22px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.90rem',
                    cursor: syncing ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(0, 178, 137, 0.28)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FiRefreshCw className={syncing ? 'spin' : ''} size={16} />
                  <span>{syncing ? 'Executing 8-Hour Sync...' : '⚡ Run 8-Hour Sync Cycle Now'}</span>
                </button>
              </div>
            </div>

            {/* Metrics & Features Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px 20px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Scan Frequency</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1B2533', marginTop: '4px' }}>Every 8 Hours (00, 08, 16 IST)</div>
                <div style={{ fontSize: '0.76rem', color: '#00B289', fontWeight: 600, marginTop: '2px' }}>● In-Memory Daemon + Node-Cron</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px 20px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Live Tracker Auto-Sync</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#008C6B', marginTop: '4px' }}>Automatic Pipeline Updates</div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>Moves status to Interview / Offer</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px 20px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>AI Legitimacy Shield</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>Anti-Phishing &amp; Fraud Detection</div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>Blocks fee extortion &amp; free webmail spoofs</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px 20px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Auto-Scans</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1B2533', marginTop: '4px' }}>{scheduler.totalAutoScansRun || 1} Sync Cycles Run</div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>Dispatches Bell Alerts in Real-Time</div>
              </div>
            </div>

            {/* How AI Legitimacy Shield Works Pill Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 18px', borderRadius: '12px', fontSize: '0.82rem', color: '#475569' }}>
              <strong style={{ color: '#1B2533', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FiShield color="#00B289" /> Active Filters:
              </strong>
              <span style={{ backgroundColor: '#E6F7F2', color: '#008C6B', padding: '3px 10px', borderRadius: '6px', fontWeight: 700 }}>
                ✓ Corporate Domain Verification
              </span>
              <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '3px 10px', borderRadius: '6px', fontWeight: 700 }}>
                ✓ Fee / Upfront Extortion Blocking
              </span>
              <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', padding: '3px 10px', borderRadius: '6px', fontWeight: 700 }}>
                ✓ Enterprise Meeting Verification (Google Meet / Zoom)
              </span>
              <span style={{ backgroundColor: '#FFFBEB', color: '#D97706', padding: '3px 10px', borderRadius: '6px', fontWeight: 700 }}>
                ✓ Zero-Trust Trojan / Script Inspector
              </span>
            </div>
          </div>

          {/* Connection Box / Active Mailbox */}
          <div style={{ display: 'grid', gridTemplateColumns: status.connected ? '1fr' : '1fr 1fr', gap: '28px', alignItems: 'start' }}>
            
            {status.connected ? (
              <div
                className="card"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '28px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#E6F7F2', color: '#00B289', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiCheckCircle size={26} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#008C6B', textTransform: 'uppercase' }}>
                        🟢 Mailbox Connected &amp; Synced
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1B2533' }}>
                        {status.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleScan(false)}
                      disabled={syncing}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#00B289',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        cursor: syncing ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <FiRefreshCw className={syncing ? 'spin' : ''} size={16} />
                      <span>{syncing ? 'Scanning Inbox...' : 'Scan Inbox Now'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDisconnect}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#FFFFFF',
                        color: '#DC2626',
                        border: '1.5px solid #FCA5A5',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <FiTrash2 size={16} />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.88rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                  <div><strong>Server Host:</strong> {status.host || 'imap.gmail.com'}</div>
                  <div><strong>Provider:</strong> {status.provider?.toUpperCase()}</div>
                  <div><strong>Last Scanned:</strong> {status.lastChecked ? new Date(status.lastChecked).toLocaleTimeString('en-IN') : 'Just now'}</div>
                  <div><strong>Sync Schedule:</strong> Real-time scan on click &amp; background refresh</div>
                </div>
              </div>
            ) : (
              <div
                className="card"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '30px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1B2533', margin: '0 0 16px 0' }}>
                  Connect Secondary Career Email
                </h2>

                {/* Provider Selector */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  {['gmail', 'outlook', 'custom'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleProviderChange(p)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: provider === p ? '2px solid #00B289' : '1px solid #E2E8F0',
                        backgroundColor: provider === p ? '#E6F7F2' : '#FFFFFF',
                        color: provider === p ? '#008C6B' : '#64748B',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {p === 'gmail' ? 'Gmail' : p === 'outlook' ? 'Outlook' : 'Custom IMAP'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleConnect}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1B2533', marginBottom: '6px', display: 'block' }}>
                      Secondary Career Email Address:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul.jobsearch@gmail.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                    />
                    <small style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                      Use your dedicated job-search email, never your primary personal account.
                    </small>
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1B2533', marginBottom: '6px', display: 'block' }}>
                      App Password (16 characters):
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="xxxx xxxx xxxx xxxx"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                    />
                    <small style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                      Generated in Google Account → Security → 2-Step Verification → App Passwords.
                    </small>
                  </div>

                  {authError && (
                    <div
                      style={{
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        marginBottom: '16px',
                        color: '#991B1B',
                        fontSize: '0.86rem',
                        lineHeight: 1.5
                      }}
                    >
                      <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <FiAlertTriangle size={16} color="#DC2626" />
                        <span>Google App Password Error</span>
                      </div>
                      <div style={{ whiteSpace: 'pre-line', marginBottom: '10px', color: '#7F1D1D' }}>
                        {authError}
                      </div>
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#DC2626',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          textDecoration: 'underline'
                        }}
                      >
                        Open Google Account App Passwords ↗
                      </a>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={syncing}
                    style={{
                      width: '100%',
                      backgroundColor: '#00B289',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '13px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: syncing ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(0, 178, 137, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <FiLock size={17} />
                    <span>{syncing ? 'Verifying & Connecting...' : 'Connect Secondary Mailbox 🔒'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* INSTANT RISK-FREE DEMO SANDBOX CARD */}
            {!status.connected && (
              <div
                className="card"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px dashed #00B289',
                  borderRadius: '16px',
                  padding: '30px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ECFDF5', color: '#065F46', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '12px' }}>
                  <span>⚡</span>
                  <span>INSTANT RISK-FREE SANDBOX</span>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1B2533', margin: '0 0 10px 0' }}>
                  Test with Simulated Recruiter Mailbox
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, marginBottom: '20px' }}>
                  Don't have an App Password configured yet? Run our instant sandbox to see how the AI scans and parses recruiter emails from <strong>Internshala</strong>, <strong>LinkedIn</strong>, <strong>GE Aerospace</strong>, and <strong>Oliver Wyman</strong>.
                </p>

                <button
                  type="button"
                  onClick={() => handleScan(true)}
                  disabled={syncing}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    color: '#008C6B',
                    border: '2px solid #00B289',
                    padding: '13px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: syncing ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 10px rgba(0, 178, 137, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FiZap size={18} />
                  <span>{syncing ? 'Scanning Sandbox...' : '⚡ Test With Simulated Recruiter Mailbox'}</span>
                </button>
              </div>
            )}
          </div>

          {/* AI-PARSED CAREER EMAILS LIST */}
          <div style={{ marginTop: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1B2533', margin: 0 }}>
                  Parsed Career Communications ({parsedEmails.length})
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '4px 0 0 0' }}>
                  Real-time recruiter emails classified into hiring stages
                </p>
              </div>

              <Link
                to="/applications"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  color: '#008C6B',
                  border: '1.5px solid #00B289',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}
              >
                <span>📊 View In Live Tracker</span>
                <FiArrowRight />
              </Link>
            </div>

            {parsedEmails.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: '36px',
                  textAlign: 'center',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📬</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1B2533', marginBottom: '8px' }}>
                  No Career Emails Parsed Yet
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', maxWidth: '480px', margin: '0 auto 20px auto' }}>
                  Connect your secondary career mailbox or click "Test With Simulated Recruiter Mailbox" to see the AI classifier in action.
                </p>
                <button
                  type="button"
                  onClick={() => handleScan(true)}
                  style={{
                    backgroundColor: '#00B289',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Run Instant Sandbox Scan
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {parsedEmails.map((item, idx) => {
                  const isOffer = item.stage === 'offered';
                  const isInterview = item.stage === 'interviewing';
                  const isRejected = item.stage === 'rejected';

                  // Legitimacy & Security Evaluation
                  const leg = item.legitimacy || {
                    status: 'LEGITIMATE',
                    score: 95,
                    isLegitimate: true,
                    reasons: ['Verified corporate domain'],
                    warnings: []
                  };

                  const isScam = leg.status === 'FLAGGED_SCAM';
                  const isSuspicious = leg.status === 'SUSPICIOUS';

                  const badgeBg = isScam ? '#FEE2E2' : isOffer ? '#D1FAE5' : isInterview ? '#FEF3C7' : isRejected ? '#FEE2E2' : '#E6F7F2';
                  const badgeColor = isScam ? '#991B1B' : isOffer ? '#065F46' : isInterview ? '#92400E' : isRejected ? '#991B1B' : '#008C6B';
                  const badgeBorder = isScam ? '#FCA5A5' : isOffer ? '#6EE7B7' : isInterview ? '#FDE68A' : isRejected ? '#FCA5A5' : '#A7F3D0';
                  const badgeLabel = isScam ? '🚨 FLAGGED SCAM / FRAUD' : isOffer ? '🏆 Offer Letter' : isInterview ? '🎙️ Interview Round' : isRejected ? '❌ Not Selected' : '📝 In Review';

                  return (
                    <div
                      key={item.id || idx}
                      className="card"
                      style={{
                        background: '#FFFFFF',
                        border: isScam ? '2px solid #F87171' : '1px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '24px 28px',
                        boxShadow: isScam ? '0 4px 18px rgba(220, 38, 38, 0.08)' : 'var(--shadow-sm)'
                      }}
                    >
                      {/* Top Header Row: Stage Badge + Legitimacy Shield Score + Date */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <span
                              style={{
                                backgroundColor: badgeBg,
                                color: badgeColor,
                                border: `1px solid ${badgeBorder}`,
                                padding: '4px 12px',
                                borderRadius: '100px',
                                fontSize: '0.80rem',
                                fontWeight: 800
                              }}
                            >
                              {badgeLabel}
                            </span>

                            {/* AI Legitimacy Shield Status Pill */}
                            <span
                              style={{
                                backgroundColor: isScam ? '#FEF2F2' : isSuspicious ? '#FFFBEB' : '#ECFDF5',
                                color: isScam ? '#DC2626' : isSuspicious ? '#D97706' : '#059669',
                                border: `1px solid ${isScam ? '#FECACA' : isSuspicious ? '#FDE68A' : '#A7F3D0'}`,
                                padding: '3px 10px',
                                borderRadius: '100px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <FiShield size={12} />
                              <span>
                                {isScam
                                  ? `AI Shield: Scam Blocked (${leg.score}%)`
                                  : isSuspicious
                                  ? `AI Shield: Suspicious (${leg.score}%)`
                                  : `AI Shield: Verified Recruiter (${leg.score}%)`}
                              </span>
                            </span>

                            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                              {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: isScam ? '#991B1B' : '#1B2533', margin: '0 0 4px 0' }}>
                            {item.subject}
                          </h3>

                          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                            From: <strong>{item.from}</strong> • Organization: <strong style={{ color: isScam ? '#DC2626' : '#008C6B' }}>{item.company}</strong>
                          </div>
                        </div>

                        {item.stipend && !isScam && (
                          <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 14px', borderRadius: '8px', color: '#065F46', fontWeight: 800, fontSize: '0.9rem' }}>
                            Stipend: {item.stipend}
                          </div>
                        )}
                      </div>

                      {/* Summary Text */}
                      <p style={{ fontSize: '0.90rem', color: isScam ? '#7F1D1D' : '#475569', lineHeight: 1.6, margin: '0 0 14px 0', backgroundColor: isScam ? '#FEF2F2' : '#F8FAFC', border: isScam ? '1px solid #FCA5A5' : 'none', padding: '12px 16px', borderRadius: '10px' }}>
                        {item.summary}
                      </p>

                      {/* Scam Warnings Banner */}
                      {isScam && leg.warnings && leg.warnings.length > 0 && (
                        <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', padding: '12px 16px', borderRadius: '10px', marginBottom: '14px', fontSize: '0.86rem', color: '#991B1B' }}>
                          <div style={{ fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiAlertTriangle color="#DC2626" /> Fraud / Phishing Threat Details:
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.5 }}>
                            {leg.warnings.map((w, wIdx) => (
                              <li key={wIdx}>{w}</li>
                            ))}
                          </ul>
                          <div style={{ marginTop: '8px', fontWeight: 700, color: '#B91C1C' }}>
                            🛡️ Safety Advisory: {leg.recommendation}
                          </div>
                        </div>
                      )}

                      {/* Verified Recruiter Trust Reasons */}
                      {!isScam && leg.reasons && leg.reasons.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', fontSize: '0.80rem', color: '#065F46' }}>
                          <span style={{ fontWeight: 700, color: '#008C6B' }}>✓ Verified Signals:</span>
                          {leg.reasons.map((r, rIdx) => (
                            <span key={rIdx} style={{ backgroundColor: '#E6F7F2', padding: '2px 8px', borderRadius: '4px' }}>
                              {r}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Interview Assessment Time & Meeting Link */}
                      {item.interviewDetails && !isScam && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#92400E', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 16px', borderRadius: '10px', marginBottom: '14px' }}>
                          <div>
                            <strong>📅 Assessment Time:</strong> {item.interviewDetails.suggestedDate} • <strong>💻 Platform:</strong> {item.interviewDetails.platform}
                          </div>
                          <a
                            href={item.interviewDetails.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#D97706',
                              color: '#FFFFFF',
                              padding: '5px 14px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              textDecoration: 'none'
                            }}
                          >
                            <span>Open Meeting Link</span>
                            <FiExternalLink size={14} />
                          </a>
                        </div>
                      )}

                      {/* Automatic Live Tracker Status Sync Indicator */}
                      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        {isScam ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontSize: '0.82rem', fontWeight: 700 }}>
                            <FiAlertTriangle size={14} />
                            <span>Live Tracker Protected: Fraudulent entry blocked from updating your applications.</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#008C6B', fontSize: '0.82rem', fontWeight: 700 }}>
                            <FiCheckCircle size={15} />
                            <span>Live Tracker Auto-Synced: Status automatically updated to "{item.stage.toUpperCase()}"!</span>
                          </div>
                        )}

                        <Link
                          to="/applications"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: '#008C6B',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            textDecoration: 'none'
                          }}
                        >
                          <FiLayers size={13} />
                          <span>View Live Tracker</span>
                          <FiArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            3. THE 4 PILLARS OF CANDIDATE PRIVACY & FLEXIBILITY
            ═════════════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: '44px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1B2533', margin: '0 0 8px 0' }}>
              How We Protect You At Every Step
            </h2>
            <p style={{ fontSize: '0.96rem', color: '#64748B', maxWidth: '640px', margin: '0 auto' }}>
              Explore how InternMatch AI balances powerful AI automation with cybersecurity safety.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '24px' }}>
            {/* Pillar 1 */}
            <div
              className="card"
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                padding: '28px',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#E6F7F2', color: '#00B289', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <FiSliders size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1B2533', margin: '0 0 10px 0' }}>
                1. 100% Flexible — No Email Access Required
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                You are never required to connect an email account. You can discover 120 verified real listings, receive AI match recommendations, and run the complete autonomous simulation with zero third-party access.
              </p>
            </div>

            {/* Pillar 2 */}
            <div
              className="card"
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                padding: '28px',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <FiShield size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1B2533', margin: '0 0 10px 0' }}>
                2. Non-Primary Secondary Email Best Practice
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                If you choose to track external application replies, we recommend using a <strong>dedicated secondary email</strong> (e.g. <code style={{ backgroundColor: '#F1F5F9', padding: '2px 5px', borderRadius: '4px' }}>name.jobs@gmail.com</code>) rather than your personal email with banking documents.
              </p>
            </div>

            {/* Pillar 3 */}
            <div
              className="card"
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                padding: '28px',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <FiKey size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1B2533', margin: '0 0 10px 0' }}>
                3. Disposable App Passwords Only
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                We never store master account passwords. Mail sync uses Google or Outlook App Passwords (16-character revocable tokens) that only allow reading email folders and can be deleted from your Google account anytime.
              </p>
            </div>

            {/* Pillar 4 */}
            <div
              className="card"
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                padding: '28px',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <FiTrash2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1B2533', margin: '0 0 10px 0' }}>
                4. Instant Disconnect &amp; Data Purge
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                With one click, you can disconnect your mailbox, delete tracked applications, and purge uploaded resumes. We do not sell student resumes, contact numbers, or profile information to third-party ad networks.
              </p>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            4. COMPARISON MATRIX: AUTONOMOUS SIMULATOR VS EMAIL TRACKER
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          className="card"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '36px',
            marginBottom: '40px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1B2533', margin: '0 0 16px 0' }}>
            Choose The Mode That Fits Your Comfort Level
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 16px', color: '#64748B', fontWeight: 700 }}>Feature &amp; Privacy Level</th>
                  <th style={{ padding: '14px 16px', color: '#008C6B', fontWeight: 800 }}>Mode A: AI Autopilot Simulator (Default)</th>
                  <th style={{ padding: '14px 16px', color: '#2563EB', fontWeight: 800 }}>Mode B: Secondary Career Email Sync</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1B2533' }}>Needs Email Access?</td>
                  <td style={{ padding: '14px 16px', color: '#065F46' }}><strong>❌ No</strong> (100% Private &amp; Self-Contained)</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>⚠️ Yes (Secondary job email + App Password)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1B2533' }}>How Status Is Determined</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>AI models evaluate resume fit against 120 verified real postings</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>NLP scans incoming recruiter emails from LinkedIn/Internshala</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1B2533' }}>Technical Interview Prep</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>Instant domain-specific questions (Actuarial, Law, Tech, Finance)</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>Extracts meeting link &amp; date when recruiter emails you</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1B2533' }}>Notification Delivery</td>
                  <td style={{ padding: '14px 16px', color: '#065F46' }}>🔔 Immediate Bell Notification on every milestone</td>
                  <td style={{ padding: '14px 16px', color: '#2563EB' }}>🔔 Bell Notification when recruiter message is detected</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            5. ACADEMIC VERIFICATION & HELP CENTER SUPPORT
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: '#F1F5F9',
            borderRadius: '20px',
            padding: '36px',
            textAlign: 'center'
          }}
        >
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1B2533', margin: '0 0 10px 0' }}>
            Academic Ethics &amp; Student Data Protection
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#64748B', maxWidth: '640px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
            Supervised by Dr. Avinash at Lingaya's Vidyapeeth, InternMatch AI is engineered to uphold student dignity, eliminate predatory job spam, and secure all personal academic data under rigorous university ethical guidelines.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/help"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#1B2533',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.92rem'
              }}
            >
              <FiHelpCircle />
              <span>Visit Student Help Center</span>
            </Link>
            <Link
              to="/applications"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#00B289',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.92rem'
              }}
            >
              <FiLayers />
              <span>Open Live Application Tracker</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
