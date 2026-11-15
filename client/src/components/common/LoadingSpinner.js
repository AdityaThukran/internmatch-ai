import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeMap = {
    small: { width: '20px', height: '20px', borderWidth: '2px' },
    medium: { width: '40px', height: '40px', borderWidth: '3px' },
    large: { width: '60px', height: '60px', borderWidth: '4px' },
  };

  const { width, height, borderWidth } = sizeMap[size] || sizeMap.medium;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: '16px'
    }}>
      <div style={{
        width,
        height,
        border: `${borderWidth} solid var(--border)`,
        borderTop: `${borderWidth} solid var(--primary)`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      {text && (
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          {text}
        </p>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
