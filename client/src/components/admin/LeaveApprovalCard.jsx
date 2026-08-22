import { useState } from 'react';
import { Check, X, User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { approveLeave, rejectLeave } from '../../services/leaveService';
import { formatDate } from '../../utils/formatDate';
import LoadingSpinner from '../common/LoadingSpinner';

function StatusBadge({ status }) {
  const cls =
    status === 'approved' ? 'badge-success'
    : status === 'rejected' ? 'badge-error'
    : 'badge-warning';
  return <span className={`badge ${cls}`}>{status ?? 'pending'}</span>;
}

/**
 * LeaveApprovalCard — displays a single pending leave request.
 *
 * @param {object}   leave      — leave record
 * @param {Function} onUpdate   — called after approve/reject to refresh parent
 */
export default function LeaveApprovalCard({ leave, onUpdate }) {
  const [loading, setLoading] = useState(null); // 'approve' | 'reject' | null

  const employeeName = leave?.employee?.name  ?? leave?.name  ?? leave?.employeeName ?? 'Employee';
  const email        = leave?.employee?.email ?? leave?.email ?? '';
  const leaveType    = leave?.leaveType ?? leave?.type ?? 'Leave';
  const startDate    = leave?.startDate ?? leave?.start ?? '';
  const endDate      = leave?.endDate   ?? leave?.end   ?? '';
  const reason       = leave?.reason ?? '';
  const status       = leave?.status ?? 'pending';

  async function handleApprove() {
    if (loading) return;
    const confirm = window.confirm(`Approve leave for ${employeeName}?`);
    if (!confirm) return;
    setLoading('approve');
    try {
      await approveLeave(leave._id ?? leave.id);
      toast.success(`Leave approved for ${employeeName}`);
      onUpdate?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve leave');
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (loading) return;
    const confirm = window.confirm(`Reject leave for ${employeeName}?`);
    if (!confirm) return;
    setLoading('reject');
    try {
      await rejectLeave(leave._id ?? leave.id);
      toast.success(`Leave rejected for ${employeeName}`);
      onUpdate?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject leave');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div className="flex-between">
        <div className="flex-gap">
          <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
            {employeeName[0]?.toUpperCase() ?? 'E'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
              {employeeName}
            </div>
            {email && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{email}</div>
            )}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <User size={12} />
            {leaveType}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={12} />
            {formatDate(startDate)} — {formatDate(endDate)}
          </span>
        </div>
      </div>

      {reason && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '3px solid var(--border)', paddingLeft: 10, margin: 0 }}>
          "{reason}"
        </p>
      )}

      {/* Actions — only show if still pending */}
      {status === 'pending' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            id={`approve-leave-${leave._id ?? leave.id}`}
            className="btn btn-success btn-sm"
            onClick={handleApprove}
            disabled={!!loading}
            type="button"
            style={{ flex: 1 }}
          >
            {loading === 'approve' ? <LoadingSpinner size="sm" /> : <Check size={14} />}
            Approve
          </button>
          <button
            id={`reject-leave-${leave._id ?? leave.id}`}
            className="btn btn-danger btn-sm"
            onClick={handleReject}
            disabled={!!loading}
            type="button"
            style={{ flex: 1 }}
          >
            {loading === 'reject' ? <LoadingSpinner size="sm" /> : <X size={14} />}
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
