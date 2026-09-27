import React from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { forecastData } from '../data/mockData';

// Simple SVG line chart
const ForecastChart: React.FC = () => {
  const W = 800, H = 280, PL = 60, PR = 20, PT = 20, PB = 40;
  const cw = W - PL - PR;
  const ch = H - PT - PB;
  const data = forecastData;
  const maxVal = 300;
  const minVal = 160;
  const range = maxVal - minVal;

  const x = (i: number) => PL + (i / (data.length - 1)) * cw;
  const y = (v: number) => PT + ch - ((v - minVal) / range) * ch;

  const capacity = data[0].capacity;
  const capY = y(capacity);

  // Build actual line
  const actualPoints = data.filter(d => d.actual !== undefined);
  const actualPath = actualPoints.map((d, i) => {
    const idx = data.indexOf(d);
    return `${i === 0 ? 'M' : 'L'}${x(idx)},${y(d.actual!)}`;
  }).join(' ');

  // Build forecast line
  const forecastPoints = data.filter(d => d.forecast !== undefined);
  const fStart = data.findIndex(d => d.forecast !== undefined);
  // Connect from last actual
  const lastActual = data.filter(d => d.actual !== undefined).slice(-1)[0];
  const lastActualIdx = data.filter(d => d.actual !== undefined).length - 1;
  const forecastPath = [
    `M${x(lastActualIdx)},${y(lastActual.actual!)}`,
    ...forecastPoints.map((d, i) => `L${x(fStart + i)},${y(d.forecast!)}`),
  ].join(' ');

  // Grid lines
  const gridValues = [180, 200, 220, 240, 260, 280];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" style={{ height: 280 }}>
      {/* Grid */}
      {gridValues.map(v => (
        <g key={v}>
          <line x1={PL} y1={y(v)} x2={W - PR} y2={y(v)} stroke="#E2E8F0" strokeWidth="1" />
          <text x={PL - 8} y={y(v) + 4} fontSize="10" fill="#94A3B8" textAnchor="end">{v}</text>
        </g>
      ))}

      {/* Capacity line */}
      <line x1={PL} y1={capY} x2={W - PR} y2={capY} stroke="#DC2626" strokeWidth="1.5" strokeDasharray="6,4" />
      <text x={W - PR + 4} y={capY + 4} fontSize="10" fill="#DC2626">Capacity</text>

      {/* Risk week highlights */}
      {data.map((d, i) => d.isHighRisk ? (
        <rect
          key={i}
          x={x(i) - cw / (data.length - 1) / 2}
          y={PT}
          width={cw / (data.length - 1)}
          height={ch}
          fill="#FEF2F2"
          opacity={0.6}
        />
      ) : null)}

      {/* Actual line */}
      <path d={actualPath} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Forecast line */}
      <path d={forecastPath} fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="6,4" strokeLinejoin="round" opacity={0.7} />

      {/* Data points */}
      {data.map((d, i) => {
        const v = d.actual ?? d.forecast;
        if (!v) return null;
        const isForecast = d.actual === undefined;
        return (
          <circle
            key={i}
            cx={x(i)} cy={y(v)}
            r={isForecast ? 3 : 4}
            fill={isForecast ? 'white' : '#2563EB'}
            stroke={d.isHighRisk ? '#DC2626' : '#2563EB'}
            strokeWidth="2"
          />
        );
      })}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text key={i} x={x(i)} y={H - 8} fontSize="11" fill="#94A3B8" textAnchor="middle">
          {d.weekLabel}
        </text>
      ))}

      {/* Legend */}
      <line x1={PL} y1={H - 26} x2={PL + 20} y2={H - 26} stroke="#2563EB" strokeWidth="2.5" />
      <text x={PL + 24} y={H - 22} fontSize="10" fill="#64748B">Actual</text>
      <line x1={PL + 70} y1={H - 26} x2={PL + 90} y2={H - 26} stroke="#2563EB" strokeWidth="2" strokeDasharray="4,3" />
      <text x={PL + 94} y={H - 22} fontSize="10" fill="#64748B">Forecast</text>
      <line x1={PL + 160} y1={H - 26} x2={PL + 180} y2={H - 26} stroke="#DC2626" strokeWidth="1.5" strokeDasharray="4,3" />
      <text x={PL + 184} y={H - 22} fontSize="10" fill="#DC2626">Capacity limit</text>
    </svg>
  );
};

const ForecastPage: React.FC = () => {
  const riskWeeks = forecastData.filter(w => w.isHighRisk);

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Capacity Forecast</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
            Peliyagoda · Refrigerated · 10-week outlook · Updated daily
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="filter-select">Peliyagoda <ChevronDown size={12} /></button>
          <button className="filter-select">Fresh <ChevronDown size={12} /></button>
          <button className="filter-select">10-week <ChevronDown size={12} /></button>
        </div>
      </div>

      {/* Capacity Risk alerts */}
      {riskWeeks.length > 0 && (
        <div style={{ display: 'flex', gap: 12 }}>
          {riskWeeks.map((w, i) => (
            <div key={i} className="risk-week-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <AlertTriangle size={14} color="var(--warning)" />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Capacity Risk
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{w.weekLabel}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Refrigerated capacity</div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700,
                color: 'var(--warning-vivid)', marginTop: 4
              }}>
                {Math.round(((w.forecast ?? 0) / w.capacity) * 100)}%
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm">Review plan</button>
                <button className="btn btn-secondary btn-sm">Add capacity</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="forecast-chart-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Order volume vs. capacity</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Orders Wk 16: <strong>248</strong>
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Forecast Wk 18: <strong style={{ color: 'var(--warning)' }}>271</strong>
            </span>
          </div>
        </div>
        <ForecastChart />
      </div>

      {/* Weekly breakdown table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Weekly Breakdown</span>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Orders</th>
                <th>vs Capacity</th>
                <th>Utilization</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.map((w, i) => {
                const vol = w.actual ?? w.forecast ?? 0;
                const pct = Math.round((vol / w.capacity) * 100);
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{w.weekLabel}</td>
                    <td>{vol}</td>
                    <td>{w.capacity}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 80, height: 4, background: 'var(--n200)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(100, pct)}%`,
                            background: pct >= 100 ? 'var(--danger)' : pct >= 90 ? 'var(--warning)' : 'var(--success)',
                            borderRadius: 2,
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      {w.isHighRisk ? (
                        <span style={{ color: 'var(--warning)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={12} /> At risk
                        </span>
                      ) : (
                        <span style={{ color: 'var(--success)', fontSize: 12 }}>OK</span>
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
