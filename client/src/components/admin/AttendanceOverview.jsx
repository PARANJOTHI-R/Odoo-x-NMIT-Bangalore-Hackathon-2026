import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#6172f3', '#10b981', '#f59e0b', '#ef4444'];

/**
 * AttendanceOverview — charts for admin attendance statistics.
 *
 * @param {object[]} records — from GET /api/admin/attendance
 */
export default function AttendanceOverview({ records = [] }) {
  // Aggregate by date for bar chart
  const barData = useMemo(() => {
    const map = {};
    for (const r of records) {
      const date = r.date?.split('T')[0] ?? r.date ?? 'Unknown';
      if (!map[date]) map[date] = { date, present: 0, absent: 0, late: 0, leave: 0 };
      const s = r.status ?? 'present';
      if (map[date][s] !== undefined) map[date][s]++;
    }
    return Object.values(map)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // last 14 days
  }, [records]);

  // Overall pie breakdown
  const pieData = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, leave: 0 };
    for (const r of records) {
      const s = r.status ?? 'present';
      if (counts[s] !== undefined) counts[s]++;
    }
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" style={{ fontSize: 28 }}>📊</div>
        <div className="empty-state-title">No attendance data</div>
        <div className="empty-state-desc">Attendance records will appear here once employees start checking in.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Bar chart */}
      <div>
        <div className="card-title" style={{ marginBottom: 16 }}>Daily Attendance (Last 14 Days)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 0, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              tickFormatter={(d) => d.slice(5)}
            />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="present" name="Present" fill="#6172f3" radius={[3, 3, 0, 0]} />
            <Bar dataKey="absent"  name="Absent"  fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar dataKey="late"    name="Late"    fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="leave"   name="Leave"   fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie breakdown */}
      {pieData.length > 0 && (
        <div>
          <div className="card-title" style={{ marginBottom: 16 }}>Overall Breakdown</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pieData.map((d, i) => (
                <div key={d.name} className="flex-gap">
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
