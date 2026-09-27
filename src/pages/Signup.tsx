import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Navigation, Lock, Mail, User, ArrowRight,
  ShieldCheck, Sun, Moon, Radio, Activity, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import type { UserProfile } from '../types';
import ParticleConstellation from '../components/common/ParticleConstellation';
import TypewriterText from '../components/common/TypewriterText';

interface SignupProps {
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

export const Signup: React.FC<SignupProps> = ({ theme = 'dark', onThemeToggle }) => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { currency, setCurrency } = useCurrency();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('Dispatcher');
  const [depot, setDepot] = useState('Colombo Central Dispatch Hub');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typewriterPhrases = [
    'Join Sri Lanka\'s next-gen dispatch network',
    'Automated routing for 120 retail outlets',
    'Real-time SLA telemetry & cost intelligence',
    'Autonomous delivery optimization across Ceylon',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required operational profile fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signup(name, email, role, depot);
      setTimeout(() => {
        navigate('/planner');
      }, 350);
    } catch {
      setError('Could not complete account creation.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
      }}
      className="waypoint-login-wrapper"
    >
      {/* ─── LEFT SIDE: Sri Lanka Delivery Vehicle Hero Image & National Logistics Telemetry ─── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '44px 48px',
          background: '#0B1120',
          color: '#F8FAFC',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Background Image: High-res Sri Lanka Delivery Fleet Highway Hero */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('/sri_lanka_delivery_hero.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            opacity: 0.85,
            filter: 'contrast(1.15) saturate(1.1)',
          }}
        />

        {/* Ambient Twilight Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(11, 17, 32, 0.75) 0%, rgba(15, 23, 42, 0.45) 45%, rgba(2, 6, 23, 0.92) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Badges */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                color: '#93C5FD',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.04em',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
              }}
            >
              <Radio size={12} color="#60A5FA" style={{ animation: 'pulse 1.8s infinite' }} />
              <span>SRI LANKA LOGISTICS FLEET</span>
            </span>

            <span
              style={{
                fontSize: 11,
                color: '#CBD5E1',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '5px 12px',
                borderRadius: 20,
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
              }}
            >
              Islandwide Network
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: '#CBD5E1',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(15, 23, 42, 0.65)',
              padding: '4px 10px',
              borderRadius: 6,
              backdropFilter: 'blur(6px)',
            }}
          >
            <Activity size={13} color="#34D399" />
            <span>60 Active Vehicles</span>
          </div>
        </div>

        {/* Center / Bottom Info Box */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 520, marginTop: 'auto', marginBottom: 20 }}>
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.82)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              borderRadius: 14,
              padding: '20px 22px',
              backdropFilter: 'blur(18px)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#34D399',
                    boxShadow: '0 0 10px #34D399',
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  Sri Lanka National Transport Hubs
                </span>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'rgba(37, 99, 235, 0.3)',
                  color: '#93C5FD',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                }}
              >
                OPERATIONAL
              </span>
            </div>

            <p style={{ fontSize: 12.5, color: '#CBD5E1', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Create an operator credential to manage multi-temperature cargo distribution, fuel quota allocation, and automated dock turnarounds across Western, Central, and Southern routes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: 11 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 10px', borderRadius: 6 }}>
                <div style={{ color: '#94A3B8', fontSize: 10 }}>National Network</div>
                <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 13, marginTop: 2 }}>120 Outlets</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 10px', borderRadius: 6 }}>
                <div style={{ color: '#94A3B8', fontSize: 10 }}>Fleet Size</div>
                <div style={{ fontWeight: 700, color: '#60A5FA', fontSize: 13, marginTop: 2 }}>60 Vehicles</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 10px', borderRadius: 6 }}>
                <div style={{ color: '#94A3B8', fontSize: 10 }}>SLA Precision</div>
                <div style={{ fontWeight: 700, color: '#34D399', fontSize: 13, marginTop: 2 }}>98.4% On Time</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: '#CBD5E1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={13} color="#34D399" />
              <span>Dual Currency (USD & LKR)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={13} color="#34D399" />
              <span>Dock Matrix Intelligence</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={13} color="#34D399" />
              <span>All 9 Provinces</span>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, fontSize: 11, color: '#64748B' }}>
          Waypoint Root v2.4 · Sri Lanka Islandwide Dispatch
        </div>
      </div>

      {/* ─── RIGHT SIDE: Antigravity-Style Dynamic Particle Animation & Signup Screen ─── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 52px',
          background: theme === 'dark' ? '#040711' : '#FFFFFF',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* IDENTIFIED ANIMATION EFFECT: Particle Constellation Canvas */}
        <ParticleConstellation
          particleCount={85}
          connectionDistance={115}
          theme={theme === 'dark' ? 'dark' : 'light'}
          style={{ opacity: theme === 'dark' ? 0.8 : 0.65 }}
        />

        {/* Center Glow */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: theme === 'dark'
              ? 'radial-gradient(circle, rgba(37, 99, 235, 0.14) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Header */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              <Navigation size={17} fill="#fff" color="#fff" style={{ transform: 'rotate(45deg)' }} />
            </div>
            <span
              style={{
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--text-primary)',
              }}
            >
              Waypoint Root
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 4,
                background: 'rgba(37, 99, 235, 0.12)',
                color: '#2563EB',
                border: '1px solid rgba(37, 99, 235, 0.25)',
              }}
            >
              PRO
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Currency Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-subtle)',
                borderRadius: 20,
                padding: '3px',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                style={{
                  padding: '3px 9px',
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 16,
                  border: 'none',
                  cursor: 'pointer',
                  background: currency === 'USD' ? '#2563EB' : 'transparent',
                  color: currency === 'USD' ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                $ USD
              </button>
              <button
                type="button"
                onClick={() => setCurrency('LKR')}
                style={{
                  padding: '3px 9px',
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 16,
                  border: 'none',
                  cursor: 'pointer',
                  background: currency === 'LKR' ? '#2563EB' : 'transparent',
                  color: currency === 'LKR' ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                Rs. LKR
              </button>
            </div>

            {onThemeToggle && (
              <button
                type="button"
                onClick={onThemeToggle}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  padding: '6px 9px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                }}
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={13} color="#F59E0B" /> : <Moon size={13} />}
              </button>
            )}
          </div>
        </div>

        {/* Center Signup Form */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 440, width: '100%', margin: '24px auto' }}>
          {/* Antigravity Badge */}
          <div style={{ marginBottom: 14 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                background: 'rgba(37, 99, 235, 0.1)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                color: '#2563EB',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span style={{ fontSize: 9 }}>▲</span> WAYPOINT ROOT · OPERATOR REGISTRATION
            </span>
          </div>

          {/* DYNAMIC TYPEWRITER EFFECT */}
          <div style={{ marginBottom: 18, minHeight: 74 }}>
            <h1
              style={{
                fontSize: 27,
                fontWeight: 800,
                margin: '0 0 8px 0',
                letterSpacing: '-0.03em',
                lineHeight: 1.25,
                color: 'var(--text-primary)',
              }}
            >
              <TypewriterText words={typewriterPhrases} typingSpeed={45} pauseTime={3000} />
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Register an operator account for Sri Lanka route planning and fleet management.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: '#FEE2E2',
                color: '#B91C1C',
                fontSize: 12,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ShieldCheck size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 11 }} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ruwan Wickramasinghe"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    fontSize: 13,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box',
                    outline: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#2563EB')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                Work Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 11 }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="r.wickrama@waypointroot.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    fontSize: 13,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box',
                    outline: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#2563EB')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                  Operational Role
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '9.5px 10px',
                    fontSize: 12.5,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  <option value="Dispatcher">Dispatcher (Live Ops)</option>
                  <option value="Planner">Route Planner</option>
                  <option value="Fleet Manager">Fleet & Fuel Manager</option>
                  <option value="Admin">Operations Admin</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                  Sri Lanka Logistics Hub
                </label>
                <select
                  value={depot}
                  onChange={e => setDepot(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9.5px 10px',
                    fontSize: 12.5,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  <option value="Colombo Central Dispatch Hub">Colombo Central Hub</option>
                  <option value="Kandy Valley Logistics Depot">Kandy Valley Hub</option>
                  <option value="Galle Southern Expressway Depot">Galle Southern Hub</option>
                  <option value="Kurunegala Junction Depot">Kurunegala Junction Hub</option>
                  <option value="National Dispatch Fleet HQ">National Fleet HQ</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                Account Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 11 }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create secure passkey (min 8 chars)"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    fontSize: 13,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box',
                    outline: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#2563EB')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            {/* Antigravity Pill Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                padding: '13px 24px',
                borderRadius: 9999,
                border: 'none',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                boxShadow: '0 4px 18px rgba(15, 23, 42, 0.35)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1.5px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(15, 23, 42, 0.35)';
              }}
            >
              {loading ? (
                <span>Registering Terminal Credentials...</span>
              ) : (
                <>
                  <span>Create Operator Account</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: 22, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            Already have an active operator account?{' '}
            <Link to="/login" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
              Sign in to terminal
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          <span>Waypoint Root · Sri Lanka Logistics Intelligence</span>
          <span>v2.4 Enterprise Dispatch</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
