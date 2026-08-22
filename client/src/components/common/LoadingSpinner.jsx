/**
 * LoadingSpinner — versatile loading indicator.
 *
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {string} [label]
 * @param {boolean} [overlay] — if true, centred full-width with label
 */
export default function LoadingSpinner({ size = 'md', label = '', overlay = false }) {
  const cls = size === 'sm' ? 'spinner spinner-sm'
    : size === 'lg' ? 'spinner spinner-lg'
    : 'spinner';

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className={cls} role="status" aria-label={label || 'Loading…'} />
        {label && <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{label}</span>}
      </div>
    );
  }

  return (
    <div className={cls} role="status" aria-label={label || 'Loading…'} />
  );
}
