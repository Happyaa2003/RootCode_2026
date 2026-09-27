import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { useCurrency } from '../../context/CurrencyContext';
import { getServiceAllowance, computeOrderEconomics } from '../../data/tempDataService';
import type { Order, Outlet } from '../../types';

export interface AddOrderModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({ isOpen, open, onClose }) => {
  const { allOutlets, addOrder } = useDataset();
  const { formatPrice, currency } = useCurrency();

  const [outletName, setOutletName] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [address, setAddress] = useState('');
  const [brand, setBrand] = useState<'Fresh' | 'Style' | 'Tech'>('Fresh');
  const [dockType, setDockType] = useState<'rear_dock' | 'street' | 'mall_bay'>('rear_dock');
  const [windowStart, setWindowStart] = useState('09:00');
  const [windowEnd, setWindowEnd] = useState('12:00');
  const [units, setUnits] = useState(35);
  const [weight, setWeight] = useState(280);
  const [volume, setVolume] = useState(1.8);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const isVisible = isOpen ?? open ?? false;
  if (!isVisible) return null;

  const handleSelectExistingOutlet = (outletId: string) => {
    const o = allOutlets.find(x => x.id === outletId);
    if (o) {
      setOutletName(o.name);
      setDistrict(o.district);
      setAddress(o.address);
      setDockType(o.dockType || 'street');
      if (o.name.includes('Style')) setBrand('Style');
      else if (o.name.includes('Tech')) setBrand('Tech');
      else setBrand('Fresh');
    }
  };

  const allowanceMin = getServiceAllowance(brand, dockType);
  const econ = computeOrderEconomics(brand, units, dockType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalOutlet: Outlet = {
      id: `OUT-${Math.floor(100 + Math.random() * 900)}`,
      name: outletName || `${district} Retail Hub`,
      address: address || `${district} Metro Sector`,
      district: district,
      location: { lat: 6.9271 + (Math.random() - 0.5) * 0.1, lng: 79.8612 + (Math.random() - 0.5) * 0.1 },
      dockType,
      parkingConstraint: 'normal',
      windowOpenTime: windowStart,
      windowCloseTime: windowEnd,
    };

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      outlet: finalOutlet,
      brand,
      district,
      window: { start: windowStart, end: windowEnd },
      scheduledAt: `${windowStart} AM`,
      actualDuration: `${allowanceMin} min`,
      priority,
      status: 'Unassigned',
      riskScore: 10,
      units,
      volume,
      weight,
      temp: brand === 'Fresh' ? 'Chilled' : 'Ambient',
      dockType,
      serviceAllowanceMin: allowanceMin,
      itemPrice: econ.itemPrice,
      deliveryCost: econ.deliveryCost,
      deliveryMargin: econ.deliveryMargin,
      costRatio: econ.costRatio,
      costBreakdown: econ.costBreakdown,
      estimatedTravelMin: 18,
      estimatedArrivalETA: `${windowStart} AM`,
      estimatedServiceMin: allowanceMin,
      estimatedCompletionETA: `${windowEnd} AM`,
      onTimeProbability: 98,
    };

    addOrder(newOrder);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 16,
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 12,
        width: '100%',
        maxWidth: 620,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-muted)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 6,
              background: '#2563EB', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff'
            }}>
              <Plus size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Add New Delivery Order</h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                New orders are placed into the Unscheduled Orders pool for dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Quick autofill from existing outlets */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Quick Fill from Network Outlets (Optional)
            </label>
            <select
              onChange={e => handleSelectExistingOutlet(e.target.value)}
              style={{
                width: '100%', padding: '6px 10px', fontSize: 12,
                borderRadius: 6, border: '1px solid var(--border)',
                background: 'var(--bg-main)', color: 'var(--text-main)',
              }}
            >
              <option value="">-- Or enter custom order details below --</option>
              {allOutlets.slice(0, 30).map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.district})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Outlet / Store Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Eastern Shore Distribution"
                value={outletName}
                onChange={e => setOutletName(e.target.value)}
                style={{
                  width: '100%', padding: '7px 10px', fontSize: 12,
                  borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-main)', color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                District / Corridor
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Colombo, Boston, Kandy"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                style={{
                  width: '100%', padding: '7px 10px', fontSize: 12,
                  borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-main)', color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Delivery Destination Street Address
            </label>
            <input
              type="text"
              placeholder="e.g. 605 S Talbot St, Metro Logistics Dock"
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px', fontSize: 12,
                borderRadius: 6, border: '1px solid var(--border)',
                background: 'var(--bg-main)', color: 'var(--text-main)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Brand
              </label>
              <select
                value={brand}
                onChange={e => setBrand(e.target.value as any)}
                style={{
                  width: '100%', padding: '6px 10px', fontSize: 12,
                  borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-main)', color: 'var(--text-main)',
                }}
              >
                <option value="Fresh">Fresh (Cold Chain)</option>
                <option value="Style">Style (Apparel)</option>
                <option value="Tech">Tech (Electronics)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Dock Type
              </label>
              <select
                value={dockType}
                onChange={e => setDockType(e.target.value as any)}
                style={{
                  width: '100%', padding: '6px 10px', fontSize: 12,
                  borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-main)', color: 'var(--text-main)',
                }}
              >
                <option value="rear_dock">Rear Dock</option>
                <option value="street">Street Frontage</option>
                <option value="mall_bay">Mall Service Bay</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                style={{
                  width: '100%', padding: '6px 10px', fontSize: 12,
                  borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-main)', color: 'var(--text-main)',
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Window Start
              </label>
              <input
                type="time"
                value={windowStart}
                onChange={e => setWindowStart(e.target.value)}
                style={{
                  width: '100%', padding: '6px 8px', fontSize: 12,
                  borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-main)', color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Window End
              </label>
              <input
                type="time"
                value={windowEnd}
                onChange={e => setWindowEnd(e.target.value)}
                style={{
                  width: '100%', padding: '6px 8px', fontSize: 12,
                  borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-main)', color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Units
              </label>
              <input
                type="number"
                min={1}
                value={units}
                onChange={e => setUnits(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%', padding: '6px 8px', fontSize: 12,
                  borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-main)', color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Weight (kg)
              </label>
              <input
                type="number"
                min={10}
                value={weight}
                onChange={e => setWeight(parseInt(e.target.value) || 50)}
                style={{
                  width: '100%', padding: '6px 8px', fontSize: 12,
                  borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-main)', color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Volume (m³)
              </label>
              <input
                type="number"
                step="0.1"
                min={0.1}
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value) || 0.5)}
                style={{
                  width: '100%', padding: '6px 8px', fontSize: 12,
                  borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-main)', color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Economics Preview */}
          <div style={{
            background: 'var(--bg-muted)',
            padding: 10,
            borderRadius: 6,
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11.5,
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Value ({currency}): </span>
              <strong style={{ color: 'var(--text-primary)' }}>{formatPrice(econ.itemPrice)}</strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>Turnaround: </span>
              <strong style={{ color: '#2563EB' }}>{allowanceMin} min</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Trip Cost: </span>
              <strong style={{ color: '#2563EB' }}>{formatPrice(econ.deliveryCost)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 14px', borderRadius: 6, border: '1px solid var(--border)',
                background: 'var(--bg-surface)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', color: 'var(--text-main)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '7px 16px', borderRadius: 6, border: 'none',
                background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Plus size={14} />
              <span>Create Unscheduled Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal;
