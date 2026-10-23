import { claimStatusLabels, orderStatusLabels, paymentStatusLabels } from '@/lib/format';

const allLabels: Record<string, string> = {
  ...orderStatusLabels,
  ...paymentStatusLabels,
  ...claimStatusLabels,
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  TOPUP: 'Top-up',
  REFUND: 'Refund',
  MANUAL: 'Manual',
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const green = ['COMPLETED', 'APPROVED', 'PAID', 'RESOLVED'].includes(status);
  const red = ['CANCELLED', 'REJECTED', 'REFUNDED'].includes(status);
  const cyan = ['PROCESSING', 'IN_REVIEW', 'PARTIAL'].includes(status);
  const yellow = status.includes('PENDING') || status === 'OPEN' || status === 'UNPAID';
  const className = green ? 'badge-green' : red ? 'badge-red' : cyan ? 'badge-cyan' : yellow ? 'badge-yellow' : 'badge-purple';
  return <span className={`badge ${className}`}><span className="status-dot" />{label || allLabels[status] || status.replaceAll('_', ' ')}</span>;
}
