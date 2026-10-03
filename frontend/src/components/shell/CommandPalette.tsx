import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Package, Truck, LayoutDashboard, Smartphone,
  Store, WifiOff, Calendar, AlertTriangle, BarChart2, Radio
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { orders, routes, allVehicles: vehicles, drivers } = useDataset();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) { setQuery(''); return; }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const goTo = (path: string) => {
    navigate(path);
    onClose();
  };

  const navPages = [
    { title: 'Dispatcher Dashboard', path: '/dispatcher', icon: LayoutDashboard, desc: 'Tactical command center & AI' },
    { title: 'Driver Mobile App', path: '/driver', icon: Smartphone, desc: 'Turn-by-turn navigation & POD' },
    { title: 'Store Receiving Terminal', path: '/store-manager', icon: Store, desc: 'FreshMart dock & temperature' },
    { title: 'Offline Degraded Mode', path: '/offline', icon: WifiOff, desc: 'IndexedDB cache & sync queue' },
    { title: 'Executive Overview', path: '/overview', icon: BarChart2, desc: 'KPI cards & fleet health' },
    { title: 'Live Operations', path: '/live', icon: Radio, desc: 'Real-time telemetry map' },
    { title: 'Route Planner', path: '/planner', icon: Calendar, desc: 'Gantt timeline & optimizer' },
    { title: 'Demand Forecast', path: '/forecast', icon: BarChart2, desc: 'Festival surge & capacity' },
    { title: 'Active Exceptions', path: '/exceptions', icon: AlertTriangle, desc: 'Workshop groundings & SLA' },
  ];

  const filteredPages = navPages.filter(p =>
    !query || p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.desc.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredOrders = orders.filter(o =>
    !query || o.id.toLowerCase().includes(query.toLowerCase()) ||
    o.outlet.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredRoutes = routes.filter(r =>
    !query || r.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredVehicles = vehicles.filter(v =>
    !query || v.plate.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 2);

  const filteredDrivers = drivers.filter(d =>
    !query || d.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 2);

  if (!open) return null;

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <div className="cmd-input-row">
          <Search size={18} color="var(--text-muted)" />
          <input
            className="cmd-input"
            placeholder="Search orders, routes, drivers, vehicles..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <kbd style={{ fontSize: 11, background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-muted)' }}>Esc</kbd>
        </div>

        <div className="cmd-results">
          {filteredPages.length > 0 && (
            <>
              <div className="cmd-group-label">Quick Navigation</div>
              {filteredPages.map(page => (
                <div key={page.path} className="cmd-result-item" onClick={() => goTo(page.path)}>
                  <div className="cmd-result-icon"><page.icon size={16} /></div>
                  <div>
                    <div className="cmd-result-label">{page.title}</div>
                    <div className="cmd-result-sub">{page.desc}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {filteredOrders.length > 0 && (
            <>
              <div className="cmd-group-label">Orders</div>
              {filteredOrders.map(o => (
                <div key={o.id} className="cmd-result-item" onClick={() => goTo(`/orders/${o.id}`)}>
                  <div className="cmd-result-icon"><Package size={16} /></div>
                  <div>
                    <div className="cmd-result-label">{o.id}</div>
                    <div className="cmd-result-sub">{o.outlet.name} · {o.status}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {filteredRoutes.length > 0 && (
            <>
              <div className="cmd-group-label">Routes</div>
              {filteredRoutes.map(r => (
                <div key={r.id} className="cmd-result-item" onClick={onClose}>
                  <div className="cmd-result-icon" style={{ background: r.color + '22' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="3" cy="3" r="2" stroke={r.color} strokeWidth="1.5"/>
                      <circle cx="13" cy="13" r="2" stroke={r.color} strokeWidth="1.5"/>
                      <path d="M3 5v4a2 2 0 002 2h4" stroke={r.color} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="cmd-result-label">{r.name}</div>
                    <div className="cmd-result-sub">{r.stops.length} stops · {r.driver?.name ?? 'Unassigned'}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {filteredVehicles.length > 0 && (
            <>
              <div className="cmd-group-label">Vehicles</div>
              {filteredVehicles.map(v => (
                <div key={v.id} className="cmd-result-item" onClick={onClose}>
                  <div className="cmd-result-icon"><Truck size={16} /></div>
                  <div>
                    <div className="cmd-result-label">{v.plate}</div>
                    <div className="cmd-result-sub">{v.type} · {v.status}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {filteredDrivers.length > 0 && (
            <>
              <div className="cmd-group-label">Drivers</div>
              {filteredDrivers.map((d, idx) => (
                <div key={`${d.id}-${idx}`} className="cmd-result-item" onClick={onClose}>
                  <div className="cmd-result-icon">
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-tint)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: 'var(--brand)'
                    }}>{d.initials}</div>
                  </div>
                  <div>
                    <div className="cmd-result-label">{d.name}</div>
                    <div className="cmd-result-sub">Driver · {d.licenseClass}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {query && filteredOrders.length === 0 && filteredRoutes.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              No results for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
