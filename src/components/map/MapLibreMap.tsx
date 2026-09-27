import React, { useEffect, useRef } from 'react';
import * as maplibreglModule from 'maplibre-gl';
import type { Route, Depot, Coordinates } from '../../types';

const maplibregl: any = (typeof window !== 'undefined' && (window as any).maplibregl)
  ? (window as any).maplibregl
  : maplibreglModule;

interface MapLibreMapProps {
  routes?: Route[];
  depots?: Depot[];
  selectedRouteId?: string;
  onRouteClick?: (routeId: string) => void;
  onStopClick?: (stopSequence: string, orderId: string) => void;
  center?: Coordinates;
  zoom?: number;
  showVehicles?: boolean;
  filterRoutes?: string[]; // Route IDs to display (for multi-selection checkboxes)
  routeViewMode?: 'Planned' | 'Actual' | 'Both';
}

// Generate teardrop pin SVG HTML matching OptimoRoute screenshot style
const createTeardropPinHtml = (number: number, color: string = '#E11D48', isDelayed: boolean = false) => {
  const pinColor = isDelayed ? '#EA580C' : color;
  return `
    <div class="waypoint-map-pin" style="
      position: relative;
      width: 28px;
      height: 38px;
      cursor: pointer;
      filter: drop-shadow(0 2px 5px rgba(0,0,0,0.35));
      transition: transform 0.15s ease;
    ">
      <svg viewBox="0 0 28 38" width="28" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24c0-7.732-6.268-14-14-14z" fill="${pinColor}"/>
        <circle cx="14" cy="14" r="8" fill="#FFFFFF"/>
        <text x="14" y="17.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="700" fill="#1E293B" text-anchor="middle">${number}</text>
      </svg>
    </div>
  `;
};

// Depot Hub Icon HTML
const createDepotHtml = (name: string) => `
  <div style="
    background: #0F172A;
    border: 2px solid #FFFFFF;
    border-radius: 6px;
    padding: 3px 7px;
    display: flex;
    align-items: center;
    gap: 5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    font-weight: 700;
    color: #FFFFFF;
    cursor: default;
    white-space: nowrap;
  ">
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="5" width="14" height="10" rx="1" stroke="white" stroke-width="1.5"/>
      <path d="M1 8l7-6 7 6" stroke="white" stroke-width="1.5"/>
    </svg>
    <span>${name}</span>
  </div>
`;

// Vehicle Icon HTML
const createVehicleHtml = (color: string, label: string) => `
  <div style="
    width: 26px;
    height: 26px;
    background: ${color};
    border: 2.5px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    cursor: pointer;
    transition: transform 0.15s ease;
  " title="${label}">
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M7 1l4 11-4-3-4 3 4-11z" fill="white"/>
    </svg>
  </div>
`;

const MapLibreMap: React.FC<MapLibreMapProps> = ({
  routes = [],
  depots = [],
  selectedRouteId,
  onRouteClick,
  onStopClick,
  center,
  zoom = 12.5,
  showVehicles = true,
  filterRoutes,
  routeViewMode = 'Both',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const depotMarkersRef = useRef<any[]>([]);

  // Compute initial center if not provided
  const initialCenter = center || (
    routes[0]?.stops[0]?.order?.outlet?.location
      ? { lat: routes[0].stops[0].order.outlet.location.lat, lng: routes[0].stops[0].order.outlet.location.lng }
      : { lat: 42.3736, lng: -71.1000 }
  );

  // Initialize MapLibre GL Map with OpenFreeMap Liberty style
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [initialCenter.lng, initialCenter.lat],
      zoom: zoom,
      attributionControl: false,
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      depotMarkersRef.current.forEach(m => m.remove());
      depotMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Depots when depots prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateDepots = () => {
      depotMarkersRef.current.forEach(m => m.remove());
      depotMarkersRef.current = [];

      depots.forEach(depot => {
        const el = document.createElement('div');
        el.innerHTML = createDepotHtml(depot.name);
        const m = new maplibregl.Marker({ element: el })
          .setLngLat([depot.location.lng, depot.location.lat])
          .addTo(map);
        depotMarkersRef.current.push(m);
      });
    };

    if (map.isStyleLoaded()) {
      updateDepots();
    } else {
      map.once('load', updateDepots);
    }
  }, [depots]);

  // Update routes, polylines, and numbered teardrop markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const renderLayers = () => {
      // Clear old stop markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Determine active routes
      const visibleRoutes = routes.filter(r => {
        if (filterRoutes && filterRoutes.length > 0) {
          return filterRoutes.includes(r.id);
        }
        if (selectedRouteId) {
          return r.id === selectedRouteId;
        }
        return true;
      });

      // Fit map bounds to visible routes
      const bounds = new maplibregl.LngLatBounds();
      let hasCoordinates = false;

      visibleRoutes.forEach((route) => {
        const sourceId = `source-${route.id}`;
        const layerId = `layer-${route.id}`;
        const isSelected = selectedRouteId === route.id;

        const depotLoc = depots[0]?.location || { lat: 42.3785, lng: -71.0720 };
        const coords: [number, number][] = [
          [depotLoc.lng, depotLoc.lat],
          ...route.stops.map(s => [s.order.outlet.location.lng, s.order.outlet.location.lat] as [number, number]),
        ];

        coords.forEach(([lng, lat]) => {
          bounds.extend([lng, lat]);
          hasCoordinates = true;
        });

        const geojsonData: any = {
          type: 'Feature',
          properties: {
            id: route.id,
            color: route.color,
          },
          geometry: {
            type: 'LineString',
            coordinates: coords,
          },
        };

        if (map.getSource(sourceId)) {
          (map.getSource(sourceId) as any).setData(geojsonData);
        } else {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geojsonData,
          });

          map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': route.color,
              'line-width': isSelected ? 4.5 : 3,
              'line-opacity': isSelected ? 0.95 : 0.75,
              'line-dasharray': routeViewMode === 'Actual' ? [2, 2] : [1],
            },
          });

          map.on('click', layerId, () => {
            onRouteClick?.(route.id);
          });
        }

        // Add Numbered Teardrop Pin Markers for each stop
        route.stops.forEach((stop) => {
          const el = document.createElement('div');
          const isDelayed = stop.status === 'At Risk' || (stop.order.delayMinutes && stop.order.delayMinutes > 0);
          el.innerHTML = createTeardropPinHtml(stop.sequence, route.color, !!isDelayed);

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            onRouteClick?.(route.id);
            onStopClick?.(String(stop.sequence), stop.order.id);
          });

          const popup = new maplibregl.Popup({ offset: [0, -32], closeButton: false })
            .setHTML(`
              <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; padding: 4px;">
                <div style="font-weight: 700; color: #0F172A; margin-bottom: 2px;">Stop #${stop.sequence} · ${stop.order.outlet.name}</div>
                <div style="color: #64748B;">Order: ${stop.order.id} · Scheduled: ${stop.order.scheduledAt ?? stop.eta}</div>
                <div style="margin-top: 3px; font-weight: 600; color: ${isDelayed ? '#EA580C' : '#16A34A'};">
                  ${stop.status}${stop.order.delayMinutes ? ` (${stop.order.delayMinutes}m delay)` : ''}
                </div>
              </div>
            `);

          const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([stop.order.outlet.location.lng, stop.order.outlet.location.lat])
            .setPopup(popup)
            .addTo(map);

          markersRef.current.push(marker);
        });

        // Add vehicle marker
        if (showVehicles && route.vehicle) {
          const firstStop = route.stops[0];
          if (firstStop) {
            const vEl = document.createElement('div');
            vEl.innerHTML = createVehicleHtml(route.color, `${route.driver?.name ?? 'Driver'} · ${route.vehicle.plate}`);
            const vMarker = new maplibregl.Marker({ element: vEl })
              .setLngLat([firstStop.order.outlet.location.lng - 0.004, firstStop.order.outlet.location.lat - 0.002])
              .addTo(map);
            markersRef.current.push(vMarker);
          }
        }
      });

      // Smoothly fit bounds
      if (hasCoordinates && !bounds.isEmpty()) {
        try {
          map.fitBounds(bounds, { padding: 50, maxZoom: 14.5, duration: 800 });
        } catch (_) {
          // ignore transient bounds calculation edge case
        }
      }
    };

    if (map.isStyleLoaded()) {
      renderLayers();
    } else {
      map.once('load', renderLayers);
    }
  }, [routes, depots, selectedRouteId, filterRoutes, routeViewMode]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Map Zoom Controls (OptimoRoute style on top-left) */}
      <div className="waypoint-map-zoom">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          title="Zoom Out"
        >
          −
        </button>
      </div>

      {/* Map layer switcher icon on top-right */}
      <div className="waypoint-map-layers-btn" title="Map Layers">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>
    </div>
  );
};

export default MapLibreMap;
