import React from 'react';

const BrandLogo = ({ size = 32, showText = true, variant = 'light' }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}>
      {/* HelloBonsai-Inspired Modern Emerald Geometric Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect width="36" height="36" rx="9" fill="#00B289" />
        {/* Geometric Stylized Match Nodes & Graduation Cap Icon */}
        <path
          d="M18 9L27 14L18 19L9 14L18 9Z"
          fill="#FFFFFF"
        />
        <path
          d="M12 17.5V23C12 24.5 14.5 26.5 18 26.5C21.5 26.5 24 24.5 24 23V17.5"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="27" cy="18" r="1.5" fill="#FFFFFF" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: variant === 'dark' ? '#FFFFFF' : '#1B2533',
              letterSpacing: '-0.5px',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            internmatch
          </span>
          <span
            style={{
              background: '#E6F7F2',
              color: '#008C6B',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              letterSpacing: '0.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid #B3E8DC'
            }}
          >
            AI
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
