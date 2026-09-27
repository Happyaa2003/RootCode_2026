import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  peliyagodaDepots, bostonDepots,
  peliyagodaOutlets, bostonOutlets,
  peliyagodaDrivers, bostonDrivers,
  peliyagodaVehicles, bostonVehicles,
  peliyagodaOrders, bostonOrders,
  peliyagodaRoutes, bostonRoutes,
} from '../data/tempDataService';
import type { Order, Route, Vehicle, Driver, Depot, Outlet } from '../types';

export type DatasetMode = 'peliyagoda' | 'boston';

interface DatasetContextType {
  mode: DatasetMode;
  setMode: (mode: DatasetMode) => void;
  depots: Depot[];
  outlets: Outlet[];
  drivers: Driver[];
  vehicles: Vehicle[];
  orders: Order[];
  routes: Route[];
  activeDepot: Depot;
  setActiveDepot: (depot: Depot) => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to 'boston' so the UI immediately matches Screenshot 1, but with instant 1-click toggle to 'peliyagoda' competition data!
  const [mode, setMode] = useState<DatasetMode>(() => {
    return (localStorage.getItem('waypoint-dataset-mode') as DatasetMode) || 'boston';
  });

  useEffect(() => {
    localStorage.setItem('waypoint-dataset-mode', mode);
  }, [mode]);

  const depots = mode === 'peliyagoda' ? peliyagodaDepots : bostonDepots;
  const outlets = mode === 'peliyagoda' ? peliyagodaOutlets : bostonOutlets;
  const drivers = mode === 'peliyagoda' ? peliyagodaDrivers : bostonDrivers;
  const vehicles = mode === 'peliyagoda' ? peliyagodaVehicles : bostonVehicles;
  const orders = mode === 'peliyagoda' ? peliyagodaOrders : bostonOrders;
  const routes = mode === 'peliyagoda' ? peliyagodaRoutes : bostonRoutes;

  const [activeDepot, setActiveDepot] = useState<Depot>(depots[0]);

  useEffect(() => {
    setActiveDepot(depots[0]);
  }, [mode]);

  return (
    <DatasetContext.Provider
      value={{
        mode,
        setMode,
        depots,
        outlets,
        drivers,
        vehicles,
        orders,
        routes,
        activeDepot,
        setActiveDepot,
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
