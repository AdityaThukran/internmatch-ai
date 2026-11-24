import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiShield,
  FiLock,
  FiCheckCircle,
  FiKey,
  FiFileText,
  FiCpu,
  FiMail,
  FiBell,
  FiTrash2,
  FiServer,
  FiEye,
  FiArrowRight,
  FiExternalLink,
  FiCheck,
  FiDatabase,
  FiLayers,
  FiHelpCircle
} from 'react-icons/fi';

const PROTECTION_STEPS = [
  {
    step: '01',
    title: 'Identity & Authentication',
    subtitle: 'Salted Bcrypt Hashing & Stateless JWT Authorization',
    icon: <FiKey size={24} />,
    color: '#00B289',
    bg: '#E6F7F2',
    border: '#A7F3D0',
    description:
      'When you create an account on InternMatch AI, your password is never stored in plain text. It is instantly hashed using bcrypt with 10 salt rounds before hitting our database.',
    details: [
      'Irreversible password hashing: Even system administrators cannot view your raw password.',
      'Stateless JSON Web Tokens (JWT): Secure 7-day signed tokens verify every API request without transmitting database credentials.',
      'Strict Role-Based Access Control (RBAC): Recruiter APIs, Student Profiles, and Faculty Admin controls are cryptographically partitioned.'
    ],
    technicalSpec: 'Algorithm: bcrypt (10 rounds) • Token: HMAC-SHA256 JWT • Transport: HTTPS / TLS 1.3'
  },
  {
    step: '02',
    title: 'Resume Upload & PDF Parsing',
    subtitle: 'Local In-Process Parsing with Zero Third-Party AI Data Reselling',
    icon: <FiFileText size={24} />,
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    description:
      'When you upload your PDF resume, it is parsed directly on our secure backend server to extract academic fields (Full Name, College, Degree, Skills). Your resume is never sold to marketing brokers or public data scrapers.',
    details: [
      'In-process extraction: Parsed using open-source PyMuPDF and pdf-parse within isolated server processes.',
      'No Public LLM Training: Your resume is never fed into open AI training corpora (like public OpenAI or Anthropic datasets).',
      'Editable & Verifiable: All extracted fields are displayed openly on your Profile page so you can edit, sanitize, or delete details anytime.'
    ],
    technicalSpec: 'Parser: PyMuPDF / pdf-parse • Storage: Supabase Encrypted Storage Bucket • Access: Owner-Only'
  },
  {
    step: '03',
    title: 'Vector Embeddings & Recommendation Engine',
    subtitle: 'Sentence-BERT 384-Dimensional Mathematical Matching',
    icon: <FiCpu size={24} />,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    description:
      'To match you with 120 verified real-world internships, our engine generates private mathematical vectors representing your skills and coursework.',
    details: [
      'Mathematical Vector Math: Skills are transformed into 384-dimensional dense vectors using Sentence-BERT.',
      'Cosine Similarity: Matching is performed purely via vector cosine similarity math on our own server—zero data leaves our secure cluster.',
      'Strict Match Transparency: We provide an exact percentage score and list the specific overlapping skills and skill gaps so you understand why a role was recommended.'
    ],
    technicalSpec: 'Model: all-MiniLM-L6-v2 (384-dim) • Algorithm: Cosine Vector Similarity • Processing: Local Server'
  },
  {
    step: '04',
    title: 'Autonomous AI Hiring Simulation',
    subtitle: 'Self-Contained Evaluation with Zero External Account Scraping',
    icon: <FiLayers size={24} />,
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    description:
      'Our autonomous simulation engine lets you experience the full hiring lifecycle (applications, ATS scoring, technical interviews, and offer letters) completely in-app without needing to grant access to external websites or emails.',
    details: [
      'No External Permissions Required: The simulation runs 100% inside your InternMatch AI environment.',
      'Tailored Statement of Purpose (SOP): Pitch letters are created locally for each verified company and saved only to your application tracker.',
      'Domain Technical Interviews: Assessment questions (Actuarial, Law, Finance, Tech) are generated specifically for your career field and kept private to your profile.'
    ],
    technicalSpec: 'Execution: Asynchronous Node.js Pipeline • Storage: PostgreSQL Supabase • Permissions: Zero External OAuth'
  },
  {
    step: '05',
    title: 'Optional Secondary Career Email Tracking',
    subtitle: 'Disposable App Passwords, Strict Filtering & No Plaintext Storage',
    icon: <FiMail size={24} />,
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    description:
      'If you choose to track external communications from Internshala or LinkedIn, our system enforces strict zero-risk boundaries to safeguard your digital footprint.',
    details: [
      'Mandatory Non-Primary Email Advisory: We strictly advise using a secondary job-hunt email (e.g. name.jobs@gmail.com) so personal bank alerts and identity files remain completely isolated.',
      'Disposable 16-Character App Passwords Only: You never enter your master password. App Passwords can be revoked with 1 click from your Google account anytime.',
      'Strict Career Keyword Filtering: The IMAP client strictly filters for messages matching career criteria ("interview", "shortlisted", "offer"). Personal and non-career emails are instantly discarded and never recorded.',
      'Session-Only In-Memory Handling: Connection credentials are held strictly in memory for the active scan session and never permanently stored in plaintext database tables.'
    ],
    technicalSpec: 'Protocol: IMAP over TLS (Port 993) • Security: Disposable App Password • Storage: Volatile In-Memory Session'
  },
  {
    step: '06',
    title: 'Real-Time Notification Alerts & Database Security',
    subtitle: 'End-to-End Encrypted Transport & Isolated User Rows',
    icon: <FiBell size={24} />,
    color: '#0891B2',
    bg: '#ECFEFF',
    border: '#A5F3FC',
    description:
      'Notifications about scheduled technical interviews, shortlist updates, and offer letters are delivered securely to your account.',
    details: [
      'Row-Level Security (RLS): Notifications are bound strictly to your authenticated User ID in PostgreSQL.',
      'HTTPS / TLS 1.3 In-Flight Encryption: All communication between your browser and our cloud servers is encrypted with TLS 1.3.',
      'Self-Service Management: You can mark alerts as read, clear individual items, or purge your entire notification inbox at any time.'
    ],
    technicalSpec: 'Database: PostgreSQL (Supabase) • Encryption: TLS 1.3 In-Transit & AES-256 At-Rest'
  },
  {
    step: '07',
    title: 'Data Retention & The "Right to be Forgotten"',
    subtitle: 'Instant 1-Click Disconnect, Purge & Account Erasure',
    icon: <FiTrash2 size={24} />,
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
    description:
      'You maintain complete ownership over every piece of data you submit to InternMatch AI. We respect your right to revoke access or purge data instantly.',
    details: [
      '1-Click Mailbox Disconnect: Clicking "Disconnect" instantly wipes connection tokens and active mailbox handles from the server.',
      'Resume Overwrite & Deletion: You can replace or permanently delete your uploaded resume from your Profile settings at any time.',
      'Pipeline History Erasure: Applications in your Live Tracker can be individually deleted or completely purged upon graduation.'
    ],
    technicalSpec: 'Action: Instant Cascading Deletion • Verification: Immediate Database Sync • Policy: Zero Retained Shadows'
  }
];

const DataProtectionPage = () => {
  return (
    <div className="page-wrapper" style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 72px)', padding: '40px 0 90px' }}>
      <div className="container" style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 24px' }}>

        {/* ═════════════════════════════════════════════════════════════════════
            1. HERO BANNER: COMPLETE ARCHITECTURAL TRANSPARENCY
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FBF8 100%)',
            border: '1.5px solid #00B289',
            borderRadius: '24px',
            padding: '44px 48px',
            marginBottom: '36px',
            boxShadow: '0 8px 30px rgba(0, 178, 137, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '44px', alignItems: 'center' }}>
            {/* Left Content */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#E6F7F2', color: '#008C6B', border: '1px solid #B3E8DC', padding: '5px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '16px' }}>
                <FiShield size={16} />
                <span>DATA PROTECTION &amp; ARCHITECTURAL TRANSPARENCY</span>
              </div>

              <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#1B2533', margin: '0 0 14px 0', letterSpacing: '-0.8px', lineHeight: 1.2 }}>
                How Your Data Is Protected at Every Single Step.
              </h1>

              <p style={{ fontSize: '1.02rem', color: '#64748B', lineHeight: 1.7, margin: '0 0 24px 0' }}>
                We believe candidates have the fundamental right to know <strong>exactly what happens to their data</strong>—from the moment you create an account to when you upload a resume, simulate interviews, or track an application. Below is an open, step-by-step breakdown of our engineering safeguards, encryption standards, and privacy architecture.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link
                  to="/privacy"
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
                  <FiShield size={17} />
                  <span>Open Privacy &amp; Tracking Center</span>
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
                  <span>Live Application Tracker</span>
                </Link>
              </div>
            </div>

            {/* Right Photograph Container */}
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
                  src="/images/candidate_workspace_laptop.jpg"
                  alt="Candidate typing on laptop in private secure workspace"
                  style={{
                    width: '100%',
                    height: '340px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.target.src = '/images/privacy_desk_student.jpg';
                  }}
                />
              </div>

              {/* Floating Shield Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-16px',
                  left: '20px',
                  right: '20px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '12px 18px',
                  boxShadow: '0 10px 25px rgba(0, 178, 137, 0.16)',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#E6F7F2',
                    color: '#00B289',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <FiLock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1B2533' }}>
                    100% Zero Data Reselling Guarantee
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Isolated PostgreSQL rows • AES-256 at-rest • TLS 1.3 in-transit
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            2. HIGH-LEVEL TRANSPARENCY CHECKLIST
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '40px'
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#E6F7F2', color: '#00B289', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiLock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>Password Encryption</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1B2533' }}>Bcrypt (10 Salt Rounds)</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiServer size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>In-Transit Protocol</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1B2533' }}>HTTPS / TLS 1.3 Strict</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiKey size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>Mail Sync Credentials</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1B2533' }}>App Passwords Only</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiEye size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>Third-Party Data Selling</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#065F46' }}>Zero / 100% Forbidden</div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            3. STEP-BY-STEP DATA LIFECYCLE DEEP DIVE
            ═════════════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: '44px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1B2533', margin: '0 0 10px 0' }}>
              The 7-Step Data Protection Journey
            </h2>
            <p style={{ fontSize: '0.96rem', color: '#64748B', maxWidth: '680px', margin: '0 auto' }}>
              From initial registration to application tracking and eventual account erasure, here is exactly how your data flows through our secure systems.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {PROTECTION_STEPS.map((s) => (
              <div
                key={s.step}
                className="card"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '32px 36px',
                  border: '1px solid #E2E8F0',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        backgroundColor: s.bg,
                        color: s.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Step {s.step} • {s.subtitle}
                      </div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1B2533', margin: '2px 0 0 0' }}>
                        {s.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    style={{
                      backgroundColor: s.bg,
                      color: s.color,
                      border: `1px solid ${s.border}`,
                      padding: '4px 12px',
                      borderRadius: '100px',
                      fontSize: '0.78rem',
                      fontWeight: 800
                    }}
                  >
                    Verified Architecture
                  </span>
                </div>

                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.7, margin: '0 0 18px 0' }}>
                  {s.description}
                </p>

                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', border: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1B2533', marginBottom: '10px' }}>
                    Engineering Guarantees:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#475569', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    {s.details.map((d, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  <FiDatabase size={14} color="#00B289" />
                  <span><strong>Technical Spec:</strong> {s.technicalSpec}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            4. FREQUENTLY ASKED SECURITY QUESTIONS
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          className="card"
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '36px',
            border: '1px solid #E2E8F0',
            marginBottom: '40px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1B2533', margin: '0 0 20px 0' }}>
            Common Candidate Security Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1B2533', marginBottom: '6px' }}>
                Does InternMatch AI read my personal emails if I connect an account?
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6 }}>
                <strong>No.</strong> First, we strictly instruct candidates to connect only a <em>secondary job-hunt email</em>. Second, our IMAP parser uses an exact keyword filter that checks only subject lines matching "interview", "shortlisted", or "offer". Any non-career emails are discarded on the wire and never saved.
              </div>
            </div>

            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1B2533', marginBottom: '6px' }}>
                Can corporate recruiters view my personal contact details without my consent?
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6 }}>
                <strong>No.</strong> In our Recruiter ATS Portal, student contact information is only visible to an employer when you have actively applied to their specific internship listing or have cleared an automated ATS shortlist match.
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1B2533', marginBottom: '6px' }}>
                How do I delete my data if I no longer need the platform?
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6 }}>
                You have complete self-service data control. In your <Link to="/profile" style={{ color: '#008C6B', fontWeight: 700 }}>Profile Settings</Link>, you can delete your uploaded resume. In your <Link to="/applications" style={{ color: '#008C6B', fontWeight: 700 }}>Live Tracker</Link>, you can remove any tracked role. And in the <Link to="/privacy" style={{ color: '#008C6B', fontWeight: 700 }}>Privacy &amp; Tracking Center</Link>, you can disconnect your mailbox with a single click.
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            5. ACADEMIC SUPERVISION & ETHICS FOOTER
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: '#F1F5F9',
            borderRadius: '20px',
            padding: '36px',
            textAlign: 'center'
          }}
        >
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1B2533', margin: '0 0 10px 0' }}>
            Academic Research Ethics &amp; Verification
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#64748B', maxWidth: '640px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
            InternMatch AI was designed under the academic supervision of <strong>Dr. Avinash Kumar Namdeo</strong> at Lingaya's Vidyapeeth as a verified B.Tech Capstone Project. It strictly follows academic data integrity, student autonomy, and non-commercial research ethics.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/privacy"
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
              <FiShield />
              <span>Go to Privacy &amp; Tracking</span>
            </Link>
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
              <span>Help Center &amp; FAQs</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataProtectionPage;
