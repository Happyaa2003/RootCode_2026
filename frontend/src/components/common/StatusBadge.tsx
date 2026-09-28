import React from 'react';
import type { OrderStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | string;
}

const statusMap: Record<string, string> = {
  'Unassigned': 'badge-unassigned',
  'Planned':    'badge-planned',
  'Loading':    'badge-loading',
  'Ready':      'badge-ready',
  'En Route':   'badge-en-route',
  'Arrived':    'badge-arrived',
  'Delivered':  'badge-delivered',
  'Failed':     'badge-failed',
  'At Risk':    'badge-at-risk',
  'Deferred':   'badge-deferred',
  'Offline':    'badge-offline',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const cls = statusMap[status] ?? 'badge-unassigned';
  return <span className={`badge ${cls}`}>{status}</span>;
};

export default StatusBadge;
