import React from 'react';
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
  FiHelpCircle
} from 'react-icons/fi';

const PrivacyPolicyPage = () => {
  return (
    <div className="page-wrapper" style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 72px)', padding: '40px 0 90px' }}>
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>

        {/* ═════════════════════════════════════════════════════════════════════
            1. HERO SHOWCASE: SPLIT LAYOUT WITH CUSTOM EDITORIAL IMAGE
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FBF8 100%)',
            border: '1.5px solid #00B289',
            borderRadius: '24px',
            padding: '48px',
            marginBottom: '40px',
            boxShadow: '0 8px 30px rgba(0, 178, 137, 0.09)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
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
                <span>CANDIDATE PRIVACY &amp; DATA FREEDOM</span>
              </div>

              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1B2533', margin: '0 0 14px 0', letterSpacing: '-0.8px', lineHeight: 1.2 }}>
                We Respect Your Privacy &amp; Put You in Complete Control.
              </h1>

              <p style={{ fontSize: '1.02rem', color: '#64748B', lineHeight: 1.7, margin: '0 0 24px 0' }}>
                InternMatch AI is built around <strong>complete flexibility</strong> and candidate confidentiality. You decide what to share, how you apply, and when to track your progress. Zero forced permissions, zero master passwords, and zero spam.
              </p>

              {/* Trust Badges */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
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
                <Link
                  to="/email-sync"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#00B289',
                    color: '#FFFFFF',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.94rem',
                    boxShadow: '0 4px 15px rgba(0, 178, 137, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FiMail size={17} />
                  <span>View Email Sync Settings</span>
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

            {/* Right Image Container */}
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
                    // Fallback to placeholder if asset copy is delayed
                    e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>

              {/* Floating Trust Card */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '24px',
                  right: '24px',
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
            2. THE 4 PILLARS OF CANDIDATE PRIVACY & FLEXIBILITY
            ═════════════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: '40px' }}>
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
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s ease'
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
            3. COMPARISON: AUTONOMOUS SIMULATOR VS EMAIL TRACKER
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
            4. STEP-BY-STEP SECURITY GUIDE
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
            Have Questions About Your Data Or Placement Drives?
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#64748B', maxWidth: '600px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
            Our team and academic supervisor (Dr. Avinash) ensure all research and platform data adheres to strict academic ethics and student data safety guidelines.
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
              <span>Visit Help Center</span>
            </Link>
            <Link
              to="/email-sync"
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
              <FiMail />
              <span>Configure Secondary Email</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
