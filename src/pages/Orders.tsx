import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronUp, ChevronDown, Snowflake } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Drawer from '../components/common/Drawer';
import { orders } from '../data/mockData';
import type { Order } from '../types';

const riskClass = (score: number) =>
  score >= 60 ? 'risk-high' : score >= 30 ? 'risk-medium' : 'risk-low';

const tempIcon = (temp: string) => {
  if (temp === 'Chilled') return <Snowflake size={13} color="var(--brand)" />;
  if (temp === 'Frozen') return <Snowflake size={13} color="#1E3A8A" />;
  return null;
};

const OrdersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [sortKey, setSortKey] = useState<keyof Order>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const statuses = ['All', 'Unassigned', 'Planned', 'En Route', 'At Risk', 'Delivered', 'Failed'];
  const brands = ['All', 'Fresh', 'Style', 'Tech', 'Chilled'];

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.outlet.name.toLowerCase().includes(q) ||
        o.district.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') list = list.filter(o => o.status === statusFilter);
    if (brandFilter !== 'All') list = list.filter(o => o.brand === brandFilter);
    list.sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [search, statusFilter, brandFilter, sortKey, sortDir]);

  const handleSort = (key: keyof Order) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: keyof Order }) => {
    if (sortKey !== col) return <ChevronUp size={12} color="var(--n300)" />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="sidebar-search" style={{ width: 240 }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              placeholder="Search orders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <div className="filter-bar">
            {statuses.map(s => (
              <button
                key={s}
                className={`filter-select ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          {/* Brand filter */}
          <div className="filter-bar">
            {brands.map(b => (
              <button
                key={b}
                className={`filter-select ${brandFilter === b ? 'active' : ''}`}
                onClick={() => setBrandFilter(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <div className="page-header-right">
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {filtered.length} of {orders.length} orders
          </span>
          <button className="btn btn-primary">
            <Plus size={16} /> Add Order
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className={sortKey === 'id' ? 'sorted' : ''}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Order <SortIcon col="id" /></div>
              </th>
              <th>Outlet</th>
              <th>Brand</th>
              <th>District</th>
              <th>Window</th>
              <th>Volume</th>
              <th>Weight</th>
              <th>Temp</th>
              <th>Route</th>
              <th onClick={() => handleSort('riskScore')} className={sortKey === 'riskScore' ? 'sorted' : ''}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Risk <SortIcon col="riskScore" /></div>
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr
                key={order.id}
                onClick={() => handleRowClick(order)}
                className={selectedOrder?.id === order.id ? 'selected' : ''}
              >
                <td>
                  <span style={{
                    fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 11.5,
                    background: 'var(--bg-muted)', padding: '3px 8px', borderRadius: 5,
                    border: '1px solid var(--border)'
                  }}>{order.id}</span>
                </td>
                <td>{order.outlet.name}</td>
                <td className="secondary">{order.brand}</td>
                <td className="muted">{order.district}</td>
                <td className="secondary" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {order.window.start}–{order.window.end}
                </td>
                <td className="secondary">{order.volume} m³</td>
                <td className="secondary">{order.weight} kg</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {tempIcon(order.temp)}
                    <span className="muted" style={{ fontSize: 12 }}>{order.temp}</span>
                  </div>
                </td>
                <td>
                  {order.routeId ? (
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--brand)' }}>
                      {order.routeId.replace('RT-', 'Route ')}
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td>
                  <span className={`risk-score ${riskClass(order.riskScore)}`} style={{ fontSize: 12, fontWeight: 700 }}>
                    {order.riskScore}%
                  </span>
                </td>
                <td><StatusBadge status={order.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={selectedOrder?.id ?? ''}>
        {selectedOrder && (
          <>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <StatusBadge status={selectedOrder.status} />
                {selectedOrder.temp !== 'Ambient' && (
                  <span className={`tag tag-${selectedOrder.temp.toLowerCase()}`}>
                    {selectedOrder.temp}
                  </span>
                )}
                <span className={`risk-score ${riskClass(selectedOrder.riskScore)}`} style={{ fontSize: 13, fontWeight: 700, marginLeft: 'auto' }}>
                  {selectedOrder.riskScore}% risk
                </span>
              </div>
            </div>

            <div>
              <div className="drawer-section-label">Outlet</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{selectedOrder.outlet.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedOrder.outlet.address}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedOrder.outlet.district}</div>
            </div>

            <div>
              <div className="drawer-section-label">Delivery Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Brand', value: selectedOrder.brand },
                  { label: 'Window', value: `${selectedOrder.window.start}–${selectedOrder.window.end}` },
                  { label: 'Volume', value: `${selectedOrder.volume} m³` },
                  { label: 'Weight', value: `${selectedOrder.weight} kg` },
                  { label: 'Temperature', value: selectedOrder.temp },
                  { label: 'Route', value: selectedOrder.routeId?.replace('RT-', 'Route ') ?? 'Unassigned' },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }}>Assign to Route</button>
              <button className="btn btn-secondary">View on Map</button>
              <button className="btn btn-danger">Defer</button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default OrdersPage;
