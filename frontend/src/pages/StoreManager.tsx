import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, ThermometerSnowflake,
  RefreshCw, FileCheck, Check
} from 'lucide-react';

interface InboundDelivery {
  id: string;
  orderId: string;
  cargo: string;
  route: string;
  driver: string;
  driverPhone: string;
  window: string;
  liveEta: string;
  coldChain: string;
  coldPassed: boolean;
  status: 'Unloading' | 'In-Transit' | 'Scheduled' | 'Accepted';
}

export const StoreManagerPage: React.FC = () => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [deliveries, setDeliveries] = useState<InboundDelivery[]>([
    {
      id: 'd1',
      orderId: 'ORD028',
      cargo: '40 Crates Organic Produce & Milk (2.4 m³)',
      route: 'Route 01 (Peliyagoda)',
      driver: 'Sunil Perera',
      driverPhone: '+94 77 123 4567',
      window: '08:28 – 08:38',
      liveEta: 'At Dock (08:28 AM)',
      coldChain: '+3.2°C (Target < 4°C)',
      coldPassed: true,
      status: 'Unloading',
    },
    {
      id: 'd2',
      orderId: 'ORD064',
      cargo: '24 Cases Dairy & Yogurts (1.6 m³)',
      route: 'Route 02 (Peliyagoda)',
      driver: 'Chaminda Silva',
      driverPhone: '+94 71 456 7890',
      window: '10:15 – 10:35',
      liveEta: '10:22 AM (On Schedule)',
      coldChain: '+2.8°C (Target < 4°C)',
      coldPassed: true,
      status: 'In-Transit',
    },
    {
      id: 'd3',
      orderId: 'ORD109',
      cargo: '50 Bundles Bakery & Ambient Goods (3.2 m³)',
      route: 'Route 04 (Peliyagoda)',
      driver: 'Kasun Fernando',
      driverPhone: '+94 76 987 6543',
      window: '12:00 – 12:30',
      liveEta: '12:14 PM (On Schedule)',
      coldChain: 'Ambient (No Reefer)',
      coldPassed: true,
      status: 'Scheduled',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAcceptDelivery = (id: string, orderId: string) => {
    setDeliveries(prev =>
      prev.map(d => (d.id === id ? { ...d, status: 'Accepted' } : d))
    );
    showToast(`Delivery ${orderId} verified & digitally signed by Store Receiver`);
  };

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
        {/* Top Header Strip */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 24, flexWrap: 'wrap', gap: 12
        }}>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
              color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.8px'
            }}>
              Retail Inbound Receiving Terminal
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0' }}>
              FreshMart Nugegoda Supercenter
            </h1>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              42 Old Kesbewa Road · Lead Receiver: <strong>M. Fernando</strong> · 2 Dock Bays Active
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => showToast('Dock arrival schedules refreshed from Peliyagoda dispatch')}
              className="btn btn-secondary"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)',
                color: 'var(--text-primary)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600
              }}
            >
              <RefreshCw size={14} />
              <span>Refresh Feeds</span>
            </button>
            <button
              onClick={() => showToast('Dock delay logged and transmitted to Central Dispatch')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                borderRadius: 8, border: 'none', background: '#EF4444', color: '#FFFFFF',
                cursor: 'pointer', fontSize: 12.5, fontWeight: 700
              }}
            >
              <AlertTriangle size={14} />
              <span>Log Dock Delay</span>
            </button>
          </div>
        </div>

        {/* Dock Status Banners */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16, marginBottom: 24
        }}>
          {/* Dock Bay 1 */}
          <div style={{
            background: 'var(--bg-surface)', border: '2px solid #2563EB',
            borderRadius: 12, padding: 18, boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{
                fontSize: 11, fontWeight: 800, background: '#2563EB', color: '#FFFFFF',
                padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)'
              }}>
                BAY 01 · SERVICING
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#16A34A' }}>
                Unloading Active
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Truck WP-CAD-4821 (Route 01)
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Driver: <strong>Sunil Perera</strong> · 40 crates (2.4 m³ Chilled Produce)
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 6,
              fontSize: 11.5, fontFamily: 'var(--font-mono)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ThermometerSnowflake size={14} color="#2563EB" />
                <span>Cold Sensor: <strong style={{ color: '#2563EB' }}>+3.2°C (PASS)</strong></span>
              </span>
              <span style={{ color: '#16A34A', fontWeight: 700 }}>Arrived: 08:28 AM</span>
            </div>
          </div>

          {/* Dock Bay 2 */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 18, boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{
                fontSize: 11, fontWeight: 800, background: 'var(--bg-muted)',
                color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)'
              }}>
                BAY 02 · STANDBY
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>
                Available
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Next Inbound: Route 04 (WP-LY-5510)
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Driver: <strong>Kasun Fernando</strong> · Ambient Dry Goods
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 6,
              fontSize: 11.5, fontFamily: 'var(--font-mono)'
            }}>
              <span>Expected Window: <strong>10:20–10:45 AM</strong></span>
              <span style={{ color: '#2563EB', fontWeight: 700 }}>ETA: 10:24 AM</span>
            </div>
          </div>
        </div>

        {/* Scheduled Inbound Deliveries Table */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            padding: '14px 20px', background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border)', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
              Incoming Consignment Schedule for Today
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              3 Deliveries Scheduled · 1 At Dock
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                  <th style={{ padding: '10px 16px' }}>ORDER ID</th>
                  <th style={{ padding: '10px 16px' }}>CONSIGNMENT & CARGO</th>
                  <th style={{ padding: '10px 16px' }}>DISPATCH ROUTE</th>
                  <th style={{ padding: '10px 16px' }}>DRIVER CONTACT</th>
                  <th style={{ padding: '10px 16px' }}>WINDOW</th>
                  <th style={{ padding: '10px 16px' }}>LIVE ETA</th>
                  <th style={{ padding: '10px 16px' }}>COLD CHAIN</th>
                  <th style={{ padding: '10px 16px' }}>STATUS</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(del => (
                  <tr key={del.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-vivid)' }}>
                      <Link to={`/orders/${del.orderId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {del.orderId}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {del.cargo}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {del.route}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{del.driver}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{del.driverPhone}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {del.window}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: del.status === 'Unloading' ? '#16A34A' : '#2563EB' }}>
                      {del.liveEta}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 700, color: del.coldChain.includes('Ambient') ? 'var(--text-muted)' : '#2563EB',
                        background: del.coldChain.includes('Ambient') ? 'var(--bg-muted)' : 'rgba(37,99,235,0.1)',
                        padding: '2px 7px', borderRadius: 4, fontFamily: 'var(--font-mono)'
                      }}>
                        {!del.coldChain.includes('Ambient') && <ThermometerSnowflake size={12} />}
                        {del.coldChain}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                        background: del.status === 'Accepted' ? '#DCFCE7' : del.status === 'Unloading' ? '#DBEAFE' : 'var(--bg-muted)',
                        color: del.status === 'Accepted' ? '#15803D' : del.status === 'Unloading' ? '#1D4ED8' : 'var(--text-secondary)'
                      }}>
                        {del.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {del.status === 'Accepted' ? (
                        <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={13} />
                          Signed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAcceptDelivery(del.id, del.orderId)}
                          style={{
                            padding: '6px 12px', borderRadius: 6, border: 'none',
                            background: '#16A34A', color: '#FFFFFF', fontSize: 11.5,
                            fontWeight: 700, cursor: 'pointer', display: 'inline-flex',
                            alignItems: 'center', gap: 5
                          }}
                        >
                          <FileCheck size={13} />
                          <span>Accept & Sign</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreManagerPage;
