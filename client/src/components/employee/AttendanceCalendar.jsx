import { useMemo } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_CLASS = {
  present: 'present',
  absent:  'absent',
  late:    'late',
  leave:   'leave',
  weekend: 'weekend',
};

const STATUS_TITLE = {
  present: 'Present',
  absent:  'Absent',
  late:    'Late',
  leave:   'On Leave',
  weekend: 'Weekend',
};

/**
 * AttendanceCalendar — visualises monthly attendance.
 *
 * @param {object[]} records  — array from API: [{ date: 'YYYY-MM-DD', status: 'present'|'absent'|'late'|'leave' }]
 * @param {Date}     [month]  — which month to display (defaults to current month)
 */
export default function AttendanceCalendar({ records = [], month }) {
  const display = month ? new Date(month) : new Date();
  const year    = display.getFullYear();
  const mon     = display.getMonth();

  const today = new Date().toDateString();

  // Build a lookup map: 'YYYY-MM-DD' → status
  const statusMap = useMemo(() => {
    const map = {};
    for (const r of records) {
      if (r.date) map[r.date] = r.status || 'present';
    }
    return map;
  }, [records]);

  // First day of the month (0 = Sun)
  const firstDay   = new Date(year, mon, 1).getDay();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();

  // Build cells: nulls for blank leading days + day numbers
  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [firstDay, daysInMonth]);

  function getStatus(day) {
    if (day === null) return null;
    const date = new Date(year, mon, day);
    const iso  = date.toISOString().split('T')[0];
    const dow  = date.getDay();
    if (dow === 0 || dow === 6) return 'weekend';
    return statusMap[iso] || null;
  }

  const monthLabel = display.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
          {monthLabel}
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['present', 'absent', 'late', 'leave', 'weekend'].map((s) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
              <span
                style={{ width: 8, height: 8, borderRadius: 2, display: 'inline-block' }}
                className={`att-cal-cell ${s}`}
              />
              {STATUS_TITLE[s]}
            </span>
          ))}
        </div>
      </div>

      <div className="att-calendar">
        {DAYS.map((d) => (
          <div key={d} className="att-cal-day-header">{d}</div>
        ))}

        {cells.map((day, i) => {
          const status = getStatus(day);
          const date   = day ? new Date(year, mon, day) : null;
          const isToday = date && date.toDateString() === today;
          const cls    = ['att-cal-cell', status ? STATUS_CLASS[status] : 'empty', isToday ? 'today' : ''].filter(Boolean).join(' ');

          return (
            <div
              key={i}
              className={cls}
              title={day ? `${day} — ${STATUS_TITLE[status] || 'No data'}` : ''}
              aria-label={day ? `${day} — ${STATUS_TITLE[status] || 'No data'}` : undefined}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
