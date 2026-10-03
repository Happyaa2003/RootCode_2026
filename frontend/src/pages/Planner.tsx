import React, { useState, useMemo } from 'react';
import {
  Search,
  Zap,
  Undo2,
  Redo2,
  Check,
  RotateCcw,
  Calendar,
  Download,
  Share2,
  Compass,
  Clock,
  Plus,
  Trash2
} from 'lucide-react';
import MapLibreMap from '../components/map/MapLibreMap';
import OptimizeModal from '../components/routes/OptimizeModal';
import Drawer from '../components/common/Drawer';
import UnscheduledOrdersPanel from '../components/planner/UnscheduledOrdersPanel';
import TimelineView from '../components/planner/TimelineView';
import AddOrderModal from '../components/planner/AddOrderModal';
import { useDataset } from '../context/DatasetContext';
import { useCurrency } from '../context/CurrencyContext';
import type { Order } from '../types';

type PlannerTab = 'Orders' | 'Routes' | 'Timeline' | 'Not Scheduled';

const PlannerPage: React.FC = () => {
  const {
    mode,
    routes,
    orders,
    depots,
    kpis,
    scheduleOrder,
    unscheduleOrder,
    undo,
    redo,
    canUndo,
    canRedo,
    hasUnsavedChanges,
    applyChanges,
    discardChanges
  } = useDataset();

  const { formatPrice, currency } = useCurrency();

  // Active state
  const [selectedRouteId, setSelectedRouteId] = useState<string>(() => routes[0]?.id || 'RT-001');
  const [visibleRouteIds, setVisibleRouteIds] = useState<string[]>(() => routes.map(r => r.id));
  const [brandFilter, setBrandFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [notScheduledSearch, setNotScheduledSearch] = useState('');
  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PlannerTab>('Timeline');
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [hoveredRouteDropId, setHoveredRouteDropId] = useState<string | null>(null);
  const [mapDropActive, setMapDropActive] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  });
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    setVisibleRouteIds(routes.map(r => r.id));
    if (routes[0]) setSelectedRouteId(routes[0].id);
  }, [routes.length]);

  const toggleRoute = (id: string) => {
    setVisibleRouteIds(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  // Orders counts
  const unscheduledOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Unassigned' || !o.routeId);
  }, [orders]);

  const scheduledOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'Unassigned' && o.routeId);
  }, [orders]);

  // Filtered orders for table
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (brandFilter !== 'All' && o.brand !== brandFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return o.id.toLowerCase().includes(q) || o.outlet.name.toLowerCase().includes(q) || o.district.toLowerCase().includes(q);
      }
      return true;
    });
  }, [orders, brandFilter, search]);

  // Filtered not scheduled orders
  const filteredNotScheduledOrders = useMemo(() => {
    if (!notScheduledSearch) return unscheduledOrders;
    const q = notScheduledSearch.toLowerCase();
    return unscheduledOrders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.outlet.name.toLowerCase().includes(q) ||
      o.outlet.address.toLowerCase().includes(q) ||
      o.district.toLowerCase().includes(q) ||
      o.brand.toLowerCase().includes(q)
    );
  }, [unscheduledOrders, notScheduledSearch]);

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  // Drag over handler for driver row in left panel
  const handleDriverRowDrop = (e: React.DragEvent<HTMLDivElement>, routeId: string) => {
    e.preventDefault();
    setHoveredRouteDropId(null);
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) {
      scheduleOrder(orderId, routeId);
    }
  };

  // Drag over map area
  const handleMapDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setMapDropActive(false);
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId && selectedRoute) {
      scheduleOrder(orderId, selectedRoute.id);
    }
  };

  return (
    <div className="waypoint-view" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ─── 1. TOP ACTION BAR (WayPilot PRO Dispatch Matrix) ─── */}
      <div className="planner-action-bar">
        {/* Left: Summary Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="planner-counts-pill">
            <div className="planner-counts-pill-item">
              <span className="planner-counts-pill-num" style={{ color: '#16A34A' }}>
                {scheduledOrders.length}
              </span>
              <span className="planner-counts-pill-lbl">Scheduled</span>
            </div>
            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
            <div className="planner-counts-pill-item">
              <span className="planner-counts-pill-num" style={{ color: unscheduledOrders.length > 0 ? '#D97706' : 'var(--text-muted)' }}>
                {unscheduledOrders.length}
              </span>
              <span className="planner-counts-pill-lbl">Unscheduled</span>
            </div>
            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
            <div className="planner-counts-pill-item">
              <span className="planner-counts-pill-num" style={{ color: 'var(--text-primary)' }}>
                {orders.length}
              </span>
              <span className="planner-counts-pill-lbl">Total</span>
            </div>
            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
            <div className="planner-counts-pill-item">
              <span className="planner-counts-pill-num" style={{ color: '#2563EB' }}>
                {routes.length}
              </span>
              <span className="planner-counts-pill-lbl">Routes</span>
            </div>
          </div>

          {/* Undo / Redo / Discard / Apply changes buttons */}
          <div className="planner-btn-group">
            <button
              className="planner-top-btn"
              disabled={!canUndo}
              onClick={undo}
              title="Undo last schedule/unschedule edit"
            >
              <Undo2 size={13} />
              <span>Undo</span>
            </button>

            <button
              className="planner-top-btn"
              disabled={!canRedo}
              onClick={redo}
              title="Redo previous edit"
            >
              <Redo2 size={13} />
              <span>Redo</span>
            </button>

            <button
              className="planner-top-btn"
              disabled={!hasUnsavedChanges}
              onClick={discardChanges}
              title="Discard unsaved scheduling edits"
            >
              <RotateCcw size={13} />
              <span>Discard changes</span>
            </button>

            <button
              className="planner-top-btn apply-btn"
              disabled={!hasUnsavedChanges}
              onClick={applyChanges}
              title="Save & commit route scheduling changes"
            >
              <Check size={13} strokeWidth={2.5} />
              <span>Apply changes</span>
            </button>
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* ── Date Selector (working input) ── */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <label
              htmlFor="planner-date"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '3px 8px', fontSize: 11.5, fontWeight: 600,
                color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none',
              }}
            >
              <Calendar size={12} color="#2563EB" />
              <span>{selectedDate}</span>
            </label>
            <input
              id="planner-date"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                position: 'absolute', inset: 0, opacity: 0,
                cursor: 'pointer', width: '100%',
              }}
            />
          </div>

          <button
            onClick={() => setIsAddOrderOpen(true)}
            className="planner-top-btn"
            style={{ color: '#2563EB', fontWeight: 700 }}
          >
            <Download size={13} />
            <span>Import Orders</span>
          </button>

          <button
            onClick={() => setOptimizeOpen(true)}
            className="planner-top-btn"
            style={{ background: '#0F172A', color: '#FFFFFF', borderColor: '#0F172A' }}
          >
            <Compass size={13} color="#60A5FA" />
            <span>Plan Routes</span>
          </button>

          {/* ── Share Routes Dropdown ── */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShareOpen(o => !o)}
              className="planner-top-btn"
              style={shareOpen ? { borderColor: '#2563EB', color: '#2563EB' } : {}}
            >
              <Share2 size={13} />
              <span>Share Routes ▾</span>
            </button>

            {shareOpen && (
              <div
                onMouseLeave={() => setShareOpen(false)}
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4,
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 200, minWidth: 200, overflow: 'hidden',
                }}
              >
                {[
                  {
                    icon: '📄', label: 'Download CSV',
                    sublabel: 'Spreadsheet format',
                    action: () => {
                      const csv = `Order ID,Outlet,Route,ETA,Cargo Value,Delivery Cost\n` +
                        orders.map(o => `${o.id},"${o.outlet.name}",${o.routeId || 'Unscheduled'},${o.scheduledAt || 'N/A'},${o.itemPrice || 0},${o.deliveryCost || 0}`).join('\n');
                      const link = document.createElement('a');
                      link.href = encodeURI(`data:text/csv;charset=utf-8,${csv}`);
                      link.download = `waypilot_routes_${selectedDate}.csv`;
                      link.click();
                    }
                  },
                  {
                    icon: '🗂️', label: 'Download JSON',
                    sublabel: 'Full route data',
                    action: () => {
                      const blob = new Blob([JSON.stringify({ date: selectedDate, routes, orders }, null, 2)], { type: 'application/json' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `waypilot_routes_${selectedDate}.json`;
                      link.click();
                    }
                  },
                  {
                    icon: '🖨️', label: 'Print Route Sheet',
                    sublabel: 'Printable manifest',
                    action: () => {
                      const printWin = window.open('', '_blank');
                      if (!printWin) return;
                      printWin.document.write(`<html><head><title>WayPilot Route Sheet — ${selectedDate}</title>
                        <style>body{font-family:sans-serif;font-size:12px;padding:20px}
                        table{border-collapse:collapse;width:100%}
                        th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
                        th{background:#f1f5f9;font-weight:700}h2{margin-bottom:8px}</style></head>
                        <body><h2>WayPilot Route Sheet — ${selectedDate}</h2>
                        <table><thead><tr><th>Order ID</th><th>Outlet</th><th>Route</th><th>ETA</th><th>Weight</th><th>Volume</th></tr></thead>
                        <tbody>${orders.map(o => `<tr><td>${o.id}</td><td>${o.outlet.name}</td><td>${o.routeId || 'Unscheduled'}</td><td>${o.scheduledAt || o.window.start}</td><td>${o.weight}kg</td><td>${o.volume}m³</td></tr>`).join('')}</tbody></table>
                        </body></html>`);
                      printWin.document.close();
                      printWin.focus();
                      printWin.print();
                    }
                  },
                  {
                    icon: '🔗', label: 'Copy Share Link',
                    sublabel: 'Link to this plan',
                    action: () => {
                      const url = `${window.location.origin}/planner?date=${selectedDate}&depot=${encodeURIComponent(depots[0]?.name || '')}`;
                      navigator.clipboard.writeText(url).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      });
                    }
                  },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setShareOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '9px 14px', border: 'none',
                      background: 'transparent', cursor: 'pointer', textAlign: 'left',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.label === 'Copy Share Link' && copied ? '✓ Copied!' : item.label}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{item.sublabel}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 2. UPPER HALF: Routes List + Interactive Map + Floating Unscheduled Panel ─── */}
      <div className="waypoint-split-top" style={{ height: '52%', minHeight: '320px' }}>
        {/* Left: Routes & Fleet Capacity Panel */}
        <div className="waypoint-driver-panel">
          <div className="waypoint-route-mode">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Plan View:</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>All Routes</span>
            </div>
            <button
              onClick={() => setOptimizeOpen(true)}
              style={{
                fontSize: 11, color: '#2563EB', background: 'none', border: 'none',
                cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3
              }}
            >
              <Zap size={11} fill="#2563EB" />
              <span>Optimize</span>
            </button>
          </div>

          {/* Counts Header */}
          <div className="waypoint-driver-counts">
            <div>
              <div className="waypoint-driver-count-num" style={{ color: '#2563EB' }}>{routes.length}</div>
              <div>Routes</div>
            </div>
            <div>
              <div className="waypoint-driver-count-num" style={{ color: '#16A34A' }}>{scheduledOrders.length}</div>
              <div>Orders</div>
            </div>
            <div>
              <div className="waypoint-driver-count-num" style={{ color: unscheduledOrders.length > 0 ? '#D97706' : 'var(--text-muted)' }}>
                {unscheduledOrders.length}
              </div>
              <div>Unassigned</div>
            </div>
          </div>

          {/* Planned Routes List (Drop targets for unscheduled orders!) */}
          <div className="waypoint-driver-list">
            {routes.map(r => {
              const isSelected = selectedRouteId === r.id;
              const isChecked = visibleRouteIds.includes(r.id);
              const capPct = Math.round((r.usedVolume / (r.vehicle?.capacityVolume || 15)) * 100);
              const isDropHovered = hoveredRouteDropId === r.id;

              return (
                <div
                  key={r.id}
                  className={`waypoint-driver-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedRouteId(r.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (hoveredRouteDropId !== r.id) setHoveredRouteDropId(r.id);
                  }}
                  onDragLeave={() => setHoveredRouteDropId(null)}
                  onDrop={(e) => handleDriverRowDrop(e, r.id)}
                  style={{
                    background: isDropHovered ? 'rgba(37, 99, 235, 0.12)' : undefined,
                    border: isDropHovered ? '1px dashed #2563EB' : undefined,
                    transition: 'all 0.12s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleRoute(r.id);
                    }}
                    style={{ cursor: 'pointer', accentColor: '#2563EB' }}
                  />

                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: r.color, flexShrink: 0
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {r.driver?.name ?? r.name}
                      </span>
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {r.stops.length} stops
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {r.vehicle?.plate}
                      </span>
                      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${Math.min(capPct, 100)}%`,
                          background: capPct > 90 ? '#DC2626' : capPct > 70 ? '#F59E0B' : '#10B981'
                        }} />
                      </div>
                      <span style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {capPct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: MapLibre Map with Floating Unscheduled Orders Panel */}
        <div
          style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            if (!mapDropActive) setMapDropActive(true);
          }}
          onDragLeave={() => setMapDropActive(false)}
          onDrop={handleMapDrop}
        >
          {/* Map Component */}
          <MapLibreMap
            routes={routes}
            depots={depots}
            selectedRouteId={selectedRoute?.id}
            filterRoutes={visibleRouteIds}
            onRouteClick={(id) => setSelectedRouteId(id)}
            onStopClick={(_seq, orderId) => {
              const o = orders.find(item => item.id === orderId);
              if (o) {
                setSelectedOrder(o);
                setDrawerOpen(true);
              }
            }}
          />

          {/* Map Drop Indicator Overlay */}
          {mapDropActive && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(37, 99, 235, 0.15)',
                border: '3px dashed #2563EB',
                zIndex: 35,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  background: '#2563EB',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}
              >
                Release order to add to {selectedRoute?.driver?.name ?? selectedRoute?.name}
              </div>
            </div>
          )}

          {/* ─── Floating Unscheduled Orders Panel (Constrained within map view) ─── */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              bottom: 10,
              maxHeight: 'calc(100% - 20px)',
              zIndex: 25,
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'none',
            }}
          >
            <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', maxHeight: '100%', minHeight: 0 }}>
              <UnscheduledOrdersPanel
                style={{ maxHeight: '100%' }}
                onSelectOrder={(o) => {
                  setSelectedOrder(o);
                  setDrawerOpen(true);
                }}
              />
            </div>
          </div>

          {/* Floating Plan Summary Box (Top-Right on map) */}
          <div className="waypoint-stats-panel" style={{ zIndex: 15 }}>
            <span
              className="waypoint-deactivate"
              onClick={() => setOptimizeOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              Re-optimize plan
            </span>
            <div className="waypoint-stats-date">
              {mode === 'peliyagoda' ? '09/26/2026' : '19/06/2024'}{' '}
              <span style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: 10 }}>
                ({depots[0]?.name || 'Central Hub'})
              </span>
            </div>

            <div className="waypoint-stats-grid">
              <div className="waypoint-stat-metric">
                <div className="waypoint-stat-val" style={{ color: '#16A34A' }}>
                  {orders.length > 0 ? Math.round((scheduledOrders.length / orders.length) * 100) : 100}%
                </div>
                <div className="waypoint-stat-lbl">Assignment</div>
              </div>

              <div className="waypoint-stat-metric">
                <div className="waypoint-stat-val">{routes.length} Active</div>
                <div className="waypoint-stat-lbl">Utilization</div>
              </div>
            </div>

            {/* Cargo Economics */}
            <div className="waypoint-stats-economics">
              <div className="waypoint-stats-econ-row">
                <span className="waypoint-stat-lbl">Cargo Value:</span>
                <span className="waypoint-stat-val" style={{ color: '#16A34A', fontSize: 11.5 }}>
                  {formatPrice(kpis.totalItemValue || 68400, { compact: true })}
                </span>
              </div>
              <div className="waypoint-stats-econ-row">
                <span className="waypoint-stat-lbl">Delivery Cost:</span>
                <span className="waypoint-stat-val" style={{ color: '#2563EB', fontSize: 11.5 }}>
                  {formatPrice(kpis.totalDeliveryCost || 2840, { compact: true })}
                </span>
              </div>
            </div>

            <button
              onClick={() => setOptimizeOpen(true)}
              style={{
                marginTop: 6, width: '100%', padding: '5px 8px', borderRadius: 4,
                border: 'none', background: '#2563EB', color: 'white',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 5
              }}
            >
              <Zap size={12} fill="white" />
              <span>Optimize Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3. LOWER HALF: Tabs Bar (Orders | Routes | Timeline | Not Scheduled) ─── */}
      <div className="waypoint-split-bottom" style={{ height: '54%', display: 'flex', flexDirection: 'column' }}>
        {/* WayPilot Tab Navigation Bar */}
        <div className="planner-tabs-bar">
          <button
            className={`planner-tab-btn ${activeTab === 'Orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('Orders')}
          >
            <span>Orders</span>
            <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 10, background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
              {orders.length}
            </span>
          </button>

          <button
            className={`planner-tab-btn ${activeTab === 'Routes' ? 'active' : ''}`}
            onClick={() => setActiveTab('Routes')}
          >
            <span>Routes</span>
            <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 10, background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
              {routes.length}
            </span>
          </button>

          <button
            className={`planner-tab-btn ${activeTab === 'Timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('Timeline')}
          >
            <Clock size={13} color={activeTab === 'Timeline' ? '#2563EB' : 'var(--text-muted)'} />
            <span>Timeline</span>
          </button>

          <button
            className={`planner-tab-btn ${activeTab === 'Not Scheduled' ? 'active' : ''}`}
            onClick={() => setActiveTab('Not Scheduled')}
          >
            <span>Not Scheduled</span>
            {unscheduledOrders.length > 0 && (
              <span style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 10,
                background: '#FEF3C7',
                color: '#B45309',
                fontWeight: 700
              }}>
                {unscheduledOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* ─── TAB 1: Timeline Gantt View ─── */}
        {activeTab === 'Timeline' && (
          <div style={{ flex: 1, minHeight: 0 }}>
            <TimelineView
              onSelectOrder={(o) => {
                setSelectedOrder(o);
                setDrawerOpen(true);
              }}
            />
          </div>
        )}

        {/* ─── TAB 2: Orders Full Table ─── */}
        {activeTab === 'Orders' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Table Toolbar */}
            <div className="waypoint-table-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Brand:</span>
                <div className="waypoint-pills">
                  {(['All', 'Fresh', 'Style', 'Tech'] as const).map(b => (
                    <button
                      key={b}
                      className={`waypoint-pill ${brandFilter === b ? 'active' : ''}`}
                      onClick={() => setBrandFilter(b)}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Showing {filteredOrders.length} of {orders.length} orders
                </span>

                <div className="waypoint-filter-box">
                  <Search size={12} color="var(--text-muted)" />
                  <input
                    placeholder="Filter deliveries..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      border: 'none', background: 'transparent', outline: 'none',
                      fontSize: 11, color: 'var(--text-primary)', width: '100%'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table className="data-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ width: 110 }}>Plan status</th>
                    <th style={{ width: 90 }}>Order ID</th>
                    <th style={{ width: 75 }}>Brand</th>
                    <th style={{ width: 110 }}>Time Window</th>
                    <th style={{ width: 140 }}>Estimated ETA & SLA</th>
                    <th style={{ width: 85 }}>Weight</th>
                    <th style={{ width: 85 }}>Volume</th>
                    <th style={{ width: 120 }}>Assigned Route</th>
                    <th style={{ width: 115, textAlign: 'right' }}>Item Price</th>
                    <th style={{ width: 110, textAlign: 'right' }}>Delivery Cost</th>
                    <th style={{ width: 105, textAlign: 'right' }}>Net Margin</th>
                    <th style={{ width: 75 }}>Priority</th>
                    <th>Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const assignedRoute = routes.find(r => r.id === order.routeId);
                    const isUnscheduled = order.status === 'Unassigned' || !order.routeId;

                    return (
                      <tr
                        key={order.id}
                        onClick={() => { setSelectedOrder(order); setDrawerOpen(true); }}
                        style={{ height: 38, cursor: 'pointer' }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              width: 7, height: 7, borderRadius: '50%',
                              background: isUnscheduled ? '#D97706' : '#16A34A', flexShrink: 0
                            }} />
                            <span style={{ fontWeight: 600, color: isUnscheduled ? '#D97706' : '#16A34A' }}>
                              {isUnscheduled ? 'Unassigned' : 'Assigned'}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontWeight: 700,
                            color: 'var(--text-primary)', fontSize: 11.5
                          }}>
                            {order.id}
                          </span>
                        </td>

                        <td>
                          <span style={{
                            fontWeight: 600, fontSize: 11,
                            color: order.brand === 'Fresh' ? '#16A34A' : order.brand === 'Style' ? '#7C3AED' : '#2563EB'
                          }}>
                            {order.brand}
                          </span>
                        </td>

                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                          {order.window.start} – {order.window.end}
                        </td>

                        {/* Estimated ETA & SLA Turnaround */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11.5, color: '#2563EB' }}>
                                {order.estimatedArrivalETA || order.scheduledAt || order.window.start}
                              </span>
                              <span style={{
                                fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                                background: (order.onTimeProbability ?? 95) >= 90 ? '#DCFCE7' : ((order.onTimeProbability ?? 95) >= 75 ? '#FEF3C7' : '#FEE2E2'),
                                color: (order.onTimeProbability ?? 95) >= 90 ? '#15803D' : ((order.onTimeProbability ?? 95) >= 75 ? '#B45309' : '#B91C1C'),
                              }}>
                                {order.onTimeProbability ?? 96}% SLA
                              </span>
                            </div>
                            <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                              {order.estimatedTravelMin ?? 18}m leg · {order.estimatedServiceMin ?? order.serviceAllowanceMin ?? 15}m dock
                            </div>
                          </div>
                        </td>

                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                          {order.weight} kg
                        </td>

                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                          {order.volume} m³
                        </td>

                        <td>
                          {assignedRoute ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: assignedRoute.color || '#2563EB'
                              }} />
                              <span style={{ fontWeight: 600, fontSize: 11.5 }}>
                                {assignedRoute.driver?.name || assignedRoute.name}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (routes[0]) scheduleOrder(order.id, routes[0].id);
                              }}
                              style={{
                                background: 'rgba(37, 99, 235, 0.08)',
                                border: '1px solid #2563EB',
                                color: '#2563EB',
                                borderRadius: 4,
                                padding: '2px 6px',
                                fontSize: 10.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              + Assign Route
                            </button>
                          )}
                        </td>

                        {/* Delivering Item Price */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: 11.5 }}>
                            {formatPrice(order.itemPrice ?? 1240)}
                          </div>
                          <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                            {order.units ?? 40}u
                          </div>
                        </td>

                        {/* Delivery Cost */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', fontSize: 11.5 }}>
                            {formatPrice(order.deliveryCost ?? 28.40)}
                          </div>
                          <div style={{
                            display: 'inline-block', fontSize: 9, fontWeight: 700,
                            padding: '1px 4px', borderRadius: 3, marginTop: 1,
                            background: (order.costRatio ?? 3) > 5 ? '#FEE2E2' : '#DCFCE7',
                            color: (order.costRatio ?? 3) > 5 ? '#DC2626' : '#16A34A',
                          }}>
                            {order.costRatio ?? '2.4'}%
                          </div>
                        </td>

                        {/* Net Margin */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669', fontSize: 11.5 }}>
                            {formatPrice(order.deliveryMargin ?? 1211.60, { includeSign: true })}
                          </div>
                          <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                            {Math.round(100 - (order.costRatio ?? 3))}%
                          </div>
                        </td>

                        <td style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                          {order.priority ?? 'Medium'}
                        </td>

                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {order.outlet.name}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB 3: Routes Overview Table ─── */}
        {activeTab === 'Routes' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            <table className="data-table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ width: 140 }}>Driver / Route</th>
                  <th style={{ width: 110 }}>Vehicle Plate</th>
                  <th style={{ width: 90 }}>Stops</th>
                  <th style={{ width: 150 }}>Volume Capacity</th>
                  <th style={{ width: 110 }}>Weight</th>
                  <th style={{ width: 120, textAlign: 'right' }}>Total Cargo Value</th>
                  <th style={{ width: 120, textAlign: 'right' }}>Route Cost</th>
                  <th style={{ width: 120, textAlign: 'right' }}>Profit Margin</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(r => {
                  const capPct = Math.round((r.usedVolume / (r.vehicle?.capacityVolume || 15)) * 100);
                  const cargoVal = r.totalCargoValue || r.stops.reduce((sum, s) => sum + (s.order.itemPrice || 1200), 0);
                  const routeCost = r.totalRouteCost || r.stops.reduce((sum, s) => sum + (s.order.deliveryCost || 28), 0);
                  const margin = cargoVal - routeCost;

                  return (
                    <tr key={r.id} style={{ height: 42 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
                          <span style={{ fontWeight: 700 }}>{r.driver?.name ?? r.name}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{r.vehicle?.plate || 'WP-9821'}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#2563EB' }}>{r.stops.length} stops</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${Math.min(capPct, 100)}%`,
                              background: capPct > 90 ? '#DC2626' : capPct > 70 ? '#F59E0B' : '#10B981'
                            }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{r.usedVolume} / {r.vehicle?.capacityVolume || 15} m³ ({capPct}%)</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{r.usedWeight} kg</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#16A34A', fontFamily: 'var(--font-mono)' }}>
                        {formatPrice(cargoVal)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#2563EB', fontFamily: 'var(--font-mono)' }}>
                        {formatPrice(routeCost)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                        {formatPrice(margin, { includeSign: true })}
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedRouteId(r.id);
                            setActiveTab('Timeline');
                          }}
                          style={{
                            padding: '3px 8px', borderRadius: 4,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-surface)',
                            cursor: 'pointer', fontSize: 11, fontWeight: 600
                          }}
                        >
                          View in Timeline
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── TAB 4: Dedicated Not Scheduled Orders View ─── */}
        {activeTab === 'Not Scheduled' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Toolbar */}
            <div className="waypoint-table-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Unassigned Deliveries Pool ({unscheduledOrders.length})
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Orders waiting for route assignment
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="waypoint-filter-box" style={{ width: 220 }}>
                  <Search size={12} color="var(--text-muted)" />
                  <input
                    placeholder="Search unscheduled orders..."
                    value={notScheduledSearch}
                    onChange={e => setNotScheduledSearch(e.target.value)}
                    style={{
                      border: 'none', background: 'transparent', outline: 'none',
                      fontSize: 11, color: 'var(--text-primary)', width: '100%'
                    }}
                  />
                </div>

                <button
                  onClick={() => setIsAddOrderOpen(true)}
                  style={{
                    background: '#2563EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Plus size={12} />
                  <span>Add Order</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table className="data-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>Order ID</th>
                    <th style={{ width: 200 }}>Outlet / Destination</th>
                    <th style={{ width: 75 }}>Brand</th>
                    <th style={{ width: 110 }}>Time Window</th>
                    <th style={{ width: 100 }}>Dock Turnaround</th>
                    <th style={{ width: 90 }}>Weight & Vol</th>
                    <th style={{ width: 110, textAlign: 'right' }}>Cargo Value</th>
                    <th style={{ width: 110, textAlign: 'right' }}>Delivery Cost</th>
                    <th style={{ width: 80 }}>Priority</th>
                    <th style={{ width: 180 }}>Quick Assign To Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotScheduledOrders.map(order => (
                    <tr
                      key={order.id}
                      onClick={() => { setSelectedOrder(order); setDrawerOpen(true); }}
                      style={{ height: 40, cursor: 'pointer' }}
                    >
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2563EB' }}>
                          {order.id}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{order.outlet.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{order.outlet.address}</div>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 600, fontSize: 11,
                          color: order.brand === 'Fresh' ? '#16A34A' : order.brand === 'Style' ? '#7C3AED' : '#2563EB'
                        }}>
                          {order.brand}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{order.window.start} – {order.window.end}</td>
                      <td>{order.actualDuration || `${order.serviceAllowanceMin || 10} min`}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{order.weight}kg · {order.volume}m³</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#16A34A', fontFamily: 'var(--font-mono)' }}>
                        {formatPrice(order.itemPrice ?? 1200)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#2563EB', fontFamily: 'var(--font-mono)' }}>
                        {formatPrice(order.deliveryCost ?? 28)}
                      </td>
                      <td>{order.priority || 'Medium'}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              scheduleOrder(order.id, e.target.value);
                            }
                          }}
                          defaultValue=""
                          style={{
                            padding: '3px 6px',
                            borderRadius: 4,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-surface)',
                            fontSize: 11,
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            outline: 'none',
                            width: '100%'
                          }}
                        >
                          <option value="" disabled>Select route to assign...</option>
                          {routes.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.driver?.name ?? r.name} ({r.stops.length} stops)
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modals & Drawers ────────────────────────────────────────────── */}
      <OptimizeModal open={optimizeOpen} onClose={() => setOptimizeOpen(false)} />
      <AddOrderModal isOpen={isAddOrderOpen} onClose={() => setIsAddOrderOpen(false)} />

      {/* Detailed Order Allocation Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={`Order ${selectedOrder?.id ?? ''}`}>
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                Order Allocation
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700 }}>{selectedOrder.outlet.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{selectedOrder.outlet.address}</p>
            </div>

            {/* Quick Unschedule / Schedule in Drawer */}
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedOrder.routeId ? (
                <button
                  onClick={() => {
                    unscheduleOrder(selectedOrder.id);
                    setDrawerOpen(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #DC2626',
                    background: 'rgba(220, 38, 38, 0.08)',
                    color: '#DC2626',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Trash2 size={13} />
                  <span>Unschedule Order</span>
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        scheduleOrder(selectedOrder.id, e.target.value);
                        setDrawerOpen(false);
                      }
                    }}
                    defaultValue=""
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '1px solid #2563EB',
                      background: 'var(--bg-surface)',
                      color: '#2563EB',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" disabled>Assign to Fleet Route...</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.driver?.name ?? r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 6, border: '1px solid var(--border)', fontSize: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>Brand: <strong>{selectedOrder.brand}</strong></div>
                <div>District: <strong>{selectedOrder.district}</strong></div>
                <div>Weight: <strong>{selectedOrder.weight} kg</strong></div>
                <div>Volume: <strong>{selectedOrder.volume} m³</strong></div>
                <div>Window: <strong>{selectedOrder.window.start} – {selectedOrder.window.end}</strong></div>
                <div>Temp: <strong>{selectedOrder.temp}</strong></div>
              </div>
            </div>

            {/* Delivery Time Estimation Card */}
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 6, border: '1px solid var(--border)', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Delivery Time Estimation & SLA
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                  background: (selectedOrder.onTimeProbability ?? 95) >= 90 ? '#DCFCE7' : '#FEF3C7',
                  color: (selectedOrder.onTimeProbability ?? 95) >= 90 ? '#15803D' : '#B45309',
                }}>
                  {selectedOrder.onTimeProbability ?? 96}% SLA Confidence
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>Arrival ETA: <strong style={{ color: '#2563EB', fontFamily: 'var(--font-mono)' }}>{selectedOrder.estimatedArrivalETA || selectedOrder.scheduledAt || selectedOrder.window.start}</strong></div>
                <div>Transit Leg: <strong>{selectedOrder.estimatedTravelMin ?? 18} min</strong></div>
                <div>Dock Turnaround: <strong style={{ color: '#10B981' }}>{selectedOrder.estimatedServiceMin ?? selectedOrder.serviceAllowanceMin ?? 15} min</strong></div>
                <div>Est. Completion: <strong>{selectedOrder.estimatedCompletionETA || selectedOrder.serviceEnd || selectedOrder.window.end}</strong></div>
              </div>
            </div>

            {/* Financial Margin Card */}
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 6, border: '1px solid var(--border)', fontSize: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                Cargo Economics ({currency})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Merchandise Value</div>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatPrice(selectedOrder.itemPrice ?? 1240)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Delivery Cost</div>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#2563EB' }}>{formatPrice(selectedOrder.deliveryCost ?? 28.40)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Net Margin</div>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#16A34A' }}>{formatPrice(selectedOrder.deliveryMargin ?? 1211.60, { includeSign: true })}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PlannerPage;
