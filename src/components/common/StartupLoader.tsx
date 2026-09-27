import React, { useState, useEffect } from 'react';
import { Navigation, Radio, ChevronRight } from 'lucide-react';
import ParticleConstellation from './ParticleConstellation';

interface StartupLoaderProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const StartupLoader: React.FC<StartupLoaderProps> = ({ onComplete, forceShow = false }) => {
  const [visible, setVisible] = useState(() => {
    if (forceShow) return true;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('liftoff') === 'true') return true;
    // Show on initial session or if not marked as skipped in this session
    return !sessionStorage.getItem('waypoint_liftoff_completed');
  });

  const [progress, setProgress] = useState(8);
  const [stepIndex, setStepIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  // Expose replay trigger globally for convenience
  useEffect(() => {
    (window as any).replayWaypointStartup = () => {
      sessionStorage.removeItem('waypoint_liftoff_completed');
      setProgress(8);
      setStepIndex(0);
      setFadingOut(false);
      setVisible(true);
    };
  }, []);

  const telemetrySteps = [
    {
      code: 'STAGE 01',
      title: 'Calibrating 9 Sri Lankan Provincial Dispatch Hubs',
      detail: 'Western (Peliyagoda HQ), Central (Kandy), Southern (Galle), Northern (Jaffna)',
      targetPct: 32,
    },
    {
      code: 'STAGE 02',
      title: 'Establishing Fleet Telemetry · 60 Multi-Temp Vehicles',
      detail: 'GPS Tracers, Chilled & Frozen Multi-Compartment Temp Sensors Online',
      targetPct: 64,
    },
    {
      code: 'STAGE 03',
      title: 'Mapping 120 Retail Outlets & Ceylon Highway Corridors',
      detail: 'A1 Kandy Arterial, E01 Southern Expressway, A3 Coastal, A9 Northern',
      targetPct: 88,
    },
    {
      code: 'STAGE 04',
      title: 'Neural Route Engine Online · Experience Liftoff',
      detail: 'Dynamic Time Windows, Fuel Surcharge Model & Parity Synchronized',
      targetPct: 100,
    },
  ];

  useEffect(() => {
    if (!visible) {
      onComplete?.();
      return;
    }

    let currentStep = 0;
    const stepDuration = 550; // smooth pacing

    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < telemetrySteps.length) {
        setStepIndex(currentStep);
        setProgress(telemetrySteps[currentStep].targetPct);
      } else {
        clearInterval(stepInterval);
        setProgress(100);
        setTimeout(() => {
          setFadingOut(true);
          sessionStorage.setItem('waypoint_liftoff_completed', 'true');
          setTimeout(() => {
            setVisible(false);
            onComplete?.();
          }, 450);
        }, 400);
      }
    }, stepDuration);

    return () => clearInterval(stepInterval);
  }, [visible, onComplete]);

  const handleSkip = () => {
    setFadingOut(true);
    sessionStorage.setItem('waypoint_liftoff_completed', 'true');
    setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 200);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#040711',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: fadingOut ? 'scale(1.03)' : 'scale(1)',
        pointerEvents: fadingOut ? 'none' : 'auto',
        userSelect: 'none',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Background Interactive Antigravity Particle Constellation */}
      <ParticleConstellation
        particleCount={95}
        connectionDistance={125}
        theme="dark"
        style={{ opacity: 0.85 }}
      />

      {/* Atmospheric Center Glow */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      {/* Central Liftoff HUD Matrix */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
          maxWidth: '560px',
          width: '90%',
          textAlign: 'center',
        }}
      >
        {/* Holographic Radar Compass Rings */}
        <div
          style={{
            position: 'relative',
            width: 140,
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
          }}
        >
          {/* Outer Pulsing Wave Ring */}
          <div
            style={{
              position: 'absolute',
              inset: -12,
              borderRadius: '50%',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              animation: 'ping 2.6s cubic-bezier(0, 0, 0.2, 1) infinite',
              pointerEvents: 'none',
            }}
          />

          {/* Rotating Compass Tick Marks Ring */}
          <div
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: '50%',
              border: '1px dashed rgba(96, 165, 250, 0.4)',
              animation: 'radarSpin 12s linear infinite',
              pointerEvents: 'none',
            }}
          />

          {/* Secondary Concentric Ring */}
          <div
            style={{
              position: 'absolute',
              inset: 12,
              borderRadius: '50%',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              pointerEvents: 'none',
            }}
          />

          {/* Center Glowing Waypoint Root Emblem */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 55%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 50px rgba(37, 99, 235, 0.65), inset 0 1px 2px rgba(255, 255, 255, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <Navigation
              size={36}
              fill="#FFFFFF"
              color="#FFFFFF"
              style={{ transform: 'rotate(45deg)', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
            />
          </div>
        </div>

        {/* Antigravity Badge */}
        <div style={{ marginBottom: 12 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 9999,
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              background: 'rgba(37, 99, 235, 0.14)',
              border: '1px solid rgba(59, 130, 246, 0.45)',
              color: '#93C5FD',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
          >
            <span style={{ fontSize: 9 }}>▲</span> WAYPOINT ROOT · SRI LANKA AI LOGISTICS
          </span>
        </div>

        {/* Dynamic Title */}
        <h1
          style={{
            fontSize: 'clamp(24px, 4vw, 34px)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            margin: '0 0 10px 0',
            color: '#F8FAFC',
            lineHeight: 1.15,
          }}
        >
          Experience Liftoff
        </h1>

        <p
          style={{
            fontSize: 13.5,
            color: '#94A3B8',
            margin: '0 0 24px 0',
            lineHeight: 1.5,
            maxWidth: 460,
          }}
        >
          Initializing nationwide autonomous delivery routing, multi-temp vehicle tracking, and SLA cost optimization across Sri Lanka.
        </p>

        {/* Active Telemetry Stage Box */}
        <div
          style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 20,
            backdropFilter: 'blur(12px)',
            textAlign: 'left',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={13} color="#34D399" style={{ animation: 'pulse 1.4s infinite' }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: '#38BDF8', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                {telemetrySteps[stepIndex]?.code}
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#34D399', fontFamily: 'var(--font-mono)' }}>
              {progress}% CALIBRATED
            </span>
          </div>

          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF', marginBottom: 4, letterSpacing: '-0.01em' }}>
            {telemetrySteps[stepIndex]?.title}
          </div>

          <div style={{ fontSize: 11.5, color: '#94A3B8', lineHeight: 1.4 }}>
            {telemetrySteps[stepIndex]?.detail}
          </div>
        </div>

        {/* High-Precision Glowing Progress Bar */}
        <div
          style={{
            width: '100%',
            height: 6,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 9999,
            overflow: 'hidden',
            position: 'relative',
            marginBottom: 22,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #2563EB 0%, #06B6D4 60%, #10B981 100%)',
              borderRadius: 9999,
              transition: 'width 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.8)',
            }}
          />
        </div>

        {/* Antigravity Pill Skip Button */}
        <button
          type="button"
          onClick={handleSkip}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '9px 20px',
            borderRadius: 9999,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#E2E8F0',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.color = '#E2E8F0';
          }}
        >
          <span>Enter Terminal Now</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Bottom Coordinates & System Telemetry Ticker */}
      <div
        style={{
          position: 'absolute',
          bottom: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 11,
          color: '#64748B',
          fontFamily: 'var(--font-mono)',
          zIndex: 10,
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '0 20px',
        }}
      >
        <span>DEPOT: PELIYAGODA HQ (06°57′N, 79°53′E)</span>
        <span>•</span>
        <span>CORRIDORS: A1 · E01 · A3 · A9</span>
        <span>•</span>
        <span>AI ENGINE: CEYLON-V2.4</span>
      </div>
    </div>
  );
};

export default StartupLoader;
