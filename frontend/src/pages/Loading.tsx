import React, { useState } from 'react';
import { CheckSquare, Square, Truck } from 'lucide-react';
import { routes } from '../data/mockData';

const LoadingPage: React.FC = () => {
  const route = routes[0]; // Show Route 01 as active loading
  const [loaded, setLoaded] = useState<Set<number>>(new Set([0, 1]));

  const toggle = (i: number) => setLoaded(prev => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    return next;
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-surface)' }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 4 }}>
            Loading Bay 02
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            {route.name.replace('Route ', 'TRIP ')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
            {route.vehicle?.plate ?? '—'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
            Driver: {route.driver?.name ?? 'TBD'}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            {route.stops.length} STOPS
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{
        padding: '16px 32px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-subtle)', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 24,
      }}>
        <div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {loaded.size} / {route.stops.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>orders loaded</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 8, background: 'var(--n200)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--success)',
              width: `${Math.round((loaded.size / route.stops.length) * 100)}%`,
              borderRadius: 4, transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
            {Math.round((loaded.size / route.stops.length) * 100)}% complete
          </div>
        </div>
        {loaded.size === route.stops.length && (
          <button className="btn btn-primary" style={{ height: 44 }}>
            <Truck size={18} /> Ready to Dispatch
          </button>
        )}
      </div>

      {/* Stop checklist */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 32px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 12 }}>
          Loading Checklist
        </div>
        {route.stops.map((stop, i) => (
          <div
            key={i}
            onClick={() => toggle(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 20px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 8,
              background: loaded.has(i) ? 'var(--success-tint)' : 'var(--bg-surface)',
              borderColor: loaded.has(i) ? 'var(--success)' : 'var(--border)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Checkbox */}
            <div style={{ color: loaded.has(i) ? 'var(--success)' : 'var(--n300)' }}>
              {loaded.has(i) ? <CheckSquare size={24} /> : <Square size={24} />}
            </div>

            {/* Sequence */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: loaded.has(i) ? 'var(--success-vivid)' : 'var(--bg-muted)',
              color: loaded.has(i) ? 'white' : 'var(--text-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-mono)',
              flexShrink: 0, border: '1px solid var(--border)'
            }}>
              {String(stop.sequence).padStart(2, '0')}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 15, fontWeight: 600,
                color: loaded.has(i) ? 'var(--success)' : 'var(--text-primary)',
                textDecoration: loaded.has(i) ? 'line-through' : 'none',
              }}>
                {stop.order.outlet.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {stop.order.outlet.address}
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="tag tag-volume">{stop.order.volume} m³</span>
              <span className="tag tag-weight">{stop.order.weight} kg</span>
              <span className={`tag tag-${stop.order.temp.toLowerCase()}`}>{stop.order.temp}</span>
            </div>

            {/* Window */}
            <div style={{ textAlign: 'right', minWidth: 80 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {stop.order.window.start}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>–{stop.order.window.end}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingPage;
