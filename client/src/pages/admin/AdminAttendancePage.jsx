import { useEffect, useState, useCallback } from 'react';
import { getAdminAttendance } from '../../services/attendanceService';
import AttendanceOverview from '../../components/admin/AttendanceOverview';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';

function StatusBadge({ status }) {
  const cls =
    status === 'present' ? 'badge-success'
    : status === 'absent'  ? 'badge-error'
    : status === 'late'    ? 'badge-warning'
    : status === 'leave'   ? 'badge-info'
    : 'badge-default';
  return <span className={`badge ${cls}`}>{status ?? '—'}</span>;
}

export default function AdminAttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getAdminAttendance();
      const data = res?.data ?? res ?? [];
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-header-title">Attendance Overview</h1>
        <p className="page-header-sub">Organisation-wide attendance statistics</p>
      </div>

      {loading ? (
        <LoadingSpinner overlay label="Loading attendance data…" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <AttendanceOverview records={records} />
          </div>

          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 16 }}>All Records</h2>
            {records.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No records yet</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records
                      .slice()
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 50)
                      .map((r, i) => (
                        <tr key={r._id ?? r.id ?? i}>
                          <td style={{ fontWeight: 500 }}>
                            {r.employee?.name ?? r.name ?? r.employeeName ?? '—'}
                          </td>
                          <td>{formatDate(r.date)}</td>
                          <td>{r.checkIn  ?? r.checkInTime  ?? '—'}</td>
                          <td>{r.checkOut ?? r.checkOutTime ?? '—'}</td>
                          <td><StatusBadge status={r.status} /></td>
                        </tr>
                      ))
                    }
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
