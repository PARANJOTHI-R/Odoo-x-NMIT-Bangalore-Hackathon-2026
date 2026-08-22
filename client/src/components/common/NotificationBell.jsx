import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { relativeTime } from '../../utils/formatDate';

const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    type: 'leave',
    message: 'Your leave request for Aug 25–26 has been approved.',
    time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    color: '#10b981',
    bg: '#d1fae5',
  },
  {
    id: 2,
    type: 'payroll',
    message: 'Your salary for July 2026 has been processed.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
    color: '#6172f3',
    bg: '#e0eaff',
  },
  {
    id: 3,
    type: 'attendance',
    message: 'Reminder: Please check out before leaving today.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    color: '#f59e0b',
    bg: '#fef3c7',
  },
];

export default function NotificationBell() {
  const [open, setOpen]                 = useState(false);
  const [notifications, setNotifs]      = useState(DEMO_NOTIFICATIONS);
  const ref = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const icons = { leave: '🏖️', payroll: '💰', attendance: '⏱️' };

  return (
    <div className="notif-wrapper" ref={ref}>
      <button
        id="notification-bell-btn"
        className="navbar-icon-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        type="button"
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="notif-badge" aria-hidden="true" />}
      </button>

      {open && (
        <div className="notif-dropdown" role="dialog" aria-label="Notifications">
          <div className="notif-header">
            <span className="notif-title">
              Notifications {unreadCount > 0 && <span style={{ color: 'var(--accent)', fontSize: 12 }}>({unreadCount})</span>}
            </span>
            {unreadCount > 0 && (
              <button className="notif-mark-read" onClick={markAllRead} type="button">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notif-empty">No notifications yet</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notif-item${n.read ? '' : ' unread'}`}
                onClick={() => setNotifs((prev) =>
                  prev.map((x) => x.id === n.id ? { ...x, read: true } : x)
                )}
              >
                <div
                  className="notif-icon"
                  style={{ background: n.bg, color: n.color, fontSize: 18 }}
                >
                  {icons[n.type] || '🔔'}
                </div>
                <div className="notif-body">
                  <p className="notif-msg">{n.message}</p>
                  <p className="notif-time">{relativeTime(n.time)}</p>
                </div>
                {!n.read && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 6 }} />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
