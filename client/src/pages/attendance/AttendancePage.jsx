import { useEffect, useState, useCallback } from 'react';
import { Clock, CheckCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyAttendance, checkIn, checkOut } from '../../services/attendanceService';
import AttendanceCalendar from '../../components/employee/AttendanceCalendar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, elapsedTime } from '../../utils/formatDate';

function StatusBadge({ status }) {
  const cls =
    status === 'present' ? 'badge-success'
    : status === 'absent'  ? 'badge-error'
    : status === 'late'    ? 'badge-warning'
    : status === 'leave'   ? 'badge-info'
    : 'badge-default';
  return <span className={`badge ${cls}`}>{status ?? '—'}</span>;
}

export default function AttendancePage() {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actionLoad, setActionLoad] = useState(null);

  const todayISO = new Date().toISOString().split('T')[0];
  const todayRecord = records.find((r) => (r.date ?? '').startsWith(todayISO));
  const checkedIn   = !!(todayRecord?.checkIn  ?? todayRecord?.checkInTime);
  const checkedOut  = !!(todayRecord?.checkOut ?? todayRecord?.checkOutTime);

  const loadRecords = useCallback(async () => {
    try {
      const res  = await getMyAttendance();
      const data = res?.data ?? res ?? [];
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      // backend may be offline — silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  async function handleCheckIn() {
    setActionLoad('in');
    try {
      await checkIn();
      toast.success('Checked in! Have a productive day 🚀');
      await loadRecords();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Check-in failed. Please try again.');
    } finally {
      setActionLoad(null);
    }
  }

  async function handleCheckOut() {
    setActionLoad('out');
    try {
      await checkOut();
      toast.success('Checked out. See you tomorrow!');
      await loadRecords();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Check-out failed. Please try again.');
    } finally {
      setActionLoad(null);
    }
  }

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-header-title">Attendance</h1>
        <p className="page-header-sub">Track your daily presence and work hours</p>
      </div>

      {loading ? (
        <LoadingSpinner overlay label="Loading attendance…" />
      ) : (
        <div className="content-grid">
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Today card */}
            <div className="checkin-status-card">
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>Today</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{formatDate(new Date())}</div>
              </div>

              {/* Status row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.65 }}>Check-in</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {checkedIn
                      ? formatTime(todayRecord?.checkIn ?? todayRecord?.checkInTime)
                      : '—'
                    }
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.65 }}>Check-out</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {checkedOut
                      ? formatTime(todayRecord?.checkOut ?? todayRecord?.checkOutTime)
                      : '—'
                    }
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.65 }}>Working time</div>
                  <div style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} />
                    {checkedIn
                      ? elapsedTime(
                          todayRecord?.checkIn ?? todayRecord?.checkInTime,
                          checkedOut ? (todayRecord?.checkOut ?? todayRecord?.checkOutTime) : undefined
                        )
                      : '—'
                    }
                  </div>
                </div>
              </div>

              <div className="checkin-btn-group">
                <button
                  id="attendance-checkin-btn"
                  className="checkin-btn checkin-btn-in"
                  onClick={handleCheckIn}
                  disabled={checkedIn || !!actionLoad}
                  type="button"
                >
                  {actionLoad === 'in'
                    ? <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                    : checkedIn ? <CheckCircle size={16} /> : null
                  }
                  {checkedIn ? 'Already Checked In' : 'Check In'}
                </button>
                <button
                  id="attendance-checkout-btn"
                  className="checkin-btn checkin-btn-out"
                  onClick={handleCheckOut}
                  disabled={!checkedIn || checkedOut || !!actionLoad}
                  type="button"
                >
                  {actionLoad === 'out'
                    ? <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                    : checkedOut ? <CheckCircle size={16} /> : null
                  }
                  {checkedOut ? 'Checked Out' : 'Check Out'}
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: 16 }}>Monthly Calendar</h2>
              <AttendanceCalendar records={records} />
            </div>
          </div>

          {/* Right — history table */}
          <div className="card" style={{ alignSelf: 'start' }}>
            <h2 className="card-title" style={{ marginBottom: 16 }}>Attendance History</h2>

            {records.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Calendar size={24} /></div>
                <div className="empty-state-title">No attendance records</div>
                <div className="empty-state-desc">Your records will appear here once you start checking in.</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>In</th>
                      <th>Out</th>
                      <th>Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records
                      .slice()
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 30)
                      .map((r, i) => {
                        const inTime  = r.checkIn  ?? r.checkInTime;
                        const outTime = r.checkOut ?? r.checkOutTime;
                        return (
                          <tr key={r._id ?? r.id ?? i}>
                            <td style={{ fontWeight: 500 }}>{formatDate(r.date)}</td>
                            <td>{inTime  ? formatTime(inTime)  : '—'}</td>
                            <td>{outTime ? formatTime(outTime) : '—'}</td>
                            <td>{inTime && outTime ? elapsedTime(inTime, outTime) : '—'}</td>
                            <td><StatusBadge status={r.status} /></td>
                          </tr>
                        );
                      })
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
