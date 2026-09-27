import React from 'react';

interface CapacityBarProps {
  used: number;
  total: number;
  showLabel?: boolean;
  height?: number;
}

const CapacityBar: React.FC<CapacityBarProps> = ({ used, total, showLabel = true, height = 4 }) => {
  const pct = Math.min(100, Math.round((used / total) * 100));
  const cls = pct >= 100 ? 'danger' : pct >= 85 ? 'warning' : 'healthy';

  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{pct}%</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{used} / {total}</span>
        </div>
      )}
      <div className="capacity-bar" style={{ height }}>
        <div
          className={`capacity-bar-fill ${cls}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default CapacityBar;
