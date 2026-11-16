import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMail,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiExternalLink,
  FiLock,
  FiZap,
  FiArrowRight,
  FiInfo,
  FiTrash2,
  FiAward,
  FiVideo,
  FiSend
} from 'react-icons/fi';
import {
  connectEmailMailbox,
  getEmailMailboxStatus,
  disconnectEmailMailbox,
  scanEmailInbox,
  getParsedEmails
} from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EmailSyncPage = () => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState({ connected: false, email: null, lastChecked: null });
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
      const [statusRes, emailsRes] = await Promise.allSettled([
        getEmailMailboxStatus(),
        getParsedEmails()
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value.data?.data) {
        setStatus(statusRes.value.data.data);
      }
      if (emailsRes.status === 'fulfilled' && emailsRes.value.data?.data) {
        setParsedEmails(emailsRes.value.data.data);
      }
    } catch (e) {
      console.warn('Email status load warning:', e);
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
        setNotice('✅ Secondary career mailbox connected! Starting initial AI scan...');
        // Auto-run first scan
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
      setNotice('Mailbox disconnected.');
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
          `🎉 Scanned ${res.data.totalEmailsScanned} career emails! Dispatched alerts to your Notification Bell.`
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

  if (loading) {
    return <LoadingSpinner text="Loading email tracking portal..." />;
  }

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 72px)', padding: '36px 0 90px' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

        {/* 1. Header Banner */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FBF8 100%)',
            border: '1.5px solid #00B289',
            borderRadius: '18px',
            padding: '32px 36px',
            marginBottom: '28px',
            boxShadow: '0 4px 20px rgba(0, 178, 137, 0.08)'
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#E6F7F2', color: '#008C6B', border: '1px solid #B3E8DC', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px' }}>
            <span>📬</span>
            <span>AUTOMATED CAREER EMAIL TRACKER &amp; NLP PARSER</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1B2533', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
            Email Application Tracking Portal
          </h1>
          <p style={{ fontSize: '0.96rem', color: '#64748B', maxWidth: '780px', lineHeight: 1.6, margin: 0 }}>
            Connect your job-search mailbox to automatically track incoming interview invitations, recruiter shortlist notifications, and offer letters without manually checking spam or tracking spreadsheets.
          </p>
        </div>

        {/* 2. SECURITY ADVISORY GUIDELINE BANNER (PROMINENT ZERO-RISK GUIDELINE) */}
        <div
          style={{
            background: '#FFFBEB',
            border: '2px solid #FCD34D',
            borderRadius: '16px',
            padding: '24px 28px',
            marginBottom: '32px',
            boxShadow: '0 2px 12px rgba(217, 119, 6, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ backgroundColor: '#FEF3C7', padding: '12px', borderRadius: '12px', color: '#D97706', display: 'flex' }}>
              <FiShield size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400E', margin: '0 0 8px 0' }}>
                🛡️ Important Security &amp; Privacy Advisory: Use a Dedicated Career Email
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#78350F', fontSize: '0.92rem', lineHeight: 1.7 }}>
                <li>
                  <strong>Never connect your primary personal email:</strong> Your primary personal email often contains banking alerts, Aadhaar/government IDs, passwords, and private family messages.
                </li>
                <li>
                  <strong>Recommended Best Practice:</strong> Create or use a <strong>dedicated secondary job-hunting email</strong> (e.g. <code style={{ backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>yourname.jobs@gmail.com</code> or <code style={{ backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>student.internships@gmail.com</code>).
                </li>
                <li>
                  <strong>Use an App Password instead of your master password:</strong> Google and Outlook allow you to generate a secure 16-character App Password specifically for mail access that can be revoked at any time.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Notice alert */}
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

        <div style={{ display: 'grid', gridTemplateColumns: status.connected ? '1fr' : '1fr 1fr', gap: '28px', alignItems: 'start' }}>

          {/* 3. CONNECTION CARD / ACTIVE STATUS CARD */}
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
                <div><strong>Live Status:</strong> Automatic 15-Minute Sync Active</div>
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
                    Use your dedicated job-hunt email, not your primary personal email.
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

          {/* 4. INSTANT DEMO / TESTING SANDBOX CARD */}
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
                Don't have an App Password ready right now? Run the instant sandbox to test how the AI scans and parses recruiter emails from <strong>Internshala</strong>, <strong>LinkedIn</strong>, <strong>GE Aerospace</strong>, and <strong>Oliver Wyman</strong>.
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

        {/* 5. AI-PARSED CAREER EMAILS LIST */}
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1B2533', margin: 0 }}>
                Parsed Career Communications ({parsedEmails.length})
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '4px 0 0 0' }}>
                Real-time emails parsed with our NLP stage classifier
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
              <span>📊 Open Live Tracker Pipeline</span>
              <FiArrowRight />
            </Link>
          </div>

          {parsedEmails.length === 0 ? (
            <div
              className="card"
              style={{
                padding: '40px',
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

                const badgeBg = isOffer ? '#D1FAE5' : isInterview ? '#FEF3C7' : isRejected ? '#FEE2E2' : '#E6F7F2';
                const badgeColor = isOffer ? '#065F46' : isInterview ? '#92400E' : isRejected ? '#991B1B' : '#008C6B';
                const badgeBorder = isOffer ? '#6EE7B7' : isInterview ? '#FDE68A' : isRejected ? '#FCA5A5' : '#A7F3D0';
                const badgeLabel = isOffer ? '🏆 Offer Letter' : isInterview ? '🎙️ Interview Round' : isRejected ? '❌ Not Selected' : '📝 In Review';

                return (
                  <div
                    key={item.id || idx}
                    className="card"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '22px 26px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span
                            style={{
                              backgroundColor: badgeBg,
                              color: badgeColor,
                              border: `1px solid ${badgeBorder}`,
                              padding: '3px 10px',
                              borderRadius: '100px',
                              fontSize: '0.78rem',
                              fontWeight: 800
                            }}
                          >
                            {badgeLabel}
                          </span>
                          <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                            {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1B2533', margin: '0 0 4px 0' }}>
                          {item.subject}
                        </h3>
                        <div style={{ fontSize: '0.84rem', color: '#64748B' }}>
                          From: <strong>{item.from}</strong> • Organization: <strong style={{ color: '#008C6B' }}>{item.company}</strong>
                        </div>
                      </div>

                      {item.stipend && (
                        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 14px', borderRadius: '8px', color: '#065F46', fontWeight: 800, fontSize: '0.9rem' }}>
                          Stipend: {item.stipend}
                        </div>
                      )}
                    </div>

                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: '0 0 14px 0', backgroundColor: '#F8FAFC', padding: '12px 16px', borderRadius: '10px' }}>
                      {item.summary}
                    </p>

                    {item.interviewDetails && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#92400E', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 16px', borderRadius: '8px' }}>
                        <div><strong>📅 Assessment Time:</strong> {item.interviewDetails.suggestedDate}</div>
                        <div><strong>💻 Platform:</strong> {item.interviewDetails.platform}</div>
                        <a
                          href={item.interviewDetails.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#008C6B',
                            fontWeight: 700,
                            textDecoration: 'none'
                          }}
                        >
                          <span>Open Meeting Link</span>
                          <FiExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EmailSyncPage;
