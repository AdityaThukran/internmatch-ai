import React from 'react';
import './ui.css';

/**
 * Empty state placeholder.
 * @param {object} props
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {string} [props.message]
 * @param {React.ReactNode} [props.action]
 */
const EmptyState = ({ icon = '📭', title, message, action }) => (
  <div className="empty-state">
    <div className="empty-icon" aria-hidden="true">{icon}</div>
    <h3 className="empty-title">{title}</h3>
    {message && <p className="empty-message">{message}</p>}
    {action && <div className="empty-action">{action}</div>}
  </div>
);

export default EmptyState;
