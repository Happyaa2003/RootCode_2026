import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronDown, Search, Sun, Moon, Wifi, Sparkles } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/':           'Command Overview',
  '/orders':     'Order Management',
  '/planner':    'Route Optimization Engine',
  '/live':       'Live GPS Operations',
  '/fleet':      'Fleet Telemetry',
  '/loading':    'Cross-Dock Loading',
  '/forecast':   'Demand & Capacity Risk',
  '/exceptions': 'Mission Exceptions',
  '/reports':    'Performance Analytics',
};

interface TopBarProps {
  pathname: string;
  onSearchOpen: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ pathname, onSearchOpen, theme, onThemeToggle }) => {
  const title = pageTitles[pathname] ?? 'Way Pilot Command';

  return (
    <header className="topbar">
      {/* Breadcrumb with Tactical Marker */}
      <div className="topbar-breadcrumb">
        <span className="topbar-crumb">COLOMBO CENTRAL</span>
        <span className="topbar-crumb-sep">/</span>
        <span className="topbar-title">{title}</span>
      </div>

      <div className="topbar-spacer" />

      {/* Global Quick Search */}
      <button className="topbar-search" onClick={onSearchOpen}>
        <Search size={14} color="var(--text-muted)" />
        <span>Search routes, orders, drivers, vehicles...</span>
        <kbd>Ctrl K</kbd>
      </button>

      <div className="topbar-actions">
        {/* Landing Page Showcase Link */}
        <Link to="/landing" className="topbar-pill topbar-pill-tour" title="View Marketing Landing & Showcase">
          <Sparkles size={13} />
          <span>Product Tour</span>
        </Link>

        {/* Depot Selector */}
        <button className="topbar-pill" title="Active Hub: Peliyagoda Central">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="4" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.25"/>
            <path d="M4 4V3a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.25"/>
            <path d="M1 7h12" stroke="currentColor" strokeWidth="1.25"/>
          </svg>
          <span>Peliyagoda Hub</span>
          <ChevronDown size={11} />
        </button>

        {/* Live Radar Beacon */}
        <div className="live-indicator" title="Connected to Sri Lanka Telemetry Stream">
          <span className="live-dot" />
          <span>RADAR LIVE</span>
        </div>

        {/* Dark / Light Mode Switcher */}
        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          title={`Switch to ${theme === 'light' ? 'Dark Cyber' : 'Light Clean'} mode`}
          aria-label="Toggle theme"
        >
          <div className="theme-toggle-thumb">
            {theme === 'light' ? <Sun size={12} strokeWidth={2.5} /> : <Moon size={12} strokeWidth={2.5} />}
          </div>
        </button>

        {/* Notifications */}
        <button className="topbar-icon-btn" title="5 Active System Alerts">
          <Bell size={15} />
          <span className="notif-badge">5</span>
        </button>

        {/* GPS Satellite Lock */}
        <button className="topbar-icon-btn" title="GPS Sat-Lock Active · 24 Vehicles Monitored">
          <Wifi size={15} />
        </button>

        {/* User Avatar */}
        <div className="user-avatar" title="Dispatcher: Adeeba Dissanayake">
          AD
        </div>
      </div>
    </header>
  );
};

export default TopBar;
