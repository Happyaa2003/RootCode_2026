import React, { useState, useMemo } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Search } from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import type { ExceptionSeverity, Exception } from '../types';

const severityIcon = (sev: ExceptionSeverity, size = 16) => {
  if (sev === 'Critical') return <AlertCircle size={size} color="var(--danger)" />;
  if (sev === 'High') return <AlertTriangle size={size} color="var(--warning)" />;
  if (sev === 'Medium') return <Info size={size} color="var(--brand)" />;
  return <Info size={size} color="var(--n400)" />;
};

const ExceptionsPage: React.FC = () => {
  const { orders, allVehicles } = useDataset();

  const [filter, setFilter] = useState<'All' | ExceptionSeverity>('All');
  const [search, setSearch] = useState('');
  const [resolved, setResolved] = useState(false);

  // Derive dynamic exceptions directly from orders delays and vehicle workshop groundings
  const dynamicExceptions: Exception[] = useMemo(() => {
    const list: Exception[] = [];

    // 1. Vehicles grounded in workshop from task2b_peak_day_fleet.csv
    const groundedVehicles = allVehicles.filter(v => v.status === 'Maintenance');
    groundedVehicles.forEach((v, idx) => {
      list.push({
        id: `EXC-VEH-${idx + 1}`,
        severity: 'Critical',
        timestamp: '07:15 AM',
        entityType: 'Vehicle',
        entityId: v.id,
        entityName: `${v.plate} (${v.id})`,
        problem: 'Vehicle Grounded in Maintenance Workshop',
        detail: `Fleet unit ${v.id} is flagged in_workshop (task2b_peak_day_fleet). Vehicle unavailable for route dispatch.`,
        impact: `Lost capacity: ${v.capacityVolume} m³ (${v.capacityWeight} kg). Quota frozen at ${v.weeklyFuelQuotaL} L.`,
        resolved: false,
        actions: ['Reassign Scheduled Deliveries', 'Notify Fleet Supervisor', 'Inspect Repair ETA'],
      });
    });

    // 2. Delayed orders with late SLA penalties
    const delayedOrders = orders.filter(o => o.delayMinutes && o.delayMinutes > 0);
    delayedOrders.forEach((o, idx) => {
      const penalty = o.costBreakdown?.penaltyCost || (o.delayMinutes! * 4.50);
      list.push({
        id: `EXC-ORD-${idx + 1}`,
        severity: o.delayMinutes! >= 5 ? 'High' : 'Medium',
        timestamp: `${o.scheduledAt || '08:30'} AM`,
        entityType: 'Order',
        entityId: o.id,
        entityName: `${o.id} · ${o.outlet.name}`,
        problem: `Delivery Delayed by ${o.delayMinutes} Minutes (SLA Incurred: $${penalty.toFixed(2)})`,
        detail: `Arrival occurred behind scheduled window (${o.scheduledAt}). Dock allowance: ${o.serviceAllowanceMin || 18}m for ${o.brand} retail drop.`,
        impact: `Financial SLA penalty: +$${penalty.toFixed(2)} charged against route gross margin.`,
        resolved: false,
        actions: ['Approve Delay Exception', 'Recalculate Next ETA', 'Contact Store Receiving'],
      });
    });

    return list;
  }, [allVehicles, orders]);

  const filtered = dynamicExceptions.filter(e => {
    if (e.resolved !== resolved) return false;
    if (filter !== 'All' && e.severity !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.entityName.toLowerCase().includes(q) || e.problem.toLowerCase().includes(q) || e.entityId.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="sidebar-search" style={{ width: 240 }}>
            <Search size={14} color="var(--text-muted)" />
            <input placeholder="Search exceptions & incidents..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-bar">
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(s => (
              <button
                key={s}
                className={`filter-select ${filter === s ? 'active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s !== 'All' && severityIcon(s as ExceptionSeverity, 12)}
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="page-header-right">
          <div className="tab-strip" style={{ borderBottom: 'none', padding: 0, gap: 4 }}>
            <button
              className={`tab-item ${!resolved ? 'active' : ''}`}
              onClick={() => setResolved(false)}
            >
              Active Incidents ({dynamicExceptions.filter(e => !e.resolved).length})
            </button>
            <button
              className={`tab-item ${resolved ? 'active' : ''}`}
              onClick={() => setResolved(true)}
            >
              Resolved (0)
            </button>
          </div>
        </div>
      </div>

      {/* Severity summary strip */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-subtle)', flexShrink: 0,
      }}>
        {[
          { sev: 'Critical', color: 'var(--danger)', bg: 'var(--danger-tint)', count: dynamicExceptions.filter(e => e.severity === 'Critical' && !e.resolved).length },
          { sev: 'High', color: 'var(--warning)', bg: 'var(--warning-tint)', count: dynamicExceptions.filter(e => e.severity === 'High' && !e.resolved).length },
          { sev: 'Medium', color: 'var(--brand)', bg: 'var(--brand-tint)', count: dynamicExceptions.filter(e => e.severity === 'Medium' && !e.resolved).length },
          { sev: 'Low', color: 'var(--n400)', bg: 'var(--bg-muted)', count: dynamicExceptions.filter(e => e.severity === 'Low' && !e.resolved).length },
        ].map((item, i) => (
          <div key={i} style={{
            flex: 1, padding: '12px 20px',
            borderRight: i < 3 ? '1px solid var(--border)' : 'none',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-md)',
              background: item.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {severityIcon(item.sev as ExceptionSeverity)}
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
                color: item.color, lineHeight: 1
              }}>{item.count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{item.sev} Incidents</div>
            </div>
          </div>
        ))}
      </div>

      {/* Exception list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><CheckCircle size={22} color="var(--success)" /></div>
            <div className="empty-state-title" style={{ color: 'var(--success)' }}>No active exceptions</div>
            <div className="empty-state-desc">All dispatch routes, vehicles, and deliveries operating on schedule.</div>
          </div>
        ) : (
          filtered.map(exc => (
            <div key={exc.id} className={`exception-row ${exc.severity.toLowerCase()}`}>
              <div style={{ flexShrink: 0, paddingTop: 2 }}>
                {severityIcon(exc.severity)}
              </div>
              <div className="exception-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className={`exception-severity severity-${exc.severity.toLowerCase()}`}>{exc.severity}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exc.timestamp}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, background: 'var(--bg-muted)',
                    padding: '1px 6px', borderRadius: 3, color: 'var(--text-secondary)',
                  }}>{exc.entityType}</span>
                  <span className="exception-entity">{exc.entityName}</span>
                </div>
                <div className="exception-problem">{exc.problem}</div>
                <div className="exception-detail">{exc.detail}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Impact: <strong>{exc.impact}</strong>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  {exc.actions.map((action, i) => (
                    <button key={i} className={`btn btn-sm ${i === 0 ? 'btn-secondary' : 'btn-ghost'}`}>
                      {action}
                    </button>
                  ))}
                  <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', color: 'var(--success)' }}>
                    Mark resolved
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExceptionsPage;
