import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Calendar, Radio, BarChart2, ChevronDown, Search,
  Sun, Moon, Settings, HelpCircle, LogOut, Package,
  Truck, Warehouse, AlertTriangle, Layers
} from 'lucide-react';

interface OptimoHeaderProps {
  onSearchOpen: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const OptimoHeader: React.FC<OptimoHeaderProps> = ({ onSearchOpen, theme, onThemeToggle }) => {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const isLiveActive = location.pathname === '/' || location.pathname === '/live';
  const isPlanActive = location.pathname === '/planner';
  const isAnalyticsActive = location.pathname === '/reports';

  return (
    <header className="optimoroute-header">
      {/* OptimoRoute Logo */}
      <Link to="/" className="optimoroute-brand">
        <span className="optimoroute-brand-title">OptimoRoute</span>
        <span className="optimoroute-brand-tm">™</span>
      </Link>

      {/* Main Tabs (matching screenshot) */}
      <nav className="optimoroute-tabs">
        <NavLink
          to="/planner"
          className={`optimoroute-tab ${isPlanActive ? 'active' : ''}`}
        >
          <Calendar size={15} />
          <span>Plan and Optimize</span>
        </NavLink>

        <NavLink
          to="/"
          className={`optimoroute-tab ${isLiveActive ? 'active' : ''}`}
        >
          <Radio size={15} color={isLiveActive ? '#2563EB' : 'currentColor'} />
          <span>Live</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={`optimoroute-tab ${isAnalyticsActive ? 'active' : ''}`}
        >
          <BarChart2 size={15} />
          <span>Analytics</span>
        </NavLink>

        {/* More Operations Modules Dropdown */}
        <div className="optimoroute-dropdown-tab" style={{ position: 'relative' }}>
          <button
            className={`optimoroute-tab ${['/orders', '/fleet', '/loading', '/forecast', '/exceptions'].includes(location.pathname) ? 'active' : ''}`}
            onClick={() => setMoreOpen(o => !o)}
          >
            <Layers size={14} />
            <span>Operations</span>
            <ChevronDown size={12} />
          </button>

          {moreOpen && (
            <div
              style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                minWidth: 180, zIndex: 100, padding: 4
              }}
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
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                    fontSize: 12, fontWeight: 500, color: 'var(--text-primary)',
                    textDecoration: 'none', borderRadius: 4,
                    background: location.pathname === item.path ? 'var(--bg-muted)' : 'transparent'
                  }}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Quick Search */}
        <button
          onClick={onSearchOpen}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--bg-muted)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '4px 10px', fontSize: 12,
            color: 'var(--text-muted)', cursor: 'pointer'
          }}
          title="Search orders, routes (Ctrl+K)"
        >
          <Search size={13} />
          <span>Search...</span>
          <kbd style={{ fontSize: 9, fontFamily: 'monospace', background: 'var(--bg-surface)', padding: '1px 4px', borderRadius: 3, border: '1px solid var(--border)' }}>
            Ctrl K
          </kbd>
        </button>

        {/* Theme Toggle Slider */}
        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          style={{ width: 48, height: 26 }}
        >
          <div className="theme-toggle-thumb" style={{ width: 18, height: 18, transform: theme === 'dark' ? 'translateX(22px)' : 'none' }}>
            {theme === 'light' ? <Sun size={10} /> : <Moon size={10} />}
          </div>
        </button>

        {/* Administration dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setAdminOpen(a => !a)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              border: 'none', background: 'none', fontSize: 12,
              fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer'
            }}
          >
            <Settings size={13} />
            <span>Administration</span>
            <ChevronDown size={11} />
          </button>
          {adminOpen && (
            <div
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 6,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                minWidth: 160, zIndex: 100, padding: 4
              }}
              onMouseLeave={() => setAdminOpen(false)}
            >
              <div style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                PELIYAGODA DEPOT #1
              </div>
              <Link to="/fleet" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '6px 10px', fontSize: 12, color: 'var(--text-primary)', textDecoration: 'none' }}>
                Vehicle Settings
              </Link>
              <Link to="/planner" onClick={() => setAdminOpen(false)} style={{ display: 'block', padding: '6px 10px', fontSize: 12, color: 'var(--text-primary)', textDecoration: 'none' }}>
                Routing Profiles
              </Link>
            </div>
          )}
        </div>

        {/* Support */}
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            border: 'none', background: 'none', fontSize: 12,
            fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer'
          }}
        >
          <HelpCircle size={13} />
          <span>Support</span>
          <ChevronDown size={11} />
        </button>

        {/* Logout */}
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            border: 'none', background: 'none', fontSize: 12,
            fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer'
          }}
          title="Logout dispatcher session"
        >
          <LogOut size={13} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default OptimoHeader;
