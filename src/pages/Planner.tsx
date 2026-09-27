import React, { useState, useMemo } from 'react';
import { Search, Zap } from 'lucide-react';
import MapLibreMap from '../components/map/MapLibreMap';
import OptimizeModal from '../components/routes/OptimizeModal';
import Drawer from '../components/common/Drawer';
import { useDataset } from '../context/DatasetContext';
import type { Order } from '../types';

const PlannerPage: React.FC = () => {
  const { mode, routes, orders, depots } = useDataset();

  const [selectedRouteId, setSelectedRouteId] = useState<string>(() => routes[0]?.id || 'RT-001');
  const [visibleRouteIds, setVisibleRouteIds] = useState<string[]>(() => routes.map(r => r.id));
  const [brandFilter, setBrandFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  React.useEffect(() => {
    setVisibleRouteIds(routes.map(r => r.id));
    if (routes[0]) setSelectedRouteId(routes[0].id);
  }, [routes]);

  const toggleRoute = (id: string) => {
    setVisibleRouteIds(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

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

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  return (
    <div className="waypoint-view">
      {/* ─── UPPER HALF: Planned Routes List + Map + Plan Metrics ─────────── */}
      <div className="waypoint-split-top">
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
              <div className="waypoint-driver-count-num" style={{ color: '#16A34A' }}>{orders.length}</div>
              <div>Orders</div>
            </div>
            <div>
              <div className="waypoint-driver-count-num" style={{ color: 'var(--text-muted)' }}>0</div>
              <div>Unassigned</div>
            </div>
          </div>

          {/* Planned Routes List with Checkboxes */}
          <div className="waypoint-driver-list">
            {routes.map(r => {
              const isSelected = selectedRouteId === r.id;
              const isChecked = visibleRouteIds.includes(r.id);
              const capPct = Math.round((r.usedVolume / (r.vehicle?.capacityVolume || 15)) * 100);

              return (
                <div
                  key={r.id}
                  className={`waypoint-driver-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedRouteId(r.id)}
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

        {/* Center: MapLibre Map */}
        <div style={{ flex: 1, position: 'relative' }}>
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

          {/* Floating Plan Summary Box (Top-Right on map) */}
          <div className="waypoint-stats-panel">
            <span
              className="waypoint-deactivate"
              onClick={() => setOptimizeOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              Re-optimize plan
            </span>
            <div className="waypoint-stats-date">
              {mode === 'peliyagoda' ? '09/26/2026' : '12/29/2021'}<br />
              <span style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: 11 }}>
                {depots[0]?.name || 'Central Hub'}
              </span>
            </div>

            <div className="waypoint-stat-metric">
              <div className="waypoint-stat-val" style={{ color: '#16A34A' }}>100%</div>
              <div className="waypoint-stat-lbl">Order Assignment</div>
            </div>

            <div className="waypoint-stat-metric">
              <div className="waypoint-stat-val">{routes.length} Active</div>
              <div className="waypoint-stat-lbl">Fleet Utilization</div>
            </div>

            <div className="waypoint-stat-metric">
              <div className="waypoint-stat-val">94.2%</div>
              <div className="waypoint-stat-lbl">Target SLA Score</div>
            </div>

            <button
              onClick={() => setOptimizeOpen(true)}
              style={{
                marginTop: 8, width: '100%', padding: '6px 8px', borderRadius: 4,
                border: 'none', background: '#2563EB', color: 'white',
                fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 5
              }}
            >
              <Zap size={12} fill="white" />
              <span>Optimize Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── LOWER HALF: Orders Queue / Allocation Table ─────────────────── */}
      <div className="waypoint-split-bottom">
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

        {/* Detailed Table matching OptimoRoute style */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="data-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ width: 110 }}>Plan status</th>
                <th style={{ width: 100 }}>Order ID</th>
                <th style={{ width: 85 }}>Brand</th>
                <th style={{ width: 130 }}>Time Window</th>
                <th style={{ width: 95 }}>Weight</th>
                <th style={{ width: 95 }}>Volume</th>
                <th style={{ width: 120 }}>Assigned Route</th>
                <th style={{ width: 90 }}>Priority</th>
                <th>Delivery Destination</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const assignedRoute = routes.find(r => r.id === order.routeId);

                return (
                  <tr
                    key={order.id}
                    onClick={() => { setSelectedOrder(order); setDrawerOpen(true); }}
                    style={{ height: 38 }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: '#16A34A', flexShrink: 0
                        }} />
                        <span style={{ fontWeight: 600, color: '#16A34A' }}>
                          Assigned
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

                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      {order.weight} kg
                    </td>

                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      {order.volume} m³
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: assignedRoute?.color || '#2563EB'
                        }} />
                        <span style={{ fontWeight: 600, fontSize: 11.5 }}>
                          {assignedRoute?.driver?.name || assignedRoute?.name || 'Route 01'}
                        </span>
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

      <OptimizeModal open={optimizeOpen} onClose={() => setOptimizeOpen(false)} />

      {/* Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={`Order ${selectedOrder?.id ?? ''}`}>
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                Order Allocation
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>{selectedOrder.outlet.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{selectedOrder.outlet.address}</p>
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
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PlannerPage;
