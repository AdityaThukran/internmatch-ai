import React from 'react';

const SkillBadge = ({ skill, variant = 'default', onRemove = null }) => {
  const getStyles = () => {
    switch (variant) {
      case 'matched':
        return {
          bg: '#E6F7F2',
          color: '#008C6B',
          border: '1px solid #A7F3D0',
          icon: '✓ '
        };
      case 'missing':
        return {
          bg: '#FEF3C7',
          color: '#92400E',
          border: '1px solid #FDE68A',
          icon: '⚡ '
        };
      case 'primary':
        return {
          bg: '#E6F7F2',
          color: '#00B289',
          border: '1px solid #A7F3D0',
          icon: ''
        };
      default:
        return {
          bg: '#F8FAFC',
          color: '#1B2533',
          border: '1px solid #E2E8F0',
          icon: ''
        };
    }
  };

  const style = getStyles();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '0.82rem',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        border: style.border,
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap'
      }}
    >
      <span>{style.icon}{skill}</span>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(skill)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            lineHeight: 1,
            color: 'inherit',
            opacity: 0.6,
            padding: '0 2px'
          }}
          title={`Remove ${skill}`}
        >
          ×
        </button>
      )}
    </span>
  );
};

export default SkillBadge;
