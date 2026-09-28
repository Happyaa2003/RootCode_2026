import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  peliyagodaDepots, bostonDepots,
  peliyagodaOutlets, bostonOutlets,
  all120PeliyagodaOutlets,
  peliyagodaDrivers, bostonDrivers,
  peliyagodaVehicles, bostonVehicles,
  all60PeliyagodaVehicles,
  peliyagodaOrders, bostonOrders,
  peliyagodaRoutes, bostonRoutes,
  districtTravelMatrix,
  task2aForecastCases,
  task2bPeakFleet,
  task2bPeakScenarios,
  calendarEvents,
  trafficSpeedProfiles,
  calculateDatasetEconomics,
} from '../data/tempDataService';
import type {
  Order, Route, Vehicle, Driver, Depot, Outlet,
  DistrictTravelInfo, Task2aForecastItem, PeakFleetStatus, PeakDayScenario, KpiSummary,
  RouteStop
} from '../types';

export type DatasetMode = 'peliyagoda' | 'boston';

interface HistoryState {
  orders: Order[];
  routes: Route[];
}

interface DatasetContextType {
  mode: DatasetMode;
  setMode: (mode: DatasetMode) => void;
  depots: Depot[];
  outlets: Outlet[];
  allOutlets: Outlet[];
  drivers: Driver[];
  vehicles: Vehicle[];
  allVehicles: Vehicle[];
  orders: Order[];
  routes: Route[];
  activeDepot: Depot;
  setActiveDepot: (depot: Depot) => void;
  districtTravelMatrix: DistrictTravelInfo[];
  task2aForecastCases: Task2aForecastItem[];
  task2bPeakFleet: PeakFleetStatus[];
  task2bPeakScenarios: PeakDayScenario[];
  calendarEvents: any[];
  trafficSpeedProfiles: any[];
  kpis: KpiSummary;
  // Dynamic order assignment and unscheduling
  scheduleOrder: (orderId: string, routeId: string, insertIndex?: number) => void;
  unscheduleOrder: (orderId: string) => void;
  addOrder: (newOrder: Order) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  hasUnsavedChanges: boolean;
  applyChanges: () => void;
  discardChanges: () => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<DatasetMode>(() => {
    return (localStorage.getItem('waypoint-dataset-mode') as DatasetMode) || 'boston';
  });

  useEffect(() => {
    localStorage.setItem('waypoint-dataset-mode', mode);
  }, [mode]);

  const baseDepots = mode === 'peliyagoda' ? peliyagodaDepots : bostonDepots;
  const baseOutlets = mode === 'peliyagoda' ? peliyagodaOutlets : bostonOutlets;
  const baseAllOutlets = mode === 'peliyagoda' ? all120PeliyagodaOutlets : bostonOutlets;
  const baseDrivers = mode === 'peliyagoda' ? peliyagodaDrivers : bostonDrivers;
  const baseVehicles = mode === 'peliyagoda' ? peliyagodaVehicles : bostonVehicles;
  const baseAllVehicles = mode === 'peliyagoda' ? all60PeliyagodaVehicles : bostonVehicles;
  const baseInitialOrders = mode === 'peliyagoda' ? peliyagodaOrders : bostonOrders;
  const baseInitialRoutes = mode === 'peliyagoda' ? peliyagodaRoutes : bostonRoutes;

  // Active state for orders and routes
  const [orders, setOrders] = useState<Order[]>(baseInitialOrders);
  const [routes, setRoutes] = useState<Route[]>(baseInitialRoutes);
  const [activeDepot, setActiveDepot] = useState<Depot>(baseDepots[0]);

  // Undo / Redo history
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync state when mode changes
  useEffect(() => {
    const newOrders = mode === 'peliyagoda' ? peliyagodaOrders : bostonOrders;
    const newRoutes = mode === 'peliyagoda' ? peliyagodaRoutes : bostonRoutes;
    setOrders(newOrders);
    setRoutes(newRoutes);
    setActiveDepot(mode === 'peliyagoda' ? peliyagodaDepots[0] : bostonDepots[0]);
    setHistory([]);
    setFuture([]);
    setHasUnsavedChanges(false);
  }, [mode]);

  // Push current state to undo history before making mutations
  const pushHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(-20), { orders, routes }]);
    setFuture([]);
    setHasUnsavedChanges(true);
  }, [orders, routes]);

  // Schedule an unscheduled order onto a route
  const scheduleOrder = useCallback((orderId: string, routeId: string, insertIndex?: number) => {
    pushHistory();

    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const updatedOrder: Order = {
      ...targetOrder,
      routeId,
      status: 'Planned',
      scheduledAt: targetOrder.scheduledAt || targetOrder.window.start || '09:00 AM',
    };

    setOrders(prevOrders =>
      prevOrders.map(o => (o.id === orderId ? updatedOrder : o))
    );

    setRoutes(prevRoutes =>
      prevRoutes.map(r => {
        if (r.id !== routeId) {
          // If the order was previously on another route, remove it from that route
          return {
            ...r,
            stops: r.stops.filter(s => s.order.id !== orderId),
          };
        }

        const newStop: RouteStop = {
          order: updatedOrder,
          sequence: (insertIndex !== undefined && insertIndex >= 0) ? insertIndex + 1 : r.stops.length + 1,
          eta: updatedOrder.scheduledAt || '09:15 AM',
          status: 'Planned',
        };

        const existingStops = r.stops.filter(s => s.order.id !== orderId);
        const newStops = [...existingStops];
        if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= newStops.length) {
          newStops.splice(insertIndex, 0, newStop);
        } else {
          newStops.push(newStop);
        }

        // Re-index sequences
        const reindexedStops = newStops.map((s, idx) => ({ ...s, sequence: idx + 1 }));

        return {
          ...r,
          stops: reindexedStops,
          usedVolume: Math.round((r.usedVolume + (updatedOrder.volume || 1.5)) * 10) / 10,
          usedWeight: Math.round(r.usedWeight + (updatedOrder.weight || 250)),
        };
      })
    );
  }, [orders, pushHistory]);

  // Unschedule an order back to the unscheduled pool
  const unscheduleOrder = useCallback((orderId: string) => {
    pushHistory();

    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const updatedOrder: Order = {
      ...targetOrder,
      routeId: undefined,
      stopSequence: undefined,
      status: 'Unassigned',
    };

    setOrders(prevOrders =>
      prevOrders.map(o => (o.id === orderId ? updatedOrder : o))
    );

    setRoutes(prevRoutes =>
      prevRoutes.map(r => {
        const hasStop = r.stops.some(s => s.order.id === orderId);
        if (!hasStop) return r;

        const newStops = r.stops
          .filter(s => s.order.id !== orderId)
          .map((s, idx) => ({ ...s, sequence: idx + 1 }));

        return {
          ...r,
          stops: newStops,
          usedVolume: Math.max(0, Math.round((r.usedVolume - (targetOrder.volume || 1.5)) * 10) / 10),
          usedWeight: Math.max(0, Math.round(r.usedWeight - (targetOrder.weight || 250))),
        };
      })
    );
  }, [orders, pushHistory]);

  // Add a newly created order directly into the dataset (unscheduled)
  const addOrder = useCallback((newOrder: Order) => {
    pushHistory();
    setOrders(prev => [newOrder, ...prev]);
  }, [pushHistory]);

  // Undo
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture(prev => [{ orders, routes }, ...prev]);
    setOrders(previous.orders);
    setRoutes(previous.routes);
    setHistory(prev => prev.slice(0, -1));
  }, [history, orders, routes]);

  // Redo
  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(prev => [...prev, { orders, routes }]);
    setOrders(next.orders);
    setRoutes(next.routes);
    setFuture(prev => prev.slice(1));
  }, [future, orders, routes]);

  // Apply Changes
  const applyChanges = useCallback(() => {
    setHasUnsavedChanges(false);
    setHistory([]);
    setFuture([]);
  }, []);

  // Discard Changes
  const discardChanges = useCallback(() => {
    const origOrders = mode === 'peliyagoda' ? peliyagodaOrders : bostonOrders;
    const origRoutes = mode === 'peliyagoda' ? peliyagodaRoutes : bostonRoutes;
    setOrders(origOrders);
    setRoutes(origRoutes);
    setHistory([]);
    setFuture([]);
    setHasUnsavedChanges(false);
  }, [mode]);

  const kpis = useMemo(() => {
    return calculateDatasetEconomics(orders, baseVehicles);
  }, [orders, baseVehicles]);

  return (
    <DatasetContext.Provider
      value={{
        mode,
        setMode,
        depots: baseDepots,
        outlets: baseOutlets,
        allOutlets: baseAllOutlets,
        drivers: baseDrivers,
        vehicles: baseVehicles,
        allVehicles: baseAllVehicles,
        orders,
        routes,
        activeDepot,
        setActiveDepot,
        districtTravelMatrix,
        task2aForecastCases,
        task2bPeakFleet,
        task2bPeakScenarios,
        calendarEvents,
        trafficSpeedProfiles,
        kpis,
        scheduleOrder,
        unscheduleOrder,
        addOrder,
        canUndo: history.length > 0,
        canRedo: future.length > 0,
        undo,
        redo,
        hasUnsavedChanges,
        applyChanges,
        discardChanges,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error('useDataset must be used within DatasetProvider');
  return ctx;
};
