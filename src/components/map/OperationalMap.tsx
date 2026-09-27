import React from 'react';
import MapLibreMap from './MapLibreMap';
import type { Coordinates } from '../../types';

interface OperationalMapProps {
  selectedRouteId?: string;
  onRouteClick?: (routeId: string) => void;
  onStopClick?: (stopId: string, orderId: string) => void;
  center?: Coordinates;
  zoom?: number;
  showVehicles?: boolean;
  filterRoutes?: string[];
  routeViewMode?: 'Planned' | 'Actual' | 'Both';
}

const OperationalMap: React.FC<OperationalMapProps> = (props) => {
  return <MapLibreMap {...props} />;
};

export default OperationalMap;
