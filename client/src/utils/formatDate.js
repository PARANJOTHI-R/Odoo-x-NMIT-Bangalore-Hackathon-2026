/**
 * Date formatting utilities for Dayflow HRMS
 */

/**
 * Format a date to a human-readable string.
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  if (!date) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...options,
    }).format(new Date(date));
  } catch {
    return '—';
  }
}

/**
 * Format a date+time string.
 */
export function formatDateTime(date) {
  if (!date) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  } catch {
    return '—';
  }
}

/**
 * Format time only (HH:MM AM/PM).
 */
export function formatTime(date) {
  if (!date) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  } catch {
    return '—';
  }
}

/**
 * Get today's date as YYYY-MM-DD string.
 */
export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get elapsed time as a string (e.g. "2h 30m").
 * @param {string|Date} from  start time
 * @param {string|Date} [to]  end time (defaults to now)
 */
export function elapsedTime(from, to) {
  if (!from) return '0h 0m';
  const start = new Date(from);
  const end = to ? new Date(to) : new Date();
  const diffMs = end - start;
  if (diffMs < 0) return '0h 0m';
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

/**
 * Return a relative label like "2 days ago".
 */
export function relativeTime(date) {
  if (!date) return '';
  try {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diffMs = new Date(date) - new Date();
    const diffDays = Math.round(diffMs / 86400000);
    if (Math.abs(diffDays) < 1) {
      const diffHours = Math.round(diffMs / 3600000);
      if (Math.abs(diffHours) < 1) {
        const diffMins = Math.round(diffMs / 60000);
        return rtf.format(diffMins, 'minute');
      }
      return rtf.format(diffHours, 'hour');
    }
    return rtf.format(diffDays, 'day');
  } catch {
    return '';
  }
}

/**
 * Format a number as Indian Rupees.
 */
export function formatCurrency(amount) {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
