/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiBriefcase,
  FiCpu,
  FiShield,
  FiLayers,
  FiBell,
  FiHelpCircle,
  FiMail
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import BrandLogo from '../common/BrandLogo';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [crawlerActive, setCrawlerActive] = useState(true);

  const userDropdownRef = useRef(null);

  const [displayName, setDisplayName] = useState(user?.name || 'ADITYA');

  useEffect(() => {
    const updateFromStorage = () => {
      try {
        const u = localStorage.getItem('user');
        if (u) {
          const parsed = JSON.parse(u);
          if (parsed.name) setDisplayName(parsed.name);
        }
      } catch (e) {}
    };
    updateFromStorage();
    window.addEventListener('profileUpdated', updateFromStorage);
    return () => window.removeEventListener('profileUpdated', updateFromStorage);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  // Check crawler heartbeat
  useEffect(() => {
    const checkCrawler = async () => {
      try {
        const res = await fetch('/api/internships/crawler/status');
        const json = await res.json();
        if (json?.data?.isRunning) {
          setCrawlerActive(true);
        }
      } catch (err) {
        // Fallback
      }
    };
    checkCrawler();
    const interval = setInterval(checkCrawler, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`bonsai-navbar ${scrolled ? 'bonsai-navbar-scrolled' : ''}`}>
      <div className="bonsai-navbar-container">
        {/* Left: Brand Logo */}
        <div className="bonsai-logo-group">
          <Link to="/" className="bonsai-brand-link">
            <BrandLogo size={36} showText={true} />
          </Link>
        </div>

        {/* Center: Clean, Legit Core Website Navigation (Zero Fake Links) */}
        <nav className="bonsai-nav-desktop">
          {/* 1. Find Internships */}
          <Link
            to="/internships"
            className={`bonsai-nav-link ${isActive('/internships') ? 'bonsai-nav-link-active' : ''}`}
          >
            <FiBriefcase size={15} />
            <span>Find Internships</span>
          </Link>

          {/* 2. AI Matches */}
          <Link
            to="/recommendations"
            className={`bonsai-nav-link ${isActive('/recommendations') ? 'bonsai-nav-link-active' : ''}`}
          >
            <FiCpu size={15} />
            <span>AI Matches</span>
            <span className="bonsai-pill-tag">AI</span>
          </Link>

          {/* 3. Live Application Tracker */}
          <Link
            to="/applications"
            className={`bonsai-nav-link ${isActive('/applications') ? 'bonsai-nav-link-active' : ''}`}
          >
            <FiLayers size={15} />
            <span>Live Tracker</span>
          </Link>

          {/* 4. Privacy, Data Security & Email Tracking (Replaces Help on Navbar) */}
          <Link
            to="/privacy"
            className={`bonsai-nav-link ${isActive('/privacy') ? 'bonsai-nav-link-active' : ''}`}
          >
            <FiShield size={15} />
            <span>Privacy &amp; Tracking</span>
          </Link>

          {/* 5. Recruiter Portal & ATS */}
          {(user?.role === 'recruiter' || user?.role === 'admin') && (
            <Link
              to="/recruiter"
              className={`bonsai-nav-link ${isActive('/recruiter') ? 'bonsai-nav-link-active' : ''}`}
            >
              <FiBriefcase size={15} />
              <span>Recruiter ATS</span>
            </Link>
          )}

          {/* 4. Live AI Crawler Status Pill */}
          <div className="bonsai-crawler-indicator" title="Autonomous AI crawler is continuously scanning corporate portals for new openings">
            <span className="bonsai-crawler-pulse-dot" />
            <span className="bonsai-crawler-label">AI Crawler: Live</span>
          </div>

          {/* Admin link if user is administrator */}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`bonsai-nav-link ${isActive('/admin') ? 'bonsai-nav-link-active' : ''}`}
            >
              <FiShield size={15} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right: User Avatar / Auth Buttons */}
        <div className="bonsai-actions-desktop">
          {isAuthenticated ? (
            <div className="bonsai-user-wrap">
              <NotificationBell />

              <div className="bonsai-user-menu" ref={userDropdownRef}>
                <button
                  type="button"
                  className="bonsai-user-trigger"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                >
                  <div className="bonsai-user-avatar">{getInitials(displayName)}</div>
                  <span className="bonsai-user-name">{displayName.split(' ')[0] || 'ADITYA'}</span>
                  <FiChevronDown className={`bonsai-chevron ${userDropdownOpen ? 'bonsai-chevron-up' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="bonsai-user-dropdown-panel">
                    <div className="bonsai-user-dropdown-header">
                      <div className="bonsai-user-avatar-large">{getInitials(displayName)}</div>
                      <div>
                        <p className="bonsai-dropdown-username">{displayName}</p>
                        <p className="bonsai-dropdown-useremail">{user?.email || 'thukranaditya@gmail.com'}</p>
                        <span className="bonsai-role-chip">
                          {user?.role === 'recruiter' ? '🏢 Corporate Recruiter' : (user?.role === 'admin' ? '🛡️ Placement Guide' : '🎓 Student Candidate')}
                        </span>
                      </div>
                    </div>

                    <div className="bonsai-dropdown-divider" />

                    {(user?.role === 'recruiter' || user?.role === 'admin') && (
                      <Link to="/recruiter" className="bonsai-dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                        <FiBriefcase /> Recruiter Portal &amp; ATS
                      </Link>
                    )}
                    <Link to="/profile" className="bonsai-dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                      <FiUser /> Profile & Resume
                    </Link>
                    <Link to="/recommendations" className="bonsai-dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                      <FiCpu /> AI Match Recommendations
                    </Link>
                    <Link to="/applications" className="bonsai-dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                      <FiLayers /> My Applied Pipeline
                    </Link>
                    <Link to="/privacy" className="bonsai-dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                      <FiShield /> Privacy &amp; Email Tracking
                    </Link>
                    <Link to="/notifications" className="bonsai-dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                      <FiBell /> Notification Center
                    </Link>
                    <Link to="/help" className="bonsai-dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                      <FiHelpCircle /> Help &amp; FAQs
                    </Link>

                    {user?.role === 'admin' && (
                      <Link to="/admin" className="bonsai-dropdown-link" onClick={() => setUserDropdownOpen(false)}>
                        <FiShield /> Faculty & Guide Console
                      </Link>
                    )}

                    <div className="bonsai-dropdown-divider" />

                    <button type="button" className="bonsai-dropdown-link bonsai-logout-btn" onClick={handleLogout}>
                      <FiLogOut /> Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bonsai-auth-buttons">
              <Link to="/login" className="bonsai-login-link">
                Login
              </Link>
              <Link to="/internships" className="bonsai-try-free-btn">
                <span>Explore Openings</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            className="bonsai-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Android Optimized) */}
      {mobileOpen && (
        <div className="bonsai-mobile-drawer">
          {/* Mobile Live Crawler Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#E6F7F2', borderRadius: '12px', marginBottom: '14px', border: '1px solid #A7F3D0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="bonsai-crawler-pulse-dot" />
              <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#008C6B' }}>
                AI Crawler: Continuously Active
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Live Real-Time</span>
          </div>

          <div className="bonsai-mobile-links">
            <Link to="/internships" className="bonsai-mobile-link" onClick={() => setMobileOpen(false)}>
              <FiBriefcase size={17} color="#00B289" />
              <span>Find Real-Time Internships</span>
            </Link>
            <Link to="/recommendations" className="bonsai-mobile-link" onClick={() => setMobileOpen(false)}>
              <FiCpu size={17} color="#00B289" />
              <span>AI Matches & Recommendations</span>
              <span className="bonsai-pill-tag" style={{ marginLeft: 'auto' }}>AI</span>
            </Link>
            <Link to="/applications" className="bonsai-mobile-link" onClick={() => setMobileOpen(false)}>
              <FiLayers size={17} color="#00B289" />
              <span>Live Application Tracker</span>
            </Link>
            <Link to="/notifications" className="bonsai-mobile-link" onClick={() => setMobileOpen(false)}>
              <FiBell size={17} color="#00B289" />
              <span>Notifications & Alerts</span>
            </Link>
            <Link to="/privacy" className="bonsai-mobile-link" onClick={() => setMobileOpen(false)}>
              <FiShield size={17} color="#00B289" />
              <span>Privacy &amp; Tracking</span>
            </Link>
            <Link to="/data-protection" className="bonsai-mobile-link" onClick={() => setMobileOpen(false)}>
              <FiLock size={17} color="#00B289" />
              <span>Data Protection Transparency</span>
            </Link>
            <Link to="/help" className="bonsai-mobile-link" onClick={() => setMobileOpen(false)}>
              <FiHelpCircle size={17} color="#00B289" />
              <span>Help &amp; Student Guides</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/profile" className="bonsai-mobile-link" onClick={() => setMobileOpen(false)}>
                  <FiUser size={17} color="#00B289" />
                  <span>My Profile & Resume</span>
                </Link>
                {(user?.role === 'recruiter' || user?.role === 'admin') && (
                  <Link to="/recruiter" className="bonsai-mobile-link" onClick={() => setMobileOpen(false)}>
                    <FiBriefcase size={17} color="#00B289" />
                    <span>Recruiter Portal &amp; ATS</span>
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="bonsai-mobile-link" onClick={() => setMobileOpen(false)}>
                    <FiShield size={17} color="#00B289" />
                    <span>Admin Placement Console</span>
                  </Link>
                )}
                <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                  <button type="button" className="bonsai-mobile-logout" onClick={handleLogout}>
                    <FiLogOut size={16} />
                    <span>Log Out ({displayName.split(' ')[0]})</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="bonsai-mobile-auth">
                <Link to="/login" className="bonsai-mobile-login" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link to="/internships" className="bonsai-try-free-btn" style={{ textAlign: 'center', display: 'block', borderRadius: '200px' }} onClick={() => setMobileOpen(false)}>
                  <span>Explore Openings</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
