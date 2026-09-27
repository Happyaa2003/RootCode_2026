import React, { useState } from 'react';
import { Search, Truck, Snowflake, Wifi, WifiOff } from 'lucide-react';
import CapacityBar from '../components/common/CapacityBar';
import Drawer from '../components/common/Drawer';
import { vehicles } from '../data/mockData';
import type { Vehicle } from '../types';

const FleetPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = vehicles.filter(v => {
    if (typeFilter !== 'All' && v.type !== typeFilter) return false;
    if (statusFilter !== 'All' && v.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return v.plate.toLowerCase().includes(q) || (v.driver?.name.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  const statusColor = (s: string) => {
    if (s === 'Active') return 'var(--success)';
    if (s === 'Idle') return 'var(--warning)';
    if (s === 'Offline') return 'var(--n400)';
    return 'var(--danger)';
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="sidebar-search" style={{ width: 220 }}>
            <Search size={14} color="var(--text-muted)" />
            <input placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-bar">
            {['All', 'Standard', 'Reefer', 'Large'].map(t => (
              <button key={t} className={`filter-select ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
            ))}
          </div>
          <div className="filter-bar">
            {['All', 'Active', 'Idle', 'Offline', 'Maintenance'].map(s => (
              <button key={s} className={`filter-select ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="page-header-right">
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{filtered.length} vehicles</span>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Plate</th>
              <th>Type</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Capacity (Vol)</th>
              <th>Capacity (Wgt)</th>
              <th>Refrigeration</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr
                key={v.id}
                className={selected?.id === v.id ? 'selected' : ''}
                onClick={() => { setSelected(v); setDrawerOpen(true); }}
              >
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 4,
                      background: v.status === 'Active' ? 'var(--success-tint)' : v.status === 'Offline' ? 'var(--bg-muted)' : 'var(--warning-tint)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Truck size={14} color={statusColor(v.status)} />
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11.5,
                      background: 'var(--bg-muted)', padding: '2px 7px', borderRadius: 5,
                      border: '1px solid var(--border)'
                    }}>{v.plate}</span>
                  </div>
                </td>
                <td className="secondary">{v.type}</td>
                <td>
                  {v.driver ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-tint)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700, color: 'var(--brand)',
                      }}>{v.driver.initials}</div>
                      <span style={{ fontSize: 13 }}>{v.driver.name}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unassigned</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(v.status) }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: statusColor(v.status) }}>{v.status}</span>
                  </div>
                </td>
                <td>
                  <div style={{ minWidth: 120 }}>
                    <CapacityBar used={0} total={v.capacityVolume} showLabel={false} height={3} />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{v.capacityVolume} m³</div>
                  </div>
                </td>
                <td className="muted">{v.capacityWeight.toLocaleString()} kg</td>
                <td>
                  {v.hasRefrigeration ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand)' }}>
                      <Snowflake size={14} /> <span style={{ fontSize: 12, fontWeight: 500 }}>Reefer</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ambient</span>
                  )}
                </td>
                <td>
                  {v.status === 'Offline' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--n400)' }}>
                      <WifiOff size={13} /> <span style={{ fontSize: 12 }}>No signal</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)' }}>
                      <Wifi size={13} /> <span style={{ fontSize: 12 }}>08:42 AM</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={selected?.plate ?? ''}>
        {selected && (
          <>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', background: statusColor(selected.status) + '20', color: statusColor(selected.status), borderRadius: 4 }}>
                  {selected.status}
                </span>
                {selected.hasRefrigeration && (
                  <span className="tag tag-chilled"><Snowflake size={10} /> Reefer</span>
                )}
              </div>
            </div>

            {selected.driver && (
              <div>
                <div className="drawer-section-label">Driver</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: 'var(--brand-tint)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: 'var(--brand)',
                  }}>{selected.driver.initials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{selected.driver.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selected.driver.phone}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>License {selected.driver.licenseClass}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="drawer-section-label">Specifications</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Type', value: selected.type },
                  { label: 'Volume Capacity', value: `${selected.capacityVolume} m³` },
                  { label: 'Weight Capacity', value: `${selected.capacityWeight.toLocaleString()} kg` },
                  { label: 'Refrigeration', value: selected.hasRefrigeration ? 'Yes (Reefer)' : 'No' },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }}>View on Map</button>
              <button className="btn btn-secondary">Assign Driver</button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default FleetPage;
