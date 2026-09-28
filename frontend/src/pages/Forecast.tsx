import React, { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useDataset } from '../context/DatasetContext';

const ForecastPage: React.FC = () => {
  const { task2aForecastCases } = useDataset();

  const [depotFilter, setDepotFilter] = useState<'All' | 'Peliyagoda' | 'Kandy'>('Peliyagoda');
  const [brandFilter, setBrandFilter] = useState<'All' | 'Fresh' | 'Style' | 'Tech'>('All');

  const filteredCases = useMemo(() => {
    return task2aForecastCases.filter(c => {
      if (depotFilter !== 'All' && c.depot !== depotFilter) return false;
      if (brandFilter !== 'All' && c.brand !== brandFilter) return false;
      return true;
    });
  }, [task2aForecastCases, depotFilter, brandFilter]);

  // Weeks aggregate
  const weekData = useMemo(() => {
    const weeks = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    return weeks.map(w => {
      const items = filteredCases.filter(c => c.isoWeek === w);
      const totalVol = items.reduce((sum, c) => sum + (c.predTotalVolumeM3 || 0), 0);
      const chilledVol = items.reduce((sum, c) => sum + (c.predChilledVolumeM3 || 0), 0);
      const capacity = depotFilter === 'Kandy' ? 65 : 120;
      const isPeakWeek = w === 15; // Sinhala/Tamil New Year festival peak
      const isHighRisk = totalVol > capacity * 0.85;

      return {
        week: w,
        label: `Wk ${w} (2026)`,
        totalVol: Math.round(totalVol * 10) / 10,
        chilledVol: Math.round(chilledVol * 10) / 10,
        capacity,
        isPeakWeek,
        isHighRisk,
      };
    });
  }, [filteredCases, depotFilter]);

  // Risk weeks
  const riskWeeks = weekData.filter(w => w.isHighRisk || w.isPeakWeek);

  // SVG Chart
  const W = 800, H = 260, PL = 50, PR = 20, PT = 20, PB = 40;
  const cw = W - PL - PR;
  const ch = H - PT - PB;
  const maxVal = Math.max(...weekData.map(d => d.totalVol), 140);
  const minVal = 0;
  const range = maxVal - minVal;

  const x = (i: number) => PL + (i / (weekData.length - 1)) * cw;
  const y = (v: number) => PT + ch - ((v - minVal) / range) * ch;

  const capacity = weekData[0]?.capacity || 120;
  const capY = y(capacity);

  const totalPath = weekData.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.totalVol)}`).join(' ');
  const chilledPath = weekData.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.chilledVol)}`).join(' ');

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Weekly Demand Forecasting (Task 2A)
            </h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--brand-tint)', color: 'var(--brand-vivid)' }}>
              task2a_test_inputs.csv · 2026 Model
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Multi-week forward demand predictions incorporating festival ramp effects (Aluth Avurudda) and depot capacity.
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="filter-bar">
            {(['All', 'Peliyagoda', 'Kandy'] as const).map(d => (
              <button
                key={d}
                className={`filter-select ${depotFilter === d ? 'active' : ''}`}
                onClick={() => setDepotFilter(d)}
              >
                {d === 'All' ? 'All Depots' : `${d} Depot`}
              </button>
            ))}
          </div>

          <div className="filter-bar">
            {(['All', 'Fresh', 'Style', 'Tech'] as const).map(b => (
              <button
                key={b}
                className={`filter-select ${brandFilter === b ? 'active' : ''}`}
                onClick={() => setBrandFilter(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Festival and Peak Alerts */}
      {riskWeeks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {riskWeeks.slice(0, 3).map((w, i) => (
            <div key={i} className="risk-week-card" style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '14px 16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <AlertTriangle size={14} color={w.isPeakWeek ? '#DC2626' : '#F59E0B'} />
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: w.isPeakWeek ? '#DC2626' : '#D97706',
                  textTransform: 'uppercase'
                }}>
                  {w.isPeakWeek ? 'Festival Surge Peak (Avurudda)' : 'Capacity Utilization Alert'}
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{w.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Predicted: <strong>{w.totalVol} m³</strong> / Capacity: <strong>{w.capacity} m³</strong>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700,
                color: w.totalVol > w.capacity ? '#DC2626' : '#2563EB', marginTop: 4
              }}>
                {Math.round((w.totalVol / w.capacity) * 100)}% Fleet Load
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SVG Forecast Chart */}
      <div className="forecast-chart-wrapper" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              Predicted Volume (m³) vs Operating Fleet Ceiling
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <span style={{ width: 10, height: 3, background: '#2563EB', borderRadius: 2 }} />
              <span>Total Volume</span>
              <span style={{ width: 10, height: 3, background: '#10B981', borderRadius: 2, marginLeft: 6 }} />
              <span>Chilled Volume</span>
              <span style={{ width: 10, height: 2, background: '#DC2626', borderTop: '2px dashed #DC2626', marginLeft: 6 }} />
              <span>Depot Cap</span>
            </div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Weeks 14–23 (ISO 2026)
          </span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 240 }}>
          {/* Grid lines */}
          {[20, 50, 80, 110, 140].map(v => (
            <g key={v}>
              <line x1={PL} y1={y(v)} x2={W - PR} y2={y(v)} stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
              <text x={PL - 8} y={y(v) + 4} fontSize="10" fill="var(--text-muted)" textAnchor="end">{v} m³</text>
            </g>
          ))}

          {/* Capacity ceiling */}
          <line x1={PL} y1={capY} x2={W - PR} y2={capY} stroke="#DC2626" strokeWidth="1.5" strokeDasharray="6,4" />
          <text x={W - PR} y={capY - 6} fontSize="10" fill="#DC2626" textAnchor="end" fontWeight="700">Capacity Ceiling ({capacity} m³)</text>

          {/* Festival highlight on Week 15 */}
          {weekData.findIndex(w => w.isPeakWeek) !== -1 && (
            <rect
              x={x(weekData.findIndex(w => w.isPeakWeek)) - 25}
              y={PT}
              width={50}
              height={ch}
              fill="#FEF3C7"
              opacity={0.4}
              rx={4}
            />
          )}

          {/* Total volume line */}
          <path d={totalPath} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Chilled volume line */}
          <path d={chilledPath} fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="4,3" strokeLinejoin="round" />

          {/* Data Points */}
          {weekData.map((d, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(d.totalVol)} r={4} fill="#2563EB" stroke="white" strokeWidth="1.5" />
              <text x={x(i)} y={H - 10} fontSize="10" fill="var(--text-muted)" textAnchor="middle">W{d.week}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Detailed Cases Table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-title">Forecast Rows (task2a_test_inputs.csv)</span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Showing {filteredCases.length} forecast targets</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Row ID</th>
                <th>Depot Hub</th>
                <th>Brand</th>
                <th>Year</th>
                <th>Week</th>
                <th style={{ textAlign: 'right' }}>Predicted Total Volume</th>
                <th style={{ textAlign: 'right' }}>Predicted Chilled Volume</th>
                <th>Festival Ramp Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.slice(0, 15).map(c => {
                const isAvurudda = c.isoWeek === 15;
                return (
                  <tr key={c.rowId}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{c.rowId}</td>
                    <td>{c.depot}</td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: c.brand === 'Fresh' ? '#16A34A' : (c.brand === 'Style' ? '#7C3AED' : '#2563EB')
                      }}>
                        {c.brand}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{c.isoYear}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Week {c.isoWeek}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {c.predTotalVolumeM3} m³
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#10B981' }}>
                      {c.predChilledVolumeM3} m³
                    </td>
                    <td>
                      {isAvurudda ? (
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#FEF3C7', color: '#D97706' }}>
                          Surge (Avurudda Peak)
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Normal Operating</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
