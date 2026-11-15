import React from 'react';

const MatchScoreCircle = ({ score = 0, size = 64, strokeWidth = 5, showLabel = true }) => {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const getColor = () => {
    if (normalizedScore >= 75) return '#00B289';
    if (normalizedScore >= 50) return '#008C6B';
    return '#64748B';
  };

  const color = getColor();

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-out, stroke 0.4s ease'
            }}
          />
        </svg>
        {/* Score text in center */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: size * 0.28,
            color: 'var(--text-primary)'
          }}
        >
          {normalizedScore}%
        </div>
      </div>
      {showLabel && (
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Match
        </span>
      )}
    </div>
  );
};

export default MatchScoreCircle;
