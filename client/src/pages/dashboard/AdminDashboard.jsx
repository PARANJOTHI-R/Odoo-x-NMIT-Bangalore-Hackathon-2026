import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, UserX, Clock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminAttendance } from '../../services/attendanceService';
import { getAdminLeaves } from '../../services/leaveService';
import { getAdminEmployees } from '../../services/profileService';
import AttendanceOverview from '../../components/admin/AttendanceOverview';
import EmployeeTable from '../../components/admin/EmployeeTable';
import LeaveApprovalCard from '../../components/admin/LeaveApprovalCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
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
}

export default function AdminDashboard() {
  const [employees,   setEmployees]   = useState([]);
  const [attendance,  setAttendance]  = useState([]);
  const [leaves,      setLeaves]      = useState([]);
  const [loading,     setLoading]     = useState(true);

  const fetchAll = useCallback(() => {
    Promise.allSettled([
      getAdminAttendance(),
      getAdminLeaves(),
      getAdminEmployees(),
    ]).then(([attRes, leaveRes, empRes]) => {
      if (attRes.status === 'fulfilled') {
        const d = attRes.value?.data ?? attRes.value ?? [];
        setAttendance(Array.isArray(d) ? d : []);
      }
      if (leaveRes.status === 'fulfilled') {
        const d = leaveRes.value?.data ?? leaveRes.value ?? [];
        setLeaves(Array.isArray(d) ? d : []);
      }
      if (empRes.status === 'fulfilled') {
        const d = empRes.value?.data ?? empRes.value ?? [];
        setEmployees(Array.isArray(d) ? d : []);
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const todayISO = new Date().toISOString().split('T')[0];
  const todayAtt = attendance.filter((r) => (r.date ?? '').startsWith(todayISO));
  const presentToday = todayAtt.filter((r) => r.status === 'present' || r.status === 'late').length;
  const absentToday  = employees.length - presentToday;
  const pendingLeaves = leaves.filter((l) => (l.status ?? 'pending') === 'pending');

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-header-title">Admin Dashboard</h1>
        <p className="page-header-sub">{formatDate(new Date())} · Overview of your organisation</p>
      </div>

      {loading ? (
        <LoadingSpinner overlay label="Loading dashboard…" />
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <StatCard label="Total Employees" value={employees.length}    icon={Users}      color="#6172f3" bg="var(--accent-light)"  />
            <StatCard label="Present Today"   value={presentToday}        icon={UserCheck}  color="#10b981" bg="var(--success-light)" />
            <StatCard label="Absent Today"    value={Math.max(0, absentToday)} icon={UserX} color="#ef4444" bg="var(--error-light)"   />
            <StatCard label="Pending Leaves"  value={pendingLeaves.length} icon={Clock}     color="#f59e0b" bg="var(--warning-light)" />
          </div>

          {/* Main grid */}
          <div className="content-grid">
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Attendance chart */}
              <div className="card">
                <div className="flex-between" style={{ marginBottom: 4 }}>
                  <h2 className="card-title">Attendance Overview</h2>
                  <Link to="/admin/attendance" style={{ fontSize: 13, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Details <ArrowRight size={14} />
                  </Link>
                </div>
                <p className="card-subtitle" style={{ marginBottom: 16 }}>Daily breakdown for all employees</p>
                <AttendanceOverview records={attendance} />
              </div>

              {/* Employee table */}
              <div className="card">
                <div className="flex-between" style={{ marginBottom: 4 }}>
                  <h2 className="card-title">Employee Management</h2>
                  <Link to="/admin/employees" style={{ fontSize: 13, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    View all <ArrowRight size={14} />
                  </Link>
                </div>
                <p className="card-subtitle" style={{ marginBottom: 16 }}>Search and manage your workforce</p>
                <EmployeeTable
                  employees={employees.slice(0, 5)}
                  onUpdate={fetchAll}
                />
              </div>
            </div>

            {/* Right — Leave approvals */}
            <div>
              <div className="card">
                <div className="flex-between" style={{ marginBottom: 4 }}>
                  <h2 className="card-title">Leave Requests</h2>
                  <Link to="/admin/leave" style={{ fontSize: 13, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    All <ArrowRight size={14} />
                  </Link>
                </div>
                <p className="card-subtitle" style={{ marginBottom: 16 }}>
                  {pendingLeaves.length} pending approval{pendingLeaves.length !== 1 ? 's' : ''}
                </p>

                {pendingLeaves.length === 0 ? (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <div className="empty-state-title" style={{ fontSize: 13 }}>No pending approvals</div>
                    <div className="empty-state-desc">All leave requests have been handled.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pendingLeaves.slice(0, 5).map((l) => (
                      <LeaveApprovalCard
                        key={l._id ?? l.id}
                        leave={l}
                        onUpdate={() => {
                          getAdminLeaves()
                            .then((res) => {
                              const d = res?.data ?? res ?? [];
                              setLeaves(Array.isArray(d) ? d : []);
                            })
                            .catch(() => toast.error('Failed to refresh leave requests'));
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
