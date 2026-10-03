import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DatasetProvider } from './context/DatasetContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import WaypointHeader from './components/shell/WaypointHeader';
import CommandPalette from './components/shell/CommandPalette';
import AIChatbot from './components/common/AIChatbot';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import WaypointLiveView from './pages/WaypointLiveView';
import OrdersPage from './pages/Orders';
import PlannerPage from './pages/Planner';
import FleetPage from './pages/Fleet';
import LoadingPage from './pages/Loading';
import ForecastPage from './pages/Forecast';
import ExceptionsPage from './pages/Exceptions';
import ReportsPage from './pages/Reports';
import Overview from './pages/Overview';
import DispatcherPage from './pages/Dispatcher';
import DriverPage from './pages/Driver';
import StoreManagerPage from './pages/StoreManager';
import OrderDetailPage from './pages/OrderDetail';
import OfflineModePage from './pages/OfflineMode';
import StartupLoader from './components/common/StartupLoader';
import UserManagementPage from './pages/UserManagement';

type Theme = 'light' | 'dark';

const AppShell: React.FC<{
  children: React.ReactNode;
  theme: Theme;
  onThemeToggle: () => void;
}> = ({ children, theme, onThemeToggle }) => {
  const [cmdOpen, setCmdOpen] = useState(false);

  const openCmd  = useCallback(() => setCmdOpen(true), []);
  const closeCmd = useCallback(() => setCmdOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <WaypointHeader
        onSearchOpen={openCmd}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      <CommandPalette open={cmdOpen} onClose={closeCmd} />
      <AIChatbot />
    </div>
  );
};

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('waypoint-theme') as Theme | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light';
      localStorage.setItem('waypoint-theme', next);
      return next;
    });
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <AppShell theme={theme} onThemeToggle={toggleTheme}>{children}</AppShell>
  );

  return (
    <AuthProvider>
      <CurrencyProvider>
        <DatasetProvider>
          <StartupLoader />
          <Routes>
            <Route path="/landing" element={<Landing theme={theme} onThemeToggle={toggleTheme} />} />
            <Route path="/login" element={<Login theme={theme} onThemeToggle={toggleTheme} />} />
            <Route path="/signup" element={<Signup theme={theme} onThemeToggle={toggleTheme} />} />
            <Route path="/"              element={<Shell><WaypointLiveView /></Shell>} />
            <Route path="/live"          element={<Shell><WaypointLiveView /></Shell>} />
            <Route path="/overview"      element={<Shell><Overview /></Shell>} />
            <Route path="/dispatcher"    element={<Shell><DispatcherPage /></Shell>} />
            <Route path="/orders"        element={<Shell><OrdersPage /></Shell>} />
            <Route path="/orders/:orderId" element={<Shell><OrderDetailPage /></Shell>} />
            <Route path="/order-detail"  element={<Shell><OrderDetailPage /></Shell>} />
            <Route path="/planner"       element={<Shell><PlannerPage /></Shell>} />
            <Route path="/fleet"         element={<Shell><FleetPage /></Shell>} />
            <Route path="/loading"       element={<Shell><LoadingPage /></Shell>} />
            <Route path="/driver"        element={<Shell><DriverPage /></Shell>} />
            <Route path="/store-manager" element={<Shell><StoreManagerPage /></Shell>} />
            <Route path="/forecast"      element={<Shell><ForecastPage /></Shell>} />
            <Route path="/exceptions"    element={<Shell><ExceptionsPage /></Shell>} />
            <Route path="/offline"       element={<Shell><OfflineModePage /></Shell>} />
            <Route path="/reports"       element={<Shell><ReportsPage /></Shell>} />
            <Route path="/users"         element={<Shell><UserManagementPage /></Shell>} />
          </Routes>
        </DatasetProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
