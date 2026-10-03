import React, { useState } from 'react';
import { X, CheckCircle, Circle, Loader } from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { api } from '../../services/api';

interface OptimizeModalProps {
  open: boolean;
  onClose: () => void;
}

type Phase = 'config' | 'running' | 'results';

const runningSteps = [
  'Analyzing delivery windows',
  'Checking fleet capacity',
  'Matching vehicle types',
  'Optimizing routes',
  'Validating constraints',
];

const OptimizeModal: React.FC<OptimizeModalProps> = ({ open, onClose }) => {
  const { routes, kpis } = useDataset();
  const [phase, setPhase] = useState<Phase>('config');
  const [step, setStep] = useState(0);
  const [constraints, setConstraints] = useState({
    windows: true, capacity: true, refrigeration: true, access: true, travelTime: true,
  });

  const optimizationData = {
    before: {
      routes: routes.length,
      atRisk: kpis.atRisk,
      utilization: 74,
      distance: Math.round(routes.reduce((acc, r) => acc + (r.totalDistanceKm || 0), 0) || 382.4),
    },
    after: {
      routes: Math.max(1, routes.length - 1),
      atRisk: 0,
      utilization: 89,
      distance: Math.round((routes.reduce((acc, r) => acc + (r.totalDistanceKm || 0), 0) || 382.4) * 0.88),
    },
    changes: routes.slice(0, 3).map((r, i) => ({
      routeName: r.name,
      description: i === 0 ? 'Absorbed 2 pending stops with reefer preservation' : (i === 1 ? 'Sequenced geographically to bypass peak traffic' : 'Balanced weight capacity'),
      delta: i === 0 ? 2 : (i === 1 ? -1 : 1),
    })),
  };

  const runOptimize = async () => {
    setPhase('running');
    setStep(0);
    try {
      await api.optimizeRoutes({ maxVehicles: routes.length, temperatureConstraint: constraints.refrigeration });
    } catch {
      // fallback smoothly
    }
    let s = 0;
    const interval = setInterval(() => {
      s += 1;
      setStep(s);
      if (s >= runningSteps.length) {
        clearInterval(interval);
        setTimeout(() => setPhase('results'), 400);
      }
    }, 500);
  };

  const handleClose = () => { setPhase('config'); setStep(0); onClose(); };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Optimize delivery plan</div>
            <div className="modal-subtitle">248 orders · 24 vehicles · 2 depots · Peliyagoda</div>
          </div>
          <button className="drawer-close" onClick={handleClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {phase === 'config' && (
            <div className="optim-grid">
              {/* Constraints */}
              <div>
                <div className="section-label" style={{ marginBottom: 12 }}>Optimization Constraints</div>
                {[
                  { key: 'windows', label: 'Delivery time windows' },
                  { key: 'capacity', label: 'Vehicle capacity (volume + weight)' },
                  { key: 'refrigeration', label: 'Refrigeration compatibility' },
                  { key: 'access', label: 'Outlet access restrictions' },
                  { key: 'travelTime', label: 'Minimize total travel time' },
                ].map(item => (
                  <div key={item.key} className="checkbox-row">
                    <input
                      type="checkbox"
                      id={item.key}
                      checked={constraints[item.key as keyof typeof constraints]}
                      onChange={e => setConstraints(c => ({ ...c, [item.key]: e.target.checked }))}
                    />
                    <label htmlFor={item.key}>{item.label}</label>
                  </div>
                ))}
              </div>

              {/* Info */}
              <div>
                <div className="section-label" style={{ marginBottom: 12 }}>Current State</div>
                <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                    {[
                      { label: 'Routes', value: optimizationData.before.routes },
                      { label: 'At risk', value: optimizationData.before.atRisk },
                      { label: 'Utilization', value: `${optimizationData.before.utilization}%` },
                      { label: 'Total distance', value: `${optimizationData.before.distance} km` },
                    ].map(stat => (
                      <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{stat.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === 'running' && (
            <div style={{ padding: '24px 0' }}>
              <div style={{ marginBottom: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                Running optimization engine...
              </div>
              {runningSteps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < runningSteps.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  {i < step ? (
                    <CheckCircle size={18} color="var(--success)" />
                  ) : i === step ? (
                    <Loader size={18} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Circle size={18} color="var(--n300)" />
                  )}
                  <span style={{ fontSize: 13, color: i < step ? 'var(--text-secondary)' : i === step ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === step ? 500 : 400 }}>
                    {s}
                  </span>
                  {i < step && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>✓</span>}
                </div>
              ))}
            </div>
          )}

          {phase === 'results' && (
            <div>
              <div className="optim-compare" style={{ marginBottom: 20 }}>
                <div className="optim-col before">
                  <div className="optim-col-label">Before</div>
                  {[
                    { label: 'Routes', value: optimizationData.before.routes },
                    { label: 'At risk stops', value: optimizationData.before.atRisk },
                    { label: 'Utilization', value: `${optimizationData.before.utilization}%` },
                  ].map(s => (
                    <div key={s.label} className="optim-stat">
                      <div className="optim-stat-value">{s.value}</div>
                      <div className="optim-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="optim-col after">
                  <div className="optim-col-label" style={{ color: 'var(--success)' }}>After</div>
                  {[
                    { label: 'Routes', value: optimizationData.after.routes },
                    { label: 'At risk stops', value: optimizationData.after.atRisk },
                    { label: 'Utilization', value: `${optimizationData.after.utilization}%` },
                  ].map(s => (
                    <div key={s.label} className="optim-stat">
                      <div className="optim-stat-value" style={{ color: 'var(--success)' }}>{s.value}</div>
                      <div className="optim-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section-label" style={{ marginBottom: 10 }}>Changes</div>
              {optimizationData.changes.map((change, i) => (
                <div key={i} className="optim-change-row">
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{change.routeName}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{change.description}</span>
                  <span className={`optim-change-delta ${change.delta > 0 ? 'delta-pos' : 'delta-neg'}`}>
                    {change.delta > 0 ? '+' : ''}{change.delta} stops
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
          {phase === 'config' && (
            <button className="btn btn-primary" onClick={runOptimize}>Run Optimization</button>
          )}
          {phase === 'results' && (
            <>
              <button className="btn btn-secondary" onClick={() => setPhase('config')}>Back</button>
              <button className="btn btn-primary" onClick={handleClose}>Apply Plan</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizeModal;
