import React, { useState, useEffect, useCallback } from 'react';
import { Users, CheckCircle2, XCircle, Clock, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { UserProfile } from '../types';

const statusColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
  ACTIVE: {
    bg: 'rgba(16, 185, 129, 0.1)',
    text: '#059669',
    border: 'rgba(16, 185, 129, 0.3)',
    label: 'Active',
  },
  PENDING_APPROVAL: {
    bg: 'rgba(234, 179, 8, 0.1)',
    text: '#D97706',
    border: 'rgba(234, 179, 8, 0.3)',
    label: 'Pending',
  },
  REJECTED: {
    bg: 'rgba(239, 68, 68, 0.1)',
    text: '#DC2626',
    border: 'rgba(239, 68, 68, 0.3)',
    label: 'Rejected',
  },
};

const roleColors: Record<string, string> = {
  Admin: '#7C3AED',
  Dispatcher: '#2563EB',
  Planner: '#0891B2',
  'Fleet Manager': '#D97706',
  Driver: '#059669',
};

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED'>('ALL');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminGetAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load users. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async (email: string, name: string) => {
    setActionLoading(email);
    setError(null);
    try {
      await api.adminApproveUser(email);
      setSuccessMsg(`✓ ${name}'s account has been approved.`);
      await fetchUsers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to approve user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (email: string, name: string) => {
    if (!window.confirm(`Reject ${name}'s account request? They will not be able to sign in.`)) return;
    setActionLoading(email);
    setError(null);
    try {
      await api.adminRejectUser(email);
      setSuccessMsg(`✕ ${name}'s account has been rejected.`);
      await fetchUsers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to reject user.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter(u => filter === 'ALL' || u.status === filter);
  const pendingCount = users.filter(u => u.status === 'PENDING_APPROVAL').length;

  if (currentUser?.role !== 'Admin') {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        <ShieldCheck size={48} color="#EF4444" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Access Restricted</h2>
        <p>User Management is only accessible to Administrators.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 28px', height: '100%', overflowY: 'auto', background: 'var(--bg-main)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(124, 58, 237, 0.12)',
              border: '1px solid rgba(124, 58, 237, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={18} color="#7C3AED" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              User Management
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
              Review, approve or reject operator account requests
            </p>
          </div>
          {pendingCount > 0 && (
            <span
              style={{
                background: '#EF4444',
                color: '#fff',
                borderRadius: 9999,
                padding: '2px 9px',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {pendingCount} pending
            </span>
          )}
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            fontSize: 12,
            fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Success / Error banners */}
      {successMsg && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#059669',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={15} />
          {successMsg}
        </div>
      )}
      {error && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#DC2626',
            fontSize: 13,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 20,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 4,
          width: 'fit-content',
        }}
      >
        {(['ALL', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: 7,
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              background: filter === f ? '#2563EB' : 'transparent',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            {f === 'ALL' ? `All (${users.length})` :
             f === 'PENDING_APPROVAL' ? `Pending (${users.filter(u => u.status === 'PENDING_APPROVAL').length})` :
             f === 'ACTIVE' ? `Active (${users.filter(u => u.status === 'ACTIVE').length})` :
             `Rejected (${users.filter(u => u.status === 'REJECTED').length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>
          Loading users…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>
          No users found for this filter.
        </div>
      ) : (
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
            background: 'var(--bg-surface)',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.2fr 1.2fr 1fr 120px',
              padding: '10px 16px',
              background: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Depot / Hub</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {/* Rows */}
          {filtered.map(u => {
            const statusCfg = statusColors[u.status ?? 'ACTIVE'] ?? statusColors['ACTIVE'];
            const isActionInProgress = actionLoading === u.email;
            return (
              <div
                key={u.email}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1.2fr 1.2fr 1fr 120px',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Name + initials */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: `${roleColors[u.role] ?? '#64748B'}22`,
                      border: `1px solid ${roleColors[u.role] ?? '#64748B'}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      color: roleColors[u.role] ?? '#64748B',
                      flexShrink: 0,
                    }}
                  >
                    {u.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                    {u.createdAt && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.email}
                </div>

                {/* Role */}
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      background: `${roleColors[u.role] ?? '#64748B'}18`,
                      color: roleColors[u.role] ?? '#64748B',
                    }}
                  >
                    {u.role}
                  </span>
                </div>

                {/* Depot */}
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{u.depot}</div>

                {/* Status */}
                <div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 9999,
                      background: statusCfg.bg,
                      color: statusCfg.text,
                      border: `1px solid ${statusCfg.border}`,
                    }}
                  >
                    {u.status === 'PENDING_APPROVAL' && <Clock size={10} />}
                    {u.status === 'ACTIVE' && <CheckCircle2 size={10} />}
                    {u.status === 'REJECTED' && <XCircle size={10} />}
                    {statusCfg.label}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  {u.status === 'PENDING_APPROVAL' && (
                    <>
                      <button
                        onClick={() => handleApprove(u.email, u.name)}
                        disabled={isActionInProgress}
                        title="Approve"
                        style={{
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#059669',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: isActionInProgress ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <CheckCircle2 size={12} />
                        {isActionInProgress ? '...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(u.email, u.name)}
                        disabled={isActionInProgress}
                        title="Reject"
                        style={{
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          background: 'rgba(239, 68, 68, 0.08)',
                          color: '#DC2626',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: isActionInProgress ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <XCircle size={12} />
                        {isActionInProgress ? '...' : 'Reject'}
                      </button>
                    </>
                  )}
                  {u.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleReject(u.email, u.name)}
                      disabled={isActionInProgress}
                      title="Revoke access"
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: isActionInProgress ? 'wait' : 'pointer',
                      }}
                    >
                      {isActionInProgress ? '...' : 'Revoke'}
                    </button>
                  )}
                  {u.status === 'REJECTED' && (
                    <button
                      onClick={() => handleApprove(u.email, u.name)}
                      disabled={isActionInProgress}
                      title="Re-approve"
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: '1px solid rgba(37, 99, 235, 0.4)',
                        background: 'rgba(37, 99, 235, 0.08)',
                        color: '#2563EB',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: isActionInProgress ? 'wait' : 'pointer',
                      }}
                    >
                      {isActionInProgress ? '...' : 'Re-approve'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
