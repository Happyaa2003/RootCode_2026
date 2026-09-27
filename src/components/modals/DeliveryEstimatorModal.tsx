import React, { useState, useMemo } from 'react';
import {
  X, Clock, MapPin, CloudRain, Sun, CloudLightning,
  CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, DollarSign
} from 'lucide-react';
import { all120PeliyagodaOutlets, peliyagodaDepots } from '../../data/tempDataService';
import { estimateDeliveryTime } from '../../services/deliveryEstimator';
import { useCurrency } from '../../context/CurrencyContext';

interface DeliveryEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDistrict?: string;
  initialOutletName?: string;
}

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Galle', 'Matara',
  'Kurunegala', 'Puttalam', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Badulla', 'Kegalle'
];

export const DeliveryEstimatorModal: React.FC<DeliveryEstimatorModalProps> = ({
  isOpen,
  onClose,
  initialDistrict = 'Colombo',
  initialOutletName,
}) => {
  const { formatPrice, currency } = useCurrency();
  const [depotId, setDepotId] = useState('DEP-PEL');
  const [district, setDistrict] = useState(initialDistrict);
  const [outletId, setOutletId] = useState<string>('');
  const [brand, setBrand] = useState<'Fresh' | 'Style' | 'Tech'>('Fresh');
  const [dockType, setDockType] = useState<'rear_dock' | 'street' | 'mall_bay'>('rear_dock');
  const [departureTime, setDepartureTime] = useState('07:30');
  const [weather, setWeather] = useState<'clear' | 'showers' | 'monsoon'>('clear');
  const [vehicleType, setVehicleType] = useState<'heavy' | 'medium' | 'light'>('medium');
  const [windowStart, setWindowStart] = useState('08:00');
  const [windowEnd, setWindowEnd] = useState('11:00');

  // Filter outlets by selected district
  const districtOutlets = useMemo(() => {
    return all120PeliyagodaOutlets.filter(o => o.district.toLowerCase() === district.toLowerCase());
  }, [district]);

  // Sync selected outlet when district changes
  React.useEffect(() => {
    if (districtOutlets.length > 0) {
      if (initialOutletName) {
        const found = districtOutlets.find(o => o.name.toLowerCase().includes(initialOutletName.toLowerCase()));
        if (found) {
          setOutletId(found.id);
          setBrand(found.name.includes('Style') ? 'Style' : (found.name.includes('Tech') ? 'Tech' : 'Fresh'));
          setDockType(found.dockType || 'rear_dock');
          return;
        }
      }
      setOutletId(districtOutlets[0].id);
      setBrand(districtOutlets[0].name.includes('Style') ? 'Style' : (districtOutlets[0].name.includes('Tech') ? 'Tech' : 'Fresh'));
      setDockType(districtOutlets[0].dockType || 'rear_dock');
    }
  }, [district, districtOutlets, initialOutletName]);

  const selectedOutlet = districtOutlets.find(o => o.id === outletId) || districtOutlets[0];

  // Perform calculation
  const estimation = useMemo(() => {
    return estimateDeliveryTime({
      depotId,
      district,
      outletName: selectedOutlet?.name || `${district} Retail Hub`,
      brand,
      dockType,
      departureTime,
      weatherCondition: weather,
      vehicleType,
      windowOpen: windowStart,
      windowClose: windowEnd,
    });
  }, [depotId, district, selectedOutlet, brand, dockType, departureTime, weather, vehicleType, windowStart, windowEnd]);

  // Operational cost estimation in base USD
  const estimatedFuelCost = Math.round((estimation.distanceKm / 5.2) * 1.25 * 100) / 100;
  const estimatedLaborCost = Math.round((estimation.totalEstimatedDeliveryMin / 60) * 22.00 * 100) / 100;
  const estimatedDockFee = Math.round(estimation.dockAllowanceMin * 0.45 * 100) / 100;
  const totalEstimatedCost = estimatedFuelCost + estimatedLaborCost + estimatedDockFee;

  if (!isOpen) return null;

  return (
    <div className="waypoint-modal-backdrop" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 16,
    }}>
      <div className="waypoint-modal" style={{
        background: 'var(--bg-surface)',
        borderRadius: 12,
        width: '100%',
        maxWidth: 880,
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-muted)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: '#2563EB', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff',
            }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  Delivery Time & ETA Estimator
                </h3>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, padding: '2px 7px',
                  borderRadius: 4, background: 'rgba(37, 99, 235, 0.12)', color: '#2563EB'
                }}>
                  ROOTCODE ENGINE
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                Multi-factor prediction: district matrix, traffic curves, dock service allowance & weather factors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 6, borderRadius: 6
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>
          {/* Left Column: Input Parameters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
              color: 'var(--text-muted)', letterSpacing: '0.05em',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <MapPin size={13} color="#2563EB" /> Route Dispatch Parameters
            </div>

            {/* Depot & District */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Origin Depot
                </label>
                <select
                  value={depotId}
                  onChange={e => setDepotId(e.target.value)}
                  style={{
                    width: '100%', padding: '7px 10px', fontSize: 12,
                    borderRadius: 6, border: '1px solid var(--border)',
                    background: 'var(--bg-main)', color: 'var(--text-main)',
                  }}
                >
                  {peliyagodaDepots.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Destination District
                </label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  style={{
                    width: '100%', padding: '7px 10px', fontSize: 12,
                    borderRadius: 6, border: '1px solid var(--border)',
                    background: 'var(--bg-main)', color: 'var(--text-main)',
                  }}
                >
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d} Province Sector</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Outlet */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Target Retail Outlet ({districtOutlets.length} available in {district})
              </label>
              <select
                value={outletId}
                onChange={e => {
                  const id = e.target.value;
                  setOutletId(id);
                  const o = districtOutlets.find(x => x.id === id);
                  if (o) {
                    setBrand(o.name.includes('Style') ? 'Style' : (o.name.includes('Tech') ? 'Tech' : 'Fresh'));
                    setDockType(o.dockType || 'rear_dock');
                  }
                }}
                style={{
                  width: '100%', padding: '7px 10px', fontSize: 12,
                  borderRadius: 6, border: '1px solid var(--border)',
                  background: 'var(--bg-main)', color: 'var(--text-main)',
                }}
              >
                {districtOutlets.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({(o.dockType || 'street').replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Brand & Dock Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Brand Category (Service Table)
                </label>
                <select
                  value={brand}
                  onChange={e => setBrand(e.target.value as any)}
                  style={{
                    width: '100%', padding: '7px 10px', fontSize: 12,
                    borderRadius: 6, border: '1px solid var(--border)',
                    background: 'var(--bg-main)', color: 'var(--text-main)',
                  }}
                >
                  <option value="Fresh">Fresh (Cold Chain / Food)</option>
                  <option value="Style">Style (Apparel / Retail)</option>
                  <option value="Tech">Tech (Electronics / Devices)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Dock Infrastructure
                </label>
                <select
                  value={dockType}
                  onChange={e => setDockType(e.target.value as any)}
                  style={{
                    width: '100%', padding: '7px 10px', fontSize: 12,
                    borderRadius: 6, border: '1px solid var(--border)',
                    background: 'var(--bg-main)', color: 'var(--text-main)',
                  }}
                >
                  <option value="rear_dock">Rear Loading Dock</option>
                  <option value="street">Street Frontage Unloading</option>
                  <option value="mall_bay">Shopping Mall Service Bay</option>
                </select>
              </div>
            </div>

            {/* Departure Time & Vehicle Class */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Planned Departure Time
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={e => setDepartureTime(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 10px', fontSize: 12,
                    borderRadius: 6, border: '1px solid var(--border)',
                    background: 'var(--bg-main)', color: 'var(--text-main)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Vehicle Class
                </label>
                <select
                  value={vehicleType}
                  onChange={e => setVehicleType(e.target.value as any)}
                  style={{
                    width: '100%', padding: '7px 10px', fontSize: 12,
                    borderRadius: 6, border: '1px solid var(--border)',
                    background: 'var(--bg-main)', color: 'var(--text-main)',
                  }}
                >
                  <option value="medium">Medium 9T Chilled Rigid (Default)</option>
                  <option value="heavy">Heavy 14T 3-Axle Truck</option>
                  <option value="light">Light 3.5T Urban Van</option>
                </select>
              </div>
            </div>

            {/* Customer Time Window Target */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  SLA Window Open
                </label>
                <input
                  type="time"
                  value={windowStart}
                  onChange={e => setWindowStart(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 10px', fontSize: 12,
                    borderRadius: 6, border: '1px solid var(--border)',
                    background: 'var(--bg-main)', color: 'var(--text-main)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  SLA Window Close
                </label>
                <input
                  type="time"
                  value={windowEnd}
                  onChange={e => setWindowEnd(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 10px', fontSize: 12,
                    borderRadius: 6, border: '1px solid var(--border)',
                    background: 'var(--bg-main)', color: 'var(--text-main)',
                  }}
                />
              </div>
            </div>

            {/* Weather Condition */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Weather & Monsoon Conditions
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { id: 'clear', label: 'Clear Dry', icon: Sun, color: '#F59E0B' },
                  { id: 'showers', label: 'Rain (+10%)', icon: CloudRain, color: '#3B82F6' },
                  { id: 'monsoon', label: 'Monsoon (+25%)', icon: CloudLightning, color: '#8B5CF6' },
                ].map(w => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWeather(w.id as any)}
                    style={{
                      padding: '8px 10px', borderRadius: 6, border: weather === w.id ? '2px solid #2563EB' : '1px solid var(--border)',
                      background: weather === w.id ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-main)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      fontSize: 11, fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)',
                    }}
                  >
                    <w.icon size={13} color={w.color} />
                    <span>{w.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Predictive Results & SLA Breakdown */}
          <div style={{
            background: 'var(--bg-muted)',
            borderRadius: 10,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Predictive Delivery Forecast
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                background: estimation.timeWindowCompliance ? '#DCFCE7' : '#FEE2E2',
                color: estimation.timeWindowCompliance ? '#15803D' : '#B91C1C',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {estimation.timeWindowCompliance ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                {estimation.timeWindowCompliance ? 'SLA Window Compliant' : 'High Risk Delay Alert'}
              </span>
            </div>

            {/* Big ETA Callout Banner */}
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 8,
              padding: '14px 16px',
              border: '1px solid var(--border)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
                  Estimated Arrival (ETA)
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB', fontFamily: 'var(--font-mono)' }}>
                  {estimation.estimatedArrivalETA}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Depart {estimation.departureTime} · {estimation.estimatedTravelMin}m transit
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
                  Departure / Completion (ETD)
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                  {estimation.estimatedCompletionETA}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Dock service turnaround: {estimation.dockAllowanceMin}m
                </div>
              </div>
            </div>

            {/* On-Time Probability Meter */}
            <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <ShieldCheck size={14} color="#10B981" />
                  On-Time SLA Confidence
                </span>
                <span style={{
                  fontSize: 14, fontWeight: 800,
                  color: estimation.onTimeProbability >= 90 ? '#10B981' : (estimation.onTimeProbability >= 75 ? '#F59E0B' : '#EF4444')
                }}>
                  {estimation.onTimeProbability}%
                </span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'var(--bg-muted)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${estimation.onTimeProbability}%`,
                  height: '100%',
                  background: estimation.onTimeProbability >= 90 ? '#10B981' : (estimation.onTimeProbability >= 75 ? '#F59E0B' : '#EF4444'),
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>

            {/* Turnaround Step-by-Step Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Corridor Distance & Class</span>
                <span style={{ fontWeight: 600 }}>{estimation.distanceKm} km ({estimation.roadClass})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Base Free-Flow Travel</span>
                <span style={{ fontWeight: 600 }}>{estimation.baseTravelMin} min</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Traffic Delay (Multiplier: {estimation.trafficMultiplier}x)</span>
                <span style={{ fontWeight: 600, color: estimation.trafficDelayMin > 0 ? '#F59E0B' : 'inherit' }}>
                  +{estimation.trafficDelayMin} min
                </span>
              </div>
              {estimation.monsoonWeatherDelayMin > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Monsoon Storm Buffer</span>
                  <span style={{ fontWeight: 600, color: '#8B5CF6' }}>+{estimation.monsoonWeatherDelayMin} min</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Dock Service Allowance ({brand} · {dockType.replace('_', ' ')})</span>
                <span style={{ fontWeight: 600, color: '#2563EB' }}>{estimation.dockAllowanceMin} min</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: 700, fontSize: 12 }}>
                <span>Total Turnaround Time</span>
                <span style={{ color: '#2563EB' }}>{estimation.totalEstimatedDeliveryMin} min ({(estimation.totalEstimatedDeliveryMin / 60).toFixed(1)} hrs)</span>
              </div>
            </div>

            {/* Estimated Operational Cost in Selected Currency (USD / LKR) */}
            <div style={{
              background: 'var(--bg-surface)',
              padding: 10,
              borderRadius: 8,
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <DollarSign size={14} color="#10B981" />
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Estimated Delivery Trip Cost</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                    {formatPrice(totalEstimatedCost)}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--text-muted)' }}>
                Fuel: {formatPrice(estimatedFuelCost)} · Labor: {formatPrice(estimatedLaborCost)}
                <div style={{ color: '#2563EB', fontWeight: 600 }}>Active Currency: {currency}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
          background: 'var(--bg-muted)',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'var(--bg-surface)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', color: 'var(--text-main)'
            }}
          >
            Close
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '7px 18px', borderRadius: 6, border: 'none',
              background: '#2563EB', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <span>Apply ETA to Dispatch Schedule</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryEstimatorModal;
