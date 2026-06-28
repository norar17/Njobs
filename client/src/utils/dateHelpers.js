export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatRelativeTime = (date) => {
  if (!date) return '—';
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(date);
};

export const formatSalary = (min, max) => {
  const fmt = (n) => {
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return `${n}`;
  };
  if (min && max) return `$${fmt(min)} - $${fmt(max)}`;
  if (min) return `From $${fmt(min)}`;
  if (max) return `Up to $${fmt(max)}`;
  return 'Not disclosed';
};
