const LEAVE_TYPES = [
  { key: 'annual',   label: 'Annual Leave',   color: '#6172f3', total: 18 },
  { key: 'sick',     label: 'Sick Leave',     color: '#10b981', total: 12 },
  { key: 'casual',   label: 'Casual Leave',   color: '#f59e0b', total: 6  },
  { key: 'paternity',label: 'Paternity Leave', color: '#8b5cf6', total: 5  },
];

/**
 * LeaveBalanceBar — visual leave balance indicators.
 *
 * @param {object} balances — e.g. { annual: { used: 5, remaining: 13 }, sick: … }
 */
export default function LeaveBalanceBar({ balances = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {LEAVE_TYPES.map(({ key, label, color, total }) => {
        const b   = balances[key] || {};
        const used = b.used ?? 0;
        const remaining = b.remaining ?? (total - used);
        const pct = Math.min(100, Math.round((used / total) * 100));

        return (
          <div key={key} className="leave-bar-item">
            <div className="leave-bar-header">
              <span className="leave-bar-label">{label}</span>
              <span className="leave-bar-count">
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{remaining}</span>
                <span style={{ color: 'var(--text-muted)' }}> / {total} days</span>
              </span>
            </div>
            <div className="leave-bar-track" title={`${used} used, ${remaining} remaining`}>
              <div
                className="leave-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: color,
                  opacity: pct >= 100 ? 1 : 0.85,
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ color }}>{used} used</span>
              <span>{remaining} available</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
