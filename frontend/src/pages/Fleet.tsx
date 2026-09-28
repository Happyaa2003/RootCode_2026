import React, { useState } from 'react';
import { Search, Truck, Snowflake, Wrench } from 'lucide-react';
import CapacityBar from '../components/common/CapacityBar';
import Drawer from '../components/common/Drawer';
import { useDataset } from '../context/DatasetContext';
import type { Vehicle } from '../types';

const FleetPage: React.FC = () => {
  const { allVehicles } = useDataset();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = allVehicles.filter(v => {
    if (typeFilter !== 'All' && v.type !== typeFilter) return false;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Maintenance' && v.status !== 'Maintenance') return false;
      if (statusFilter !== 'Maintenance' && v.status !== statusFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return v.plate.toLowerCase().includes(q) || (v.driver?.name.toLowerCase().includes(q) ?? false) || v.id.toLowerCase().includes(q);
    }
    return true;
  });

  const statusColor = (s: string) => {
    if (s === 'Active') return 'var(--success)';
    if (s === 'Idle') return 'var(--warning)';
    if (s === 'Offline') return 'var(--n400)';
    if (s === 'Maintenance') return 'var(--danger)';
    return 'var(--danger)';
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="sidebar-search" style={{ width: 220 }}>
            <Search size={14} color="var(--text-muted)" />
            <input placeholder="Search 60 fleet units..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-bar">
            {['All', 'Standard', 'Reefer', 'Large'].map(t => (
              <button key={t} className={`filter-select ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
            ))}
          </div>
          <div className="filter-bar">
            {['All', 'Active', 'Idle', 'Maintenance', 'Offline'].map(s => (
              <button key={s} className={`filter-select ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s === 'Maintenance' ? 'Workshop (task2b)' : s}
              </button>
            ))}
          </div>
        </div>
        <div className="page-header-right">
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Showing {filtered.length} of {allVehicles.length} vehicles (from vehicles.csv)
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <table className="data-table" style={{ fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ width: 130 }}>Vehicle / Plate</th>
              <th style={{ width: 110 }}>Depot Hub</th>
              <th style={{ width: 100 }}>Type</th>
              <th style={{ width: 140 }}>Driver</th>
              <th style={{ width: 120 }}>Status</th>
              <th style={{ width: 110 }}>Capacity (Vol)</th>
              <th style={{ width: 100 }}>Capacity (Wgt)</th>
              <th style={{ width: 100 }}>Fuel Efficiency</th>
              <th style={{ width: 160 }}>Weekly Fuel Quota</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => {
              const quota = v.weeklyFuelQuotaL || 400;
              const consumed = v.fuelConsumedL || 120;
              const pct = Math.round((consumed / quota) * 100);

              return (
                <tr
                  key={v.id}
                  className={selected?.id === v.id ? 'selected' : ''}
                  onClick={() => { setSelected(v); setDrawerOpen(true); }}
                  style={{ height: 40 }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 4,
                        background: v.status === 'Active' ? 'var(--success-tint)' : v.status === 'Maintenance' ? 'var(--danger-tint)' : 'var(--bg-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {v.status === 'Maintenance' ? (
                          <Wrench size={14} color="var(--danger)" />
                        ) : (
                          <Truck size={14} color={statusColor(v.status)} />
                        )}
                      </div>
                      <div>
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11.5,
                          color: 'var(--text-primary)'
                        }}>
                          {v.plate}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v.id}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ color: 'var(--text-secondary)' }}>
                    {v.depotId === 'DEP-KDY' ? 'Kandy Hill' : 'Peliyagoda'}
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{v.type}</span>
                      {v.hasRefrigeration && <span title="Reefer Chilled"><Snowflake size={12} color="#2563EB" /></span>}
                    </div>
                  </td>

                  <td>
                    {v.driver ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', background: 'var(--brand-tint)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 700, color: 'var(--brand)',
                        }}>{v.driver.initials}</div>
                        <span>{v.driver.name}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                    )}
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(v.status) }} />
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: statusColor(v.status),
                      }}>
                        {v.status === 'Maintenance' ? 'In Workshop' : v.status}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div style={{ minWidth: 100 }}>
                      <CapacityBar used={0} total={v.capacityVolume} showLabel={false} height={3} />
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>{v.capacityVolume} m³</div>
                    </div>
                  </td>

                  <td style={{ fontFamily: 'var(--font-mono)' }}>{v.capacityWeight.toLocaleString()} kg</td>

                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      {v.kmPerL?.toFixed(1) ?? '5.2'} km/L
                    </div>
                    <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                      {v.fuelType === 'diesel' ? 'Diesel' : 'Petrol'}
                    </div>
                  </td>

                  <td>
                    <div style={{ minWidth: 120 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                        <span>{consumed.toFixed(0)} L</span>
                        <span style={{ color: 'var(--text-muted)' }}>{quota} L</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${Math.min(pct, 100)}%`,
                          background: pct > 80 ? '#DC2626' : (pct > 50 ? '#F59E0B' : '#10B981')
                        }} />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={`${selected?.plate ?? ''} · ${selected?.id ?? ''}`}>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '2px 8px',
                background: statusColor(selected.status) + '20',
                color: statusColor(selected.status), borderRadius: 4
              }}>
                {selected.status === 'Maintenance' ? 'Grounded in Workshop (task2b_peak_day_fleet)' : selected.status}
              </span>
              {selected.hasRefrigeration && (
                <span className="tag tag-chilled"><Snowflake size={10} /> Reefer Chilled</span>
              )}
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                Fuel Economics & Statutory Quota
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Weekly Quota: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{selected.weeklyFuelQuotaL ?? 400} Liters</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Fuel Consumed: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{selected.fuelConsumedL ?? 120} Liters</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Efficiency: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{selected.kmPerL?.toFixed(1) ?? '5.2'} km/L</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Depot: </span>
                  <strong>{selected.depotId === 'DEP-KDY' ? 'Kandy Hill Depot' : 'Peliyagoda Central'}</strong>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                Payload & Capacity
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Volume: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{selected.capacityVolume} m³</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Weight: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{selected.capacityWeight.toLocaleString()} kg</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default FleetPage;
