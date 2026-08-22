import { useEffect, useState, useCallback } from 'react';
import { getAdminLeaves } from '../../services/leaveService';
import LeaveApprovalCard from '../../components/admin/LeaveApprovalCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminLeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLeaves = useCallback(async () => {
    try {
      const res = await getAdminLeaves();
      const data = res?.data ?? res ?? [];
      setLeaves(Array.isArray(data) ? data : []);
    } catch {
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const pendingLeaves = leaves.filter((l) => (l.status ?? 'pending') === 'pending');
  const processedLeaves = leaves.filter((l) => (l.status ?? 'pending') !== 'pending');

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-header-title">Leave Management</h1>
        <p className="page-header-sub">Review and manage employee leave requests</p>
      </div>

      {loading ? (
        <LoadingSpinner overlay label="Loading leave requests..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Pending Requests Section */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 4 }}>
              Pending Requests ({pendingLeaves.length})
            </h2>
            <p className="card-subtitle" style={{ marginBottom: 16 }}>
              Requests requiring approval or rejection
            </p>

            {pendingLeaves.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-state-title" style={{ fontSize: 14 }}>No pending requests</div>
                <div className="empty-state-desc">All leave applications have been processed.</div>
              </div>
            ) : (
              <div className="grid-2">
                {pendingLeaves.map((l) => (
                  <LeaveApprovalCard
                    key={l._id ?? l.id}
                    leave={l}
                    onUpdate={loadLeaves}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Processed History */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 16 }}>Request History</h2>
            {processedLeaves.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-state-title" style={{ fontSize: 13 }}>No history yet</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedLeaves.map((l, i) => (
                      <tr key={l._id ?? l.id ?? i}>
                        <td style={{ fontWeight: 500 }}>
                          {l.employee?.name ?? l.name ?? 'Employee'}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{l.leaveType ?? l.type ?? '—'}</td>
                        <td>
                          {l.startDate} to {l.endDate}
                        </td>
                        <td>{l.reason ?? '—'}</td>
                        <td>
                          <span
                            className={`badge ${
                              l.status === 'approved' ? 'badge-success' : 'badge-error'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
