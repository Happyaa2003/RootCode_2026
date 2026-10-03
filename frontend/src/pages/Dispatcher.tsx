import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, CheckCircle2, AlertTriangle, AlertOctagon,
  Truck, Clock, ShieldCheck, PowerOff, Sparkles,
  Check, ExternalLink
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { useCurrency } from '../context/CurrencyContext';

interface AiRecommendation {
  id: string;
  type: string;
  matchScore: string;
  title: string;
  routeFromTo: string;
  reasons: string[];
  impact1Val: string;
  impact1Lbl: string;
  impact2Val: string;
  impact2Lbl: string;
  applied?: boolean;
}

export const DispatcherPage: React.FC = () => {
  const { kpis, activeDepot } = useDataset();
  const { formatPrice } = useCurrency();
  const [selectedRouteId, setSelectedRouteId] = useState<string>('r1');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([
    {
      id: 'rec-1',
      type: 'DYNAMIC RE-BALANCE',
      matchScore: '94% MATCH',
      title: 'Move ORD-010 (FreshMart Panadura)',
      routeFromTo: 'Route 01 (Sunil) → Route 02 (Chaminda)',
      reasons: [
        'Route 01 running 4m late on Baseline Road corridor',
        'Route 02 has 2.2 m³ spare chilled reefer volume',
        'Prevents $38.50 late SLA penalty on retail drop',
      ],
      impact1Val: '-18m',
      impact1Lbl: 'Travel Time',
      impact2Val: '-1 Risk',
      impact2Lbl: 'Risk Drops',
      applied: false,
    },
    {
      id: 'rec-2',
      type: 'SEQUENCE OPTIMIZE',
      matchScore: '88% MATCH',
      title: 'Swap Stop 3 & 4 on Route 03',
      routeFromTo: 'Kandana Hub before Ja-Ela Town',
      reasons: [
        'Morning school zone congestion clearance on A3',
        'Saves 4.2 km loop backtrack',
      ],
      impact1Val: '-12m',
      impact1Lbl: 'Travel Time',
      impact2Val: '-3.4L',
      impact2Lbl: 'Fuel Saved',
      applied: false,
    },
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleApplyRec = (id: string, title: string) => {
    setRecommendations(prev =>
      prev.map(r => (r.id === id ? { ...r, applied: true } : r))
    );
    showToast(`Neural Recommendation Applied: ${title}`);
  };

  const kpiItems = [
    { label: 'Total Orders', value: kpis.totalOrders || 248, cls: 'brand', trend: '+14 Today', icon: Package },
    { label: 'Planned', value: kpis.planned || 221, cls: 'brand', trend: '89.1% Wave 1', icon: CheckCircle2 },
    { label: 'Unassigned', value: kpis.unassigned || 14, cls: 'warning', trend: 'Requires Review', icon: AlertTriangle },
    { label: 'At Risk', value: kpis.atRisk || 13, cls: 'danger', trend: 'Time Window SL', icon: AlertOctagon },
    { label: 'Active Fleet', value: kpis.activeVehicles || 42, cls: 'brand', trend: '94% Utilization', icon: Truck },
    { label: 'On Schedule', value: kpis.onSchedule || 31, cls: 'success', trend: '98.4% SLA Target', icon: Clock },
    { label: 'Completed', value: kpis.completed || 4, cls: 'success', trend: '14.2 m³ Done', icon: ShieldCheck },
    { label: 'Depot Idle', value: kpis.offline || 2, cls: 'muted', trend: 'Standby Wave 2', icon: PowerOff },
  ];

  const activeRoutesList = [
    {
      id: 'r1',
      name: 'Route 01',
      driver: 'Sunil Perera',
      initials: 'SP',
      vehicle: 'WP-CAD-4821 · Reefer',
      stops: '12 Deliveries',
      estFinish: '12:30 PM',
      capText: '10.4 / 12.4 m³',
      capPct: 84,
      color: '#2563EB',
      badge: 'Active',
      timeRisk: false,
    },
    {
      id: 'r2',
      name: 'Route 02',
      driver: 'Chaminda Silva',
      initials: 'CS',
      vehicle: 'WP-DAE-9102 · Standard',
      stops: '9 Deliveries',
      estFinish: '01:15 PM',
      capText: '7.2 / 8.2 m³',
      capPct: 88,
      color: '#D97706',
      badge: 'Active',
      timeRisk: true,
    },
    {
      id: 'r3',
      name: 'Route 03',
      driver: 'Nuwan Pradeep',
      initials: 'NP',
      vehicle: 'WP-NA-2045 · Reefer',
      stops: '14 Deliveries',
      estFinish: '02:00 PM',
      capText: '15.2 / 18.6 m³',
      capPct: 82,
      color: '#8B5CF6',
      badge: 'Active',
      timeRisk: false,
    },
    {
      id: 'r4',
      name: 'Route 04',
      driver: 'Kasun Fernando',
      initials: 'KF',
      vehicle: 'WP-LY-5510 · Large',
      stops: '8 Deliveries',
      estFinish: '11:45 AM',
      capText: '9.8 / 11.0 m³',
      capPct: 89,
      color: '#F59E0B',
      badge: 'Active',
      timeRisk: false,
    },
  ];

  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)', color: '#FFFFFF', padding: '10px 20px',
          borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', fontSize: 13,
          fontWeight: 600, zIndex: 99999, boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <Check size={16} color="#10B981" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. KPI STRIP */}
      <div className="kpi-strip" style={{ flexShrink: 0 }}>
        {kpiItems.map((kpi, i) => (
          <div key={i} className={`kpi-cell ${kpi.cls}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div className={`kpi-value ${kpi.cls}`}>{kpi.value}</div>
              <div style={{
                width: 28, height: 28, borderRadius: 7, background: 'var(--bg-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
              }}>
                <kpi.icon size={15} />
              </div>
            </div>
            <div className="kpi-label">{kpi.label}</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9.5,
              color: kpi.cls === 'danger' ? 'var(--danger-vivid)' : kpi.cls === 'warning' ? 'var(--warning-vivid)' : 'var(--text-muted)',
              marginTop: 3, fontWeight: 600
            }}>
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      {/* 2. THREE COLUMN ENTERPRISE OPERATIONS LAYOUT */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT PANEL: Active Routes List */}
        <aside style={{
          width: 300, flexShrink: 0, background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)', overflowY: 'auto', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)'
          }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Active Routes
              </span>
              <span style={{
                marginLeft: 8, background: 'var(--brand-tint)', color: 'var(--brand-vivid)',
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, fontFamily: 'var(--font-mono)'
              }}>
                {activeRoutesList.length}
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
              {activeDepot?.name?.toUpperCase() || 'PELIYAGODA'}
            </span>
          </div>

          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeRoutesList.map(r => (
              <div
                key={r.id}
                onClick={() => setSelectedRouteId(r.id)}
                style={{
                  background: 'var(--bg-subtle)',
                  border: `1px solid ${selectedRouteId === r.id ? r.color : 'var(--border)'}`,
                  borderLeft: `4px solid ${r.color}`,
                  borderRadius: 8, padding: 12, cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: selectedRouteId === r.id ? `0 0 12px ${r.color}25` : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>{r.name}</span>
                    {r.timeRisk && (
                      <span style={{
                        fontSize: 9.5, fontWeight: 800, color: 'var(--warning-vivid)',
                        background: 'var(--warning-tint)', padding: '1px 6px', borderRadius: 4,
                        textTransform: 'uppercase', fontFamily: 'var(--font-mono)'
                      }}>
                        Time Risk
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, background: '#DCFCE7', color: '#15803D',
                    padding: '2px 6px', borderRadius: 4
                  }}>
                    {r.badge}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', background: `${r.color}20`,
                    border: `1px solid ${r.color}40`, color: r.color, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800,
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {r.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{r.driver}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{r.vehicle}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8, fontSize: 11.5 }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>Stops</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.stops}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>Est. Finish</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{r.estFinish}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
                  <span>Capacity: {r.capText}</span>
                  <span style={{ fontWeight: 700, color: r.capPct > 85 ? 'var(--warning-vivid)' : 'var(--text-secondary)' }}>{r.capPct}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-muted)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.capPct}%`, background: r.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER PANEL: Tactical Vector Map & Live Hub Stats */}
        <section style={{ flex: 1, position: 'relative', background: '#0B1120', display: 'flex', flexDirection: 'column' }}>
          {/* Tactical map background */}
          <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <img
              src="/colombo-tactical-map.svg"
              onError={(e) => {
                // Fallback to stylized SVG placeholder if svg not in public
                e.currentTarget.style.display = 'none';
              }}
              alt="Colombo Tactical Operations Map"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
            />

            {/* Simulated Live Tactical Map Canvas */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 40% 50%, rgba(30, 58, 138, 0.45) 0%, rgba(11, 17, 32, 0.95) 75%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {/* Radar pulse animation */}
              <div style={{
                position: 'absolute', width: 440, height: 440, borderRadius: '50%',
                border: '1px dashed rgba(56, 189, 248, 0.25)', animation: 'radarSpin 24s linear infinite'
              }} />
              <div style={{
                position: 'absolute', width: 280, height: 280, borderRadius: '50%',
                border: '1px solid rgba(56, 189, 248, 0.15)'
              }} />

              {/* Waypoint delivery pins */}
              {[
                { top: '38%', left: '42%', label: 'DEP-PEL (Peliyagoda Central Depot)', color: '#38BDF8', pulse: true },
                { top: '48%', left: '46%', label: 'Stop 01 · Keells Kollupitiya', color: '#10B981' },
                { top: '56%', left: '49%', label: 'Stop 02 · FreshMart Nugegoda', color: '#F59E0B' },
                { top: '64%', left: '53%', label: 'Stop 03 · Cargills Moratuwa', color: '#EF4444' },
                { top: '34%', left: '48%', label: 'Stop 04 · Glomark Wattala', color: '#8B5CF6' },
              ].map((pin, i) => (
                <div key={i} style={{ position: 'absolute', top: pin.top, left: pin.left, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%', background: pin.color,
                      boxShadow: `0 0 14px ${pin.color}`, border: '2px solid #FFFFFF'
                    }} />
                    <span style={{
                      background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)',
                      color: '#FFFFFF', padding: '2px 8px', borderRadius: 4,
                      fontSize: 10, fontFamily: 'var(--font-mono)', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {pin.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Hub Telemetry Box */}
            <div style={{
              position: 'absolute', top: 16, left: 20, background: 'rgba(15,23,42,0.88)',
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 16, zIndex: 20
            }}>
              <div>
                <div style={{ fontSize: 9.5, color: '#94A3B8', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ACTIVE LOGISTICS HUB
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#FFFFFF' }}>
                  {activeDepot?.name || 'Peliyagoda Central Depot'}
                </div>
              </div>
              <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.12)' }} />
              <div>
                <div style={{ fontSize: 9.5, color: '#94A3B8', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  LIVE VEHICLES
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#38BDF8' }}>
                  6 En Route
                </div>
              </div>
            </div>

            {/* Floating Plan Performance Box */}
            <div style={{
              position: 'absolute', bottom: 20, left: 20, background: 'rgba(15,23,42,0.92)',
              backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 10, padding: 14, minWidth: 260, zIndex: 20, boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                Live Dispatch Wave 1
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>
                Peliyagoda Commercial Run · Monday Operations
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>8 / 248</div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>Completed Stops</div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>1</div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>Failed Attempt</div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>2</div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>Running Late</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>{formatPrice(68400)}</div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>Cargo In-Transit</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: Neural Dispatch AI + Critical Exceptions */}
        <aside style={{
          width: 340, flexShrink: 0, background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)', overflowY: 'auto', display: 'flex', flexDirection: 'column'
        }}>
          {/* Neural AI Section */}
          <div style={{ padding: 14, borderBottom: '1px solid var(--border)' }}>
            <div style={{
              fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px',
              color: '#8B5CF6', marginBottom: 12, display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color="#8B5CF6" />
                <span>NEURAL DISPATCH V2.6</span>
              </div>
              <span style={{
                background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', padding: '2px 7px',
                borderRadius: 4, border: '1px solid rgba(139,92,246,0.3)', fontSize: 10
              }}>
                LIVE
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recommendations.map(rec => (
                <div
                  key={rec.id}
                  style={{
                    background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: 12, borderLeft: '3.5px solid #8B5CF6'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#8B5CF6', fontFamily: 'var(--font-mono)' }}>
                      {rec.type}
                    </span>
                    <span style={{ fontSize: 10, color: '#8B5CF6', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {rec.matchScore}
                    </span>
                  </div>

                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {rec.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--brand-vivid)', fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                    {rec.routeFromTo}
                  </div>

                  <ul style={{ margin: '0 0 10px 0', paddingLeft: 16, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {rec.reasons.map((r, idx) => (
                      <li key={idx} style={{ marginBottom: 3 }}>{r}</li>
                    ))}
                  </ul>

                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                    background: 'var(--bg-muted)', padding: '6px 10px', borderRadius: 6, marginBottom: 10
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>{rec.impact1Val}</div>
                      <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{rec.impact1Lbl}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>{rec.impact2Val}</div>
                      <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{rec.impact2Lbl}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => showToast(`Reviewing constraints for ${rec.title}`)}
                      style={{
                        flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid var(--border)',
                        background: 'var(--bg-surface)', color: 'var(--text-secondary)',
                        fontSize: 11.5, fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      Review
                    </button>
                    <button
                      disabled={rec.applied}
                      onClick={() => handleApplyRec(rec.id, rec.title)}
                      style={{
                        flex: 1, padding: '6px 0', borderRadius: 6, border: 'none',
                        background: rec.applied ? '#10B981' : 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                        color: '#FFFFFF', fontSize: 11.5, fontWeight: 700, cursor: rec.applied ? 'default' : 'pointer'
                      }}
                    >
                      {rec.applied ? '✓ Applied' : 'Apply'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exceptions Stream */}
          <div style={{ padding: 14 }}>
            <div style={{
              fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px',
              color: 'var(--text-muted)', marginBottom: 12, display: 'flex',
              justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)'
            }}>
              <span>CRITICAL EXCEPTIONS</span>
              <span style={{
                color: 'var(--danger-vivid)', background: 'var(--danger-tint)',
                padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(220,38,38,0.25)', fontWeight: 700
              }}>
                3 ACTIVE
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Exception 1 */}
              <div style={{
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                borderLeft: '3.5px solid #EF4444', borderRadius: 8, padding: 10
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: '#EF4444', background: '#FEE2E2', padding: '1px 6px', borderRadius: 4 }}>
                    CRITICAL
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>07:15 AM</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>WP-CAD-8812 (VEH-019)</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#EF4444', marginTop: 1 }}>Vehicle Grounded in Workshop</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.35 }}>
                  Fleet unit flagged in maintenance workshop. Lost capacity: 12.4 m³.
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button
                    onClick={() => showToast('Reassignment wizard opened')}
                    style={{
                      padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)',
                      background: 'var(--bg-surface)', fontSize: 10.5, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Reassign
                  </button>
                  <Link
                    to="/exceptions"
                    style={{
                      padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)',
                      background: 'var(--bg-surface)', fontSize: 10.5, fontWeight: 600,
                      textDecoration: 'none', color: 'inherit'
                    }}
                  >
                    Exceptions View
                  </Link>
                </div>
              </div>

              {/* Exception 2 */}
              <div style={{
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                borderLeft: '3.5px solid #F59E0B', borderRadius: 8, padding: 10
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: '#D97706', background: '#FEF3C7', padding: '1px 6px', borderRadius: 4 }}>
                    HIGH
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>08:43 AM</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>ORD-009 · Keells Nugegoda</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#D97706', marginTop: 1 }}>Delayed by 4m (+ $18.00 SLA)</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.35 }}>
                  High-Level Road water main repair causing stop access bottleneck.
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button
                    onClick={() => showToast('Exception SLA waiver approved')}
                    style={{
                      padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)',
                      background: 'var(--bg-surface)', fontSize: 10.5, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Approve Waiver
                  </button>
                </div>
              </div>

              {/* Exception 3 */}
              <div style={{
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                borderLeft: '3.5px solid #3B82F6', borderRadius: 8, padding: 10
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: '#2563EB', background: '#DBEAFE', padding: '1px 6px', borderRadius: 4 }}>
                    MEDIUM
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>08:54 AM</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>ORD-012 · Cargills Moratuwa</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#2563EB', marginTop: 1 }}>Dock Space Unavailable</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.35 }}>
                  Receiving dock congested. Driver waiting on perimeter apron.
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <Link
                    to="/store-manager"
                    style={{
                      padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)',
                      background: 'var(--bg-surface)', fontSize: 10.5, fontWeight: 600,
                      textDecoration: 'none', color: '#2563EB', display: 'flex', alignItems: 'center', gap: 4
                    }}
                  >
                    <span>Store Receiving Portal</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DispatcherPage;
