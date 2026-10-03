import React, { useState } from 'react';
import { Truck, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import OperationalMap from '../components/map/OperationalMap';
import StatusBadge from '../components/common/StatusBadge';
import { useDataset } from '../context/DatasetContext';
import type { Route } from '../types';

const LiveOps: React.FC = () => {
  const { routes, kpis: kpiSummary } = useDataset();
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const atRiskCount = routes.flatMap(r => r.stops).filter(s => s.status === 'At Risk').length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Live Status Strip */}
      <div style={{
        display: 'flex', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
        padding: '12px 22px', gap: 28, alignItems: 'center', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { value: kpiSummary.onSchedule, label: 'On Schedule', color: 'var(--success-vivid)', icon: Clock },
            { value: atRiskCount, label: 'At Risk', color: 'var(--warning-vivid)', icon: AlertTriangle },
            { value: kpiSummary.completed, label: 'Completed', color: 'var(--brand-vivid)', icon: ShieldCheck },
            { value: kpiSummary.offline, label: 'Depot Standby', color: 'var(--text-muted)', icon: Truck },
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: stat.color + '15',
                border: `1px solid ${stat.color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: 18, fontWeight: 700, color: stat.color,
                boxShadow: `0 0 12px ${stat.color}20`
              }}>
                {stat.value}
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{stat.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TELEMETRY OK</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="live-indicator">
            <span className="live-dot" />
            <span>RADAR ACTIVE · 12S PING</span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="liveops-layout">
        {/* Map */}
        <div className="liveops-map">
          <OperationalMap
            selectedRouteId={selectedRoute?.id}
            onRouteClick={id => {
              const r = routes.find(r => r.id === id);
              setSelectedRoute(r ?? null);
            }}
            showVehicles={true}
          />
        </div>

        {/* Right panel: active routes */}
        <div className="liveops-panel">
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--bg-subtle)'
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)'
            }}>
              Active Missions ({routes.length})
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--brand-vivid)',
              background: 'var(--brand-tint)', padding: '2px 7px', borderRadius: 4, fontWeight: 700
            }}>
              LIVE GPS
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {routes.map(route => {
              const progress = route.stops.filter(s => s.status === 'Delivered').length;
              const isSelected = selectedRoute?.id === route.id;
              const hasRisk = route.stops.some(s => s.status === 'At Risk');
              const routeStatus = hasRisk ? 'At Risk' : route.status === 'Active' ? 'En Route' : route.status as any;

              return (
                <div
                  key={route.id}
                  className="driver-row"
                  style={{
                    background: isSelected ? 'var(--brand-tint)' : undefined,
                    borderLeft: isSelected ? `3.5px solid ${route.color}` : '3.5px solid transparent',
                  }}
                  onClick={() => setSelectedRoute(r => r?.id === route.id ? null : route)}
                >
                  <div
                    className="driver-avatar-sm"
                    style={{
                      background: route.color + '20',
                      border: `1px solid ${route.color}45`,
                      color: route.color
                    }}
                  >
                    {route.driver?.initials ?? '??'}
                  </div>

                  <div className="driver-row-info">
                    <div className="driver-row-name">{route.driver?.name ?? 'Unassigned'}</div>
                    <div className="driver-row-sub">
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{route.vehicle?.plate}</span> · {route.name}
                    </div>
                    {/* Simulated Telemetry speed & cold chain */}
                    <div style={{
                      display: 'flex', gap: 6, marginTop: 4, fontSize: 9.5,
                      fontFamily: 'var(--font-mono)', color: 'var(--text-muted)'
                    }}>
                      <span style={{ color: 'var(--brand-vivid)' }}>38 km/h</span>
                      <span>•</span>
                      <span style={{ color: 'var(--success-vivid)' }}>3.4°C Chilled</span>
                    </div>

                    <div style={{ marginTop: 6 }}>
                      <div style={{
                        height: 4, background: 'var(--bg-muted)', borderRadius: 2, overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', background: route.color,
                          width: `${Math.round((progress / Math.max(route.stops.length, 1)) * 100)}%`,
                          borderRadius: 2,
                          boxShadow: `0 0 6px ${route.color}`
                        }} />
                      </div>
                    </div>
                  </div>

                  <div className="driver-row-right">
                    <div className="driver-progress">
                      {progress} / {route.stops.length}
                    </div>
                    <div className="driver-eta">{route.estimatedFinish ?? '—'}</div>
                    <div style={{ marginTop: 4 }}>
                      <StatusBadge status={routeStatus} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected route detail */}
          {selectedRoute && (
            <div style={{
              borderTop: '1px solid var(--border)',
              padding: 16, background: 'var(--bg-subtle)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div className="route-color-dot" style={{ background: selectedRoute.color, width: 9, height: 9 }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5 }}>
                  {selectedRoute.name} — Waypoint Schedule
                </span>
              </div>
              {selectedRoute.stops.slice(0, 3).map((stop, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                  fontSize: 12,
                }}>
                  <div>
                    <span style={{
                      fontWeight: 700, marginRight: 8, color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)', fontSize: 11
                    }}>
                      {String(stop.sequence).padStart(2, '0')}
                    </span>
                    <span style={{ fontWeight: 600 }}>{stop.order.outlet.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{stop.eta}</span>
                    <StatusBadge status={stop.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveOps;
