import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiBriefcase, FiCpu, FiLayers, FiUser, FiHome, FiBell } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './AndroidBottomNav.css';

/**
 * AndroidBottomNav - Native-feeling Android/iOS Bottom Navigation Bar
 * Fully optimized for mobile touchscreens (360px - 480px).
 * Displays exclusively on mobile viewports (< 768px).
 * Inspired by Internshala & Unstop mobile UX patterns.
 */
const AndroidBottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    // Pull notification badge count from localStorage
    try {
      const count = localStorage.getItem('internmatch_notif_count');
      if (count) setNotifCount(parseInt(count, 10) || 0);
    } catch (e) {}
  }, [location]);

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: <FiHome size={21} />,
      badge: null,
      exact: true
    },
    {
      to: '/internships',
      label: 'Internships',
      icon: <FiBriefcase size={21} />,
      badge: null
    },
    {
      to: '/recommendations',
      label: 'AI Match',
      icon: <FiCpu size={21} />,
      badge: 'AI'
    },
    {
      to: '/applications',
      label: 'Tracker',
      icon: <FiLayers size={21} />,
      badge: null
    },
    {
      to: isAuthenticated ? '/profile' : '/login',
      label: isAuthenticated ? 'Profile' : 'Login',
      icon: <FiUser size={21} />,
      badge: null
    }
  ];

  return (
    <nav className="android-bottom-nav" aria-label="Mobile Navigation">
      <div className="android-bottom-nav-container">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to) && item.to !== '/';
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`android-nav-tab ${isActive ? 'android-nav-tab-active' : ''}`}
            >
              {isActive && <span className="android-nav-active-pill" />}
              <div className={`android-nav-icon-wrapper ${isActive ? 'android-nav-icon-active' : ''}`}>
                {item.icon}
                {item.badge && (
                  <span className="android-nav-badge">{item.badge}</span>
                )}
              </div>
              <span className="android-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default AndroidBottomNav;

