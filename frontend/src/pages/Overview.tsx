import React, { useState } from 'react';
import {
  AlertTriangle, Package, CheckCircle2,
  AlertOctagon, Truck, Clock, ShieldCheck, PowerOff, Sparkles
} from 'lucide-react';
import OperationalMap from '../components/map/OperationalMap';
import StatusBadge from '../components/common/StatusBadge';
import CapacityBar from '../components/common/CapacityBar';
import { useDataset } from '../context/DatasetContext';
import { aiRecommendations } from '../data/mockData';
import type { Exception } from '../types';

const Overview: React.FC = () => {
  const { routes, kpis } = useDataset();
  const [selectedRoute, setSelectedRoute] = useState<string | undefined>();

  // Fallback exceptions list for executive overview
  const exceptions: Exception[] = [
    {
      id: 'EXC-001',
      severity: 'Critical',
      timestamp: '07:15 AM',
      entityType: 'Vehicle',
      entityId: 'VEH-019',
      entityName: 'WP-CAD-8812 (VEH-019)',
      problem: 'Vehicle Grounded in Workshop',
      detail: 'Fleet unit flagged in maintenance workshop. Lost capacity: 12.4 m³.',
      impact: 'Lost capacity',
      resolved: false,
      actions: ['Reassign', 'Supervisor'],
    },
    {
      id: 'EXC-002',
      severity: 'High',
      timestamp: '08:43 AM',
      entityType: 'Order',
      entityId: 'ORD-009',
      entityName: 'ORD-009 · Keells Nugegoda',
      problem: 'Delayed by 4m (+ $18.00 SLA)',
      detail: 'Service start delayed due to High-Level Road water main repair.',
      impact: 'SLA risk',
      resolved: false,
      actions: ['Approve', 'Recalculate'],
    },
    {
      id: 'EXC-003',
      severity: 'Medium',
      timestamp: '08:54 AM',
      entityType: 'Order',
      entityId: 'ORD-012',
      entityName: 'ORD-012 · Cargills Moratuwa',
      problem: 'Dock Space Unavailable',
      detail: 'Receiving dock congested. Driver waiting on perimeter apron.',
      impact: 'Dock turnaround',
      resolved: false,
      actions: ['Store Portal'],
    },
  ];

  const kpiItems = [
    { label: 'Total Orders',    value: kpis.totalOrders,    cls: 'brand',   trend: '+14 Today',       icon: Package },
    { label: 'Planned',         value: kpis.planned,        cls: 'brand',   trend: 'Wave 1 Active',   icon: CheckCircle2 },
    { label: 'Unassigned',      value: kpis.unassigned,     cls: 'warning', trend: 'Requires Review', icon: AlertTriangle },
    { label: 'At Risk',         value: kpis.atRisk,         cls: 'danger',  trend: 'Time Window SL',  icon: AlertOctagon },
    { label: 'Active Fleet',    value: kpis.activeVehicles, cls: 'brand',   trend: 'High Utilization', icon: Truck },
    { label: 'On Schedule',     value: kpis.onSchedule,     cls: 'success', trend: '98.4% SLA Target',icon: Clock },
    { label: 'Completed',       value: kpis.completed,      cls: 'success', trend: 'Delivered',       icon: ShieldCheck },
    { label: 'Depot Idle',      value: kpis.offline,        cls: 'muted',   trend: 'Standby Wave 2',  icon: PowerOff },
  ];

  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* KPI strip */}
      <div className="kpi-strip">
        {kpiItems.map((kpi, i) => (
          <div key={i} className={`kpi-cell ${kpi.cls}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div className={`kpi-value ${kpi.cls}`}>{kpi.value}</div>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'var(--bg-muted)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)'
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

      {/* 3-column layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT: Routes */}
        <div style={{
          width: 290, flexShrink: 0, background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--bg-subtle)'
          }}>
            <div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px'
              }}>Active Routes</span>
              <span style={{
                marginLeft: 8, background: 'var(--brand-tint)', color: 'var(--brand-vivid)',
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                fontFamily: 'var(--font-mono)'
              }}>{routes.length}</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
              PELIYAGODA
            </span>
          </div>

          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {routes.map(route => {
              const cap = route.vehicle?.capacityVolume ?? 12.4;
              const volPct = Math.round((route.usedVolume / cap) * 100);
              const hasRisk = route.stops.some(s => s.status === 'At Risk');

              return (
                <div
                  key={route.id}
                  className={`route-card ${selectedRoute === route.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRoute(r => r === route.id ? undefined : route.id)}
                  style={{ borderLeft: `3.5px solid ${route.color}` }}
                >
                  <div className="route-card-header">
                    <div className="route-name-tag">
                      <span className="route-label">{route.name}</span>
                      {hasRisk && (
                        <span style={{
                          fontSize: 9.5, fontWeight: 800, color: 'var(--warning-vivid)',
                          background: 'var(--warning-tint)', padding: '1px 6px',
                          borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.4px',
                          border: '1px solid rgba(217,119,6,0.3)', fontFamily: 'var(--font-mono)'
                        }}>Time Risk</span>
                      )}
                    </div>
                    <StatusBadge status={route.status} />
                  </div>

                  <div className="route-driver-info">
                    <div className="driver-initials" style={{
                      borderColor: route.color + '40',
                      background: route.color + '15',
                      color: route.color
                    }}>
                      {route.driver?.initials ?? '??'}
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {route.driver?.name ?? 'Unassigned'}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {route.vehicle?.plate ?? '—'} · {route.vehicle?.type}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <div>
                        <div className="route-meta-label">Stops</div>
                        <div className="route-meta-value">{route.stops.length} Deliveries</div>
                      </div>
                      <div>
                        <div className="route-meta-label">Est. Finish</div>
                        <div className="route-meta-value" style={{ fontFamily: 'var(--font-mono)' }}>
                          {route.estimatedFinish ?? '—'}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
                        <span>Capacity: {route.usedVolume} / {cap} m³</span>
                        <span style={{ fontWeight: 700, color: volPct > 85 ? 'var(--warning-vivid)' : 'var(--text-secondary)' }}>{volPct}%</span>
                      </div>
                      <CapacityBar used={route.usedVolume} total={cap} showLabel={false} height={4} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER: Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <OperationalMap
            selectedRouteId={selectedRoute}
            onRouteClick={id => setSelectedRoute(r => r === id ? undefined : id)}
          />
        </div>

        {/* RIGHT: AI + Exceptions */}
        <div style={{
          width: 320, flexShrink: 0, background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* AI Recommendations */}
          <div style={{ padding: 14, borderBottom: '1px solid var(--border)' }}>
            <div style={{
              fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px',
              color: 'var(--purple-vivid)', marginBottom: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color="var(--purple-vivid)" />
                <span>NEURAL DISPATCH V2.6</span>
              </div>
              <span style={{
                background: 'var(--purple-tint)', padding: '2px 7px',
                borderRadius: 4, border: '1px solid rgba(124,58,237,0.25)', fontSize: 10
              }}>LIVE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aiRecommendations.map(rec => (
                <div key={rec.id} className="ai-card">
                  <div className="ai-card-header">
                    <span className="ai-label">DYNAMIC RE-BALANCE</span>
                    <span style={{
                      marginLeft: 'auto', fontSize: 11, color: 'var(--purple-vivid)',
                      fontWeight: 700, fontFamily: 'var(--font-mono)'
                    }}>
                      {rec.confidence}% MATCH
                    </span>
                  </div>
                  <div className="ai-card-body">
                    <div className="ai-move-title">Move {rec.orderName}</div>
                    <div className="ai-move-route">{rec.fromRouteName} → {rec.toRouteName}</div>
                    <ul className="ai-reasons">
                      {rec.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                    <div className="ai-impact">
                      <div>
                        <div className="ai-impact-value">{rec.impact.travelDelta}m</div>
                        <div className="ai-impact-label">Travel Time</div>
                      </div>
                      <div>
                        <div className="ai-impact-value">{rec.impact.atRiskDelta}</div>
                        <div className="ai-impact-label">Risk Drops</div>
                      </div>
                    </div>
                    <div className="ai-card-actions">
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Review</button>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1, background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)' }}>Apply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exceptions Alert Stream */}
          <div style={{ padding: 14 }}>
            <div style={{
              fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px',
              color: 'var(--text-muted)', marginBottom: 12,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontFamily: 'var(--font-mono)'
            }}>
              <span>CRITICAL EXCEPTIONS</span>
              <span style={{
                color: 'var(--danger-vivid)', background: 'var(--danger-tint)',
                padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(220,38,38,0.25)',
                fontWeight: 700
              }}>
                {exceptions.filter(e => !e.resolved).length} ACTIVE
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {exceptions.slice(0, 4).map(exc => (
                <div key={exc.id} className={`exception-row ${exc.severity.toLowerCase()}`}>
                  <div>
                    <div className={`exception-severity severity-${exc.severity.toLowerCase()}`}>
                      {exc.severity}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                      {exc.timestamp}
                    </div>
                  </div>
                  <div className="exception-content">
                    <div className="exception-entity">{exc.entityName}</div>
                    <div className="exception-problem">{exc.problem}</div>
                    <div className="exception-detail">{exc.detail}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      {exc.actions.map((a, i) => (
                        <button key={i} className="btn btn-secondary btn-xs">{a}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
