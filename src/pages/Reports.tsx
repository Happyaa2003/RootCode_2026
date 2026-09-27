import React from 'react';
import { TrendingDown, TrendingUp, Clock, Package } from 'lucide-react';

const weeks = ['Wk 13', 'Wk 14', 'Wk 15', 'Wk 16'];
const onTimeRate = [91, 88, 94, 89];
const deliveryCount = [210, 224, 238, 248];
const avgServiceTime = [18, 21, 17, 19];
const lateRate = [9, 12, 6, 11];

const MiniBarChart: React.FC<{ values: number[]; labels: string[]; color: string; max: number }> = ({ values, labels, color, max }) => {
  const W = 280, H = 80, PL = 30, PB = 20;
  const bw = (W - PL) / values.length * 0.6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 80 }}>
      {values.map((v, i) => {
        const barH = (v / max) * (H - PB);
        const barX = PL + i * ((W - PL) / values.length) + ((W - PL) / values.length - bw) / 2;
        const barY = H - PB - barH;
        return (
          <g key={i}>
            <rect x={barX} y={barY} width={bw} height={barH} fill={color} rx={2} opacity={0.85} />
            <text x={barX + bw / 2} y={H - 5} fontSize="9" fill="#94A3B8" textAnchor="middle">{labels[i]}</text>
            <text x={barX + bw / 2} y={barY - 3} fontSize="9" fill="#334155" textAnchor="middle" fontWeight="600">{v}</text>
          </g>
        );
      })}
    </svg>
  );
};

const ReportsPage: React.FC = () => {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Operations Report</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Week 13–16 · Peliyagoda Depot</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary">Export CSV</button>
          <button className="btn btn-secondary">Print report</button>
        </div>
      </div>

      {/* KPI summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { icon: Package, label: 'Total deliveries', value: '920', sub: 'Wk 13–16', trend: '+5%', up: true },
          { icon: Clock, label: 'On-time rate', value: '90.5%', sub: '4-week avg', trend: '-0.4%', up: false },
          { icon: TrendingDown, label: 'Avg service time', value: '18.8 min', sub: 'per stop', trend: '-2 min', up: true },
          { icon: TrendingUp, label: 'Late delivery rate', value: '9.5%', sub: '4-week avg', trend: '+1.2%', up: false },
        ].map((item, i) => (
          <div key={i} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '16px 20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-md)',
                background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon size={16} color="var(--text-secondary)" />
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: item.up ? 'var(--success)' : 'var(--danger)',
                background: item.up ? 'var(--success-tint)' : 'var(--danger-tint)',
                padding: '2px 6px', borderRadius: 3,
              }}>
                {item.trend}
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700,
              color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.5px'
            }}>
              {item.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Delivery Volume</span>
          </div>
          <div className="card-body">
            <MiniBarChart values={deliveryCount} labels={weeks} color="#2563EB" max={280} />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Orders per week</div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Late Delivery Rate</span>
          </div>
          <div className="card-body">
            <MiniBarChart values={lateRate} labels={weeks} color="#DC2626" max={20} />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>% of deliveries late per week</div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">On-Time Rate</span>
          </div>
          <div className="card-body">
            <MiniBarChart values={onTimeRate} labels={weeks} color="#16A34A" max={100} />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>% on-time per week</div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Avg. Service Time</span>
          </div>
          <div className="card-body">
            <MiniBarChart values={avgServiceTime} labels={weeks} color="#D97706" max={30} />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Minutes per stop</div>
          </div>
        </div>
      </div>

      {/* Route performance table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Route Performance (Wk 16)</span>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Driver</th>
                <th>Stops</th>
                <th>Delivered</th>
                <th>On-Time</th>
                <th>Avg. Service</th>
                <th>Utilization</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {[
                { route: 'Route 01', driver: 'Nimal Perera', stops: 12, delivered: 12, onTime: '100%', service: '16 min', util: '84%', dist: '47 km' },
                { route: 'Route 02', driver: 'Kamal Silva', stops: 8, delivered: 7, onTime: '87.5%', service: '22 min', util: '58%', dist: '38 km' },
                { route: 'Route 03', driver: 'Sunil Fernando', stops: 10, delivered: 10, onTime: '90%', service: '18 min', util: '77%', dist: '52 km' },
                { route: 'Route 04', driver: 'Ruwan Jayasuriya', stops: 11, delivered: 9, onTime: '81.8%', service: '20 min', util: '87%', dist: '41 km' },
                { route: 'Route 07', driver: 'Priya Wickramasinghe', stops: 9, delivered: 8, onTime: '88.9%', service: '17 min', util: '106%', dist: '35 km' },
              ].map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{r.route}</td>
                  <td className="secondary">{r.driver}</td>
                  <td className="secondary">{r.stops}</td>
                  <td className="secondary">{r.delivered}</td>
                  <td>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: parseFloat(r.onTime) >= 90 ? 'var(--success)' : 'var(--warning)',
                    }}>{r.onTime}</span>
                  </td>
                  <td className="secondary">{r.service}</td>
                  <td>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: parseFloat(r.util) > 100 ? 'var(--danger)' : parseFloat(r.util) > 85 ? 'var(--warning)' : 'var(--success)',
                    }}>{r.util}</span>
                  </td>
                  <td className="muted">{r.dist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
