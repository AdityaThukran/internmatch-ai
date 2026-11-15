import React from 'react';
import './ui.css';

/**
 * Reusable loading indicator.
 * @param {object} props
 * @param {string} [props.text] - Optional message shown under the spinner
 * @param {boolean} [props.fullPage] - Center in a full page block
 */
const Loader = ({ text = 'Loading...', fullPage = false }) => (
  <div className={`loader ${fullPage ? 'loader-full' : ''}`} role="status" aria-live="polite">
    <span className="loader-spinner" />
    {text && <span className="loader-text">{text}</span>}
  </div>
);

export default Loader;
