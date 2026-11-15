/* eslint-disable */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
  FiCpu,
  FiFileText,
  FiSend,
  FiCheckCircle,
  FiMail,
  FiMessageSquare,
  FiExternalLink,
  FiArrowRight,
  FiZap,
  FiBookOpen,
  FiLayers,
  FiBell,
  FiAward,
  FiCheck
} from 'react-icons/fi';

const FAQ_DATA = [
  {
    id: 1,
    category: 'ai-matching',
    icon: <FiCpu />,
    question: 'How does InternMatch AI match internships to my profile?',
    answer:
      'InternMatch AI uses Sentence-BERT (384-dimensional dense semantic vectors) along with cosine similarity diagnostics. Instead of simple keyword matching, our neural engine evaluates the semantic alignment between your candidate skills, academic coursework, and the internship job requirements. It computes a precision match score (0–100%) and highlights your exact matching competencies alongside skill gaps.'
  },
  {
    id: 2,
    category: 'resume',
    icon: <FiFileText />,
    question: 'How do I upload and parse my resume?',
    answer:
      'Navigate to the Profile & Resume page (/profile) and click "Upload PDF Resume". Our in-process PDF parser automatically extracts your Full Name, Degree Specialization, College/Institution, Base Location, Contact Details, GitHub/LinkedIn links, and Technical Skills. All extracted fields are editable so you can fine-tune your details anytime.'
  },
  {
    id: 3,
    category: 'applying',
    icon: <FiSend />,
    question: 'How does 1-Click Auto-Apply work?',
    answer:
      'When viewing any internship card, click "1-Click Auto-Apply". InternMatch AI automatically bundles your verified profile credentials, generates a custom AI cover letter based on your matched skills, and submits your application directly to the employer pipeline. You can monitor your application status across 4 stages (Applied → Under Review → Interviewing → Offered) in the Live Tracker.'
  },
  {
    id: 4,
    category: 'crawlers',
    icon: <FiZap />,
    question: 'Where do the internship listings come from?',
    answer:
      'Our autonomous real-time crawler scans official corporate career portals, Internshala, and LinkedIn job guest APIs every 60 seconds. Only active, verified opportunities with clear eligibility, stipend information, and verified company domains are indexed into the platform directory.'
  },
  {
    id: 5,
    category: 'resume',
    icon: <FiAward />,
    question: 'What if my degree or specific branch is not in the presets?',
    answer:
      'InternMatch AI supports all engineering and university degrees (Electrical, Mechanical, Civil, BCA, MCA, B.Sc, BBA, etc.). The parser extracts your full program title directly from your resume. You can also manually type any degree in the Degree / Program field and add custom technical skills.'
  },
  {
    id: 6,
    category: 'notifications',
    icon: <FiBell />,
    question: 'How do weekly email digests and alert notifications work?',
    answer:
      'Every Sunday at 8:00 AM, our background Node-Cron daemon synthesizes your top 5 highest-affinity matching internships and prepares an alert digest. You can view all real-time alerts in the in-app Notification Center (bell icon in the navbar).'
  },
  {
    id: 7,
    category: 'academic',
    icon: <FiBookOpen />,
    question: 'Is InternMatch AI free for university students?',
    answer:
      'Yes, 100% free! InternMatch AI was developed as a Capstone Engineering Project at Lingaya\'s Vidyapeeth to provide students with transparent, automated internship discovery without subscription paywalls or hidden charges.'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'ai-matching', label: '🤖 AI Matching' },
  { id: 'resume', label: '📄 Resume Parser' },
  { id: 'applying', label: '⚡ Auto-Apply' },
  { id: 'crawlers', label: '🌐 Live Crawlers' },
  { id: 'notifications', label: '🔔 Notifications' }
];

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openAccordion, setOpenAccordion] = useState(1);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  // Filter FAQs based on category and search query
  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.email || !contactForm.message) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 4500);
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '40px 0 80px', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @media (max-width: 880px) {
          .help-split-grid {
            grid-template-columns: 1fr !important;
          }
          .help-split-grid > div:first-child {
            position: static !important;
          }
        }
      `}</style>
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Header Hero Banner */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '48px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '48px 32px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Ambient Emerald Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '400px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(0,178,137,0.12) 0%, rgba(255,255,255,0) 70%)',
              pointerEvents: 'none'
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#E6F7F2',
              color: '#008C6B',
              padding: '6px 16px',
              borderRadius: '200px',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '16px',
              border: '1px solid #B3E8DC'
            }}
          >
            <FiHelpCircle /> InternMatch AI Knowledge Base &amp; Student Help
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1B2533', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            How can we help your internship journey?
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: '640px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Everything you need to know about AI resume parsing, automated semantic matching, 1-click applications, and placement alerts.
          </p>

          {/* Search Bar */}
          <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative' }}>
            <FiSearch
              style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#00B289',
                fontSize: '1.2rem'
              }}
            />
            <input
              type="text"
              placeholder="Search help topics, auto-apply, BERT match score, PDF parsing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 20px 14px 48px',
                borderRadius: '14px',
                border: '2px solid #E2E8F0',
                fontSize: '0.98rem',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'border-color 0.2s',
                backgroundColor: '#F8FAFC'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#00B289')}
              onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
            />
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '24px'
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '100px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedCategory === cat.id ? '1.5px solid #00B289' : '1px solid #CBD5E1',
                  backgroundColor: selectedCategory === cat.id ? '#00B289' : '#FFFFFF',
                  color: selectedCategory === cat.id ? '#FFFFFF' : '#475569',
                  transition: 'all 0.2s'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Split: Picture on the Left, Helps on the Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 440px) 1fr',
            gap: '36px',
            alignItems: 'start'
          }}
          className="help-split-grid"
        >
          {/* ================= LEFT SIDE: Picture & Desk Illustration ================= */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '1.5px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                overflow: 'hidden'
              }}
            >
              {/* Illustration Frame */}
              <div
                style={{
                  backgroundColor: '#EDFAF6',
                  borderRadius: '18px',
                  border: '1.5px solid #B3E8DC',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Fallback & Primary Graphic: Person with Laptop at Green Desk */}
                <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                  <img
                    src="/images/help_desk_person.png"
                    alt="Student with laptop sitting at an emerald green desk"
                    onError={(e) => {
                      // If PNG not found, fallback to embedded modern SVG illustration
                      e.target.style.display = 'none';
                      const fallback = document.getElementById('svg-help-desk-fallback');
                      if (fallback) fallback.style.display = 'block';
                    }}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '12px',
                      display: 'block',
                      objectFit: 'cover'
                    }}
                  />

                  {/* SVG Fallback Illustration */}
                  <div id="svg-help-desk-fallback" style={{ display: 'none', width: '100%' }}>
                    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
                      <defs>
                        <linearGradient id="deskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00E5A3" />
                          <stop offset="60%" stopColor="#00B289" />
                          <stop offset="100%" stopColor="#007355" />
                        </linearGradient>
                        <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#F8FAFC" />
                          <stop offset="100%" stopColor="#E6F7F2" />
                        </linearGradient>
                      </defs>
                      {/* Background Wall */}
                      <rect width="400" height="320" rx="16" fill="url(#wallGrad)" />
                      {/* Window / Floating UI Cards */}
                      <rect x="250" y="30" width="120" height="75" rx="8" fill="#FFFFFF" stroke="#B3E8DC" strokeWidth="2" />
                      <circle cx="270" cy="50" r="8" fill="#00B289" />
                      <rect x="286" y="46" width="65" height="8" rx="4" fill="#E2E8F0" />
                      <rect x="270" y="66" width="85" height="6" rx="3" fill="#CBD5E1" />
                      <rect x="270" y="80" width="55" height="6" rx="3" fill="#00E5A3" />
                      
                      {/* Bookshelf */}
                      <rect x="30" y="40" width="80" height="8" rx="2" fill="#008C6B" />
                      <rect x="38" y="24" width="10" height="16" rx="2" fill="#00B289" />
                      <rect x="52" y="20" width="12" height="20" rx="2" fill="#1B2533" />
                      <rect x="68" y="26" width="8" height="14" rx="2" fill="#00E5A3" />

                      {/* Person Silhouette & Character */}
                      {/* Chair Back */}
                      <rect x="155" y="115" width="50" height="75" rx="8" fill="#1E293B" />
                      <rect x="175" y="190" width="10" height="45" fill="#334155" />
                      
                      {/* Person: Head, Hair, Torso */}
                      <circle cx="180" cy="100" r="22" fill="#FBBF24" />
                      <path d="M162 95C162 78 198 78 198 95C198 90 190 85 180 85C170 85 162 90 162 95Z" fill="#1E293B" />
                      <path d="M152 145C152 125 208 125 208 145V200H152V145Z" fill="#0F172A" />
                      {/* Person Arms typing */}
                      <path d="M155 145L185 175H225" stroke="#FBBF24" strokeWidth="12" strokeLinecap="round" />

                      {/* LAPTOP on Desk */}
                      <path d="M200 178L235 142H265L230 178Z" fill="#94A3B8" />
                      <rect x="228" y="138" width="40" height="28" rx="3" fill="#00B289" />
                      <rect x="232" y="142" width="32" height="20" rx="2" fill="#0F172A" />
                      {/* Code glow on screen */}
                      <rect x="236" y="146" width="16" height="3" rx="1" fill="#00E5A3" />
                      <rect x="236" y="152" width="22" height="3" rx="1" fill="#38BDF8" />
                      <rect x="236" y="157" width="12" height="3" rx="1" fill="#FFFFFF" />
                      {/* Laptop Base */}
                      <rect x="195" y="176" width="55" height="5" rx="2" fill="#64748B" />

                      {/* DESK (Green Color Matching Website) */}
                      <rect x="80" y="180" width="260" height="18" rx="6" fill="url(#deskGrad)" />
                      {/* Desk Trim */}
                      <rect x="82" y="194" width="256" height="4" fill="#007355" />
                      {/* Desk Legs */}
                      <rect x="100" y="198" width="14" height="100" rx="3" fill="#004D38" />
                      <rect x="306" y="198" width="14" height="100" rx="3" fill="#004D38" />

                      {/* Desk Accessories */}
                      {/* Desk Lamp */}
                      <path d="M105 180V120H125L115 135" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
                      <path d="M110 125L135 140" stroke="#00B289" strokeWidth="8" strokeLinecap="round" />
                      <polygon points="120,140 145,155 130,165" fill="#FEF08A" opacity="0.6" />
                      
                      {/* Green Potted Plant */}
                      <rect x="285" y="162" width="18" height="18" rx="3" fill="#B45309" />
                      <circle cx="294" cy="155" r="10" fill="#00E5A3" />
                      <circle cx="288" cy="150" r="7" fill="#00B289" />
                      <circle cx="300" cy="150" r="7" fill="#10B981" />

                      {/* Coffee Mug */}
                      <rect x="135" y="166" width="12" height="14" rx="2" fill="#FFFFFF" stroke="#00B289" strokeWidth="2" />
                      <path d="M147 170C150 170 150 176 147 176" stroke="#00B289" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                </div>

                {/* Picture Caption Tag */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#008C6B',
                    marginTop: '12px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00B289' }} />
                  Student Support &amp; Placement Guidance
                </div>
              </div>

              {/* Quick Contact & Placement Guidance Card */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1B2533', margin: '0 0 8px' }}>
                  Need 1-on-1 Assistance?
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Our faculty and placement support team can review your resume, troubleshoot match issues, or connect you with corporate recruiters.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600 }}>
                    <FiMail style={{ color: '#00B289' }} />
                    <span>thukranaditya@gmail.com</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600 }}>
                    <FiBookOpen style={{ color: '#00B289' }} />
                    <span>Lingaya's Vidyapeeth, Faridabad</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600 }}>
                    <FiAward style={{ color: '#00B289' }} />
                    <span>Faculty of Engineering &amp; Technology</span>
                  </div>
                </div>
              </div>

              {/* Direct Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#E6F7F2',
                    color: '#008C6B',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem'
                  }}
                >
                  <span>Upload &amp; Verify Resume</span>
                  <FiArrowRight />
                </Link>

                <Link
                  to="/recommendations"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    color: '#1E293B',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <span>Explore AI Matches</span>
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDE: Helps, FAQs & Step-by-Step Guides ================= */}
          <div>
            {/* Quick Stats Banner */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '28px'
              }}
            >
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #E2E8F0',
                  padding: '18px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ color: '#00B289', fontSize: '1.4rem', marginBottom: '4px' }}>
                  <FiCpu />
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1B2533' }}>384-Dim</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>S-BERT AI Vector Matching</div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #E2E8F0',
                  padding: '18px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ color: '#00B289', fontSize: '1.4rem', marginBottom: '4px' }}>
                  <FiZap />
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1B2533' }}>60 Seconds</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Autonomous Web Crawler</div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #E2E8F0',
                  padding: '18px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ color: '#00B289', fontSize: '1.4rem', marginBottom: '4px' }}>
                  <FiCheckCircle />
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1B2533' }}>1-Click</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Auto-Apply &amp; Live Tracking</div>
              </div>
            </div>

            {/* Section Title */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1B2533', margin: '0 0 6px' }}>
                Frequently Asked Questions ({filteredFaqs.length})
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
                Click any topic below to expand comprehensive step-by-step guidance.
              </p>
            </div>

            {/* Accordion FAQ List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => {
                  const isOpen = openAccordion === faq.id;
                  return (
                    <div
                      key={faq.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: isOpen ? '1.5px solid #00B289' : '1.5px solid #E2E8F0',
                        overflow: 'hidden',
                        boxShadow: isOpen ? '0 4px 14px rgba(0,178,137,0.08)' : '0 2px 6px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleAccordion(faq.id)}
                        style={{
                          width: '100%',
                          padding: '18px 22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '14px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              color: isOpen ? '#00B289' : '#64748B',
                              fontSize: '1.15rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: isOpen ? '#E6F7F2' : '#F1F5F9'
                            }}
                          >
                            {faq.icon}
                          </span>
                          <span
                            style={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: isOpen ? '#008C6B' : '#1E293B'
                            }}
                          >
                            {faq.question}
                          </span>
                        </div>
                        <span style={{ color: isOpen ? '#00B289' : '#94A3B8', fontSize: '1.2rem', display: 'flex' }}>
                          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      </button>

                      {isOpen && (
                        <div
                          style={{
                            padding: '0 22px 20px 66px',
                            fontSize: '0.92rem',
                            color: '#475569',
                            lineHeight: 1.65,
                            borderTop: '1px solid #F1F5F9'
                          }}
                        >
                          <p style={{ margin: '14px 0 0' }}>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px dashed #CBD5E1',
                    padding: '36px 24px',
                    textAlign: 'center',
                    color: '#64748B'
                  }}
                >
                  <p style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600 }}>
                    No help topics found matching "{searchQuery}"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#E6F7F2',
                      color: '#008C6B',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Reset Search &amp; Filters
                  </button>
                </div>
              )}
            </div>

            {/* Quick Interactive Contact Support Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1.5px solid #E2E8F0',
                padding: '28px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <span
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#E6F7F2',
                    color: '#00B289',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}
                >
                  <FiMessageSquare />
                </span>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1B2533', margin: 0 }}>
                    Ask a Question or Send Feedback
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0 }}>
                    Direct message to the student placement cell and AI engineering team.
                  </p>
                </div>
              </div>

              {contactSubmitted ? (
                <div
                  style={{
                    backgroundColor: '#E6F7F2',
                    border: '1.5px solid #00B289',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#008C6B',
                    fontWeight: 700
                  }}
                >
                  <FiCheck size={20} />
                  <span>Thank you! Your inquiry has been dispatched to the placement desk.</span>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.88rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Your Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. rahul@example.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.88rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      How can we assist you? *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe your issue or feedback (e.g. resume extraction feedback, missing internship, recommendation tuning)..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.88rem',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      style={{
                        padding: '10px 22px',
                        borderRadius: '10px',
                        backgroundColor: '#00B289',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <FiSend /> Send Inquiry
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
