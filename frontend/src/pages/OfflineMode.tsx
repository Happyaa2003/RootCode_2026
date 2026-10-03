import React, { useState } from 'react';
import { WifiOff, Wifi, RefreshCw, Check } from 'lucide-react';

interface MutationItem {
  id: string;
  type: string;
  payload: string;
  timestamp: string;
  size: string;
  status: 'pending' | 'syncing' | 'synced';
}

export const OfflineModePage: React.FC = () => {
  const [isOffline, setIsOffline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [mutations, setMutations] = useState<MutationItem[]>([
    {
      id: 'MUT-001',
      type: 'Proof of Delivery (e-POD)',
      payload: 'ORD028 · FreshMart Nugegoda · Signee: M. Fernando (Photo 48KB)',
      timestamp: '08:35:12 AM',
      size: '48.2 KB',
      status: 'pending',
    },
    {
      id: 'MUT-002',
      type: 'Incident Delay Report',
      payload: 'ORD009 · Keells Nugegoda · High-Level Road water main bottleneck',
      timestamp: '08:43:05 AM',
      size: '1.4 KB',
      status: 'pending',
    },
    {
      id: 'MUT-003',
      type: 'Cold Chain Telemetry Log',
      payload: 'WP-CAD-4821 Reefer: +3.2°C recorded at Dock Bay 01',
      timestamp: '08:48:20 AM',
      size: '0.8 KB',
      status: 'pending',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSimulateSync = () => {
    setSyncing(true);
    showToast('Cellular link established: flushing 3 pending mutations to central cloud...');

    setTimeout(() => {
      setMutations(prev => prev.map(m => ({ ...m, status: 'synced' })));
      setIsOffline(false);
      setSyncing(false);
      showToast('Sync complete! All 3 local mutations reconciled with 0 data loss.');
    }, 1800);
  };

  const handleResetOffline = () => {
    setIsOffline(true);
    setMutations(prev => prev.map(m => ({ ...m, status: 'pending' })));
    showToast('Switched back to Offline Degraded Mode for demonstration.');
  };

  const pendingCount = mutations.filter(m => m.status === 'pending').length;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
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

      {/* Persistent Critical Offline Alert Banner */}
      <div style={{
        background: isOffline
          ? 'linear-gradient(90deg, #991B1B, #B91C1C)'
          : 'linear-gradient(90deg, #065F46, #047857)',
        color: '#FFFFFF', padding: '12px 24px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '2px solid rgba(0,0,0,0.2)', flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)', transition: 'background 0.3s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {isOffline ? <WifiOff size={18} /> : <Wifi size={18} />}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {isOffline
                ? 'Enterprise Offline Degraded Mode — IndexedDB & Local Storage Cache Active'
                : 'Network Online — Local Edge Cache Fully Synchronized'}
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 2 }}>
              {isOffline
                ? 'Cellular telemetry socket disconnected. Running on local cached manifests. All driver actions and PODs are safely queued in local storage.'
                : 'All driver signatures, exceptions, and cold-chain telemetry have been reconciled with Central Dispatch.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, background: 'rgba(0,0,0,0.25)',
            padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {isOffline ? 'Last Cloud Sync: 08:14:22 AM (48m ago)' : 'Last Cloud Sync: Just now'}
          </div>

          {isOffline ? (
            <button
              disabled={syncing}
              onClick={handleSimulateSync}
              style={{
                background: '#FFFFFF', color: '#991B1B', fontWeight: 800,
                border: 'none', borderRadius: 6, display: 'flex', alignItems: 'center',
                gap: 6, cursor: syncing ? 'default' : 'pointer', padding: '7px 14px',
                fontSize: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              <RefreshCw size={13} className={syncing ? 'spinning' : ''} />
              <span>{syncing ? 'Reconciling Queue...' : 'Simulate Network Reconnection'}</span>
            </button>
          ) : (
            <button
              onClick={handleResetOffline}
              style={{
                background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6,
                padding: '7px 14px', fontSize: 12, cursor: 'pointer'
              }}
            >
              Reset to Offline Mode
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '24px 32px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* Degraded Health Ribbons */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14, marginBottom: 24
        }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Cached Delivery Routes</span>
              <span style={{ background: '#DBEAFE', color: '#1D4ED8', fontWeight: 700, fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>
                Edge DB Ready
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
              2 Active Routes
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              11 scheduled supermarket stops cached in IndexedDB
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Outbound Mutations</span>
              <span style={{
                background: pendingCount > 0 ? '#FEE2E2' : '#DCFCE7',
                color: pendingCount > 0 ? '#DC2626' : '#15803D',
                fontWeight: 700, fontSize: 10, padding: '2px 6px', borderRadius: 4
              }}>
                {pendingCount > 0 ? `${pendingCount} Awaiting Sync` : 'Synchronized'}
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 800,
              color: pendingCount > 0 ? '#DC2626' : '#10B981'
            }}>
              {pendingCount} Mutations
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Safe inside LocalStorage buffer (50.4 KB)
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Re-Route Strategy</span>
              <span style={{ background: '#FEF3C7', color: '#B45309', fontWeight: 700, fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>
                Fallback Mode
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 800, color: '#D97706' }}>
              Deterministic Lock
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Sequence locked; dynamic neural re-balance suspended
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Local Storage Integrity</span>
              <span style={{ background: '#DCFCE7', color: '#15803D', fontWeight: 700, fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>
                100% Intact
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 800, color: '#16A34A' }}>
              CRC-32 Valid
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Zero data loss during rural hill-country network dropout
            </div>
          </div>
        </div>

        {/* 2 Column Layout: Cached Manifests vs Outbound Mutation Ledger */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20 }}>

          {/* Left Column: Locally Cached Routes */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              padding: '14px 18px', background: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border)', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)' }}>
                  Locally Cached Delivery Manifests
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Stored in IndexedDB (offline available without 4G)
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 800, background: '#DBEAFE', color: '#1D4ED8',
                padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)'
              }}>
                v2.6 CACHE
              </span>
            </div>

            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                borderRadius: 8, padding: 14, borderLeft: '4px solid #2563EB'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>Route 01 · WP-CAD-4821</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A' }}>12 Deliveries Cached</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Driver: Sunil Perera · Peliyagoda → Nugegoda → Bambalapitiya
                </div>
                <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  Cached Size: 32.4 KB · CRC Checksum: 0x9AF83E12
                </div>
              </div>

              <div style={{
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                borderRadius: 8, padding: 14, borderLeft: '4px solid #10B981'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>Route 02 · WP-DAE-9102</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A' }}>9 Deliveries Cached</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Driver: Chaminda Silva · Peliyagoda → Kandy Road Corridor
                </div>
                <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  Cached Size: 24.1 KB · CRC Checksum: 0x4C72B001
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Outbound Mutation Ledger (Sync Queue) */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              padding: '14px 18px', background: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border)', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)' }}>
                  Outbound Mutation Sync Queue
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Transactions recorded while offline awaiting auto-reconciliation
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 800,
                background: pendingCount > 0 ? '#FEE2E2' : '#DCFCE7',
                color: pendingCount > 0 ? '#DC2626' : '#15803D',
                padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)'
              }}>
                {pendingCount} PENDING
              </span>
            </div>

            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mutations.map(mut => (
                <div
                  key={mut.id}
                  style={{
                    background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: 14,
                    borderLeft: mut.status === 'synced' ? '4px solid #10B981' : '4px solid #DC2626'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                        {mut.id}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {mut.type}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                      background: mut.status === 'synced' ? '#DCFCE7' : '#FEE2E2',
                      color: mut.status === 'synced' ? '#15803D' : '#DC2626'
                    }}>
                      {mut.status === 'synced' ? '✓ RECONCILED' : 'QUEUED (LOCAL)'}
                    </span>
                  </div>

                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {mut.payload}
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between', fontSize: 10.5,
                    fontFamily: 'var(--font-mono)', color: 'var(--text-muted)'
                  }}>
                    <span>Captured: {mut.timestamp}</span>
                    <span>Buffer: {mut.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OfflineModePage;
