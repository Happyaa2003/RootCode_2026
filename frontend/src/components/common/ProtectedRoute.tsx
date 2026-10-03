import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserProfile } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserProfile['role'][];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  const location = useLocation();

  // 1. Not Authenticated -> Redirect to Login
  if (!user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user profile is still hydrating, allow temporary pass-through if token exists
  if (!user) {
    return <>{children}</>;
  }

  // 2. Role Check: If allowedRoles is defined and user's role is not included
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 80px)',
          padding: '24px',
          background: 'var(--bg-main)',
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: '100%',
            textAlign: 'center',
            padding: '40px 32px',
            borderRadius: 16,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '2px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <ShieldAlert size={30} color="#DC2626" />
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#DC2626',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              marginBottom: 16,
            }}
          >
            <Lock size={11} />
            ACCESS RESTRICTED
          </span>

          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 10px 0',
            }}
          >
            Permission Required
          </h2>

          <p
            style={{
              fontSize: 13.5,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 24px 0',
            }}
          >
            Your current operational role is <strong style={{ color: 'var(--text-primary)' }}>{user.role}</strong>.
            This module is restricted to operators with the following designated clearance:
          </p>

          {/* Allowed Roles Badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'center',
              marginBottom: 28,
            }}
          >
            {allowedRoles.map(r => (
              <span
                key={r}
                style={{
                  padding: '5px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                {r}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link
              to={user.role === 'Driver' ? '/driver' : user.role === 'Planner' ? '/planner' : '/dispatcher'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 8,
                background: '#2563EB',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={14} />
              Return to My Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized -> Render Child Component
  return <>{children}</>;
};

export default ProtectedRoute;
