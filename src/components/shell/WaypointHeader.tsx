import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Calendar, Radio, BarChart2, ChevronDown, Search,
  Sun, Moon, Settings, HelpCircle, LogOut, Package,
  Truck, Warehouse, AlertTriangle, Layers, Navigation, Database
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

interface WaypointHeaderProps {
  onSearchOpen: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const WaypointHeader: React.FC<WaypointHeaderProps> = ({ onSearchOpen, theme, onThemeToggle }) => {
  const location = useLocation();
  const { mode, setMode } = useDataset();
  const [moreOpen, setMoreOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [datasetOpen, setDatasetOpen] = useState(false);

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
          <span>Analytics</span>
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
        {/* Dataset Switcher (Peliyagoda tempData vs Boston screenshot benchmark) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDatasetOpen(o => !o)}
            className="waypoint-dataset-btn"
            title="Switch dataset (tempData vs Benchmark)"
          >
            <Database size={12} color="#2563EB" />
            <span style={{ fontWeight: 600 }}>
              {mode === 'peliyagoda' ? 'Dataset: Peliyagoda (tempData)' : 'Dataset: Boston (Benchmark)'}
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
            <span>Administration</span>
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

        {/* Support */}
        <a href="#support" className="waypoint-link-btn">
          <HelpCircle size={13} />
          <span>Support</span>
          <ChevronDown size={11} />
        </a>

        {/* Logout */}
        <a href="#logout" className="waypoint-link-btn">
          <LogOut size={13} />
          <span>Logout</span>
        </a>
      </div>
    </header>
  );
};

export default WaypointHeader;
