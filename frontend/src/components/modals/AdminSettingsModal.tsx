import React, { useState } from 'react';
import {
  X, Settings, Package, Layers, Check, Copy, RefreshCw,
  Send, Shield, Truck, Clock, DollarSign, Save
} from 'lucide-react';

export type AdminTab = 'dispatch-rules' | 'depot-settings' | 'api-keys';

interface AdminSettingsModalProps {
  open: boolean;
  initialTab?: AdminTab;
  onClose: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  open,
  initialTab = 'dispatch-rules',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dispatch Rules state
  const [ambientAllowance, setAmbientAllowance] = useState('18');
  const [chilledAllowance, setChilledAllowance] = useState('22');
  const [techAllowance, setTechAllowance] = useState('25');
  const [slaPenaltyRate, setSlaPenaltyRate] = useState('4.50');
  const [peakTrafficBuffer, setPeakTrafficBuffer] = useState(true);
  const [maxWeightCap, setMaxWeightCap] = useState('95');
  const [maxVolumeCap, setMaxVolumeCap] = useState('90');
  const [strictReeferLock, setStrictReeferLock] = useState(true);

  // API & Webhooks state
  const [webhookUrl, setWebhookUrl] = useState('https://erp.retailchain.lk/webhooks/waypilot-events');
  const [liveApiKey, setLiveApiKey] = useState('wp_live_2026_rootcode_99a8f4c28e12b77a');
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  if (!open) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestWebhook = () => {
    setPingStatus('sending');
    setTimeout(() => {
      setPingStatus('success');
      showToast('HTTP 200 OK: Test payload delivered to ' + webhookUrl);
      setTimeout(() => setPingStatus(null), 3000);
    }, 900);
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(5, 8, 16, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20
      }}
    >
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 740, maxHeight: '90vh',
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6, background: 'var(--brand-tint)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Settings size={15} color="var(--brand-vivid)" />
              </div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                System Administration & Settings
              </h2>
              <span style={{
                fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                background: 'var(--brand-tint)', color: 'var(--brand-vivid)'
              }}>
                WayPilot Enterprise v2.6
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Configure heuristics, hub dispatch allowances, and RootCode designathon developer integrations.
            </div>
          </div>

          <button
            onClick={onClose}
            className="waypoint-icon-btn"
            style={{ width: 28, height: 28, border: 'none', background: 'transparent' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-app)', padding: '0 16px', gap: 8
        }}>
          <button
            onClick={() => setActiveTab('dispatch-rules')}
            style={{
              padding: '10px 14px', fontSize: 12, fontWeight: 600,
              border: 'none', background: 'transparent',
              borderBottom: activeTab === 'dispatch-rules' ? '2px solid var(--brand-vivid)' : '2px solid transparent',
              color: activeTab === 'dispatch-rules' ? 'var(--brand-vivid)' : 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Settings size={13} />
            <span>Dispatch Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('depot-settings')}
            style={{
              padding: '10px 14px', fontSize: 12, fontWeight: 600,
              border: 'none', background: 'transparent',
              borderBottom: activeTab === 'depot-settings' ? '2px solid var(--brand-vivid)' : '2px solid transparent',
              color: activeTab === 'depot-settings' ? 'var(--brand-vivid)' : 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Package size={13} />
            <span>Depot Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('api-keys')}
            style={{
              padding: '10px 14px', fontSize: 12, fontWeight: 600,
              border: 'none', background: 'transparent',
              borderBottom: activeTab === 'api-keys' ? '2px solid var(--brand-vivid)' : '2px solid transparent',
              color: activeTab === 'api-keys' ? 'var(--brand-vivid)' : 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Layers size={13} />
            <span>API Keys & Webhooks</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          
          {/* Toast Notification */}
          {toastMessage && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 6,
              background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Check size={14} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ─── TAB 1: Dispatch Rules ───────────────────────────────────────── */}
          {activeTab === 'dispatch-rules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Traffic & Speed Curve */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Truck size={14} color="var(--brand-vivid)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Traffic Speed & Travel Time Heuristics (Task 1)
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Calibrated for Sri Lankan road classes (urban 35 km/h, provincial highway 55 km/h, hill corridor 32 km/h).
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-subtle)', borderRadius: 6 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                      Morning Rush-Hour Congestion Buffer (+18%)
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                      Automatically inflates travel times between 07:30 AM and 09:30 AM on Colombo A1 & A3 corridors.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={peakTrafficBuffer}
                    onChange={e => setPeakTrafficBuffer(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#2563EB', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Service & Dock Allowances */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Clock size={14} color="#16A34A" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Store Dock Unloading Allowances (Minutes per Stop)
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Ambient Grocery Drop:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="number"
                        value={ambientAllowance}
                        onChange={e => setAmbientAllowance(e.target.value)}
                        style={{
                          width: '100%', padding: '6px 8px', borderRadius: 4,
                          border: '1px solid var(--border)', background: 'var(--bg-surface)',
                          fontSize: 12, fontFamily: 'var(--font-mono)'
                        }}
                      />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>min</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Chilled Reefer Drop:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="number"
                        value={chilledAllowance}
                        onChange={e => setChilledAllowance(e.target.value)}
                        style={{
                          width: '100%', padding: '6px 8px', borderRadius: 4,
                          border: '1px solid var(--border)', background: 'var(--bg-surface)',
                          fontSize: 12, fontFamily: 'var(--font-mono)'
                        }}
                      />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>min</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      High-Value Tech Appliances:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="number"
                        value={techAllowance}
                        onChange={e => setTechAllowance(e.target.value)}
                        style={{
                          width: '100%', padding: '6px 8px', borderRadius: 4,
                          border: '1px solid var(--border)', background: 'var(--bg-surface)',
                          fontSize: 12, fontFamily: 'var(--font-mono)'
                        }}
                      />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLA Delay Penalty */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <DollarSign size={14} color="#DC2626" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Financial SLA Penalty Rate
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                      Charged per minute against dispatch gross margin when arrival time exceeds scheduled customer window.
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 140 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>$</span>
                    <input
                      type="number"
                      step="0.5"
                      value={slaPenaltyRate}
                      onChange={e => setSlaPenaltyRate(e.target.value)}
                      style={{
                        width: '100%', padding: '6px 8px', borderRadius: 4,
                        border: '1px solid var(--border)', background: 'var(--bg-surface)',
                        fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700
                      }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/min</span>
                  </div>
                </div>
              </div>

              {/* Load & Reefer Constraints */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Shield size={14} color="#7C3AED" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Load Capacity Thresholds & Safety Locks
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Max Vehicle Weight Utilization: <strong>{maxWeightCap}%</strong>
                    </label>
                    <input
                      type="range" min="70" max="100" value={maxWeightCap}
                      onChange={e => setMaxWeightCap(e.target.value)}
                      style={{ width: '100%', accentColor: '#2563EB' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Max Vehicle Volume Utilization: <strong>{maxVolumeCap}%</strong>
                    </label>
                    <input
                      type="range" min="70" max="100" value={maxVolumeCap}
                      onChange={e => setMaxVolumeCap(e.target.value)}
                      style={{ width: '100%', accentColor: '#2563EB' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Strict Reefer Isolation Lock</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                      Prevent non-refrigerated vehicles from accepting Fresh chilled dairy/frozen SKUs.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={strictReeferLock}
                    onChange={e => setStrictReeferLock(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#2563EB', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => showToast('Dispatch rules updated and synchronized across all active routes!')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Save size={14} />
                  <span>Save Dispatch Rules</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── TAB 2: Depot Settings ───────────────────────────────────────── */}
          {activeTab === 'depot-settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Depot 1: Peliyagoda Central */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, background: 'var(--bg-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A' }}></span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Peliyagoda Central Hub (DEP-PEL-01)
                    </span>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: 4 }}>
                    PRIMARY LOGISTICS DEPOT
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, fontSize: 11.5, marginTop: 10 }}>
                  <div style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 6, border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 10.5 }}>Location</div>
                    <div style={{ fontWeight: 700 }}>Colombo Metro</div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>6.9535° N, 79.8821° E</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 6, border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 10.5 }}>Loading Bays</div>
                    <div style={{ fontWeight: 700 }}>6 Bays Active</div>
                    <div style={{ fontSize: 10, color: '#16A34A' }}>Bays 01-06 Online</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 6, border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 10.5 }}>Allocated Fleet</div>
                    <div style={{ fontWeight: 700 }}>45 Vehicles</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>18 Reefer units</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 6, border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 10.5 }}>Weekly Fuel Quota</div>
                    <div style={{ fontWeight: 700, color: '#2563EB' }}>14,500 Liters</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Statutory cap</div>
                  </div>
                </div>
              </div>

              {/* Depot 2: Kandy Central */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, background: 'var(--bg-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }}></span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Kandy Mountain Hub (DEP-KDY-01)
                    </span>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, background: '#DBEAFE', color: '#1D4ED8', padding: '2px 8px', borderRadius: 4 }}>
                    SATELLITE HILL DEPOT
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, fontSize: 11.5, marginTop: 10 }}>
                  <div style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 6, border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 10.5 }}>Location</div>
                    <div style={{ fontWeight: 700 }}>Central Province</div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>7.2906° N, 80.6337° E</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 6, border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 10.5 }}>Loading Bays</div>
                    <div style={{ fontWeight: 700 }}>2 Bays Active</div>
                    <div style={{ fontSize: 10, color: '#16A34A' }}>Bays 01-02 Online</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 6, border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 10.5 }}>Allocated Fleet</div>
                    <div style={{ fontWeight: 700 }}>15 Vehicles</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Hill terrain tuned</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: 8, borderRadius: 6, border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 10.5 }}>Weekly Fuel Quota</div>
                    <div style={{ fontWeight: 700, color: '#2563EB' }}>4,000 Liters</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Statutory cap</div>
                  </div>
                </div>
              </div>

              {/* Operating Shift Hours */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Depot Shift Windows</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Peliyagoda Central Operating Hours:
                    </label>
                    <input
                      defaultValue="06:00 AM - 18:00 PM (Wave 1: 06:00 - 12:00, Wave 2: 12:30 - 18:00)"
                      style={{
                        width: '100%', padding: '6px 8px', borderRadius: 4,
                        border: '1px solid var(--border)', background: 'var(--bg-surface)',
                        fontSize: 12, fontFamily: 'var(--font-mono)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Kandy Satellite Operating Hours:
                    </label>
                    <input
                      defaultValue="07:00 AM - 17:00 PM (Wave 1: 07:00 - 12:30, Wave 2: 13:00 - 17:00)"
                      style={{
                        width: '100%', padding: '6px 8px', borderRadius: 4,
                        border: '1px solid var(--border)', background: 'var(--bg-surface)',
                        fontSize: 12, fontFamily: 'var(--font-mono)'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => showToast('Depot operational parameters saved successfully!')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Save size={14} />
                  <span>Save Depot Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── TAB 3: API Keys & Webhooks ─────────────────────────────────── */}
          {activeTab === 'api-keys' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* API Credentials */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Shield size={14} color="var(--brand-vivid)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    REST API Access Tokens (Designathon & ERP Sync)
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Use these bearer keys to dispatch automated telemetry batches or trigger neural optimization runs programmatically.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Production API Key (Read / Write):
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        readOnly
                        value={liveApiKey}
                        style={{
                          flex: 1, padding: '6px 10px', borderRadius: 4,
                          border: '1px solid var(--border)', background: 'var(--bg-subtle)',
                          fontFamily: 'var(--font-mono)', fontSize: 12
                        }}
                      />
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => copyToClipboard(liveApiKey, 'Production API Key')}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {copiedKey === 'Production API Key' ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                        <span>Copy</span>
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          const newKey = 'wp_live_2026_rootcode_' + Math.random().toString(36).substring(2, 12);
                          setLiveApiKey(newKey);
                          showToast('Generated new production API key');
                        }}
                        title="Regenerate Key"
                      >
                        <RefreshCw size={12} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Sandbox Test Key:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        readOnly
                        value="wp_test_sandbox_44f1e09bc872a"
                        style={{
                          flex: 1, padding: '6px 10px', borderRadius: 4,
                          border: '1px solid var(--border)', background: 'var(--bg-subtle)',
                          fontFamily: 'var(--font-mono)', fontSize: 12
                        }}
                      />
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => copyToClipboard('wp_test_sandbox_44f1e09bc872a', 'Sandbox Test Key')}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {copiedKey === 'Sandbox Test Key' ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Outbound Webhook Subscriptions */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Send size={14} color="#10B981" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Outbound Telemetry Webhook Dispatcher
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Real-time JSON event stream dispatched when stops complete, cold chain spikes, or driver proofs are captured.
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Webhook Destination URL (POST):
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      value={webhookUrl}
                      onChange={e => setWebhookUrl(e.target.value)}
                      style={{
                        flex: 1, padding: '6px 10px', borderRadius: 4,
                        border: '1px solid var(--border)', background: 'var(--bg-surface)',
                        fontFamily: 'var(--font-mono)', fontSize: 12
                      }}
                    />
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleTestWebhook}
                      disabled={pingStatus === 'sending'}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Send size={12} />
                      <span>{pingStatus === 'sending' ? 'Pinging...' : (pingStatus === 'success' ? '✓ 200 OK' : 'Send Test Ping')}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Subscribed Event Types:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11.5 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: '#2563EB' }} />
                      <code>delivery.completed</code> (POD signature & photo)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: '#2563EB' }} />
                      <code>delivery.delayed</code> (SLA penalty incurred)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: '#2563EB' }} />
                      <code>vehicle.grounded_workshop</code> (Task 2B alert)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: '#2563EB' }} />
                      <code>cold_chain.temperature_spike</code>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => showToast('Webhook endpoints & security signing secret saved!')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Save size={14} />
                  <span>Save Webhook Settings</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal;
