import React from 'react';

export default function StatusBadge({ status = 'ONGOING' }) {
  const normalizedStatus = (status || 'ONGOING').toUpperCase();

  return (
    <span className={`status-badge ${normalizedStatus}`}>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          display: 'inline-block'
        }}
      />
      {normalizedStatus}
    </span>
  );
}
