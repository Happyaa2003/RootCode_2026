import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Truck, ArrowLeft, Printer, Phone,
  ThermometerSnowflake, Camera, Check
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useDataset } from '../context/DatasetContext';

export const OrderDetailPage: React.FC = () => {
  const { orderId = 'ORD028' } = useParams<{ orderId?: string }>();
  const { formatPrice } = useCurrency();
  const { orders } = useDataset();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const matchedOrder = orders.find(o => o.id === orderId) || {
    id: orderId,
    outlet: {
      name: 'FreshMart Nugegoda Supercenter',
      address: '42 Old Kesbewa Road, Nugegoda, Western Province',
      lat: 6.8722,
      lng: 79.8911,
      dockType: 'Street Curbside',
      contactPhone: '+94 11 281 9900',
      managerName: 'M. Fernando',
    },
    brand: 'Fresh' as const,
    itemPrice: 1240.00,
    deliveryCost: 28.40,
    units: 40,
    volumeM3: 2.4,
    status: 'Delivered' as const,
    scheduledWindow: { start: '08:28', end: '08:38' },
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const itemPrice = matchedOrder.itemPrice || 1240.00;
  const deliveryCost = matchedOrder.deliveryCost || 28.40;
  const netMargin = itemPrice - deliveryCost;
  const marginPct = Math.round((netMargin / itemPrice) * 1000) / 10;
  const costRatio = Math.round((deliveryCost / itemPrice) * 1000) / 10;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-app)', padding: '24px 32px', position: 'relative' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)', color: '#FFFFFF', padding: '10px 20px',
          borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', fontSize: 13,
          fontWeight: 600, zIndex: 99999, boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <Check size={16} color="#10B981" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Breadcrumb & Top Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20, flexWrap: 'wrap', gap: 12
        }}>
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5,
              color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase', marginBottom: 6
            }}>
              <Link to="/orders" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={12} />
                <span>Orders Queue</span>
              </Link>
              <span>/</span>
              <span>{matchedOrder.id}</span>
              <span>/</span>
              <span style={{ color: 'var(--brand-vivid)' }}>{matchedOrder.outlet.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Order {matchedOrder.id}
              </h1>
              <span style={{
                fontSize: 12, padding: '3px 10px', borderRadius: 6, fontWeight: 700,
                background: '#DCFCE7', color: '#15803D'
              }}>
                Delivered / On Time
              </span>
              <span style={{
                background: 'var(--brand-tint)', color: 'var(--brand-vivid)',
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 4
              }}>
                Peliyagoda Wave 1
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)',
                color: 'var(--text-primary)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600
              }}
            >
              <Printer size={14} />
              <span>Print Consignment</span>
            </button>
            <button
              onClick={() => showToast('Radio ping sent to Driver Sunil Perera (WP CAD-4821)')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                borderRadius: 8, border: 'none', background: '#2563EB', color: '#FFFFFF',
                cursor: 'pointer', fontSize: 12.5, fontWeight: 700
              }}
            >
              <Phone size={14} />
              <span>Contact Driver</span>
            </button>
          </div>
        </div>

        {/* 2 Column Master Detail Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>

          {/* LEFT COLUMN: Economics, Timeline & Proof of Delivery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Financial Unit Economics Card */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Delivering Cargo & Cost Economics
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                    Unit Profitability Breakdown
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '4px 10px', borderRadius: 6 }}>
                  {marginPct}% Net Delivery Margin
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Delivering Item Price (Merchandise Value)</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    {formatPrice(itemPrice)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {matchedOrder.units} items · {matchedOrder.brand} Produce Consignment
                  </div>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Total Delivery Cost (Logistics Operational Burn)</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    {formatPrice(deliveryCost)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {costRatio}% cost-to-value ratio
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Detailed Component Expense Analysis
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <tbody>
                  <tr style={{ borderBottom: '1px dashed var(--border)', height: 34 }}>
                    <td style={{ color: 'var(--text-secondary)' }}>Fuel Consumption (Diesel 3.2 km/l · Colombo baseline corridor):</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatPrice(2.84)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px dashed var(--border)', height: 34 }}>
                    <td style={{ color: 'var(--text-secondary)' }}>Driver & Crew Labor Rate (18m transit + 10m dock):</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatPrice(13.20)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px dashed var(--border)', height: 34 }}>
                    <td style={{ color: 'var(--text-secondary)' }}>Receiving Dock Service Allowance (Nugegoda street turnaround):</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatPrice(8.10)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px dashed var(--border)', height: 34 }}>
                    <td style={{ color: 'var(--text-secondary)' }}>Road Condition Wear & Toll Depreciation:</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatPrice(4.26)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px dashed var(--border)', height: 34, color: '#16A34A' }}>
                    <td style={{ fontWeight: 600 }}>SLA Late Penalty Incurred:</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatPrice(0.00)} (On-Time Delivery)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Delivery Progress Milestones Timeline */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
                Execution Timeline & GPS Audit Trail
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { time: '06:45 AM', title: 'Order Ingested & Planned', desc: 'Assigned to Route 01 (Peliyagoda Hub Wave 1)', status: 'complete' },
                  { time: '07:15 AM', title: 'Cross-Dock Loading Completed', desc: 'Reefer pre-chilled to +3.2°C at Loading Bay 02', status: 'complete' },
                  { time: '07:45 AM', title: 'Departed Peliyagoda Hub', desc: 'Driver Sunil Perera en route via Baseline Road', status: 'complete' },
                  { time: '08:28 AM', title: 'Arrived at FreshMart Nugegoda Dock', desc: 'Within scheduled 08:28–08:38 SLA window (On-Time)', status: 'complete' },
                  { time: '08:35 AM', title: 'Digital Signoff & POD Captured', desc: 'Signed by M. Fernando · Photo uploaded to edge cloud', status: 'complete' },
                ].map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', background: '#10B981',
                        color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Check size={13} />
                      </div>
                      {idx < 4 && <div style={{ width: 2, height: 28, background: 'var(--border)', margin: '4px 0' }} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{step.title}</span>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{step.time}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proof of Delivery Card */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                Electronic Proof of Delivery (e-POD)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{
                  height: 140, background: '#0F172A', borderRadius: 8,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Camera size={28} color="#38BDF8" />
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 6, color: '#E2E8F0' }}>
                    Photo_ORD028_Dock.jpg
                  </span>
                  <span style={{ fontSize: 9.5, color: '#34D399', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    GPS: 6.8722°N, 79.8911°E
                  </span>
                </div>

                <div style={{
                  padding: 12, background: 'var(--bg-subtle)', borderRadius: 8,
                  border: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                      Store Signee
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                      M. Fernando
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      Receiving Dock Supervisor
                    </div>
                  </div>
                  <div style={{
                    padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 6,
                    border: '1px dashed var(--border)', fontFamily: 'cursive', fontSize: 15, color: 'var(--brand-vivid)'
                  }}>
                    M. Fernando
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Outlet Details & Vehicle Specifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Consignee / Outlet Card */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                Receiving Consignee Outlet
              </div>

              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                FreshMart Nugegoda
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 12 }}>
                42 Old Kesbewa Road, Nugegoda, Colombo Suburbs
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Dock Type:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>Street Curbside Apron</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Coordinates:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>6.8722°N, 79.8911°E</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Contact Lead:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>M. Fernando (+94 11 281 9900)</span>
                </div>
              </div>
            </div>

            {/* Dispatch Route & Vehicle Card */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                Assigned Fleet Asset & Driver
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Truck size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Sunil Perera (Driver)
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    WP-CAD-4821 · Reefer Unit
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Dispatch Route:</span>
                  <strong style={{ color: 'var(--brand-vivid)' }}>Route 01 (Stop 1 of 12)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cold Chain Status:</span>
                  <strong style={{ color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <ThermometerSnowflake size={13} />
                    +3.2°C Certified
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Depot Origin:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Peliyagoda Central Depot</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
