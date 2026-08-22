import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { applyLeave, getMyLeaves } from '../../services/leaveService';
import LeaveBalanceBar from '../../components/employee/LeaveBalanceBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';

const schema = z.object({
  leaveType: z.string().min(1, 'Please select a leave type'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate:   z.string().min(1, 'End date is required'),
  reason:    z.string().min(5, 'Please provide a reason (min 5 characters)'),
}).refine(
  (d) => new Date(d.endDate) >= new Date(d.startDate),
  { message: 'End date must be after start date', path: ['endDate'] }
);

const LEAVE_TYPES = [
  { value: 'annual',    label: 'Annual Leave'   },
  { value: 'sick',      label: 'Sick Leave'     },
  { value: 'casual',    label: 'Casual Leave'   },
  { value: 'paternity', label: 'Paternity Leave'},
  { value: 'other',     label: 'Other'          },
];

function StatusBadge({ status }) {
  const cls =
    status === 'approved' ? 'badge-success'
    : status === 'rejected' ? 'badge-error'
    : 'badge-warning';
  return <span className={`badge ${cls}`}>{status ?? 'pending'}</span>;
}

export default function LeavePage() {
  const [leaves,      setLeaves]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const loadLeaves = useCallback(async () => {
    try {
      const res  = await getMyLeaves();
      const data = res?.data ?? res ?? [];
      setLeaves(Array.isArray(data) ? data : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLeaves(); }, [loadLeaves]);

  async function onSubmit(data) {
    try {
      await applyLeave(data);
      toast.success('Leave request submitted successfully!');
      reset();
      setShowForm(false);
      await loadLeaves();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit leave request');
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-header-title">Leave Management</h1>
            <p className="page-header-sub">Apply for leave and track your requests</p>
          </div>
          <button
            id="apply-leave-btn"
            className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setShowForm((s) => !s)}
            type="button"
          >
            {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Apply for Leave</>}
          </button>
        </div>
      </div>

      <div className="content-grid">
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Apply form */}
          {showForm && (
            <div className="card fade-in">
              <h2 className="card-title" style={{ marginBottom: 20 }}>Apply for Leave</h2>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="grid-2" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label form-label-required" htmlFor="leave-type">Leave Type</label>
                    <select
                      id="leave-type"
                      className={`form-control${errors.leaveType ? ' error' : ''}`}
                      {...register('leaveType')}
                    >
                      <option value="">Select type…</option>
                      {LEAVE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    {errors.leaveType && <span className="form-error" role="alert">{errors.leaveType.message}</span>}
                  </div>

                  {/* placeholder for alignment */}
                  <div />
                </div>

                <div className="grid-2" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label form-label-required" htmlFor="leave-start">Start Date</label>
                    <input
                      id="leave-start"
                      type="date"
                      min={todayStr}
                      className={`form-control${errors.startDate ? ' error' : ''}`}
                      {...register('startDate')}
                    />
                    {errors.startDate && <span className="form-error" role="alert">{errors.startDate.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label form-label-required" htmlFor="leave-end">End Date</label>
                    <input
                      id="leave-end"
                      type="date"
                      min={todayStr}
                      className={`form-control${errors.endDate ? ' error' : ''}`}
                      {...register('endDate')}
                    />
                    {errors.endDate && <span className="form-error" role="alert">{errors.endDate.message}</span>}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label form-label-required" htmlFor="leave-reason">Reason</label>
                  <textarea
                    id="leave-reason"
                    className={`form-control${errors.reason ? ' error' : ''}`}
                    placeholder="Briefly explain the reason for your leave…"
                    {...register('reason')}
                  />
                  {errors.reason && <span className="form-error" role="alert">{errors.reason.message}</span>}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    id="leave-submit-btn"
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? <><div className="spinner spinner-sm" /> Submitting…</>
                      : 'Submit Request'
                    }
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setShowForm(false); reset(); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* History */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 16 }}>My Leave Requests</h2>

            {loading ? (
              <LoadingSpinner overlay label="Loading requests…" />
            ) : leaves.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><CalendarDays size={24} /></div>
                <div className="empty-state-title">No leave requests</div>
                <div className="empty-state-desc">Click &quot;Apply for Leave&quot; above to submit your first request.</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves
                      .slice()
                      .sort((a, b) => new Date(b.createdAt ?? b.startDate ?? 0) - new Date(a.createdAt ?? a.startDate ?? 0))
                      .map((l, i) => (
                        <tr key={l._id ?? l.id ?? i}>
                          <td>
                            <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                              {l.leaveType ?? l.type ?? '—'}
                            </span>
                          </td>
                          <td>{formatDate(l.startDate ?? l.start)}</td>
                          <td>{formatDate(l.endDate   ?? l.end)}</td>
                          <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {l.reason ?? '—'}
                          </td>
                          <td><StatusBadge status={l.status} /></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right — balance */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <h2 className="card-title" style={{ marginBottom: 16 }}>Leave Balance</h2>
          <LeaveBalanceBar balances={{}} />
        </div>
      </div>
    </div>
  );
}
