import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Eye } from 'lucide-react';

export default function RiskBadge({ level = 'LOW', score, showIcon = true }) {
  const normalizedLevel = (level || 'LOW').toUpperCase();

  const getIcon = () => {
    switch (normalizedLevel) {
      case 'CRITICAL':
        return <AlertTriangle size={13} />;
      case 'HIGH':
        return <AlertCircle size={13} />;
      case 'WATCH':
        return <Eye size={13} />;
      default:
        return <CheckCircle size={13} />;
    }
  };

  return (
    <span className={`risk-badge ${normalizedLevel}`} title={`Risk Level: ${normalizedLevel}${score !== undefined ? ` (Score: ${score})` : ''}`}>
      {showIcon && getIcon()}
      <span>{normalizedLevel}</span>
      {score !== undefined && score !== null && (
        <span style={{ opacity: 0.85, fontWeight: 500, fontSize: '0.7rem', marginLeft: '2px' }}>
          ({score})
        </span>
      )}
    </span>
  );
}
