import React, { useState, useMemo } from 'react';
import {
  Camera, FileText, CheckCircle, Search, Info, ChevronDown
} from 'lucide-react';
import MapLibreMap from '../components/map/MapLibreMap';
import Drawer from '../components/common/Drawer';
import { useDataset } from '../context/DatasetContext';
import type { Order } from '../types';

const WaypointLiveView: React.FC = () => {
  const { mode, routes, orders, depots, drivers } = useDataset();

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
      <div className="waypoint-split-top">
        {/* Left: Driver Checklist Panel */}
        <div className="waypoint-driver-panel">
          {/* Show route: [ Planned | Actual | Both ] */}
          <div className="waypoint-route-mode">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Show route:</span>
              <div className="waypoint-btn-group">
                {(['Planned', 'Actual', 'Both'] as const).map(mode => (
                  <button
                    key={mode}
                    className={`waypoint-btn-toggle ${routeViewMode === mode ? 'active' : ''}`}
                    onClick={() => setRouteViewMode(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <a href="#history" className="waypoint-history-link">
              View History
            </a>
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
                  key={drv.id}
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
            <span className="waypoint-deactivate">Deactivate plan</span>
            <div className="waypoint-stats-date">
              {mode === 'peliyagoda' ? '09/26/2026' : '12/29/2021'}<br />
              <span style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: 11 }}>
                {mode === 'peliyagoda' ? 'Saturday' : 'Wednesday'}
              </span>
            </div>

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

            <div>
              <div className="waypoint-stat-val">5.85 mi</div>
              <div className="waypoint-stat-lbl">Total Distance</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── LOWER HALF: Orders / Stops Execution Table ───────────────────── */}
      <div className="waypoint-split-bottom">
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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

        {/* Detailed Table (exact columns from screenshot) */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="data-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ width: 120 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Live status <ChevronDown size={11} />
                  </div>
                </th>
                <th style={{ width: 100 }}>Order ID</th>
                <th style={{ width: 115 }}>Proof of Delivery</th>
                <th style={{ width: 105 }}>Scheduled at</th>
                <th style={{ width: 145 }}>Service start</th>
                <th style={{ width: 145 }}>Service end</th>
                <th style={{ width: 110 }}>Actual duration</th>
                <th style={{ width: 90 }}>Priority</th>
                <th>Location</th>
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
                    {/* Live status */}
                    <td>
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

                    {/* Priority */}
                    <td style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                      {order.priority ?? 'Medium'}
                    </td>

                    {/* Location */}
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
                Brand: <strong>{selectedOrder.brand}</strong> · District: <strong>{selectedOrder.district}</strong> · Volume: <strong>{selectedOrder.volume} m³</strong> · Weight: <strong>{selectedOrder.weight} kg</strong> · Temp: <strong>{selectedOrder.temp}</strong>
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default WaypointLiveView;
