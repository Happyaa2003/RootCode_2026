import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  peliyagodaDepots,
  peliyagodaOutlets,
  all120PeliyagodaOutlets,
  peliyagodaDrivers,
  peliyagodaVehicles,
  all60PeliyagodaVehicles,
  peliyagodaOrders,
  peliyagodaRoutes,
  districtTravelMatrix,
  task2aForecastCases,
  task2bPeakFleet,
  task2bPeakScenarios,
  calendarEvents,
  trafficSpeedProfiles,
  calculateDatasetEconomics,
} from '../data/tempDataService';
import { api } from '../services/api';
import type {
  Order, Route, Vehicle, Driver, Depot, Outlet,
  DistrictTravelInfo, Task2aForecastItem, PeakFleetStatus, PeakDayScenario, KpiSummary,
  RouteStop
} from '../types';

export type DatasetMode = 'peliyagoda';

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
  backendConnected: boolean;
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
  refreshFromBackend: () => Promise<void>;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<DatasetMode>('peliyagoda');
  const [backendConnected, setBackendConnected] = useState(false);

  // Entities state
  const [depots, setDepots] = useState<Depot[]>(peliyagodaDepots);
  const [outlets, setOutlets] = useState<Outlet[]>(peliyagodaOutlets);
  const [allOutlets, setAllOutlets] = useState<Outlet[]>(all120PeliyagodaOutlets);
  const [drivers, setDrivers] = useState<Driver[]>(peliyagodaDrivers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(peliyagodaVehicles);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(all60PeliyagodaVehicles);
  const [orders, setOrders] = useState<Order[]>(peliyagodaOrders);
  const [routes, setRoutes] = useState<Route[]>(peliyagodaRoutes);
  const [activeDepot, setActiveDepot] = useState<Depot>(peliyagodaDepots[0]);

  // Undo / Redo history
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch initial live state from Backend API
  const refreshFromBackend = useCallback(async () => {
    try {
      const [fetchedOrders, fetchedRoutes, fetchedVehicles, fetchedDepots, fetchedDrivers, fetchedOutlets] = await Promise.all([
        api.getOrders({ limit: 100 }),
        api.getRoutes(),
        api.getVehicles(),
        api.getDepots(),
        api.getDrivers(),
        api.getOutlets({ limit: 120 }),
      ]);

      if (fetchedOrders?.length) setOrders(fetchedOrders);
      if (fetchedRoutes?.length) setRoutes(fetchedRoutes);
      if (fetchedVehicles?.length) {
        setVehicles(fetchedVehicles.slice(0, 8));
        setAllVehicles(fetchedVehicles);
      }
      if (fetchedDepots?.length) {
        setDepots(fetchedDepots);
        setActiveDepot(fetchedDepots[0]);
      }
      if (fetchedDrivers?.length) setDrivers(fetchedDrivers);
      if (fetchedOutlets?.length) {
        setOutlets(fetchedOutlets.slice(0, 24));
        setAllOutlets(fetchedOutlets);
      }
      setBackendConnected(true);
    } catch (err) {
      console.warn('Backend API currently unreachable, using initialized dataset:', err);
    }
  }, []);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  // Real-time WebSocket telematics subscriber
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWS = () => {
      try {
        ws = new WebSocket('ws://127.0.0.1:8000/api/v1/ws/telemetry');
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'FLEET_TELEMETRY_UPDATE' && Array.isArray(data.vehicles)) {
              setVehicles(prev =>
                prev.map(v => {
                  const match = data.vehicles.find((tv: any) => tv.id === v.id);
                  if (match) {
                    return {
                      ...v,
                      location: { lat: match.lat, lng: match.lng },
                      heading: match.heading ?? v.heading,
                      lastSeen: 'Just now',
                    };
                  }
                  return v;
                })
              );
            }
          } catch {
            // ignore non-json
          }
        };
        ws.onerror = () => {
          // auto reconnect after delay
          reconnectTimeout = setTimeout(connectWS, 10000);
        };
      } catch {
        // ws not available
      }
    };

    connectWS();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

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

        const reindexedStops = newStops.map((s, idx) => ({ ...s, sequence: idx + 1 }));

        return {
          ...r,
          stops: reindexedStops,
          usedVolume: Math.round((r.usedVolume + (updatedOrder.volume || 1.5)) * 10) / 10,
          usedWeight: Math.round(r.usedWeight + (updatedOrder.weight || 250)),
        };
      })
    );

    // Call backend API asynchronously
    api.scheduleOrder(orderId, routeId, insertIndex).catch(err => {
      console.warn('Backend scheduleOrder error:', err);
    });
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

    // Call backend API asynchronously
    api.unscheduleOrder(orderId).catch(err => {
      console.warn('Backend unscheduleOrder error:', err);
    });
  }, [orders, pushHistory]);

  // Add a newly created order directly into the dataset (unscheduled)
  const addOrder = useCallback((newOrder: Order) => {
    pushHistory();
    setOrders(prev => [newOrder, ...prev]);

    // Call backend API asynchronously
    api.createOrder(newOrder).catch(err => {
      console.warn('Backend createOrder error:', err);
    });
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
    refreshFromBackend();
    setHistory([]);
    setFuture([]);
    setHasUnsavedChanges(false);
  }, [refreshFromBackend]);

  const kpis = useMemo(() => {
    return calculateDatasetEconomics(orders, vehicles);
  }, [orders, vehicles]);

  return (
    <DatasetContext.Provider
      value={{
        mode,
        setMode,
        depots,
        outlets,
        allOutlets,
        drivers,
        vehicles,
        allVehicles,
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
        backendConnected,
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
        refreshFromBackend,
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
