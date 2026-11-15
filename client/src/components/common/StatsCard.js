import React from 'react';

const StatsCard = ({ title, value, subtitle, icon, trend, color = 'var(--primary)' }) => {
  return (
    <div
      className="card"
      style={{
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: `${color}18`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6rem',
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.4px'
          }}
        >
          {title}
        </p>
        <h3
          style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.2
          }}
        >
          {value}
        </h3>
        {subtitle && (
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-light)',
              marginTop: '4px'
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
