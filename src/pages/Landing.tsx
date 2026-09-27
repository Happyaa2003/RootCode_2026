import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Route, Package, Truck, BarChart2, AlertTriangle, MapPin,
  ArrowRight, CheckCircle2, Sun, Moon
} from 'lucide-react';

interface LandingProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

// Showstopper Product Preview Component
const ProductPreview: React.FC = () => (
  <div className="product-frame">
    <div className="product-frame-bar">
      <div className="frame-dot frame-dot-red" />
      <div className="frame-dot frame-dot-yellow" />
      <div className="frame-dot frame-dot-green" />
      <span style={{
        marginLeft: 12, fontSize: 10, fontFamily: 'var(--font-mono)',
        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px'
      }}>
        WAYPOINT DISPATCH MATRIX · COLOMBO LOGISTICS GRID
      </span>
    </div>
    <div style={{ display: 'flex', height: 410, fontFamily: 'var(--font-sans)' }}>
      {/* Mini sidebar */}
      <div style={{
        width: 220, background: '#080C16', borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', fontSize: 11,
      }}>
        <div style={{
          padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontWeight: 700, color: '#38BDF8', letterSpacing: '0.8px',
          textTransform: 'uppercase', fontSize: 10, fontFamily: 'var(--font-mono)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>UNASSIGNED QUEUE</span>
          <span style={{ background: 'rgba(56,189,248,0.15)', padding: '1px 6px', borderRadius: 4 }}>14</span>
        </div>
        {[
          { id: 'WD-1028', outlet: 'FreshMart Nugegoda', window: '08:30–11:00', vol: '2.4 m³', risk: 18, temp: 'CHILLED', riskCls: '#22C55E' },
          { id: 'WD-1039', outlet: 'FreshMart Kalutara', window: '08:00–10:00', vol: '3.8 m³', risk: 55, temp: 'CHILLED', riskCls: '#F59E0B' },
          { id: 'WD-1041', outlet: 'FreshMart Panadura', window: '08:30–10:30', vol: '2.6 m³', risk: 48, temp: 'CHILLED', riskCls: '#F59E0B' },
          { id: 'WD-1037', outlet: 'FreshMart Negombo', window: '10:00–13:00', vol: '2.9 m³', risk: 31, temp: 'CHILLED', riskCls: '#F59E0B' },
        ].map(o => (
          <div key={o.id} style={{
            padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 11, fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>{o.id}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: o.riskCls, fontFamily: 'var(--font-mono)' }}>{o.risk}% RISK</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>{o.outlet}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 5, fontFamily: 'var(--font-mono)' }}>{o.window}</div>
            <div style={{ display: 'flex', gap: 5 }}>
              <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.08)', borderRadius: 3, padding: '2px 5px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}>{o.vol}</span>
              <span style={{ fontSize: 9, background: 'rgba(59,130,246,0.2)', borderRadius: 3, padding: '2px 5px', fontWeight: 600, color: '#60A5FA', fontFamily: 'var(--font-mono)' }}>{o.temp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Cyber Map */}
      <div style={{
        flex: 1, background: '#070B16', position: 'relative', overflow: 'hidden',
      }}>
        {/* Fake Tactical Map Grid */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <radialGradient id="hubGlow" cx="35" cy="50" r="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="40%" x2="100%" y2="40%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4"/>
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4"/>
          <line x1="35%" y1="0" x2="35%" y2="100%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4"/>
          <line x1="65%" y1="0" x2="65%" y2="100%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4"/>

          <circle cx="35" cy="50" r="80" fill="url(#hubGlow)" />

          {/* Route 1 — Electric Blue */}
          <polyline
            points="35,50 120,130 180,200 240,240"
            fill="none" stroke="#38BDF8" strokeWidth="3.5" opacity="0.9" strokeLinejoin="round"
          />
          {/* Route 2 — Cyber Purple */}
          <polyline
            points="35,50 80,80 150,100 230,110 290,150"
            fill="none" stroke="#A855F7" strokeWidth="3" opacity="0.8" strokeLinejoin="round"
          />
          {/* Route 3 — Neon Emerald */}
          <polyline
            points="35,50 60,90 90,160 110,240 140,300"
            fill="none" stroke="#10B981" strokeWidth="3" opacity="0.75" strokeLinejoin="round"
          />

          {/* Peliyagoda Hub */}
          <rect x="20" y="35" width="30" height="30" rx="8" fill="#1E40AF" stroke="#60A5FA" strokeWidth="2"/>
          <text x="35" y="54" fontSize="10" fill="#FFFFFF" textAnchor="middle" fontWeight="bold" fontFamily="var(--font-mono)">HUB</text>

          {/* Stop markers */}
          {[
            { cx: 120, cy: 130, n: '01', c: '#38BDF8' },
            { cx: 180, cy: 200, n: '02', c: '#38BDF8' },
            { cx: 240, cy: 240, n: '03', c: '#F59E0B' },
            { cx: 230, cy: 110, n: '01', c: '#A855F7' },
            { cx: 290, cy: 150, n: '02', c: '#A855F7' },
          ].map((m, i) => (
            <g key={i}>
              <circle cx={m.cx} cy={m.cy} r="10" fill={m.c} stroke="#FFFFFF" strokeWidth="2"/>
              <text x={m.cx} y={m.cy + 4} fontSize="8" fill="#000000" textAnchor="middle" fontWeight="900" fontFamily="var(--font-mono)">{m.n}</text>
            </g>
          ))}

          {/* Moving vehicles */}
          <circle cx="160" cy="160" r="9" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2"/>
          <circle cx="200" cy="125" r="9" fill="#A855F7" stroke="#FFFFFF" strokeWidth="2"/>
        </svg>

        {/* Map overlay pills */}
        <div style={{
          position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {[
            { label: 'ROUTE 01 · COLOMBO SOUTH', color: '#38BDF8', stops: '12 stops', eta: 'ETA 11:42' },
            { label: 'ROUTE 02 · KANDY HIGHWAY', color: '#A855F7', stops: '8 stops', eta: 'ETA 12:30' },
            { label: 'ROUTE 03 · NEGOMBO COAST', color: '#10B981', stops: '10 stops', eta: 'ETA 13:00' },
          ].map((r, i) => (
            <div key={i} style={{
              background: 'rgba(8,12,22,0.85)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, padding: '5px 10px', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5, fontFamily: 'var(--font-mono)',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: r.color, boxShadow: `0 0 8px ${r.color}` }} />
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{r.label}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>{r.stops}</span>
              <span style={{ color: '#38BDF8', fontWeight: 600 }}>{r.eta}</span>
            </div>
          ))}
        </div>

        <div style={{
          position: 'absolute', bottom: 10, left: 10, fontSize: 10, color: 'rgba(255,255,255,0.6)',
          background: 'rgba(8,12,22,0.85)', padding: '4px 10px', borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-mono)',
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
          PELIYAGODA SAT-LINK · 24 VEHICLES MONITORED · 100% DISPATCH LOCK
        </div>
      </div>
    </div>
  </div>
);

const Landing: React.FC<LandingProps> = ({ theme, onThemeToggle }) => {
  const navigate = useNavigate();

  return (
    <div className="landing-body">
      {/* Top Navigation */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(6,182,212,0.4)',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L2 6v6l7 4 7-4V6L9 2z" stroke="white" strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
              <path d="M2 6l7 4 7-4" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M9 10v6" stroke="white" strokeWidth="1.6"/>
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '0.5px', color: '#FFFFFF' }}>WAYPOINT</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#38BDF8', letterSpacing: '1px' }}>DISPATCH PLATFORM</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13.5, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/planner')}>Route Planner</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/live')}>Live Fleet</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/forecast')}>Demand Forecast</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/exceptions')}>Exceptions</span>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 28 }}>
          <button className="theme-toggle" onClick={onThemeToggle} style={{ marginRight: 6 }}>
            <div className="theme-toggle-thumb">
              {theme === 'light' ? <Sun size={12} /> : <Moon size={12} />}
            </div>
          </button>
          <button className="btn btn-secondary" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)' }} onClick={() => navigate('/')}>
            Sign In
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Launch Console <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="landing-hero">
        <div>
          {/* Tactical Geo Pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 20, padding: '5px 14px', marginBottom: 24,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
              SRI LANKA DISPATCH MATRIX · 3 CENTRAL HUBS LIVE
            </span>
          </div>

          <h1 className="landing-headline">
            Mission-critical route dispatch & fleet telemetry.
          </h1>
          <p className="landing-subheadline">
            Waypoint transforms high-density Sri Lankan retail and cold-chain logistics with sub-minute route optimization, dynamic vehicle capacity balancing, and predictive time-window risk detection.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ height: 48, padding: '0 24px', fontSize: 14 }} onClick={() => navigate('/planner')}>
              Launch Route Planner <ArrowRight size={17} />
            </button>
            <button className="btn btn-secondary" style={{ height: 48, padding: '0 22px', fontSize: 14, color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)' }} onClick={() => navigate('/')}>
              View Live Dashboard
            </button>
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              '48 Fleet Vehicles Monitored',
              'Sub-60s Multi-Stop AI Solver',
              'Real-Time GPS & Temperature Sensors',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'rgba(255,255,255,0.75)' }}>
                <CheckCircle2 size={15} color="#22C55E" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <ProductPreview />
        </div>
      </div>

      {/* Stats Strip */}
      <div className="stats-strip">
        <div className="stats-grid">
          {[
            { value: '248', label: 'Daily Outlets Optimized' },
            { value: '98.4%', label: 'On-Time Delivery SLA' },
            { value: '-22%', label: 'Transit Kilometers Saved' },
            { value: '<45s', label: 'Solver Execution Velocity' },
          ].map((s, i) => (
            <div key={i}>
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Platform Capabilities */}
      <div className="landing-section">
        <div className="landing-section-eyebrow">Enterprise Capabilities</div>
        <h2 className="landing-section-title">
          Engineered for the operational realities<br />of complex last-mile logistics.
        </h2>
        <p className="landing-section-desc">
          Every screen, map layer, and algorithm was built specifically for dispatchers, fleet controllers, and cross-dock operations managers.
        </p>

        <div className="feature-grid">
          {[
            {
              icon: Route,
              title: 'Multi-Constraint Route Engine',
              desc: 'Solves complex Sri Lankan road topologies, narrow street access constraints, chilled and frozen dual-temperature requirements, and strict store delivery windows in seconds.',
            },
            {
              icon: Package,
              title: 'Dynamic Volume & Weight Balancing',
              desc: 'Visualizes 3D vehicle utilization curves before cross-dock loading begins. Automatically detects and rebalances over-weight or over-cube vehicles.',
            },
            {
              icon: AlertTriangle,
              title: 'Predictive Time-Window Risk Detection',
              desc: 'Identifies high-risk stops before the truck leaves Peliyagoda depot using historical Colombo traffic trends, monsoon transit factors, and outlet unload delays.',
            },
            {
              icon: BarChart2,
              title: '10-Week Fleet Demand Forecasting',
              desc: 'Machine-learning models predict upcoming seasonal surges (Avurudu, Christmas, monsoon weeks) to prevent vehicle shortfalls weeks in advance.',
            },
            {
              icon: Truck,
              title: 'Telemetry & Cold-Chain Tracking',
              desc: 'Continuous GPS coordinates, vehicle speed, engine diagnostics, and real-time cargo temperature monitoring integrated directly into the map.',
            },
            {
              icon: MapPin,
              title: 'Interactive Command Center Map',
              desc: 'High-contrast tactical satellite and vector map with live vehicle breadcrumbs, animated stop timelines, and geofence entry/exit logs.',
            },
          ].map((feature, i) => (
            <div key={i} className="feature-card">
              <div className="feature-card-icon">
                <feature.icon size={22} />
              </div>
              <div className="feature-card-title">{feature.title}</div>
              <div className="feature-card-desc">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-title">Ready to modernize your dispatch operations?</div>
        <div className="cta-desc">
          Experience the speed, precision, and clarity of Waypoint across your fleet and distribution centers today.
        </div>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <button className="btn btn-white" style={{ height: 48, padding: '0 26px', fontSize: 14.5 }} onClick={() => navigate('/')}>
            Open Command Center <ArrowRight size={16} />
          </button>
          <button className="btn" style={{
            height: 48, padding: '0 24px', fontSize: 14.5, background: 'rgba(255,255,255,0.08)',
            color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)',
          }} onClick={() => navigate('/planner')}>
            Test Route Optimization
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 24, height: 24, background: '#2563EB',
            borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L2 6v6l7 4 7-4V6L9 2z" stroke="white" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-display)' }}>WAYPOINT</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>· SRI LANKA FLEET LOGISTICS OS</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          © 2026 Waypoint Technologies Ltd. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Landing;
