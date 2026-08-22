import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CalendarDays,
  CreditCard,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { getMyAttendance, checkIn, checkOut } from '../../services/attendanceService';
import { getMyLeaves } from '../../services/leaveService';
import { getMyPayroll } from '../../services/payrollService';
import AttendanceCalendar from '../../components/employee/AttendanceCalendar';
import LeaveBalanceBar from '../../components/employee/LeaveBalanceBar';
import SalaryCard from '../../components/employee/SalaryCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, elapsedTime } from '../../utils/formatDate';

function StatCard({ label, value, icon: Icon, color, bg, to }) {
  const content = (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon" style={{ background: bg, color }}>
          <Icon size={18} />
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}

function LeaveStatusBadge({ status }) {
  const cls =
    status === 'approved' ? 'badge-success'
    : status === 'rejected' ? 'badge-error'
    : 'badge-warning';
  return <span className={`badge ${cls}`}>{status ?? 'pending'}</span>;
}

export default function EmployeeDashboard() {
  const { user } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [leaves,     setLeaves]     = useState([]);
  const [payroll,    setPayroll]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);

  const [nowStr, setNowStr] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));

  // Live clock
  useEffect(() => {
    const id = setInterval(() => {
      setNowStr(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    Promise.allSettled([
      getMyAttendance(),
      getMyLeaves(),
      getMyPayroll(),
    ]).then(([attRes, leaveRes, payRes]) => {
      if (attRes.status === 'fulfilled') {
        const data = attRes.value?.data ?? attRes.value ?? [];
        setAttendance(Array.isArray(data) ? data : []);
      }
      if (leaveRes.status === 'fulfilled') {
        const data = leaveRes.value?.data ?? leaveRes.value ?? [];
        setLeaves(Array.isArray(data) ? data : []);
      }
      if (payRes.status === 'fulfilled') {
        const data = payRes.value?.data ?? payRes.value;
        setPayroll(Array.isArray(data) ? data[0] : data);
      }
    }).finally(() => setLoading(false));
  }, []);

  // Find today's record
  const todayISO = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find((r) => (r.date ?? '').startsWith(todayISO));
  const checkedIn   = !!(todayRecord?.checkIn  ?? todayRecord?.checkedIn  ?? todayRecord?.checkInTime);
  const checkedOut  = !!(todayRecord?.checkOut ?? todayRecord?.checkedOut ?? todayRecord?.checkOutTime);

  async function handleCheckIn() {
    setCheckinLoading(true);
    try {
      await checkIn();
      toast.success('Checked in successfully!');
      const res = await getMyAttendance();
      const data = res?.data ?? res ?? [];
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckinLoading(false);
    }
  }

  async function handleCheckOut() {
    setCheckinLoading(true);
    try {
      await checkOut();
      toast.success('Checked out successfully!');
      const res = await getMyAttendance();
      const data = res?.data ?? res ?? [];
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Check-out failed');
    } finally {
      setCheckinLoading(false);
    }
  }

  // Leave balance (if returned by API)
  const leaveBalance = {};

  // Stats
  const presentDays = attendance.filter((r) => r.status === 'present').length;
  const pendingLeaves = leaves.filter((l) => (l.status ?? 'pending') === 'pending').length;
  const approvedLeaves = leaves.filter((l) => l.status === 'approved').length;

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-header-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="page-header-sub">
          {formatDate(new Date())} · {user?.department ?? user?.position ?? 'Employee'}
        </p>
      </div>

      {loading ? (
        <LoadingSpinner overlay label="Loading your dashboard…" />
      ) : (
        <>
          {/* Stats row */}
          <div className="stats-grid">
            <StatCard label="Days Present" value={presentDays}       icon={CalendarCheck} color="#6172f3" bg="var(--accent-light)"   to="/attendance" />
            <StatCard label="Pending Leaves" value={pendingLeaves}   icon={CalendarDays}  color="#f59e0b" bg="var(--warning-light)"  to="/leave"      />
            <StatCard label="Approved Leaves" value={approvedLeaves} icon={TrendingUp}    color="#10b981" bg="var(--success-light)"  to="/leave"      />
            <StatCard label="Payroll Status"  value={payroll?.status ? payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1) : '—'}
              icon={CreditCard} color="#8b5cf6" bg="#ede9fe" to="/payroll" />
          </div>

          {/* Main grid */}
          <div className="content-grid">
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Check-in card */}
              <div className="checkin-status-card">
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Current Time</div>
                  <div className="checkin-status-time">{nowStr}</div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                    {formatDate(new Date())}
                  </div>
                </div>

                {todayRecord && (
                  <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                    {(todayRecord?.checkIn ?? todayRecord?.checkInTime) && (
                      <div>
                        <div style={{ opacity: 0.65, fontSize: 11 }}>Check-in</div>
                        <div style={{ fontWeight: 600 }}>
                          {formatTime(todayRecord?.checkIn ?? todayRecord?.checkInTime)}
                        </div>
                      </div>
                    )}
                    {(todayRecord?.checkOut ?? todayRecord?.checkOutTime) && (
                      <div>
                        <div style={{ opacity: 0.65, fontSize: 11 }}>Check-out</div>
                        <div style={{ fontWeight: 600 }}>
                          {formatTime(todayRecord?.checkOut ?? todayRecord?.checkOutTime)}
                        </div>
                      </div>
                    )}
                    {checkedIn && !checkedOut && (
                      <div>
                        <div style={{ opacity: 0.65, fontSize: 11 }}>Working</div>
                        <div style={{ fontWeight: 600 }}>
                          <Clock size={12} style={{ marginRight: 4, display: 'inline' }} />
                          {elapsedTime(todayRecord?.checkIn ?? todayRecord?.checkInTime)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="checkin-btn-group">
                  <button
                    id="dashboard-checkin-btn"
                    className="checkin-btn checkin-btn-in"
                    onClick={handleCheckIn}
                    disabled={checkedIn || checkinLoading}
                    type="button"
                  >
                    {checkinLoading ? <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : null}
                    {checkedIn ? 'Checked In ✓' : 'Check In'}
                  </button>
                  <button
                    id="dashboard-checkout-btn"
                    className="checkin-btn checkin-btn-out"
                    onClick={handleCheckOut}
                    disabled={!checkedIn || checkedOut || checkinLoading}
                    type="button"
                  >
                    {checkedOut ? 'Checked Out ✓' : 'Check Out'}
                  </button>
                </div>
              </div>

              {/* Attendance Calendar */}
              <div className="card">
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <h2 className="card-title">Attendance Calendar</h2>
                  <Link to="/attendance" className="flex-gap" style={{ fontSize: 13, color: 'var(--accent)' }}>
                    View all <ArrowRight size={14} />
                  </Link>
                </div>
                <AttendanceCalendar records={attendance} />
              </div>

              {/* Recent leave requests */}
              <div className="card">
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <h2 className="card-title">Recent Leave Requests</h2>
                  <Link to="/leave" className="flex-gap" style={{ fontSize: 13, color: 'var(--accent)' }}>
                    Manage <ArrowRight size={14} />
                  </Link>
                </div>
                {leaves.length === 0 ? (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <div className="empty-state-title">No leave requests</div>
                    <div className="empty-state-desc">You haven&apos;t applied for any leave yet.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {leaves.slice(0, 4).map((l, i) => (
                      <div key={l._id ?? l.id ?? i} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{l.leaveType ?? l.type ?? 'Leave'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {formatDate(l.startDate ?? l.start)} — {formatDate(l.endDate ?? l.end)}
                          </div>
                        </div>
                        <LeaveStatusBadge status={l.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Salary card */}
              {payroll ? (
                <div>
                  <div className="flex-between" style={{ marginBottom: 12 }}>
                    <h2 className="card-title">Latest Payslip</h2>
                    <Link to="/payroll" className="flex-gap" style={{ fontSize: 13, color: 'var(--accent)' }}>
                      View <ArrowRight size={14} />
                    </Link>
                  </div>
                  <SalaryCard payroll={payroll} />
                </div>
              ) : (
                <div className="card">
                  <h2 className="card-title" style={{ marginBottom: 12 }}>Payroll</h2>
                  <div className="empty-state" style={{ padding: '16px 0' }}>
                    <div className="empty-state-title" style={{ fontSize: 13 }}>No payroll data yet</div>
                  </div>
                </div>
              )}

              {/* Leave balances */}
              <div className="card">
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <h2 className="card-title">Leave Balance</h2>
                  <Link to="/leave" className="flex-gap" style={{ fontSize: 13, color: 'var(--accent)' }}>
                    Apply <ArrowRight size={14} />
                  </Link>
                </div>
                <LeaveBalanceBar balances={leaveBalance} />
              </div>

              {/* Quick actions */}
              <div className="card">
                <h2 className="card-title" style={{ marginBottom: 14 }}>Quick Actions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link to="/leave" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', gap: 10 }}>
                    <CalendarDays size={15} style={{ color: 'var(--accent)' }} />
                    Apply for Leave
                  </Link>
                  <Link to="/attendance" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', gap: 10 }}>
                    <CalendarCheck size={15} style={{ color: 'var(--success)' }} />
                    View Attendance
                  </Link>
                  <Link to="/payroll" className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start', gap: 10 }}>
                    <CreditCard size={15} style={{ color: '#8b5cf6' }} />
                    View Payslip
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
