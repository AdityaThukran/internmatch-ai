import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiBriefcase, FiCpu, FiLayers, FiUser } from 'react-icons/fi';
import './AndroidBottomNav.css';

/**
 * AndroidBottomNav - Native-feeling Android Bottom Navigation Bar
 * Optimized for mobile touchscreens (360px - 480px).
 * Displays exclusively on mobile viewports (< 768px).
 */
const AndroidBottomNav = () => {
  const location = useLocation();

  const navItems = [
    {
      to: '/internships',
      label: 'Internships',
      icon: <FiBriefcase size={20} />,
      badge: null
    },
    {
      to: '/recommendations',
      label: 'AI Matches',
      icon: <FiCpu size={20} />,
      badge: 'AI'
    },
    {
      to: '/applications',
      label: 'Live Tracker',
      icon: <FiLayers size={20} />,
      badge: null
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: <FiUser size={20} />,
      badge: null
    }
  ];

  return (
    <nav className="android-bottom-nav" aria-label="Mobile Navigation">
      <div className="android-bottom-nav-container">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`android-nav-tab ${isActive ? 'android-nav-tab-active' : ''}`}
            >
              <div className="android-nav-icon-wrapper">
                {item.icon}
                {item.badge && (
                  <span className="android-nav-badge">{item.badge}</span>
                )}
              </div>
              <span className="android-nav-label">{item.label}</span>
              {isActive && <span className="android-nav-active-pill" />}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default AndroidBottomNav;
