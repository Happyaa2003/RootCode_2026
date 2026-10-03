import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Navigation, Phone, CheckCircle2, Camera,
  Clock, X, FileText, User, Wifi, WifiOff
} from 'lucide-react';
import WayPilotLogo from '../components/common/WayPilotLogo';

export const DriverPage: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [podOpen, setPodOpen] = useState(false);
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [signeeName, setSigneeName] = useState('M. Fernando (Store Receiving Lead)');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleOffline = () => {
    setIsOffline(prev => {
      const next = !prev;
      if (next) {
        showToast('Driver switched to Offline Mode — actions queued locally in IndexedDB');
      } else {
        showToast('Reconnected: Queued driver transactions synced with Colombo dispatch!');
      }
      return next;
    });
  };

  const handleSubmitPod = () => {
    setPodOpen(false);
    setDeliveryCompleted(true);
    showToast('POD photo & digital signoff synced! Route advanced to Stop 2 (Keells Kollupitiya)');
  };

  return (
    <div style={{
      minHeight: '100%', background: '#0B0F19', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      padding: '20px 0', overflowY: 'auto', position: 'relative'
    }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)', color: '#FFFFFF', padding: '10px 20px',
          borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', fontSize: 13,
          fontWeight: 600, zIndex: 99999, boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Device Preview Container (Simulated Smartphone) */}
      <div style={{
        width: 410, maxWidth: '100%', minHeight: 740, background: 'var(--bg-surface)',
        borderRadius: 24, overflow: 'hidden', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column', position: 'relative'
      }}>

        {/* 1. Phone Top Status Bar */}
        <div style={{
          height: 38, background: '#0F172A', color: '#FFFFFF', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', padding: '0 18px',
          fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, flexShrink: 0
        }}>
          <span>08:24</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: isOffline ? '#EF4444' : '#34D399', display: 'flex', alignItems: 'center', gap: 4 }}>
              {isOffline ? <WifiOff size={12} color="#EF4444" /> : <Wifi size={12} color="#34D399" />}
              {isOffline ? 'OFFLINE' : '4G LTE'}
            </span>
            <div style={{ width: 18, height: 10, border: '1px solid #94A3B8', borderRadius: 2, padding: 1 }}>
              <div style={{ width: '85%', height: '100%', background: '#34D399', borderRadius: 1 }} />
            </div>
          </div>
        </div>

        {/* 2. App Top Bar */}
        <div style={{
          padding: '12px 16px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <WayPilotLogo size={26} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                WAYPILOT DRIVER
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Route 01 · WP-CAD-4821
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link to="/" style={{
              fontSize: 11, fontWeight: 700, color: 'var(--brand-vivid)',
              background: 'var(--brand-tint)', padding: '4px 8px', borderRadius: 6, textDecoration: 'none'
            }}>
              Exit
            </Link>
          </div>
        </div>

        {/* 3. Offline Simulation Banner Toggle */}
        <div
          onClick={handleToggleOffline}
          style={{
            background: isOffline ? '#991B1B' : 'rgba(16,185,129,0.12)',
            borderBottom: isOffline ? '1px solid #7F1D1D' : '1px solid rgba(16,185,129,0.25)',
            color: isOffline ? '#FFFFFF' : '#15803D',
            padding: '7px 16px', fontSize: 11, fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', flexShrink: 0,
            transition: 'all 0.2s'
          }}
          title="Click to toggle simulated hill-country offline network disconnection"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: isOffline ? '#EF4444' : '#16A34A',
              boxShadow: isOffline ? '0 0 6px #EF4444' : '0 0 6px #16A34A'
            }} />
            <span>{isOffline ? 'OFFLINE DEGRADED MODE (CACHED)' : 'NETWORK ONLINE · CACHE SYNCED'}</span>
          </div>
          <span style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', opacity: 0.85 }}>
            {isOffline ? 'Tap to Reconnect' : 'Simulate Offline'}
          </span>
        </div>

        {/* 4. Scrollable Driver Dashboard Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Turn-by-Turn GPS Navigation Card */}
          <div style={{ background: '#0F172A', color: '#FFFFFF', borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: '#2563EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Navigation size={22} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  In 450 meters
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                  Turn left onto Old Kesbewa Rd
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 8, fontSize: 12, fontFamily: 'var(--font-mono)'
            }}>
              <span style={{ color: '#38BDF8', fontWeight: 700 }}>ETA: 08:28 AM</span>
              <span style={{ color: '#94A3B8' }}>2.4 km remaining</span>
              <span style={{ color: '#34D399', fontWeight: 700 }}>Speed: 42 km/h</span>
            </div>
          </div>

          {/* Current Stop Mission Card */}
          <div style={{
            background: 'var(--bg-surface)', border: '2px solid #2563EB',
            borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{
                fontSize: 10.5, fontWeight: 800, background: '#2563EB', color: '#FFFFFF',
                padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)', letterSpacing: '0.5px'
              }}>
                CURRENT STOP · 1 OF 12
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: deliveryCompleted ? '#16A34A' : '#15803D',
                background: '#DCFCE7', padding: '2px 7px', borderRadius: 4
              }}>
                {deliveryCompleted ? '✓ Completed' : '98% SLA Confidence'}
              </span>
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              FreshMart Nugegoda
            </h2>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 10 }}>
              42 Old Kesbewa Road, Nugegoda (Colombo Suburbs)
            </div>

            {/* Cargo Specification Pillbox */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'var(--bg-subtle)',
              padding: 10, borderRadius: 8, border: '1px solid var(--border)', marginBottom: 14, fontSize: 11.5
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Window: </span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>08:28–08:38</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Volume: </span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>2.4 m³ (40u)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Temp Target: </span>
                <strong style={{ color: '#2563EB' }}>+3.2°C Chilled</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Dock: </span>
                <strong>Street Curbside</strong>
              </div>
            </div>

            {/* Interactive Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <a
                href="tel:+94771234567"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  textDecoration: 'none', padding: '8px 0', borderRadius: 6,
                  background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 12, fontWeight: 600
                }}
              >
                <Phone size={13} />
                <span>Call Store</span>
              </a>

              <button
                onClick={() => showToast('Dock arrival logged at 08:28 AM')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px 0', borderRadius: 6, background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)', color: '#2563EB', fontSize: 12,
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                <Clock size={13} color="#2563EB" />
                <span>Arrived at Dock</span>
              </button>
            </div>

            {/* Proof of Delivery Button */}
            <button
              onClick={() => setPodOpen(true)}
              style={{
                width: '100%', height: 42, fontWeight: 800, fontSize: 13.5,
                background: deliveryCompleted ? '#2563EB' : '#16A34A', color: '#FFFFFF',
                borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s ease'
              }}
            >
              <Camera size={16} />
              <span>{deliveryCompleted ? 'Review Proof of Delivery' : 'Complete Delivery & POD'}</span>
            </button>
          </div>

          {/* Next Stops Progression */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 14
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
              Upcoming Stops on Route 01
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Stop 2 */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 10, background: 'var(--bg-subtle)', borderRadius: 6, border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: '#2563EB',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'
                  }}>
                    2
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>Keells Kollupitiya</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>853 Main St · 1.8 m³</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  08:43 AM
                </div>
              </div>

              {/* Stop 3 */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 10, background: 'var(--bg-subtle)', borderRadius: 6, border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-muted)',
                    color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)'
                  }}>
                    3
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>FreshMart Bambalapitiya</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Galle Rd · 3.1 m³</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  08:54 AM
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Phone Bottom Bar */}
        <div style={{
          height: 54, background: 'var(--bg-surface)', borderTop: '1px solid var(--border)',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center',
          textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', flexShrink: 0
        }}>
          <div style={{ color: '#2563EB', fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Navigation size={18} />
            <span>Navigation</span>
          </div>
          <div
            onClick={() => showToast('Manifest: 12 deliveries total · 1st stop in progress')}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
          >
            <FileText size={18} />
            <span>Manifest (12)</span>
          </div>
          <div
            onClick={() => showToast('Driver profile: Sunil Perera · WP CAD-4821')}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
          >
            <User size={18} />
            <span>Profile</span>
          </div>
        </div>

      </div>

      {/* Proof of Delivery Camera Modal */}
      {podOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100000, padding: 16
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 16, width: 440, maxWidth: '100%', overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)'
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                  Proof of Delivery Capture
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  FreshMart Nugegoda (ORD028)
                </div>
              </div>
              <button
                onClick={() => setPodOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 16 }}>
              {/* Simulated Camera Viewfinder */}
              <div style={{
                height: 180, background: '#0F172A', borderRadius: 8,
                position: 'relative', overflow: 'hidden', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: 14
              }}>
                <div style={{
                  border: '2px dashed #38BDF8', width: '80%', height: '75%',
                  borderRadius: 6, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', color: '#94A3B8'
                }}>
                  <Camera size={32} color="#38BDF8" />
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 6 }}>
                    Frame Crate Barcode & Receipt
                  </span>
                </div>
                <div style={{
                  position: 'absolute', bottom: 8, left: 12, fontSize: 9.5,
                  fontFamily: 'var(--font-mono)', color: '#34D399'
                }}>
                  GPS: 6.8722°N, 79.8911°E · ACCURACY: ±3m
                </div>
              </div>

              {/* Recipient Signature */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Store Signee Name
                </div>
                <input
                  type="text"
                  value={signeeName}
                  onChange={e => setSigneeName(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '8px 10px',
                    border: '1px solid var(--border)', borderRadius: 6, fontSize: 12,
                    background: 'var(--bg-subtle)', color: 'var(--text-primary)', outline: 'none'
                  }}
                />
              </div>

              <button
                onClick={handleSubmitPod}
                style={{
                  width: '100%', height: 42, background: '#16A34A', color: '#FFFFFF',
                  fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 13
                }}
              >
                Submit Proof of Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverPage;
