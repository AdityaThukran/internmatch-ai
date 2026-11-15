import React from 'react';

const BrandLogo = ({ size = 32, showText = true, variant = 'light' }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}>
      {/* Modern Emerald & Mint Geometric Logo with AI Spark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="blGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5A3" />
            <stop offset="50%" stopColor="#00B289" />
            <stop offset="100%" stopColor="#007355" />
          </linearGradient>
        </defs>
        {/* Squircle Badge */}
        <rect width="40" height="40" rx="10" fill="url(#blGrad)" />
        <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="9.25" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.5" />
        
        {/* Diamond Cap */}
        <path d="M20 9L32 15.5L20 22L8 15.5Z" fill="#FFFFFF" />
        
        {/* Arch Foundation */}
        <path d="M11.5 20V25.5C11.5 28.5 15 30.5 20 30.5C25 30.5 28.5 28.5 28.5 25.5V20C27 21 24 22.5 20 22.5C16 22.5 13 21 11.5 20Z" fill="#FFFFFF" fillOpacity="0.95" />
        
        {/* Tassel Node */}
        <path d="M8 15.5V22.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="23.5" r="1.5" fill="#FFFFFF" />
        
        {/* AI Spark (✦) at Top Right */}
        <path d="M32.5 5.5C32.5 7.5 33.5 8.5 35 8.7C33.5 8.9 32.5 9.9 32.5 11.9C32.5 9.9 31.5 8.9 30 8.7C31.5 8.5 32.5 7.5 32.5 5.5Z" fill="#FFFFFF" />
        <circle cx="32.5" cy="8.7" r="0.7" fill="#00E5A3" />
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
