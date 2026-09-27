import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Settings,
  UploadCloud,
  Clock,
  Package,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { useCurrency } from '../../context/CurrencyContext';
import AddOrderModal from './AddOrderModal';
import type { Order } from '../../types';

interface DisplaySettings {
  showDuration: boolean;
  showPrice: boolean;
  showAddress: boolean;
  showWeightVolume: boolean;
  showWindow: boolean;
  showBrand: boolean;
}

interface UnscheduledOrdersPanelProps {
  onSelectOrder?: (order: Order) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const UnscheduledOrdersPanel: React.FC<UnscheduledOrdersPanelProps> = ({
  onSelectOrder,
  className = '',
  style,
}) => {
  const { orders, routes, unscheduleOrder, scheduleOrder } = useDataset();
  const { formatPrice, currency } = useCurrency();

  // State
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDragOverDropZone, setIsDragOverDropZone] = useState(false);
  const [quickAssignActiveOrderId, setQuickAssignActiveOrderId] = useState<string | null>(null);

  // Field display preferences
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(() => {
    const saved = localStorage.getItem('waypoint_unscheduled_display_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      showDuration: true,
      showPrice: true,
      showAddress: false,
      showWeightVolume: false,
      showWindow: false,
      showBrand: false,
    };
  });

  const toggleSetting = (key: keyof DisplaySettings) => {
    setDisplaySettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('waypoint_unscheduled_display_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Extract all unscheduled / unassigned orders
  const unscheduledOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Unassigned' || !o.routeId);
  }, [orders]);

  // Filtered by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return unscheduledOrders;
    const q = searchQuery.toLowerCase().trim();
    return unscheduledOrders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.outlet.name.toLowerCase().includes(q) ||
      o.outlet.address.toLowerCase().includes(q) ||
      o.district.toLowerCase().includes(q) ||
      o.brand.toLowerCase().includes(q)
    );
  }, [unscheduledOrders, searchQuery]);

  // Handle Drag Start from Unscheduled Card
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, order: Order) => {
    e.dataTransfer.setData('text/plain', order.id);
    e.dataTransfer.setData('application/json', JSON.stringify(order));
    e.dataTransfer.setData('order-source', 'unscheduled');
    e.dataTransfer.effectAllowed = 'move';

    // Ghost drag preview enhancement
    const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
    ghost.style.position = 'absolute';
    ghost.style.top = '-9999px';
    ghost.style.opacity = '0.9';
    ghost.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 20, 20);
    setTimeout(() => {
      if (document.body.contains(ghost)) {
        document.body.removeChild(ghost);
      }
    }, 0);
  };

  // Drop target zone: Drag orders here to unschedule them
  const handleDropZoneDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOverDropZone) setIsDragOverDropZone(true);
  };

  const handleDropZoneDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverDropZone(false);
  };

  const handleDropZoneDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverDropZone(false);

    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) {
      unscheduleOrder(orderId);
    }
  };

  return (
    <>
      <div
        className={`waypoint-unscheduled-panel ${isMinimized ? 'minimized' : ''} ${className}`}
        style={{
          width: isMinimized ? '240px' : '285px',
          background: 'var(--bg-surface)',
          borderRadius: 8,
          border: '1px solid var(--border-strong)',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.14), 0 1px 4px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          userSelect: 'none',
          transition: 'width 0.2s ease, max-height 0.2s ease',
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* ─── Header: Unscheduled orders (N) + Settings + Minimize ─── */}
        <div
          style={{
            padding: '8px 12px',
            borderBottom: isMinimized ? 'none' : '1px solid var(--border)',
            background: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              cursor: isMinimized ? 'pointer' : 'default',
              flex: 1,
            }}
            onClick={() => {
              if (isMinimized) setIsMinimized(false);
            }}
          >
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Unscheduled orders ({unscheduledOrders.length})
            </span>

            {unscheduledOrders.length > 0 && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#F59E0B',
                  display: 'inline-block',
                }}
              />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Settings gear toggle */}
            {!isMinimized && (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  title="Adjust what information appears in the panel"
                  onClick={() => setShowSettingsPopover(!showSettingsPopover)}
                  style={{
                    background: showSettingsPopover ? 'var(--bg-muted)' : 'transparent',
                    border: 'none',
                    padding: 4,
                    borderRadius: 4,
                    cursor: 'pointer',
                    color: showSettingsPopover ? '#2563EB' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Settings size={14} />
                </button>

                {/* Settings popover */}
                {showSettingsPopover && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 6,
                      width: 210,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 6,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                      padding: 10,
                      zIndex: 60,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: 6,
                        borderBottom: '1px solid var(--border)',
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}
                    >
                      <span>Adjust Panel Columns</span>
                      <button
                        onClick={() => setShowSettingsPopover(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={displaySettings.showDuration}
                        onChange={() => toggleSetting('showDuration')}
                        style={{ accentColor: '#2563EB' }}
                      />
                      <span>Service Turnaround (min)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={displaySettings.showPrice}
                        onChange={() => toggleSetting('showPrice')}
                        style={{ accentColor: '#2563EB' }}
                      />
                      <span>Item Cargo Value ({currency})</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={displaySettings.showAddress}
                        onChange={() => toggleSetting('showAddress')}
                        style={{ accentColor: '#2563EB' }}
                      />
                      <span>Delivery Address</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={displaySettings.showWeightVolume}
                        onChange={() => toggleSetting('showWeightVolume')}
                        style={{ accentColor: '#2563EB' }}
                      />
                      <span>Weight & Volume</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={displaySettings.showWindow}
                        onChange={() => toggleSetting('showWindow')}
                        style={{ accentColor: '#2563EB' }}
                      />
                      <span>Customer Time Window</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={displaySettings.showBrand}
                        onChange={() => toggleSetting('showBrand')}
                        style={{ accentColor: '#2563EB' }}
                      />
                      <span>Brand Classification</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Quick Add Order Button (Always available in minimized and expanded) */}
            <button
              type="button"
              title="Add new unscheduled order"
              onClick={() => setIsAddModalOpen(true)}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#2563EB',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(37,99,235,0.3)',
                transition: 'transform 0.1s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>

            {/* Minimize / Expand chevron */}
            <button
              type="button"
              title={isMinimized ? 'Expand panel' : 'Minimize panel'}
              onClick={() => setIsMinimized(!isMinimized)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 4,
                borderRadius: 4,
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>
          </div>
        </div>

        {/* ─── Body (hidden when minimized) ─── */}
        {!isMinimized && (
          <>
            {/* Search Input Row */}
            <div
              style={{
                padding: '6px 10px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg-surface)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: '3px 10px',
                  flex: 1,
                }}
              >
                <Search size={13} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: 11.5,
                    color: 'var(--text-primary)',
                    width: '100%',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* ─── Draggable Orders List ─── */}
            <div
              style={{
                padding: '8px',
                maxHeight: '290px',
                minHeight: '120px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                background: 'var(--bg-inset)',
              }}
            >
              {filteredOrders.length === 0 ? (
                <div
                  style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 11.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Package size={22} strokeWidth={1.5} color="var(--text-muted)" />
                  <div>{searchQuery ? 'No matching orders found' : 'No unscheduled orders'}</div>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    style={{
                      marginTop: 4,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#2563EB',
                      cursor: 'pointer',
                    }}
                  >
                    + Add New Order
                  </button>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const duration = order.actualDuration || `${order.serviceAllowanceMin || 10} min`;
                  const isQuickAssignOpen = quickAssignActiveOrderId === order.id;

                  return (
                    <div
                      key={order.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, order)}
                      onClick={() => onSelectOrder?.(order)}
                      style={{
                        background: 'var(--bg-surface)',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        padding: '8px 10px',
                        cursor: 'grab',
                        transition: 'transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease',
                        position: 'relative',
                      }}
                      className="waypoint-unscheduled-card"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2563EB';
                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Top Row: Outlet Name & Drag Grip */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            lineHeight: 1.25,
                            flex: 1,
                          }}
                        >
                          {order.outlet.name}
                        </div>

                        {/* Brand badge if enabled */}
                        {displaySettings.showBrand && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: 3,
                              background: order.brand === 'Fresh' ? '#DCFCE7' : order.brand === 'Style' ? '#F3E8FF' : '#DBEAFE',
                              color: order.brand === 'Fresh' ? '#15803D' : order.brand === 'Style' ? '#6B21A8' : '#1E40AF',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {order.brand}
                          </span>
                        )}
                      </div>

                      {/* Sub-line: Duration & Price */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 4,
                          fontSize: 11,
                          color: 'var(--text-muted)',
                        }}
                      >
                        {displaySettings.showDuration && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>{duration}</span>
                            <span style={{ color: 'var(--border-strong)' }}>-</span>
                          </div>
                        )}

                        {displaySettings.showPrice && (
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: '#15803D',
                              fontSize: 11,
                            }}
                          >
                            {formatPrice(order.itemPrice ?? 1200)}
                          </div>
                        )}
                      </div>

                      {/* Address if toggled on */}
                      {displaySettings.showAddress && (
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--text-secondary)',
                            marginTop: 4,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {order.outlet.address}
                        </div>
                      )}

                      {/* Weight / Volume if toggled on */}
                      {displaySettings.showWeightVolume && (
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            fontSize: 10,
                            color: 'var(--text-muted)',
                            marginTop: 3,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          <span>{order.weight} kg</span>
                          <span>·</span>
                          <span>{order.volume} m³</span>
                        </div>
                      )}

                      {/* Customer Window if toggled on */}
                      {displaySettings.showWindow && (
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--text-secondary)',
                            marginTop: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Clock size={10} color="var(--text-muted)" />
                          <span>{order.window.start} – {order.window.end}</span>
                        </div>
                      )}

                      {/* Quick Assign Dropdown Drawer */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 5,
                          paddingTop: 4,
                          borderTop: '1px dashed var(--border)',
                        }}
                      >
                        <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                          Drag to route or:
                        </span>

                        <div style={{ position: 'relative' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickAssignActiveOrderId(isQuickAssignOpen ? null : order.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#2563EB',
                              fontSize: 10,
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: '1px 4px',
                              borderRadius: 3,
                            }}
                          >
                            Assign to route ▾
                          </button>

                          {isQuickAssignOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: 'absolute',
                                right: 0,
                                bottom: '100%',
                                marginBottom: 4,
                                width: 170,
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-strong)',
                                borderRadius: 6,
                                boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
                                padding: 4,
                                zIndex: 70,
                              }}
                            >
                              <div style={{ fontSize: 10, fontWeight: 700, padding: '4px 6px', color: 'var(--text-muted)' }}>
                                Choose Fleet Route:
                              </div>
                              {routes.map(r => (
                                <button
                                  key={r.id}
                                  onClick={() => {
                                    scheduleOrder(order.id, r.id);
                                    setQuickAssignActiveOrderId(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    width: '100%',
                                    padding: '5px 6px',
                                    background: 'none',
                                    border: 'none',
                                    borderRadius: 4,
                                    fontSize: 11,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    color: 'var(--text-primary)',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-muted)')}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                                >
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
                                  <span style={{ fontWeight: 600 }}>{r.driver?.name ?? r.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ─── Bottom Drop Target: Drop your order here to unschedule it ─── */}
            <div
              onDragOver={handleDropZoneDragOver}
              onDragLeave={handleDropZoneDragLeave}
              onDrop={handleDropZoneDrop}
              style={{
                padding: '12px 10px',
                borderTop: '1px solid var(--border)',
                background: isDragOverDropZone ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-subtle)',
                border: isDragOverDropZone ? '2px dashed #2563EB' : '1px solid var(--border)',
                margin: '6px',
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <UploadCloud
                size={18}
                color={isDragOverDropZone ? '#2563EB' : 'var(--text-muted)'}
                style={{
                  transform: isDragOverDropZone ? 'scale(1.15) translateY(-2px)' : 'none',
                  transition: 'transform 0.15s ease',
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isDragOverDropZone ? '#2563EB' : 'var(--text-secondary)',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {isDragOverDropZone ? 'Release to Unschedule' : 'Drop your order here to unschedule it'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Add New Order Modal */}
      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
};

export default UnscheduledOrdersPanel;
