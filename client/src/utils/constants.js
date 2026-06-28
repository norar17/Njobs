export const CATEGORIES = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Customer Support',
  'Operations',
  'Finance',
  'Human Resources',
  'Other',
];

export const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive'];

export const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'];

export const APPLICATION_STATUSES = ['Pending', 'Reviewed', 'Accepted', 'Rejected'];

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export const APPLICATION_STATUS_STYLES = {
  Pending: { text: 'text-status-pending', bg: 'bg-status-pending/10', border: 'border-status-pending/30' },
  Reviewed: { text: 'text-status-reviewed', bg: 'bg-status-reviewed/10', border: 'border-status-reviewed/30' },
  Accepted: { text: 'text-status-accepted', bg: 'bg-status-accepted/10', border: 'border-status-accepted/30' },
  Rejected: { text: 'text-status-rejected', bg: 'bg-status-rejected/10', border: 'border-status-rejected/30' },
};

export const JOB_STATUS_STYLES = {
  active: { text: 'text-status-accepted', bg: 'bg-status-accepted/10', border: 'border-status-accepted/30', label: 'Active' },
  closed: { text: 'text-ink-500', bg: 'bg-ink-300/20', border: 'border-ink-300/40', label: 'Closed' },
  removed: { text: 'text-status-rejected', bg: 'bg-status-rejected/10', border: 'border-status-rejected/30', label: 'Removed' },
};
