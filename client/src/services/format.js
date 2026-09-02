// Tiny formatting helpers used across the app

export function formatMoney(minor, currency = 'INR') {
  if (minor == null) return '—';
  const major = (minor || 0) / 100;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(major);
  } catch {
    return `${currency} ${major.toLocaleString()}`;
  }
}

export function formatDate(d, opts = {}) {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...opts,
    });
  } catch {
    return String(d);
  }
}

export function formatDateTime(d) {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    return dt.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(d);
  }
}

export function formatTimeAgo(d) {
  if (!d) return '';
  const then = new Date(d).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

export function statusClass(status) {
  return String(status || '').toLowerCase().replace(/_/g, '-');
}

export function initialsOf(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
