import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';

const Footer = () => {
  return (
    <footer
      className="app-footer"
      style={{
        backgroundColor: '#F9FBFA',
        color: '#4D5C6D',
        padding: '60px 0 30px',
        marginTop: '60px',
        borderTop: '1px solid #E5E7EB',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '48px'
          }}
        >
          {/* Col 1: Brand & Project Bio */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <BrandLogo size={32} showText={true} variant="light" />
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#4D5C6D', marginBottom: '16px' }}>
              InternMatch AI is an intelligent career platform connecting students with verified internships through NLP semantic embeddings, skill gap diagnostics, and automated crawlers.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#008C6B', fontWeight: 600 }}>
              AI-Powered Recommendation & Discovery Engine
            </div>
          </div>

          {/* Col 2: Products */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1B2533', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Platform Features
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li><Link to="/recommendations" style={{ color: '#4D5C6D', textDecoration: 'none' }}>Sentence Transformers Matching</Link></li>
              <li><Link to="/internships" style={{ color: '#4D5C6D', textDecoration: 'none' }}>Verified Opportunity Directory</Link></li>
              <li><Link to="/applications" style={{ color: '#4D5C6D', textDecoration: 'none' }}>4-Stage Application Pipeline</Link></li>
              <li><Link to="/profile" style={{ color: '#4D5C6D', textDecoration: 'none' }}>PDF Resume Parser & Skills</Link></li>
              <li><Link to="/notifications" style={{ color: '#4D5C6D', textDecoration: 'none' }}>Weekly Cron Alert Digests</Link></li>
              <li><Link to="/help" style={{ color: '#008C6B', fontWeight: 700, textDecoration: 'none' }}>🌿 Help Center &amp; FAQs</Link></li>
            </ul>
          </div>

          {/* Col 3: Tech Stack & Architecture */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1B2533', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Tech Architecture
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li><span style={{ color: '#4D5C6D' }}>Sentence-BERT (384-dim Vectors)</span></li>
              <li><span style={{ color: '#4D5C6D' }}>PyMuPDF Automated Resume Parsing</span></li>
              <li><span style={{ color: '#4D5C6D' }}>Node-Cron Sunday 08:00 AM Daemon</span></li>
              <li><span style={{ color: '#4D5C6D' }}>React 18 + Node.js Express + MongoDB</span></li>
              <li><span style={{ color: '#4D5C6D' }}>Cosine Similarity Recommendation API</span></li>
            </ul>
          </div>

          {/* Col 4: Academic Verification */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1B2533', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Academic Verification
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#4D5C6D', marginBottom: '6px' }}>
              Project: <strong>B.Tech CSE (AI) Capstone</strong>
            </p>
            <p style={{ fontSize: '0.85rem', color: '#4D5C6D', marginBottom: '6px' }}>
              Lead Developer: <strong>Aditya</strong>
            </p>
            <p style={{ fontSize: '0.85rem', color: '#4D5C6D', marginBottom: '6px' }}>
              Institution: <strong>Lingaya’s Vidyapeeth</strong>
            </p>
            <p style={{ fontSize: '0.85rem', color: '#4D5C6D', marginBottom: '6px' }}>
              Supervisor: <strong>Dr. Avinash</strong>
            </p>
            <div style={{ marginTop: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E6F7F2', color: '#008C6B', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
              <span>✓</span> Verified Capstone Project
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid #E5E7EB',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
            color: '#8E98A4'
          }}
        >
          <p>© 2026 InternMatch AI. Built by Aditya for Lingaya's Vidyapeeth. All rights reserved.</p>
          <p>Lingaya’s Vidyapeeth • Faculty of Engineering & Technology, Faridabad</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
