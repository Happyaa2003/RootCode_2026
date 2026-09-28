import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, AlertCircle, Info, CheckCircle, Search,
  ChevronDown, ChevronUp, Wrench, RotateCcw, Check, Sparkles
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import type { ExceptionSeverity, Exception } from '../types';

const severityIcon = (sev: ExceptionSeverity, size = 16) => {
  if (sev === 'Critical') return <AlertCircle size={size} color="var(--danger-vivid, #EF4444)" />;
  if (sev === 'High') return <AlertTriangle size={size} color="var(--warning-vivid, #F59E0B)" />;
  if (sev === 'Medium') return <Info size={size} color="var(--brand-vivid, #2563EB)" />;
  return <Info size={size} color="var(--text-muted, #94A3B8)" />;
};

const ExceptionsPage: React.FC = () => {
  const { orders, allVehicles } = useDataset();

  const [filter, setFilter] = useState<'All' | ExceptionSeverity>('All');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type?: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Derive dynamic exceptions directly from orders delays and vehicle workshop groundings
  const dynamicExceptions: Exception[] = useMemo(() => {
    const list: Exception[] = [];

    // 1. Vehicles grounded in workshop from task2b_peak_day_fleet.csv
    const groundedVehicles = allVehicles.filter(v => v.status === 'Maintenance');
    groundedVehicles.forEach((v, idx) => {
      const isResolved = resolvedIds.has(`EXC-VEH-${idx + 1}`);
      list.push({
        id: `EXC-VEH-${idx + 1}`,
        severity: 'Critical',
        timestamp: '07:15 AM',
        entityType: 'Vehicle',
        entityId: v.id,
        entityName: `${v.plate} (${v.id})`,
        problem: 'Vehicle Grounded in Maintenance Workshop',
        detail: `Fleet unit ${v.id} is flagged in_workshop (task2b_peak_day_fleet). Vehicle unavailable for route dispatch due to routine hydraulic and transmission overhaul.`,
        impact: `Lost capacity: ${v.capacityVolume} m³ (${v.capacityWeight} kg). Quota frozen at ${v.weeklyFuelQuotaL} L.`,
        resolved: isResolved,
        actions: ['Reassign Scheduled Deliveries', 'Notify Fleet Supervisor', 'Inspect Repair ETA'],
      });
    });

    // 2. Delayed orders with late SLA penalties
    const delayedOrders = orders.filter(o => o.delayMinutes && o.delayMinutes > 0);
    delayedOrders.forEach((o, idx) => {
      const isResolved = resolvedIds.has(`EXC-ORD-${idx + 1}`);
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
        resolved: isResolved,
        actions: ['Approve Delay Exception', 'Recalculate Next ETA', 'Contact Store Receiving'],
      });
    });

    return list;
  }, [allVehicles, orders, resolvedIds]);

  const activeExceptions = dynamicExceptions.filter(e => !e.resolved);
  const resolvedExceptions = dynamicExceptions.filter(e => e.resolved);

  const displayedList = (activeTab === 'active' ? activeExceptions : resolvedExceptions).filter(e => {
    if (filter !== 'All' && e.severity !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.entityName.toLowerCase().includes(q) ||
        e.problem.toLowerCase().includes(q) ||
        e.entityId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleResolve = (excId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResolvedIds(prev => {
      const next = new Set(prev);
      next.add(excId);
      return next;
    });
    showToast(`Incident ${excId} marked as resolved! Moved to Resolved tab.`, 'success');
  };

  const handleReopen = (excId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResolvedIds(prev => {
      const next = new Set(prev);
      next.delete(excId);
      return next;
    });
    showToast(`Incident ${excId} reopened and restored to Active queue.`, 'info');
  };

  const handleAction = (actionName: string, exc: Exception, e: React.MouseEvent) => {
    e.stopPropagation();
    if (actionName.includes('Reassign')) {
      showToast(`Deliveries for ${exc.entityName} automatically reassigned to standby vehicle WP-VEH008!`, 'success');
    } else if (actionName.includes('Notify')) {
      showToast(`Automated SMS & priority dispatch alert sent to Fleet Operations Supervisor!`, 'info');
    } else if (actionName.includes('Inspect Repair')) {
      showToast(`Workshop telematics check: Part replacement in progress. Estimated return: 15:30 today.`, 'info');
    } else if (actionName.includes('Approve Delay')) {
      showToast(`Delay exception approved for ${exc.entityId}. SLA charge waived by dispatch supervisor.`, 'warning');
    } else if (actionName.includes('Recalculate Next ETA')) {
      showToast(`Dynamic traffic routing recomputed. Downstream stops updated with +4 min adjustment.`, 'info');
    } else if (actionName.includes('Contact Store')) {
      showToast(`Direct message broadcast to store receiving dock team.`, 'info');
    } else {
      showToast(`Action "${actionName}" executed successfully for ${exc.id}!`, 'success');
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'absolute',
          top: 16,
          right: 24,
          zIndex: 9999,
          background: toast.type === 'success' ? '#065F46' : toast.type === 'warning' ? '#92400E' : '#1E40AF',
          color: '#FFFFFF',
          padding: '10px 18px',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {toast.type === 'success' ? <Check size={16} /> : <Info size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div className="page-header-left">
          <div className="sidebar-search" style={{ width: 260 }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              placeholder="Search exceptions & incidents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
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
              className={`tab-item ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active Incidents ({activeExceptions.length})
            </button>
            <button
              className={`tab-item ${activeTab === 'resolved' ? 'active' : ''}`}
              onClick={() => setActiveTab('resolved')}
            >
              Resolved ({resolvedExceptions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Severity summary strip */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-subtle)',
        flexShrink: 0,
      }}>
        {[
          { sev: 'Critical', color: 'var(--danger-vivid, #EF4444)', bg: 'var(--danger-tint, rgba(239,68,68,0.12))', count: activeExceptions.filter(e => e.severity === 'Critical').length },
          { sev: 'High', color: 'var(--warning-vivid, #F59E0B)', bg: 'var(--warning-tint, rgba(245,158,11,0.12))', count: activeExceptions.filter(e => e.severity === 'High').length },
          { sev: 'Medium', color: 'var(--brand-vivid, #2563EB)', bg: 'var(--brand-tint, rgba(37,99,235,0.12))', count: activeExceptions.filter(e => e.severity === 'Medium').length },
          { sev: 'Low', color: 'var(--text-muted, #94A3B8)', bg: 'var(--bg-muted, rgba(148,163,184,0.12))', count: activeExceptions.filter(e => e.severity === 'Low').length },
        ].map((item, i) => (
          <div
            key={i}
            onClick={() => setFilter(item.sev as ExceptionSeverity)}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRight: i < 3 ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              background: filter === item.sev ? 'var(--bg-muted)' : 'transparent',
              transition: 'background 0.15s ease'
            }}
            title={`Click to filter by ${item.sev} exceptions`}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: item.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {severityIcon(item.sev as ExceptionSeverity)}
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 700,
                color: item.color,
                lineHeight: 1
              }}>{item.count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{item.sev} Incidents</div>
            </div>
          </div>
        ))}
      </div>

      {/* Exception list container with full scroll & unconstrained row heights */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {displayedList.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', marginBottom: 12 }}>
              <CheckCircle size={32} color="#10B981" />
            </div>
            <div className="empty-state-title" style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700 }}>
              {activeTab === 'active' ? 'No Active Exceptions' : 'No Resolved Exceptions Yet'}
            </div>
            <div className="empty-state-desc" style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
              {activeTab === 'active'
                ? 'All dispatch routes, vehicles, and deliveries are operating within target SLA bounds.'
                : 'Resolved incidents and closed exception tickets will be archived here.'}
            </div>
          </div>
        ) : (
          displayedList.map(exc => {
            const isExpanded = expandedId === exc.id;

            return (
              <div
                key={exc.id}
                className={`exception-row ${exc.severity.toLowerCase()} ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setExpandedId(prev => (prev === exc.id ? null : exc.id))}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: '14px 18px',
                  background: isExpanded ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                  borderRadius: 12,
                  border: isExpanded ? '1px solid #2563EB' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                {/* Main Visible Header & Info */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', width: '100%' }}>
                  <div style={{ flexShrink: 0, paddingTop: 2 }}>
                    {severityIcon(exc.severity, 18)}
                  </div>
                  <div className="exception-content" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span className={`exception-severity severity-${exc.severity.toLowerCase()}`}>
                          {exc.severity}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exc.timestamp}</span>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          background: 'var(--bg-muted)',
                          padding: '1px 6px',
                          borderRadius: 3,
                          color: 'var(--text-secondary)',
                        }}>
                          {exc.entityType}
                        </span>
                        <span className="exception-entity">{exc.entityName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                          {isExpanded ? 'Click to collapse' : 'Click to inspect & resolve'}
                        </span>
                        {isExpanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                      </div>
                    </div>

                    <div className="exception-problem" style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)', margin: '4px 0' }}>
                      {exc.problem}
                    </div>
                    <div className="exception-detail" style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {exc.detail}
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Impact:</span>
                      <span>{exc.impact}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      marginTop: 10,
                      paddingTop: 12,
                      borderTop: '1px dashed var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      animation: 'fadeIn 0.15s ease'
                    }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: 10,
                      background: 'var(--bg-surface)',
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          Operating Hub & Bay
                        </div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                          Peliyagoda Central Depot · Bay 04
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          Diagnostic Code
                        </div>
                        <div style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--danger-vivid, #EF4444)', marginTop: 2 }}>
                          {exc.entityType === 'Vehicle' ? 'OBD-II: P0087 (Hydraulic Pressure Fault)' : 'SLA Breach: +15m Window Window Violation'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          Recommended Standby
                        </div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#10B981', marginTop: 2 }}>
                          WP-VEH008 (Reefer Standby Active)
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {exc.actions.map((action, i) => (
                        <button
                          key={i}
                          className={`btn btn-sm ${i === 0 ? 'btn-secondary' : 'btn-ghost'}`}
                          style={{
                            fontSize: 12,
                            padding: '6px 12px',
                            fontWeight: 600,
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                          onClick={e => handleAction(action, exc, e)}
                        >
                          {i === 0 ? <Sparkles size={12} color="#2563EB" /> : <Wrench size={12} />}
                          {action}
                        </button>
                      ))}

                      {exc.resolved ? (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{
                            marginLeft: 'auto',
                            color: '#F59E0B',
                            fontWeight: 700,
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                          onClick={e => handleReopen(exc.id, e)}
                        >
                          <RotateCcw size={13} />
                          Reopen Incident
                        </button>
                      ) : (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{
                            marginLeft: 'auto',
                            color: '#10B981',
                            fontWeight: 700,
                            fontSize: 12,
                            background: 'rgba(16, 185, 129, 0.08)',
                            padding: '6px 14px',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                          onClick={e => handleResolve(exc.id, e)}
                        >
                          <Check size={13} />
                          Mark resolved
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Collapsed quick resolve button */}
                {!isExpanded && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    {exc.resolved ? (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#F59E0B', fontSize: 11, fontWeight: 600, padding: '2px 8px' }}
                        onClick={e => handleReopen(exc.id, e)}
                      >
                        Reopen Incident
                      </button>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#10B981', fontSize: 11, fontWeight: 600, padding: '2px 8px' }}
                        onClick={e => handleResolve(exc.id, e)}
                      >
                        ✓ Mark resolved
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExceptionsPage;
