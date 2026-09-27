import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  orbitAngle: number;
  orbitSpeed: number;
  orbitRadius: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface ParticleConstellationProps {
  className?: string;
  style?: React.CSSProperties;
  particleCount?: number;
  connectionDistance?: number;
  theme?: 'dark' | 'light';
  accentColor?: string;
}

export const ParticleConstellation: React.FC<ParticleConstellationProps> = ({
  className = '',
  style,
  particleCount = 90,
  connectionDistance = 120,
  theme = 'light',
  accentColor = '#2563EB',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{
    x: number | null;
    y: number | null;
    prevX: number | null;
    prevY: number | null;
    vx: number;
    vy: number;
    radius: number;
    active: boolean;
  }>({
    x: null,
    y: null,
    prevX: null,
    prevY: null,
    vx: 0,
    vy: 0,
    radius: 165,
    active: false,
  });

  const shockwavesRef = useRef<Shockwave[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      width = w;
      height = h;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    // Color palette matching Antigravity video:
    // Light mode: charcoal, obsidian, slate tones
    // Dark mode: starlight white, cool silver, electric cyan
    const colors = theme === 'dark'
      ? ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#CBD5E1', '#94A3B8', '#60A5FA', '#38BDF8']
      : ['#090D16', '#0F172A', '#1E293B', '#334155', '#475569', '#64748B'];

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      const count = Math.min(particleCount, Math.max(40, Math.floor((width * height) / 8000)));
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDist = Math.max(width, height) * 0.75;

      for (let i = 0; i < count; i++) {
        const radius = Math.random() * 2.3 + 1.2;
        const distFromCenter = Math.random() * maxDist + 45;
        const angle = Math.random() * Math.PI * 2;
        const orbitSpeed = (Math.random() - 0.5) * 0.0038;

        const x = centerX + Math.cos(angle) * distFromCenter;
        const y = centerY + Math.sin(angle) * distFromCenter;

        const baseAlpha = Math.random() * 0.55 + 0.28;

        particles.push({
          x,
          y,
          homeX: x,
          homeY: y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius,
          baseRadius: radius,
          alpha: baseAlpha,
          baseAlpha,
          color: colors[Math.floor(Math.random() * colors.length)],
          orbitAngle: angle,
          orbitSpeed,
          orbitRadius: distFromCenter,
        });
      }
    };

    window.addEventListener('resize', resize);
    resize();

    // Attach pointer listeners to parent element AND window so hovering over form inputs / buttons triggers the effect!
    const targetElement = canvas.parentElement || window;

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      // Check if cursor is within canvas bounds
      if (
        currentX >= -40 &&
        currentX <= width + 40 &&
        currentY >= -40 &&
        currentY <= height + 40
      ) {
        if (mouseRef.current.prevX !== null && mouseRef.current.prevY !== null) {
          mouseRef.current.vx = (currentX - mouseRef.current.prevX) * 0.65;
          mouseRef.current.vy = (currentY - mouseRef.current.prevY) * 0.65;
        }
        mouseRef.current.prevX = currentX;
        mouseRef.current.prevY = currentY;
        mouseRef.current.x = currentX;
        mouseRef.current.y = currentY;
        mouseRef.current.active = true;
      } else {
        mouseRef.current.active = false;
        mouseRef.current.x = null;
        mouseRef.current.y = null;
      }
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = null;
      mouseRef.current.y = null;
      mouseRef.current.prevX = null;
      mouseRef.current.prevY = null;
      mouseRef.current.vx = 0;
      mouseRef.current.vy = 0;
    };

    const handlePointerDown = (e: MouseEvent | PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (currentX >= 0 && currentX <= width && currentY >= 0 && currentY <= height) {
        // Emit kinetic shockwave
        shockwavesRef.current.push({
          x: currentX,
          y: currentY,
          radius: 10,
          maxRadius: 260,
          alpha: 0.6,
        });
      }
    };

    targetElement.addEventListener('mousemove', handlePointerMove as any);
    targetElement.addEventListener('mouseleave', handlePointerLeave);
    targetElement.addEventListener('mousedown', handlePointerDown as any);

    // Subtle expanding gravitational pulse ring from center
    let centerWaveRadius = 0;
    const maxCenterWave = Math.max(width, height) * 0.85;

    // Reticle pulse state
    let reticlePhase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const mouse = mouseRef.current;

      // Decay mouse velocity
      mouse.vx *= 0.88;
      mouse.vy *= 0.88;

      // Expand subtle gravity ripple ring
      centerWaveRadius += 0.5;
      if (centerWaveRadius > maxCenterWave) centerWaveRadius = 0;

      const waveAlpha = Math.max(0, (1 - centerWaveRadius / maxCenterWave) * 0.05);
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerWaveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = theme === 'dark' ? `rgba(96, 165, 250, ${waveAlpha})` : `rgba(15, 23, 42, ${waveAlpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Process and render active click shockwaves
      for (let s = shockwavesRef.current.length - 1; s >= 0; s--) {
        const sw = shockwavesRef.current[s];
        sw.radius += 8;
        sw.alpha = Math.max(0, (1 - sw.radius / sw.maxRadius) * 0.55);

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = theme === 'dark' ? `rgba(96, 165, 250, ${sw.alpha})` : `rgba(37, 99, 235, ${sw.alpha})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Push particles intersecting shockwave
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const distToShock = Math.hypot(p.x - sw.x, p.y - sw.y);
          if (Math.abs(distToShock - sw.radius) < 22 && distToShock > 0) {
            const push = ((sw.maxRadius - sw.radius) / sw.maxRadius) * 6;
            p.vx += ((p.x - sw.x) / distToShock) * push;
            p.vy += ((p.y - sw.y) / distToShock) * push;
          }
        }

        if (sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(s, 1);
        }
      }

      // Render interactive cursor magnetic reticle & field boundary
      if (mouse.active && mouse.x !== null && mouse.y !== null) {
        reticlePhase += 0.06;
        const pulseR = 18 + Math.sin(reticlePhase) * 4;

        // Outer delicate gravitational influence perimeter
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.strokeStyle = theme === 'dark' ? 'rgba(96, 165, 250, 0.08)' : 'rgba(37, 99, 235, 0.06)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Inner pulsing magnetic reticle
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = theme === 'dark' ? 'rgba(96, 165, 250, 0.45)' : 'rgba(37, 99, 235, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Center focal star dot
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = theme === 'dark' ? '#60A5FA' : '#2563EB';
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // Update & render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Orbital velocity around center locus
        p.orbitAngle += p.orbitSpeed;
        const targetOrbitX = centerX + Math.cos(p.orbitAngle) * p.orbitRadius;
        const targetOrbitY = centerY + Math.sin(p.orbitAngle) * p.orbitRadius;

        // Elastic return toward orbital path
        const homeSpring = 0.0028;
        p.vx += (targetOrbitX - p.x) * homeSpring;
        p.vy += (targetOrbitY - p.y) * homeSpring;

        // 2. TRUE ANTIGRAVITY MOUSE HOVER PHYSICS (VORTEX, REPULSION, MOMENTUM)
        if (mouse.active && mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius && dist > 1) {
            const normX = dx / dist;
            const normY = dy / dist;
            const force = (1 - dist / mouse.radius);

            // A) Radial repulsion: Pushes away smoothly
            const repelMagnitude = force * 4.6;
            p.vx += normX * repelMagnitude * 0.22;
            p.vy += normY * repelMagnitude * 0.22;

            // B) Tangential magnetic vortex swirl: causes particles to spiral around cursor!
            const tangentX = -normY;
            const tangentY = normX;
            const vortexStrength = force * 3.4;
            p.vx += tangentX * vortexStrength * 0.16;
            p.vy += tangentY * vortexStrength * 0.16;

            // C) Kinetic momentum transfer: fast mouse movement flings particles with velocity!
            const mouseSpeed = Math.hypot(mouse.vx, mouse.vy);
            if (mouseSpeed > 0.8) {
              p.vx += mouse.vx * force * 0.12;
              p.vy += mouse.vy * force * 0.12;
            }

            // D) Proximity scaling & illumination glow
            p.radius += (p.baseRadius * (1 + force * 1.6) - p.radius) * 0.15;
            p.alpha += (Math.min(1.0, p.baseAlpha + force * 0.65) - p.alpha) * 0.15;

            // E) DIRECT CONSTELLATION FILAMENTS TO THE MOUSE CURSOR!
            const filamentAlpha = (1 - dist / mouse.radius) * (theme === 'dark' ? 0.42 : 0.3);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = theme === 'dark' ? '#93C5FD' : '#2563EB';
            ctx.globalAlpha = filamentAlpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          } else {
            // Decay back to base radius & base alpha
            p.radius += (p.baseRadius - p.radius) * 0.05;
            p.alpha += (p.baseAlpha - p.alpha) * 0.05;
          }
        } else {
          p.radius += (p.baseRadius - p.radius) * 0.05;
          p.alpha += (p.baseAlpha - p.alpha) * 0.05;
        }

        // Apply friction damping (silky smooth motion)
        p.vx *= 0.94;
        p.vy *= 0.94;

        // Position integration
        p.x += p.vx;
        p.y += p.vy;

        // Boundary wrap-around
        if (p.x < -30) p.x = width + 30;
        else if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        else if (p.y > height + 30) p.y = -30;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Connect nearby particles to each other (whisper-thin hairline lines)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);

          if (dist < connectionDistance) {
            const lineAlpha = (1 - dist / connectionDistance) * (theme === 'dark' ? 0.22 : 0.16);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = theme === 'dark' ? '#CBD5E1' : '#1E293B';
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      targetElement.removeEventListener('mousemove', handlePointerMove as any);
      targetElement.removeEventListener('mouseleave', handlePointerLeave);
      targetElement.removeEventListener('mousedown', handlePointerDown as any);
    };
  }, [particleCount, connectionDistance, theme, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`particle-constellation-canvas ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Allows hover and clicks to reach interactive form while parent tracks mouse!
        ...style,
      }}
    />
  );
};

export default ParticleConstellation;
