import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Map, Radio, Truck, Warehouse,
  BarChart2, AlertTriangle, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/orders', label: 'Orders', icon: Package },
  { path: '/planner', label: 'Planner', icon: Map },
  { path: '/live', label: 'Live Operations', icon: Radio, badge: 7 },
  { path: '/fleet', label: 'Fleet', icon: Truck },
  { path: '/loading', label: 'Loading', icon: Warehouse },
  { path: '/forecast', label: 'Forecast', icon: BarChart2 },
  { path: '/exceptions', label: 'Exceptions', icon: AlertTriangle, badge: 5 },
  { path: '/reports', label: 'Reports', icon: FileText },
];

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, onToggle }) => {
  return (
    <nav className={`sidebar ${expanded ? 'expanded' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L2 6v6l7 4 7-4V6L9 2z" stroke="white" strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
            <path d="M2 6l7 4 7-4" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M9 10v6" stroke="white" strokeWidth="1.6"/>
          </svg>
        </div>
        <div className="sidebar-logo-text-group">
          <span className="sidebar-logo-text">WAYPOINT</span>
          <span className="sidebar-logo-sub">DISPATCH OS • SL-V2</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={!expanded ? item.label : undefined}
          >
            <span className="nav-item-icon">
              <item.icon size={18} strokeWidth={1.8} />
            </span>
            <span className="nav-item-label">{item.label}</span>
            {item.badge !== undefined && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Sidebar Footer with Live Telemetry */}
      <div className="sidebar-footer">
        <div className="sidebar-status-card">
          <div className="sidebar-status-top">
            <span className="sidebar-status-title">SL-RADAR LINK</span>
            <span className="sidebar-status-val">99.8%</span>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Peliyagoda Hub Active
          </div>
          <div className="sidebar-status-progress">
            <div className="sidebar-status-progress-fill" />
          </div>
        </div>

        {/* Toggle Button */}
        <button className="sidebar-toggle" onClick={onToggle} title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}>
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
