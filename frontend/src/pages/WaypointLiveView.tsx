import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, FileText, CheckCircle, Search, ChevronDown, DollarSign, Info, Clock,
  Maximize2, Minimize2, Columns, Map as MapIcon
} from 'lucide-react';
import MapLibreMap from '../components/map/MapLibreMap';
import Drawer from '../components/common/Drawer';
import { useDataset } from '../context/DatasetContext';
import { useCurrency } from '../context/CurrencyContext';
import type { Order } from '../types';

const WaypointLiveView: React.FC = () => {
  const { mode, routes, orders, depots, drivers, kpis } = useDataset();
  const { formatPrice, currency } = useCurrency();

  // Route view mode: Planned | Actual | Both
  const [routeViewMode, setRouteViewMode] = useState<'Planned' | 'Actual' | 'Both'>('Planned');
  // Selected driver / route
  const [selectedDriverId, setSelectedDriverId] = useState<string>(() => routes[0]?.driver?.id || 'DRV-001');
  // Multi-route checkbox visibility
  const [visibleRouteIds, setVisibleRouteIds] = useState<string[]>(() => routes.map(r => r.id));

  // Table filter tabs
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [onlyRunningLate, setOnlyRunningLate] = useState<boolean>(false);
  const [orderSearch, setOrderSearch] = useState<string>('');

  // View Layout Mode: Split (default) | Table-Full (maximize table) | Map-Full (maximize map)
  const [viewLayout, setViewLayout] = useState<'split' | 'table-full' | 'map-full'>(() => {
    const p = new URLSearchParams(window.location.search).get('view');
    return (p === 'table-full' || p === 'map-full') ? p : 'split';
  });

  // Selected order for drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync visibleRouteIds when dataset routes change
  React.useEffect(() => {
    setVisibleRouteIds(routes.map(r => r.id));
    if (routes[0]?.driver) {
      setSelectedDriverId(routes[0].driver.id);
    }
  }, [routes]);

  // Toggle route checkbox on/off
  const toggleRouteVisibility = (routeId: string) => {
    setVisibleRouteIds(prev =>
      prev.includes(routeId)
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  // Drivers telemetry list matching screenshot
  const driverList = useMemo(() => {
    const list = routes.map((r, i) => {
      const drv = r.driver || drivers[i % drivers.length];
      const lateTags = ['2m late', '', '4m late', '5m late', '', '2m late'];
      const liveTags = ['6/34 live', '9/24 live', '6/30 live · started just now', '6/26 live · started just now', '7/23 live', '7/23 live · started just now'];
      const colors = ['#10B981', '#10B981', '#3B82F6', '#3B82F6', '#F59E0B', '#EA580C'];

      return {
        id: drv.id,
        name: drv.name,
        status: i === 1 ? 'On the way' : 'Servicing',
        color: colors[i % colors.length],
        late: lateTags[i % lateTags.length],
        liveTag: liveTags[i % liveTags.length],
        routeId: r.id,
      };
    });
    return list;
  }, [routes, drivers]);

  // Filtered orders for execution table
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (onlyRunningLate && (!o.delayMinutes || o.delayMinutes === 0)) return false;
      if (statusFilter !== 'All') {
        if (statusFilter === 'Failed' && o.status !== 'Failed') return false;
        if (statusFilter === 'On Route' && o.status !== 'En Route') return false;
        if (statusFilter === 'Scheduled' && o.status !== 'Planned') return false;
        if (statusFilter === 'Completed' && o.status !== 'Delivered') return false;
        if (statusFilter === 'Servicing' && o.status !== 'Loading' && o.status !== 'Arrived') return false;
      }
      if (orderSearch) {
        const q = orderSearch.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.outlet.name.toLowerCase().includes(q) ||
          (o.priority && o.priority.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [orders, statusFilter, onlyRunningLate, orderSearch]);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const selectedRoute = routes.find(r => r.driver?.id === selectedDriverId) ?? routes[0];

  return (
    <div className="waypoint-view">
      {/* ─── UPPER HALF: Driver List + MapLibre Map + Plan Stats ──────────── */}
      {viewLayout !== 'table-full' && (
        <div
          className="waypoint-split-top"
          style={{
            height: viewLayout === 'map-full' ? '100%' : '48%',
            minHeight: viewLayout === 'map-full' ? '100%' : 260,
            transition: 'height 0.2s ease',
          }}
        >
        {/* Left: Driver Checklist Panel */}
        <div className="waypoint-driver-panel">
          {/* Show route: [ Planned | Actual | Both ] */}
          <div className="waypoint-route-mode">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Show route:</span>
              <a
                href="#history"
                className="waypoint-history-link"
                style={{
                  fontSize: 11, color: '#2563EB', fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'var(--brand-tint)', padding: '2px 8px', borderRadius: 4,
                  textDecoration: 'none'
                }}
              >
                <Clock size={11} />
                <span>View History</span>
              </a>
            </div>

            <div className="waypoint-btn-group" style={{ display: 'flex', width: '100%' }}>
              {(['Planned', 'Actual', 'Both'] as const).map(mode => (
                <button
                  key={mode}
                  className={`waypoint-btn-toggle ${routeViewMode === mode ? 'active' : ''}`}
                  onClick={() => setRouteViewMode(mode)}
                  style={{ flex: 1, textAlign: 'center', padding: '4px 0', fontSize: 11 }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Counts Header: 6 On | 0 Off | 6 Total */}
          <div className="waypoint-driver-counts">
            <div>
              <div className="waypoint-driver-count-num" style={{ color: '#16A34A' }}>{driverList.length}</div>
              <div>On</div>
            </div>
            <div>
              <div className="waypoint-driver-count-num" style={{ color: 'var(--text-muted)' }}>0</div>
              <div>Off</div>
            </div>
            <div>
              <div className="waypoint-driver-count-num">{driverList.length}</div>
              <div>Total</div>
            </div>
          </div>

          {/* Drivers List with Checkboxes */}
          <div className="waypoint-driver-list">
            {driverList.map(drv => {
              const isSelected = selectedDriverId === drv.id;
              const isChecked = visibleRouteIds.includes(drv.routeId);

              return (
                <div
                  key={`${drv.routeId}-${drv.id}`}
                  className={`waypoint-driver-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDriverId(drv.id)}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleRouteVisibility(drv.routeId);
                    }}
                    style={{ cursor: 'pointer', accentColor: '#2563EB' }}
                  />

                  {/* Status Dot */}
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: drv.color, flexShrink: 0
                  }} />

                  {/* Driver Name & Subtext */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {drv.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span>{drv.status}</span>
                      <Info size={10} color="var(--text-muted)" />
                    </div>
                  </div>

                  {/* Right Telemetry */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {drv.late && (
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#EA580C' }}>
                        {drv.late}
                      </div>
                    )}
                    <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                      {drv.liveTag}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: MapLibre Map with OpenFreeMap Liberty style */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapLibreMap
            routes={routes}
            depots={depots}
            selectedRouteId={selectedRoute?.id}
            filterRoutes={visibleRouteIds}
            routeViewMode={routeViewMode}
            onRouteClick={(id) => {
              const r = routes.find(item => item.id === id);
              if (r?.driver) setSelectedDriverId(r.driver.id);
            }}
            onStopClick={(_stopSeq, orderId) => {
              const o = orders.find(item => item.id === orderId);
              if (o) handleOrderClick(o);
            }}
          />

          {/* Floating Plan Summary Box (Top-Right on map matching screenshot) */}
          <div className="waypoint-stats-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
              <span className="waypoint-deactivate">Deactivate plan</span>
            </div>
            <div className="waypoint-stats-date">
              {mode === 'peliyagoda' ? '09/26/2026' : '12/29/2021'}{' '}
              <span style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: 10 }}>
                {mode === 'peliyagoda' ? 'Saturday' : 'Wednesday'}
              </span>
            </div>

            {/* 2-Column Grid for Metrics */}
            <div className="waypoint-stats-grid">
              <div className="waypoint-stat-metric">
                <div className="waypoint-stat-val">8 / {orders.length}</div>
                <div className="waypoint-stat-lbl">Completed</div>
              </div>

              <div className="waypoint-stat-metric">
                <div className="waypoint-stat-val" style={{ color: '#DC2626' }}>1</div>
                <div className="waypoint-stat-lbl">Failed</div>
              </div>

              <div className="waypoint-stat-metric">
                <div className="waypoint-stat-val" style={{ color: '#EA580C' }}>2</div>
                <div className="waypoint-stat-lbl">Running Late</div>
              </div>

              <div className="waypoint-stat-metric">
                <div className="waypoint-stat-val">1.5 h</div>
                <div className="waypoint-stat-lbl">Time Worked</div>
              </div>

              <div className="waypoint-stat-metric" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 2 }}>
                <span className="waypoint-stat-lbl">Total Distance:</span>
                <span className="waypoint-stat-val" style={{ fontSize: 12 }}>5.85 mi</span>
              </div>
            </div>

            {/* Delivering Item Price & Operational Cost KPIs */}
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
                  {formatPrice(kpis.totalDeliveryCost || 2840, { compact: true })} <span style={{ fontSize: 9.5, opacity: 0.85 }}>({kpis.costPercentage || 4.2}%)</span>
                </span>
              </div>

              <div className="waypoint-stats-econ-row" style={{ borderTop: '1px dashed var(--border)', paddingTop: 3, marginTop: 3 }}>
                <span className="waypoint-stat-lbl" style={{ fontWeight: 600 }}>Net Margin:</span>
                <span className="waypoint-stat-val" style={{ color: '#059669', fontSize: 12, fontWeight: 800 }}>
                  {formatPrice(kpis.netDeliveryMargin || 65560, { compact: true, includeSign: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick restore button when in Full Map mode */}
          {viewLayout === 'map-full' && (
            <button
              onClick={() => setViewLayout('split')}
              style={{
                position: 'absolute', bottom: 16, right: 16, zIndex: 30,
                background: '#2563EB', color: '#fff', border: 'none', borderRadius: 6,
                padding: '7px 14px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Columns size={13} />
              <span>Show Orders Table</span>
            </button>
          )}
        </div>
      )}

      {/* ─── LOWER HALF: Orders / Stops Execution Table ───────────────────── */}
      {viewLayout !== 'map-full' && (
        <div
          className="waypoint-split-bottom"
          style={{
            height: viewLayout === 'table-full' ? '100%' : '52%',
            flex: viewLayout === 'table-full' ? '1 1 100%' : '1 1 52%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'height 0.2s ease',
          }}
        >
          {/* Table Toolbar */}
          <div className="waypoint-table-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Show only:</span>
              <div className="waypoint-pills">
                {(['Failed', 'On Route', 'Rejected', 'Scheduled', 'Servicing', 'Completed'] as const).map(pill => (
                  <button
                    key={pill}
                    className={`waypoint-pill ${statusFilter === pill ? 'active' : ''}`}
                    onClick={() => setStatusFilter(prev => prev === pill ? 'All' : pill)}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Full Table View Mode Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 4, padding: 2 }}>
                <button
                  type="button"
                  onClick={() => setViewLayout('split')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                    fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 3,
                    background: viewLayout === 'split' ? '#2563EB' : 'transparent',
                    color: viewLayout === 'split' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  title="Split View (Map + Table)"
                >
                  <Columns size={12} />
                  <span>Split</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewLayout(viewLayout === 'table-full' ? 'split' : 'table-full')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                    fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 3,
                    background: viewLayout === 'table-full' ? '#2563EB' : 'transparent',
                    color: viewLayout === 'table-full' ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  title="Full Table View (Maximize table to view all orders and full columns)"
                >
                  {viewLayout === 'table-full' ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                  <span>{viewLayout === 'table-full' ? 'Restore Split' : 'Full Table'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewLayout('map-full')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                    fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 3,
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  title="Full Map View (Maximize map)"
                >
                  <MapIcon size={12} />
                  <span>Full Map</span>
                </button>
              </div>

              {/* Quick link to Economics & Delivery Cost Analytics */}
              <Link
                to="/reports"
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 11,
                  fontWeight: 600, padding: '3px 9px', height: 26, color: '#16A34A',
                  background: 'var(--bg-surface)', border: '1px solid #86EFAC'
                }}
                title="Open Delivery Cost & Profitability Analytics"
              >
                <DollarSign size={13} />
                <span>Cost Analytics</span>
              </Link>

              {/* Running late toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={onlyRunningLate}
                  onChange={e => setOnlyRunningLate(e.target.checked)}
                  style={{ accentColor: '#EA580C' }}
                />
                <span>Running Late</span>
              </label>

              {/* Filter orders search box */}
              <div className="waypoint-filter-box">
                <Search size={12} color="var(--text-muted)" />
                <input
                  placeholder="Filter orders..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  style={{
                    border: 'none', background: 'transparent', outline: 'none',
                    fontSize: 11, color: 'var(--text-primary)', width: '100%'
                  }}
                />
              </div>
            </div>
          </div>

        {/* Detailed Table with Full Horizontal & Vertical Scrolling */}
        <div className="waypoint-table-scroll-wrap">
          <table className="data-table" style={{ fontSize: 12, minWidth: 1560, width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
              <tr>
                <th style={{ width: 115, position: 'sticky', left: 0, zIndex: 12, background: 'var(--bg-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Live status <ChevronDown size={11} />
                  </div>
                </th>
                <th style={{ width: 95 }}>Order ID</th>
                <th style={{ width: 105 }}>Proof of Delivery</th>
                <th style={{ width: 100 }}>Scheduled at</th>
                <th style={{ width: 150 }}>Estimated ETA & SLA</th>
                <th style={{ width: 135 }}>Service start</th>
                <th style={{ width: 135 }}>Service end</th>
                <th style={{ width: 95 }}>Duration</th>
                <th style={{ width: 120, textAlign: 'right' }}>Item Price</th>
                <th style={{ width: 120, textAlign: 'right' }}>Delivery Cost</th>
                <th style={{ width: 115, textAlign: 'right' }}>Net Margin</th>
                <th style={{ width: 85 }}>Priority</th>
                <th style={{ minWidth: 240, width: 260 }}>Location & Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const isDelayed = order.delayMinutes && order.delayMinutes > 0;
                const statusDotColor = order.status === 'Delivered'
                  ? '#16A34A'
                  : order.status === 'En Route'
                  ? '#2563EB'
                  : order.status === 'At Risk' || order.status === 'Failed'
                  ? '#DC2626'
                  : '#D97706';

                return (
                  <tr
                    key={order.id}
                    onClick={() => handleOrderClick(order)}
                    style={{ height: 38 }}
                  >
                    {/* Live status (pinned to left on horizontal scroll) */}
                    <td style={{ position: 'sticky', left: 0, zIndex: 5, background: 'var(--bg-surface)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: statusDotColor, flexShrink: 0
                        }} />
                        <span style={{ fontWeight: 600 }}>
                          {order.status === 'Delivered' ? 'Completed' : order.status === 'En Route' ? 'On Route' : order.status}
                        </span>
                      </div>
                    </td>

                    {/* Order ID */}
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 700,
                        color: 'var(--text-primary)', fontSize: 11.5
                      }}>
                        {order.id}
                      </span>
                    </td>

                    {/* Proof of Delivery Icons */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span title="Photo Proof" style={{ opacity: order.proofOfDelivery?.hasPhoto ? 1 : 0.25, color: '#2563EB' }}>
                          <Camera size={13} />
                        </span>
                        <span title="Signature" style={{ opacity: order.proofOfDelivery?.hasSignature ? 1 : 0.25, color: '#16A34A' }}>
                          <FileText size={13} />
                        </span>
                        <span title="Note" style={{ opacity: order.proofOfDelivery?.hasNote ? 1 : 0.25, color: '#F59E0B' }}>
                          <CheckCircle size={13} />
                        </span>
                      </div>
                    </td>

                    {/* Scheduled at */}
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                      {order.scheduledAt ?? order.window.start}
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
                          {order.estimatedTravelMin ?? 18}m transit · {order.estimatedServiceMin ?? order.serviceAllowanceMin ?? 15}m dock
                        </div>
                      </div>
                    </td>

                    {/* Service start + delay pill */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                          {order.serviceStart ?? order.window.start}
                        </span>
                        {isDelayed && (
                          <span className="delay-pill">{order.delayMinutes}m delay</span>
                        )}
                      </div>
                    </td>

                    {/* Service end + delay pill */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                          {order.serviceEnd ?? order.window.end}
                        </span>
                        {isDelayed && (
                          <span className="delay-pill">{order.delayMinutes}m delay</span>
                        )}
                      </div>
                    </td>

                    {/* Actual duration */}
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                      {order.actualDuration ?? '—'}
                    </td>

                    {/* Item Price */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: 11.5 }}>
                        {formatPrice(order.itemPrice ?? 1240)}
                      </div>
                      <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                        {order.units ?? 40}u · {order.brand}
                      </div>
                    </td>

                    {/* Delivery Cost */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', fontSize: 11.5 }}>
                        {formatPrice(order.deliveryCost ?? 28.40)}
                      </div>
                      <div style={{
                        display: 'inline-block', fontSize: 9, fontWeight: 700,
                        padding: '1px 5px', borderRadius: 3, marginTop: 1,
                        background: (order.costRatio ?? 3) > 5 ? '#FEE2E2' : '#DCFCE7',
                        color: (order.costRatio ?? 3) > 5 ? '#DC2626' : '#16A34A',
                      }}>
                        {order.costRatio ?? '2.4'}% ratio
                      </div>
                    </td>

                    {/* Net Margin */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669', fontSize: 11.5 }}>
                        {formatPrice(order.deliveryMargin ?? 1211.60, { includeSign: true })}
                      </div>
                      <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                        {Math.round(100 - (order.costRatio ?? 3))}% margin
                      </div>
                    </td>

                    {/* Priority */}
                    <td style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                      <span style={{
                        padding: '2px 7px', borderRadius: 3, fontSize: 10.5, fontWeight: 700,
                        background: order.priority === 'High' ? 'rgba(220, 38, 38, 0.12)' : (order.priority === 'Medium' ? 'rgba(217, 119, 6, 0.12)' : 'rgba(37, 99, 235, 0.1)'),
                        color: order.priority === 'High' ? '#EF4444' : (order.priority === 'Medium' ? '#F59E0B' : '#3B82F6')
                      }}>
                        {order.priority ?? 'Medium'}
                      </span>
                    </td>

                    {/* Location & Address with full width & zero clipping */}
                    <td style={{ minWidth: 240, paddingRight: 16 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {order.outlet.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap' }}>
                        {order.outlet.address}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Order Detail Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={`Order ${selectedOrder?.id ?? ''}`}>
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: selectedOrder.status === 'Delivered' ? 'var(--success-tint)' : 'var(--brand-tint)',
                color: selectedOrder.status === 'Delivered' ? 'var(--success-vivid)' : 'var(--brand-vivid)',
                fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontSize: 12
              }}>
                {selectedOrder.status}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Outlet: {selectedOrder.outlet.name}
              </span>
            </div>

            {/* Financial Economics Card */}
            <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Delivering Item Price & Operational Cost
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 6px', borderRadius: 4 }}>
                  {Math.round(100 - (selectedOrder.costRatio || 3))}% Net Margin
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, marginBottom: 12 }}>
                <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>Delivering Item Price (Cargo)</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {formatPrice(selectedOrder.itemPrice ?? 1240)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                    {selectedOrder.units ?? 40} units · {selectedOrder.brand}
                  </div>
                </div>

                <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>Total Delivering Cost</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#2563EB', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {formatPrice(selectedOrder.deliveryCost ?? 28.40)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                    {selectedOrder.costRatio ?? '2.4'}% of merchandise value
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Cost Component Breakdown ({currency})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dashed var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fuel Cost (km/l consumption):</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatPrice(selectedOrder.costBreakdown?.fuelCost ?? 2.84)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dashed var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Driver & Crew Labor:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatPrice(selectedOrder.costBreakdown?.laborCost ?? 13.20)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dashed var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Dock Turnaround ({selectedOrder.serviceAllowanceMin ?? 18}m):</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatPrice(selectedOrder.costBreakdown?.serviceCost ?? 8.10)}</span>
                </div>
                {selectedOrder.costBreakdown?.penaltyCost ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dashed var(--border)', color: '#DC2626' }}>
                    <span>Late SLA Penalty ({selectedOrder.delayMinutes}m delay):</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatPrice(selectedOrder.costBreakdown.penaltyCost, { includeSign: true })}</span>
                  </div>
                ) : null}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 2px', fontWeight: 700, color: '#16A34A', fontSize: 12 }}>
                  <span>Net Delivery Margin:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPrice(selectedOrder.deliveryMargin ?? 1211.60, { includeSign: true })}</span>
                </div>
              </div>
            </div>

            {/* Delivery Time Estimation & SLA Card */}
            <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Delivery Time Estimation & SLA
                </div>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                  background: (selectedOrder.onTimeProbability ?? 95) >= 90 ? '#DCFCE7' : '#FEF3C7',
                  color: (selectedOrder.onTimeProbability ?? 95) >= 90 ? '#15803D' : '#B45309',
                }}>
                  {selectedOrder.onTimeProbability ?? 96}% SLA Confidence
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Estimated ETA: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#2563EB' }}>
                    {selectedOrder.estimatedArrivalETA || selectedOrder.scheduledAt || selectedOrder.window.start}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Transit Time: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedOrder.estimatedTravelMin ?? 18} min</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Dock Turnaround: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#10B981' }}>
                    {selectedOrder.estimatedServiceMin ?? selectedOrder.serviceAllowanceMin ?? 18} min
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Est. Completion: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>
                    {selectedOrder.estimatedCompletionETA || selectedOrder.serviceEnd || selectedOrder.window.end}
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                Execution Times & Telemetry
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Scheduled: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedOrder.scheduledAt ?? selectedOrder.window.start}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Duration: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedOrder.actualDuration ?? '—'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Start: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedOrder.serviceStart ?? '—'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>End: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedOrder.serviceEnd ?? '—'}</strong>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                Delivery Details
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>{selectedOrder.outlet.address}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                Brand: <strong>{selectedOrder.brand}</strong> · District: <strong>{selectedOrder.district}</strong> · Dock: <strong>{selectedOrder.dockType || 'street'}</strong> · Parking: <strong>{selectedOrder.parkingConstraint || 'normal'}</strong>
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Volume: <strong>{selectedOrder.volume} m³</strong> · Weight: <strong>{selectedOrder.weight} kg</strong> · Temp: <strong>{selectedOrder.temp}</strong>
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default WaypointLiveView;
