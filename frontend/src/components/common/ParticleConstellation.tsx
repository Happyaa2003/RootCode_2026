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
  connectionDistance = 125,
  theme = 'light',
  accentColor = '#2563EB',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{
    x: number | null;
    y: number | null;
    radius: number;
    active: boolean;
  }>({
    x: null,
    y: null,
    radius: 150,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    // High-visibility, vibrant color palettes tailored for both dark & light backgrounds
    const colors = theme === 'dark'
      ? ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#CBD5E1', '#94A3B8', '#60A5FA', '#38BDF8']
      : ['#2563EB', '#1D4ED8', '#0284C7', '#0EA5E9', '#3B82F6', '#4F46E5', '#1E293B', '#334155'];

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      const count = Math.min(particleCount, Math.max(40, Math.floor((width * height) / 8500)));

      // Jittered grid layout produces a natural, well-spaced constellation field
      const cols = Math.max(3, Math.ceil(Math.sqrt((count * width) / Math.max(1, height))));
      const rows = Math.max(3, Math.ceil(count / cols));
      const cellW = width / cols;
      const cellH = height / rows;

      let created = 0;
      for (let r = 0; r < rows && created < count; r++) {
        for (let c = 0; c < cols && created < count; c++) {
          const jitterX = (Math.random() - 0.5) * cellW * 0.75;
          const jitterY = (Math.random() - 0.5) * cellH * 0.75;
          const homeX = Math.max(16, Math.min(width - 16, (c + 0.5) * cellW + jitterX));
          const homeY = Math.max(16, Math.min(height - 16, (r + 0.5) * cellH + jitterY));

          // In light mode, provide generous, crisp radii and high alpha for clear visibility
          const radius = theme === 'dark'
            ? Math.random() * 1.8 + 1.2
            : Math.random() * 2.2 + 2.0;

          const baseAlpha = theme === 'dark'
            ? Math.random() * 0.45 + 0.35
            : Math.random() * 0.35 + 0.65; // High visibility 0.65 to 1.0 on white/light background

          particles.push({
            x: homeX,
            y: homeY,
            homeX,
            homeY,
            vx: 0,
            vy: 0,
            radius,
            baseRadius: radius,
            alpha: baseAlpha,
            baseAlpha,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
          created++;
        }
      }
    };

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

    window.addEventListener('resize', resize);
    resize();

    // Track mouse interaction over the parent container
    const targetElement = canvas.parentElement || window;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (
        currentX >= -20 &&
        currentX <= width + 20 &&
        currentY >= -20 &&
        currentY <= height + 20
      ) {
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
    };

    targetElement.addEventListener('mousemove', handlePointerMove as any);
    targetElement.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('blur', handlePointerLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const hasMouse = mouse.active && mouse.x !== null && mouse.y !== null;

      // Update & render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // MOUSE HOVER REPULSION & ILLUMINATION:
        if (hasMouse) {
          const dx = p.x - mouse.x!;
          const dy = p.y - mouse.y!;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius && dist > 0.001) {
            const factor = 1 - dist / mouse.radius;
            // Smooth quadratic repulsion: gentle and fluid
            const repelMagnitude = factor * factor * 2.8;
            p.vx += (dx / dist) * repelMagnitude;
            p.vy += (dy / dist) * repelMagnitude;

            // Proximity scaling & illumination
            p.radius += (p.baseRadius * (1 + factor * 1.1) - p.radius) * 0.12;
            p.alpha += (Math.min(1.0, p.baseAlpha + factor * 0.35) - p.alpha) * 0.12;

            // Direct constellation filament connecting particle to mouse cursor
            const filamentAlpha = factor * (theme === 'dark' ? 0.42 : 0.48);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x!, mouse.y!);
            ctx.strokeStyle = theme === 'dark' ? '#93C5FD' : '#2563EB';
            ctx.globalAlpha = filamentAlpha;
            ctx.lineWidth = theme === 'dark' ? 0.85 : 1.25;
            ctx.stroke();
          } else {
            p.radius += (p.baseRadius - p.radius) * 0.06;
            p.alpha += (p.baseAlpha - p.alpha) * 0.06;
          }
        } else {
          p.radius += (p.baseRadius - p.radius) * 0.06;
          p.alpha += (p.baseAlpha - p.alpha) * 0.06;
        }

        // Return to home position via smooth spring physics
        const dxHome = p.homeX - p.x;
        const dyHome = p.homeY - p.y;
        const spring = 0.038;
        p.vx += dxHome * spring;
        p.vy += dyHome * spring;

        // Damping to eliminate flutter and settle smoothly
        p.vx *= 0.85;
        p.vy *= 0.85;

        // Position update
        p.x += p.vx;
        p.y += p.vy;

        // Rest snap when near home and velocity is minimal
        if (!hasMouse || Math.hypot(p.x - mouse.x!, p.y - mouse.y!) >= mouse.radius) {
          if (Math.hypot(dxHome, dyHome) < 0.08 && Math.hypot(p.vx, p.vy) < 0.015) {
            p.x = p.homeX;
            p.y = p.homeY;
            p.vx = 0;
            p.vy = 0;
          }
        }

        // Connect nearby particles to each other with clean geometric constellation lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);

          if (dist < connectionDistance) {
            const lineAlpha = (1 - dist / connectionDistance) * (theme === 'dark' ? 0.28 : 0.38);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = theme === 'dark' ? '#CBD5E1' : '#2563EB';
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = theme === 'dark' ? 0.75 : 1.15;
            ctx.stroke();
          }
        }

        // Render soft halo aura on light background for enhanced tech aesthetic
        if (theme !== 'dark') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius + 3, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.18;
          ctx.fill();
        }

        // Render particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      // Render subtle cursor focal dot
      if (hasMouse) {
        ctx.beginPath();
        ctx.arc(mouse.x!, mouse.y!, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = theme === 'dark' ? '#60A5FA' : accentColor;
        ctx.globalAlpha = 0.85;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mouse.x!, mouse.y!, 7, 0, Math.PI * 2);
        ctx.strokeStyle = theme === 'dark' ? 'rgba(96, 165, 250, 0.45)' : 'rgba(37, 99, 235, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
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
      window.removeEventListener('blur', handlePointerLeave);
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
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
};

export default ParticleConstellation;
