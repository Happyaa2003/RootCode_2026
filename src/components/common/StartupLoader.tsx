import React, { useState, useEffect } from 'react';
import { Navigation, Radio } from 'lucide-react';
import ParticleConstellation from './ParticleConstellation';

interface StartupLoaderProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const StartupLoader: React.FC<StartupLoaderProps> = ({ onComplete, forceShow = false }) => {
  const [visible, setVisible] = useState(() => {
    if (forceShow) return true;
    return !sessionStorage.getItem('waypoint_startup_shown');
  });

  const [progress, setProgress] = useState(12);
  const [statusText, setStatusText] = useState('Connecting to Sri Lanka National Telemetry Network...');
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!visible) {
      onComplete?.();
      return;
    }

    const milestones = [
      { pct: 35, text: 'Mapping 120 Retail Outlets across 9 Provinces...' },
      { pct: 68, text: 'Synchronizing 60 Multi-Temp Fleet Vehicles...' },
      { pct: 88, text: 'Calibrating A1, E01 & A3 Ceylon Route Corridors...' },
      { pct: 100, text: 'Waypoint Root Intelligent Dispatch Ready.' },
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < milestones.length) {
        setProgress(milestones[step].pct);
        setStatusText(milestones[step].text);
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setFadingOut(true);
          sessionStorage.setItem('waypoint_startup_shown', 'true');
          setTimeout(() => {
            setVisible(false);
            onComplete?.();
          }, 450);
        }, 350);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#070B16',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.45s ease, transform 0.45s ease',
        transform: fadingOut ? 'scale(1.02)' : 'scale(1)',
        pointerEvents: fadingOut ? 'none' : 'auto',
        userSelect: 'none',
      }}
    >
      {/* Background Particle Constellation */}
      <ParticleConstellation particleCount={85} theme="dark" />

      {/* Central Glowing Emblem & Rings */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {/* Pulsing Concentric Rings */}
        <div
          style={{
            position: 'absolute',
            width: 140,
            height: 140,
            borderRadius: '50%',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            animation: 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: '50%',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            animation: 'pulse 1.8s infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Center Logo Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(37, 99, 235, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            marginBottom: 24,
          }}
        >
          <Navigation size={32} fill="#fff" color="#fff" style={{ transform: 'rotate(45deg)' }} />
        </div>

        {/* Brand Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#F8FAFC' }}>
            Waypoint Root
          </span>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
              background: 'rgba(37, 99, 235, 0.25)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              color: '#93C5FD',
            }}
          >
            CEYLON AI
          </span>
        </div>

        {/* Dynamic Status Text */}
        <div
          style={{
            fontSize: 13,
            color: '#94A3B8',
            height: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 20,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Radio size={12} color="#34D399" style={{ animation: 'pulse 1s infinite' }} />
          <span>{statusText}</span>
        </div>

        {/* High-Precision Progress Bar */}
        <div
          style={{
            width: 240,
            height: 4,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 70%, #34D399 100%)',
              borderRadius: 2,
              transition: 'width 0.28s ease',
              boxShadow: '0 0 10px #60A5FA',
            }}
          />
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            color: '#64748B',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {progress}%
        </div>
      </div>

      {/* Quick Skip button */}
      <button
        onClick={() => {
          setFadingOut(true);
          sessionStorage.setItem('waypoint_startup_shown', 'true');
          setTimeout(() => {
            setVisible(false);
            onComplete?.();
          }, 200);
        }}
        style={{
          position: 'absolute',
          bottom: 24,
          background: 'none',
          border: 'none',
          color: '#64748B',
          fontSize: 11,
          cursor: 'pointer',
          padding: '6px 12px',
          textDecoration: 'underline',
          zIndex: 10,
        }}
      >
        Skip startup animation →
      </button>
    </div>
  );
};

export default StartupLoader;
