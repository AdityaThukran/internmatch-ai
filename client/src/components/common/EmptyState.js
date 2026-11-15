import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = '📂',
  title = 'No Data Found',
  description = 'There are no items to display at this time.',
  actionText = null,
  actionLink = null,
  onAction = null,
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '50px 20px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border)',
        margin: '20px 0'
      }}
    >
      <div
        style={{
          fontSize: '3rem',
          marginBottom: '16px',
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))'
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px'
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          maxWidth: '420px',
          margin: '0 auto 20px'
        }}
      >
        {description}
      </p>

      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
