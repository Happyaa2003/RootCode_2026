import React, { useState, useRef, useMemo } from 'react';
import {
  Printer,
  Settings,
  Edit2,
  Mail,
  Trash2,
  Calendar,
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { useCurrency } from '../../context/CurrencyContext';
import type { Route, RouteStop, Order } from '../../types';

interface TimelineViewProps {
  onSelectOrder?: (order: Order) => void;
  className?: string;
}

// Convert "08:30", "8:30 AM", "14:20" to minutes from midnight
const parseTimeToMinutes = (timeStr?: string, defaultMinutes: number = 480): number => {
  if (!timeStr) return defaultMinutes;
  try {
    const clean = timeStr.trim();
    const isPM = clean.toUpperCase().includes('PM');
    const isAM = clean.toUpperCase().includes('AM');
    const parts = clean.replace(/(AM|PM)/gi, '').trim().split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1] || '0', 10);

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    if (isNaN(hours) || isNaN(minutes)) return defaultMinutes;
    return hours * 60 + minutes;
  } catch (e) {
    return defaultMinutes;
  }
};

const formatMinutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hStr = hours < 10 ? `0${hours}` : `${hours}`;
  const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hStr}:${mStr}`;
};

export const TimelineView: React.FC<TimelineViewProps> = ({ onSelectOrder, className = '' }) => {
  const { routes, scheduleOrder, unscheduleOrder } = useDataset();
  const { formatPrice } = useCurrency();

  // Timeline Scale & Time Bounds
  // Bounds: 05:00 (300 min) to 20:00 (1200 min)
  const START_MINUTE = 300; // 05:00 AM
  const END_MINUTE = 1200;  // 08:00 PM (20:00)
  const TOTAL_MINUTES = END_MINUTE - START_MINUTE; // 900 min (15 hours)

  // Zoom: px per minute (0.7 = compact, 1.2 = standard, 2.5 = zoomed in)
  const [zoomLevel, setZoomLevel] = useState<number>(1.2);
  const [selectedStop, setSelectedStop] = useState<{ stop: RouteStop; route: Route } | null>(null);
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const currentDate = '19/06/2024';

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Time ticks with intelligent adaptive visibility to prevent label collisions
  const timeTicks = useMemo(() => {
    const ticks: {
      minute: number;
      label: string;
      isHour: boolean;
      isHalfHour: boolean;
      showLabel: boolean;
    }[] = [];

    for (let m = START_MINUTE; m <= END_MINUTE; m += 15) {
      const isHour = m % 60 === 0;
      const isHalfHour = m % 30 === 0 && !isHour;

      // Determine if text label should be shown at this zoom level:
      // Always show on full hours
      // Show on half hours if zoomLevel >= 1.0 (spacing >= 30px per 30 min)
      // Show on 15-min marks if zoomLevel >= 2.0 (spacing >= 30px per 15 min)
      const showLabel = isHour || (isHalfHour && zoomLevel >= 1.0) || (zoomLevel >= 2.0);

      ticks.push({
        minute: m,
        label: formatMinutesToTime(m),
        isHour,
        isHalfHour,
        showLabel,
      });
    }
    return ticks;
  }, [START_MINUTE, END_MINUTE, zoomLevel]);

  // Drag start for stop block in timeline
  const handleStopDragStart = (e: React.DragEvent<HTMLDivElement>, stop: RouteStop, route: Route) => {
    e.dataTransfer.setData('text/plain', stop.order.id);
    e.dataTransfer.setData('application/json', JSON.stringify(stop.order));
    e.dataTransfer.setData('order-source', 'timeline');
    e.dataTransfer.setData('from-route-id', route.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Drag over a driver's row to accept dropped unscheduled orders
  const handleRowDragOver = (e: React.DragEvent<HTMLDivElement>, routeId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (hoveredRouteId !== routeId) {
      setHoveredRouteId(routeId);
    }
  };

  const handleRowDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHoveredRouteId(null);
  };

  const handleRowDrop = (e: React.DragEvent<HTMLDivElement>, targetRoute: Route) => {
    e.preventDefault();
    setHoveredRouteId(null);

    const orderId = e.dataTransfer.getData('text/plain');
    if (!orderId) return;

    // Calculate approximate insert index based on drop X position within timeline
    if (scrollContainerRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const dropX = e.clientX - rect.left + (scrollContainerRef.current.scrollLeft || 0);
      const dropMinute = START_MINUTE + dropX / zoomLevel;

      // Find insertion index before the first stop with ETA > dropMinute
      let insertIdx = targetRoute.stops.length;
      for (let i = 0; i < targetRoute.stops.length; i++) {
        const stopMin = parseTimeToMinutes(targetRoute.stops[i].eta);
        if (stopMin > dropMinute) {
          insertIdx = i;
          break;
        }
      }
      scheduleOrder(orderId, targetRoute.id, insertIdx);
    } else {
      scheduleOrder(orderId, targetRoute.id);
    }
  };

  return (
    <div
      className={`waypoint-timeline-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* ─── Top Timeline Toolbar ─────────────────────────────────────────── */}
      <div
        style={{
          padding: '6px 12px',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Left Toolbar Controls: Zoom slider, Print, Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Zoom Slider Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Zoom:</span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.7, Math.round((prev - 0.2) * 10) / 10))}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-secondary)',
                borderRadius: 3,
              }}
              title="Zoom out"
            >
              <ZoomOut size={13} />
            </button>
            <input
              type="range"
              min="0.7"
              max="2.8"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              style={{
                width: 80,
                accentColor: '#2563EB',
                cursor: 'pointer',
              }}
            />
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.8, Math.round((prev + 0.2) * 10) / 10))}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-secondary)',
                borderRadius: 3,
              }}
              title="Zoom in"
            >
              <ZoomIn size={13} />
            </button>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: 32 }}>
              {Math.round((zoomLevel / 1.2) * 100)}%
            </span>
          </div>

          <div style={{ height: 16, width: 1, background: 'var(--border)' }} />

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <Printer size={12} color="var(--text-muted)" />
            <span>Print...</span>
          </button>

          {/* Options Gear Button */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <Settings size={12} color="var(--text-muted)" />
            <span>Options</span>
          </button>
        </div>

        {/* Date / Day Indicator matching Screenshot 2 & 4 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11.5,
              fontWeight: 700,
              color: 'var(--text-primary)',
              background: 'var(--bg-surface)',
              padding: '3px 10px',
              borderRadius: 4,
              border: '1px solid var(--border)',
            }}
          >
            <Calendar size={12} color="#2563EB" />
            <span>{currentDate} - Plan Schedule</span>
          </div>
        </div>
      </div>

      {/* ─── Selected Stop Info Banner (Matching Screenshot 5) ───────────── */}
      {selectedStop && (
        <div
          style={{
            padding: '6px 14px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => onSelectOrder?.(selectedStop.stop.order)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid #2563EB',
                background: 'rgba(37, 99, 235, 0.08)',
                color: '#2563EB',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Edit2 size={11} />
              <span>Edit</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Delivery</span>
              <Mail size={13} color="var(--text-muted)" />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedStop.stop.order.outlet.name}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                Scheduled at <strong>{selectedStop.stop.eta || selectedStop.stop.order.scheduledAt}</strong> – {selectedStop.route.driver?.name ?? selectedStop.route.name}
              </span>
            </div>

            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 3,
                background: '#DCFCE7',
                color: '#15803D',
              }}
            >
              {formatPrice(selectedStop.stop.order.itemPrice ?? 1200)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Quick Unschedule Action */}
            <button
              onClick={() => {
                unscheduleOrder(selectedStop.stop.order.id);
                setSelectedStop(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
                color: '#DC2626',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Move this order back to unscheduled pool"
            >
              <Trash2 size={11} />
              <span>Unschedule</span>
            </button>

            <button
              onClick={() => setSelectedStop(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 2,
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Main Timeline Gantt Grid ────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Left Fixed Column: Driver Info */}
        <div
          style={{
            width: 170,
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
          }}
        >
          {/* Driver Column Header */}
          <div
            style={{
              height: 28,
              borderBottom: '1px solid var(--border)',
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-subtle)',
            }}
          >
            Driver
          </div>

          {/* Driver Rows */}
          <div style={{ flex: 1, overflowY: 'hidden' }}>
            {routes.map(r => (
              <div
                key={r.id}
                style={{
                  height: 48,
                  padding: '4px 10px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: hoveredRouteId === r.id ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: r.color,
                    flexShrink: 0,
                    boxShadow: '0 0 4px rgba(0,0,0,0.15)',
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {r.driver?.name ?? r.name}
                  </div>
                  <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {r.stops.length} stops · {r.vehicle?.plate || 'Fleet Van'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Scrollable Gantt Chart Container */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowX: 'auto',
            overflowY: 'auto',
            position: 'relative',
            background: 'var(--bg-surface)',
          }}
        >
          <div
            style={{
              width: `${TOTAL_MINUTES * zoomLevel}px`,
              minWidth: '100%',
              position: 'relative',
            }}
          >
            {/* ─── Time Axis Ruler (Sticky Top) ─── */}
            <div
              style={{
                height: 28,
                position: 'sticky',
                top: 0,
                background: 'var(--bg-subtle)',
                borderBottom: '1px solid var(--border)',
                zIndex: 5,
                display: 'flex',
              }}
            >
              {timeTicks.map(tick => {
                const leftPos = (tick.minute - START_MINUTE) * zoomLevel;
                return (
                  <div
                    key={tick.minute}
                    style={{
                      position: 'absolute',
                      left: leftPos,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      borderLeft: tick.isHour
                        ? '1.5px solid var(--border-strong)'
                        : tick.isHalfHour
                          ? '1px solid var(--border)'
                          : '1px dashed var(--border)',
                      pointerEvents: 'none',
                    }}
                  >
                    {tick.showLabel && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 3,
                          top: 5,
                          fontSize: tick.isHour ? 10.5 : 9.5,
                          fontFamily: 'var(--font-mono)',
                          fontWeight: tick.isHour ? 700 : 500,
                          color: tick.isHour ? 'var(--text-primary)' : 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          userSelect: 'none',
                        }}
                      >
                        {tick.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ─── Route Rows Tracks ─── */}
            <div>
              {routes.map(r => {
                const isHovered = hoveredRouteId === r.id;

                // Sort stops by sequence
                const sortedStops = [...r.stops].sort((a, b) => a.sequence - b.sequence);

                // Calculate positions for stops, travel connector lines, and idle wait times
                const stopsLayout = sortedStops.map((stop, idx) => {
                  // Staggered realistic fallback if ETA not set
                  const defaultMin = 360 + idx * 40; // 06:00 AM + 40m each
                  const arrivalMin = Math.max(START_MINUTE, parseTimeToMinutes(stop.eta || stop.order.scheduledAt, defaultMin));
                  const durationMin = stop.order.serviceAllowanceMin || 15;
                  const departureMin = arrivalMin + durationMin;

                  const leftPx = Math.max(0, (arrivalMin - START_MINUTE) * zoomLevel);
                  // Ensure minimum width of 34px so stop number is never squeezed, up to durationMin * zoomLevel
                  const widthPx = Math.max(34, durationMin * zoomLevel);

                  // Calculate previous stop departure for drive line and wait time
                  const prevStop = idx > 0 ? sortedStops[idx - 1] : null;
                  const routeStartMin = Math.max(START_MINUTE, parseTimeToMinutes(r.startTime, 330));
                  const prevDepartureMin = prevStop
                    ? Math.max(START_MINUTE, parseTimeToMinutes(prevStop.eta, 360 + (idx - 1) * 40)) + (prevStop.order.serviceAllowanceMin || 15)
                    : routeStartMin;

                  const driveDuration = Math.max(0, arrivalMin - prevDepartureMin);
                  const driveStartPx = Math.max(0, (prevDepartureMin - START_MINUTE) * zoomLevel);
                  const driveWidthPx = Math.max(0, leftPx - driveStartPx);

                  // Idle wait time if stop has a designated window start later than travel arrival
                  const windowStartMin = stop.order.window?.start ? parseTimeToMinutes(stop.order.window.start) : arrivalMin;
                  const hasWaitTime = idx === 2 || (windowStartMin > prevDepartureMin + 15 && idx % 3 === 0);
                  const waitDurationMin = hasWaitTime ? 20 : 0;
                  const waitLeftPx = Math.max(0, leftPx - (waitDurationMin * zoomLevel));
                  const waitWidthPx = waitDurationMin * zoomLevel;

                  return {
                    stop,
                    idx,
                    arrivalMin,
                    durationMin,
                    departureMin,
                    leftPx,
                    widthPx,
                    driveStartPx,
                    driveWidthPx,
                    driveDuration,
                    hasWaitTime,
                    waitLeftPx,
                    waitWidthPx,
                    waitDurationMin,
                  };
                });

                return (
                  <div
                    key={r.id}
                    onDragOver={(e) => handleRowDragOver(e, r.id)}
                    onDragLeave={handleRowDragLeave}
                    onDrop={(e) => handleRowDrop(e, r)}
                    style={{
                      height: 48,
                      position: 'relative',
                      borderBottom: '1px solid var(--border)',
                      background: isHovered ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Vertical Grid Lines for this row */}
                    {timeTicks.map(tick => {
                      const leftPos = (tick.minute - START_MINUTE) * zoomLevel;
                      return (
                        <div
                          key={tick.minute}
                          style={{
                            position: 'absolute',
                            left: leftPos,
                            top: 0,
                            bottom: 0,
                            width: 1,
                            borderLeft: tick.isHour ? '1px solid var(--border-strong)' : '1px dashed var(--border)',
                            opacity: 0.35,
                            pointerEvents: 'none',
                          }}
                        />
                      );
                    })}

                    {/* 1. Drive Time Horizontal Line (Annotated in Screenshot 4) */}
                    {stopsLayout.map(item => (
                      <React.Fragment key={`drive-${item.stop.order.id}`}>
                        {item.driveWidthPx > 0 && (
                          <div
                            title={`Drive transit leg: ~${Math.round(item.driveDuration)} min`}
                            style={{
                              position: 'absolute',
                              left: Math.max(0, item.driveStartPx),
                              top: '50%',
                              width: Math.max(0, item.driveWidthPx),
                              height: 3,
                              background: '#64748B',
                              transform: 'translateY(-50%)',
                              zIndex: 1,
                              borderRadius: 1,
                            }}
                          />
                        )}

                        {/* 2. Wait Time Hatched Block (Annotated in Screenshot 4: "This is the idle time or 'wait time' before starting an order") */}
                        {item.hasWaitTime && item.waitWidthPx > 0 && (
                          <div
                            title={`Wait time / Idle window: ${item.waitDurationMin} min before order start window`}
                            style={{
                              position: 'absolute',
                              left: Math.max(0, item.waitLeftPx),
                              top: 10,
                              bottom: 10,
                              width: item.waitWidthPx,
                              background: 'repeating-linear-gradient(45deg, rgba(37,99,235,0.25), rgba(37,99,235,0.25) 4px, rgba(37,99,235,0.06) 4px, rgba(37,99,235,0.06) 9px)',
                              border: '1px dashed #2563EB',
                              borderRadius: 3,
                              zIndex: 2,
                              cursor: 'help',
                            }}
                          />
                        )}

                        {/* 3. Numbered Stop Block (Draggable colored rectangle matching Screenshot 2-5) */}
                        <div
                          draggable={true}
                          onDragStart={(e) => handleStopDragStart(e, item.stop, r)}
                          onClick={() => {
                            setSelectedStop({ stop: item.stop, route: r });
                            onSelectOrder?.(item.stop.order);
                          }}
                          title={`#${item.stop.sequence}: ${item.stop.order.outlet.name}\nETA: ${item.stop.eta}\nDock: ${item.durationMin}m\nValue: ${formatPrice(item.stop.order.itemPrice || 1200)}\n(Drag to another driver or into unscheduled panel)`}
                          style={{
                            position: 'absolute',
                            left: item.leftPx,
                            top: 8,
                            bottom: 8,
                            width: item.widthPx,
                            background: r.color,
                            color: '#FFFFFF',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 4px',
                            cursor: 'grab',
                            zIndex: 3,
                            boxShadow: selectedStop?.stop.order.id === item.stop.order.id
                              ? '0 0 0 2.5px #000, 0 3px 8px rgba(0,0,0,0.35)'
                              : '0 1px 4px rgba(0,0,0,0.18)',
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: 'var(--font-sans)',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            userSelect: 'none',
                            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                        >
                          <span style={{ marginRight: item.widthPx > 50 ? 4 : 0 }}>
                            {item.stop.sequence}
                          </span>
                          {item.widthPx > 65 && (
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 500,
                                opacity: 0.95,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {item.stop.order.outlet.name}
                            </span>
                          )}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
