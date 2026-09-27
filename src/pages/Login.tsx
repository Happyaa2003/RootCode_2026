import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Navigation, Lock, Mail, ArrowRight, ShieldCheck,
  Sun, Moon, Radio, Activity, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import ParticleConstellation from '../components/common/ParticleConstellation';
import TypewriterText from '../components/common/TypewriterText';

interface LoginProps {
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

export const Login: React.FC<LoginProps> = ({ theme = 'dark', onThemeToggle }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { currency, setCurrency } = useCurrency();

  const [email, setEmail] = useState('kamal.perera@waypointroot.com');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typewriterPhrases = [
    'Experience next-gen logistics with Waypoint Root',
    'Autonomous delivery routing across Sri Lanka',
    'ETA precision & real-time fuel cost control',
    'Empowering 120 retail outlets in 9 provinces',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your operational work email');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email);
      setTimeout(() => {
        navigate('/planner');
      }, 350);
    } catch {
      setError('Authentication failed. Check credentials.');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, role: any, depot: string) => {
    setEmail(demoEmail);
    setLoading(true);
    await login(demoEmail, role, depot);
    setTimeout(() => {
      navigate('/planner');
    }, 300);
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
            transition: 'transform 10s ease',
          }}
        />

        {/* Ambient Twilight Gradient Overlay for Rich Depth */}
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
              9 Provinces Active
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
            <span>60 Multi-Temp Vehicles Online</span>
          </div>
        </div>

        {/* Center / Bottom Sri Lanka Showcase Info Cards */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 520, marginTop: 'auto', marginBottom: 20 }}>
          {/* Holographic GPS Telemetry Overlay Box */}
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
                  Sri Lanka National Transport Arterials
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
                LIVE DISPATCH
              </span>
            </div>

            <p style={{ fontSize: 12.5, color: '#CBD5E1', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Connected along the A1 Kandy Highway, E01 Southern Expressway, A3 Coastal, and Northern Arterials with dynamic route calculation and temperature-controlled SLA monitoring.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: 11 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 10px', borderRadius: 6 }}>
                <div style={{ color: '#94A3B8', fontSize: 10 }}>National Network</div>
                <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 13, marginTop: 2 }}>120 Outlets</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 10px', borderRadius: 6 }}>
                <div style={{ color: '#94A3B8', fontSize: 10 }}>Active Fleet</div>
                <div style={{ fontWeight: 700, color: '#60A5FA', fontSize: 13, marginTop: 2 }}>60 Vehicles</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 10px', borderRadius: 6 }}>
                <div style={{ color: '#94A3B8', fontSize: 10 }}>On-Time Rate</div>
                <div style={{ fontWeight: 700, color: '#34D399', fontSize: 13, marginTop: 2 }}>98.4% SLA</div>
              </div>
            </div>
          </div>

          {/* Quick Feature Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: '#CBD5E1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={13} color="#34D399" />
              <span>Dual Currency (USD & LKR)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={13} color="#34D399" />
              <span>Multi-Temp Telemetry</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={13} color="#34D399" />
              <span>Dynamic Sri Lanka Map</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ position: 'relative', zIndex: 10, fontSize: 11, color: '#64748B' }}>
          Waypoint Root v2.4 · Sri Lanka Islandwide Dispatch
        </div>
      </div>

      {/* ─── RIGHT SIDE: Antigravity-Style Dynamic Particle Animation & Login Screen ─── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 52px',
          background: theme === 'dark' ? '#070B16' : '#FAFAFC',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* IDENTIFIED ANIMATION EFFECT: Particle Constellation Canvas from Antigravity video */}
        <ParticleConstellation
          particleCount={70}
          connectionDistance={105}
          theme={theme === 'dark' ? 'dark' : 'light'}
          style={{ opacity: theme === 'dark' ? 0.75 : 0.45 }}
        />

        {/* Subtle Radial Glow in Center */}
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

        {/* ─── Top Header: Logo, Currency Selector, Theme Toggle ─── */}
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
            {/* Currency Selector (USD vs LKR) */}
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

        {/* ─── Center Login Form with Antigravity-Style Typography & Typewriter ─── */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 440, width: '100%', margin: '28px auto' }}>
          {/* Antigravity Badge Style */}
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
              <span style={{ fontSize: 9 }}>▲</span> WAYPOINT ROOT · SRI LANKA AI
            </span>
          </div>

          {/* IDENTIFIED DYNAMIC TYPING HEADLINE EFFECT from video 2026-09-27 10-00-42.mp4 */}
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
              Sign in to access real-time dispatch telemetry, route optimizer, and cost analytics.
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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
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
                  placeholder="name@waypointroot.com"
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
                    transition: 'border 0.15s ease',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#2563EB')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <a href="#forgot" style={{ fontSize: 11, color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 11 }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
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
                    transition: 'border 0.15s ease',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#2563EB')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#2563EB', cursor: 'pointer' }}
                />
                <span>Keep dispatch session active (24h)</span>
              </label>
            </div>

            {/* Antigravity-Style Pill Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                padding: '12px 20px',
                borderRadius: 24,
                border: 'none',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 18px rgba(15, 23, 42, 0.35)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 22px rgba(15, 23, 42, 0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(15, 23, 42, 0.35)';
              }}
            >
              {loading ? (
                <span>Authenticating Terminal...</span>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Operational Demo Roles for Sri Lanka */}
          <div style={{ marginTop: 26 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 10,
                letterSpacing: '0.04em',
              }}
            >
              <span>1-Click Sri Lanka Operational Demo Roles</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { role: 'Dispatcher', name: 'Kamal Perera', email: 'kamal.perera@waypointroot.com', depot: 'Western Province Dispatch' },
                { role: 'Planner', name: 'Anura Jayasinghe', email: 'anura.j@waypointroot.com', depot: 'National Route Planning' },
                { role: 'Fleet Manager', name: 'Suneth Bandara', email: 'suneth.b@waypointroot.com', depot: 'Vehicle Telemetry & Maintenance' },
                { role: 'Admin', name: 'Sanduni Fernando', email: 'sanduni.f@waypointroot.com', depot: 'National Executive HQ' },
              ].map(u => (
                <button
                  key={u.role}
                  type="button"
                  onClick={() => handleQuickLogin(u.email, u.role, u.depot)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backdropFilter: 'blur(6px)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.background = 'rgba(37, 99, 235, 0.04)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--bg-surface)';
                  }}
                >
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-primary)' }}>{u.role}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 22, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            Need an enterprise dispatcher account?{' '}
            <Link to="/signup" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </div>
        </div>

        {/* ─── Footer ─── */}
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

export default Login;
