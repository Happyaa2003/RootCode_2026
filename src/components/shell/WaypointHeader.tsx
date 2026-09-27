import React, { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar, Radio, BarChart2, ChevronDown, Search,
  Sun, Moon, Settings, LogOut, Package,
  Truck, Warehouse, AlertTriangle, Layers, Navigation, Database,
  Clock, LogIn, UserPlus
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import DeliveryEstimatorModal from '../modals/DeliveryEstimatorModal';

interface WaypointHeaderProps {
  onSearchOpen: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const WaypointHeader: React.FC<WaypointHeaderProps> = ({ onSearchOpen, theme, onThemeToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode } = useDataset();
  const { currency, setCurrency } = useCurrency();
  const { user, logout, switchRole } = useAuth();

  const [moreOpen, setMoreOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [datasetOpen, setDatasetOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [estimatorOpen, setEstimatorOpen] = useState(false);

  const isLiveActive = location.pathname === '/' || location.pathname === '/live';
  const isPlanActive = location.pathname === '/planner';
  const isAnalyticsActive = location.pathname === '/reports';

  return (
    <header className="waypoint-header">
      {/* Brand: Waypoint Root */}
      <Link to="/" className="waypoint-brand">
        <div className="waypoint-brand-icon">
          <Navigation size={15} fill="#2563EB" color="#2563EB" style={{ transform: 'rotate(45deg)' }} />
        </div>
        <span className="waypoint-brand-title">Waypoint Root</span>
        <span className="waypoint-brand-badge">PRO</span>
      </Link>

      {/* Main Navigation Tabs */}
      <nav className="waypoint-tabs">
        <NavLink
          to="/planner"
          className={`waypoint-tab ${isPlanActive ? 'active' : ''}`}
        >
          <Calendar size={14} />
          <span>Plan and Optimize</span>
        </NavLink>

        <NavLink
          to="/"
          className={`waypoint-tab ${isLiveActive ? 'active' : ''}`}
        >
          <Radio size={14} color={isLiveActive ? '#2563EB' : 'currentColor'} />
          <span>Live</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={`waypoint-tab ${isAnalyticsActive ? 'active' : ''}`}
        >
          <BarChart2 size={14} />
          <span>Analytics & Cost</span>
        </NavLink>

        {/* More Operations Modules Dropdown */}
        <div className="waypoint-dropdown-tab" style={{ position: 'relative' }}>
          <button
            className={`waypoint-tab ${['/orders', '/fleet', '/loading', '/forecast', '/exceptions'].includes(location.pathname) ? 'active' : ''}`}
            onClick={() => setMoreOpen(o => !o)}
          >
            <Layers size={13} />
            <span>Operations</span>
            <ChevronDown size={11} />
          </button>

          {moreOpen && (
            <div
              className="waypoint-dropdown-menu"
              onMouseLeave={() => setMoreOpen(false)}
            >
              {[
                { path: '/orders', label: 'Orders Queue', icon: Package },
                { path: '/fleet', label: 'Fleet & Vehicles', icon: Truck },
                { path: '/loading', label: 'Loading Checklist', icon: Warehouse },
                { path: '/forecast', label: 'Demand Forecast', icon: BarChart2 },
                { path: '/exceptions', label: 'Active Exceptions', icon: AlertTriangle },
              ].map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMoreOpen(false)}
                  className={`waypoint-dropdown-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <item.icon size={14} color="var(--text-secondary)" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div style={{ flex: 1 }} />

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Currency Switcher: USD ($) vs LKR (Rs.) */}
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--bg-muted)', borderRadius: 6, padding: '2px 4px',
          border: '1px solid var(--border)'
        }}>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            style={{
              padding: '3px 8px', fontSize: 11, fontWeight: 700, borderRadius: 4,
              border: 'none', cursor: 'pointer',
              background: currency === 'USD' ? '#2563EB' : 'transparent',
              color: currency === 'USD' ? '#fff' : 'var(--text-secondary)'
            }}
            title="Display all prices in USD ($)"
          >
            $ USD
          </button>
          <button
            type="button"
            onClick={() => setCurrency('LKR')}
            style={{
              padding: '3px 8px', fontSize: 11, fontWeight: 700, borderRadius: 4,
              border: 'none', cursor: 'pointer',
              background: currency === 'LKR' ? '#2563EB' : 'transparent',
              color: currency === 'LKR' ? '#fff' : 'var(--text-secondary)'
            }}
            title="Display all prices in Sri Lankan Rupees (Rs. LKR)"
          >
            Rs. LKR
          </button>
        </div>

        {/* Delivery Time & ETA Estimator Trigger */}
        <button
          onClick={() => setEstimatorOpen(true)}
          className="waypoint-dataset-btn"
          style={{ background: 'rgba(16, 185, 129, 0.09)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10B981' }}
          title="Open Real-Time Delivery ETA & Turnaround Estimator"
        >
          <Clock size={12} color="#10B981" />
          <span style={{ fontWeight: 700 }}>ETA Estimator</span>
        </button>

        {/* Dataset Switcher (Peliyagoda tempData vs Boston screenshot benchmark) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDatasetOpen(o => !o)}
            className="waypoint-dataset-btn"
            title="Switch dataset (tempData vs Benchmark)"
          >
            <Database size={12} color="#2563EB" />
            <span style={{ fontWeight: 600 }}>
              {mode === 'peliyagoda' ? 'Peliyagoda (tempData)' : 'Boston (Benchmark)'}
            </span>
            <ChevronDown size={10} />
          </button>

          {datasetOpen && (
            <div
              className="waypoint-dropdown-menu"
              style={{ minWidth: 230, right: 0, left: 'auto' }}
              onMouseLeave={() => setDatasetOpen(false)}
            >
              <div style={{ padding: '6px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Active Logistics Dataset
              </div>
              <button
                className={`waypoint-dropdown-item ${mode === 'peliyagoda' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: mode === 'peliyagoda' ? 'var(--bg-muted)' : 'transparent', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => { setMode('peliyagoda'); setDatasetOpen(false); }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>RootCode Peliyagoda (tempData)</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Peliyagoda Depot · 120 Outlets · 60 Vehicles</div>
                </div>
              </button>
              <button
                className={`waypoint-dropdown-item ${mode === 'boston' ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: mode === 'boston' ? 'var(--bg-muted)' : 'transparent', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => { setMode('boston'); setDatasetOpen(false); }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>OptimoRoute Benchmark (Boston)</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Exact match for Screenshot 1 layout & stops</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Quick Search */}
        <button
          onClick={onSearchOpen}
          className="waypoint-search-btn"
          title="Search orders, routes (Ctrl+K)"
        >
          <Search size={12} />
          <span style={{ fontSize: 11.5 }}>Search...</span>
          <kbd style={{
            fontSize: 9.5, padding: '1px 4px', borderRadius: 3,
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)', color: 'var(--text-muted)'
          }}>
            Ctrl K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="waypoint-icon-btn"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={14} color="#F59E0B" /> : <Moon size={14} color="#64748B" />}
        </button>

        {/* Administration dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setAdminOpen(o => !o)}
            className="waypoint-link-btn"
          >
            <Settings size={13} />
            <span>Admin</span>
            <ChevronDown size={11} />
          </button>

          {adminOpen && (
            <div
              className="waypoint-dropdown-menu"
              style={{ right: 0, left: 'auto', minWidth: 160 }}
              onMouseLeave={() => setAdminOpen(false)}
            >
              <div className="waypoint-dropdown-item" style={{ cursor: 'pointer' }}>
                <Settings size={13} />
                <span>Dispatch Rules</span>
              </div>
              <div className="waypoint-dropdown-item" style={{ cursor: 'pointer' }}>
                <Package size={13} />
                <span>Depot Settings</span>
              </div>
              <div className="waypoint-dropdown-item" style={{ cursor: 'pointer' }}>
                <Layers size={13} />
                <span>API Keys & Webhooks</span>
              </div>
            </div>
          )}
        </div>

        {/* User Account / Auth Dropdown */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '3px 8px 3px 5px', borderRadius: 20,
                background: 'var(--bg-muted)', border: '1px solid var(--border)',
                cursor: 'pointer', color: 'var(--text-main)', fontSize: 11.5
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: '#2563EB', color: '#fff', fontSize: 10,
                fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {user.initials}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <div style={{ fontWeight: 700 }}>{user.name.split(' ')[0]}</div>
                <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{user.role}</div>
              </div>
              <ChevronDown size={11} color="var(--text-muted)" />
            </button>

            {userMenuOpen && (
              <div
                className="waypoint-dropdown-menu"
                style={{ right: 0, left: 'auto', minWidth: 210 }}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{user.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{user.email}</div>
                  <div style={{ fontSize: 10.5, color: '#2563EB', marginTop: 2, fontWeight: 600 }}>{user.depot}</div>
                </div>

                <div style={{ padding: '6px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Switch Active Role
                </div>
                {(['Dispatcher', 'Planner', 'Fleet Manager', 'Admin'] as const).map(r => (
                  <button
                    key={r}
                    className={`waypoint-dropdown-item ${user.role === r ? 'active' : ''}`}
                    style={{ width: '100%', border: 'none', background: user.role === r ? 'var(--bg-muted)' : 'transparent', textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => { switchRole(r); setUserMenuOpen(false); }}
                  >
                    <span>{r}</span>
                  </button>
                ))}

                <div style={{ borderTop: '1px solid var(--border)', marginTop: 4 }}>
                  <button
                    className="waypoint-dropdown-item"
                    style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: '#EF4444' }}
                    onClick={() => { logout(); setUserMenuOpen(false); navigate('/login'); }}
                  >
                    <LogOut size={13} color="#EF4444" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link
              to="/login"
              className="waypoint-link-btn"
              style={{ textDecoration: 'none' }}
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </Link>
            <Link
              to="/signup"
              style={{
                padding: '4px 9px', borderRadius: 5, background: '#2563EB',
                color: '#fff', fontSize: 11, fontWeight: 600, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 5
              }}
            >
              <UserPlus size={12} />
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </div>

      <DeliveryEstimatorModal
        isOpen={estimatorOpen}
        onClose={() => setEstimatorOpen(false)}
      />
    </header>
  );
};

export default WaypointHeader;
