import React from 'react';
import { getMatchColor } from '../../utils/helpers';
import './ui.css';

/**
 * Circular match score indicator.
 * @param {object} props
 * @param {number} props.score - Match score 0-100
 * @param {number} [props.size] - Diameter in px
 * @param {boolean} [props.showLabel] - Render the numeric label inside
 */
const MatchRing = ({ score = 0, size = 64, showLabel = true }) => {
  const safeScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const stroke = Math.max(4, Math.round(size / 10));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;
  const color = getMatchColor(safeScore);

  return (
    <div
      className="match-ring"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${safeScore}% match`}
    >
      <svg width={size} height={size}>
        <circle
          className="match-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className="match-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showLabel && (
        <span className="match-ring-label" style={{ color, fontSize: size / 4 }}>
          {safeScore}%
        </span>
      )}
    </div>
  );
};

export default MatchRing;
