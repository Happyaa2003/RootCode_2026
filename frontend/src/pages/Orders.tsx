import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Drawer from '../components/common/Drawer';
import { useDataset } from '../context/DatasetContext';
import { useCurrency } from '../context/CurrencyContext';
import type { Order } from '../types';

const riskClass = (score: number) =>
  score >= 60 ? 'risk-high' : score >= 30 ? 'risk-medium' : 'risk-low';

const OrdersPage: React.FC = () => {
  const { orders } = useDataset();
  const { formatPrice, currency } = useCurrency();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [sortKey, setSortKey] = useState<keyof Order>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const statuses = ['All', 'Planned', 'Loading', 'En Route', 'At Risk', 'Delivered', 'Failed'];
  const brands = ['All', 'Fresh', 'Style', 'Tech'];

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
  }, [orders, search, statusFilter, brandFilter, sortKey, sortDir]);

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
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <table className="data-table" style={{ fontSize: 12 }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className={sortKey === 'id' ? 'sorted' : ''} style={{ width: 95 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Order <SortIcon col="id" /></div>
              </th>
              <th>Outlet Destination</th>
              <th style={{ width: 75 }}>Brand</th>
              <th style={{ width: 90 }}>District</th>
              <th style={{ width: 110 }}>Time Window</th>
              <th style={{ width: 140 }}>Estimated ETA & SLA</th>
              <th style={{ width: 115, textAlign: 'right' }}>Item Price</th>
              <th style={{ width: 110, textAlign: 'right' }}>Delivery Cost</th>
              <th style={{ width: 105, textAlign: 'right' }}>Net Margin</th>
              <th style={{ width: 100 }}>Dock Service</th>
              <th onClick={() => handleSort('riskScore')} className={sortKey === 'riskScore' ? 'sorted' : ''} style={{ width: 65 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Risk <SortIcon col="riskScore" /></div>
              </th>
              <th style={{ width: 100 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr
                key={order.id}
                onClick={() => handleRowClick(order)}
                className={selectedOrder?.id === order.id ? 'selected' : ''}
                style={{ height: 38 }}
              >
                <td>
                  <span style={{
                    fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 11.5,
                    color: 'var(--text-primary)'
                  }}>{order.id}</span>
                </td>
                <td style={{ fontWeight: 600 }}>{order.outlet.name}</td>
                <td>
                  <span style={{
                    fontWeight: 600, fontSize: 11,
                    color: order.brand === 'Fresh' ? '#16A34A' : order.brand === 'Style' ? '#7C3AED' : '#2563EB'
                  }}>
                    {order.brand}
                  </span>
                </td>
                <td className="muted">{order.district}</td>
                <td className="secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  {order.window.start}–{order.window.end}
                </td>

                {/* Estimated ETA & SLA */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11.5, color: '#2563EB' }}>
                        {order.estimatedArrivalETA || order.scheduledAt || order.window.start}
                      </span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                        background: (order.onTimeProbability ?? 95) >= 90 ? '#DCFCE7' : '#FEF3C7',
                        color: (order.onTimeProbability ?? 95) >= 90 ? '#15803D' : '#B45309',
                      }}>
                        {order.onTimeProbability ?? 96}% SLA
                      </span>
                    </div>
                    <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                      {order.estimatedTravelMin ?? 18}m leg · {order.estimatedServiceMin ?? order.serviceAllowanceMin ?? 15}m dock
                    </div>
                  </div>
                </td>

                {/* Delivering Item Price */}
                <td style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: 11.5 }}>
                    {formatPrice(order.itemPrice ?? 1240)}
                  </div>
                  <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                    {order.units ?? 40} units
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
                    {order.costRatio ?? '2.4'}% ratio
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

                {/* Dock Service */}
                <td>
                  <span style={{
                    fontSize: 10.5, fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)'
                  }}>
                    {order.dockType || 'street'} · {order.serviceAllowanceMin || 18}m
                  </span>
                </td>

                {/* Risk */}
                <td>
                  <span className={`risk-score ${riskClass(order.riskScore)}`} style={{ fontSize: 11, fontWeight: 700 }}>
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
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={`Order ${selectedOrder?.id ?? ''}`}>
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <StatusBadge status={selectedOrder.status} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {selectedOrder.outlet.name}
              </span>
            </div>

            {/* Financial Card */}
            <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Delivering Cargo Valuation & Operational Cost
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 6px', borderRadius: 4 }}>
                  {Math.round(100 - (selectedOrder.costRatio || 3))}% Net Margin
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, marginBottom: 12 }}>
                <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>Item Merchandise Value</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {formatPrice(selectedOrder.itemPrice ?? 1240)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {selectedOrder.units ?? 40} units · {selectedOrder.brand}
                  </div>
                </div>

                <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>Total Delivering Cost</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#2563EB', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {formatPrice(selectedOrder.deliveryCost ?? 28.40)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
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

            {/* Delivery Time Estimation Card */}
            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }}>
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

            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                Dock & Destination Constraints
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-primary)' }}>{selectedOrder.outlet.address}</p>
              <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                Dock Type: <strong>{selectedOrder.dockType || 'street'}</strong> · Parking: <strong>{selectedOrder.parkingConstraint || 'normal'}</strong> · Service Allowance: <strong>{selectedOrder.serviceAllowanceMin || 18} min</strong>
              </p>
            </div>

            <Link
              to={`/orders/${selectedOrder.id}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 16px', background: '#2563EB', color: '#FFFFFF',
                borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 13,
                marginTop: 4
              }}
            >
              <span>Open Full Order Specification & Economics</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default OrdersPage;
