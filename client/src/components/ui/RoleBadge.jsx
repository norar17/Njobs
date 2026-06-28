const ROLE_STYLES = {
  applicant: 'bg-brand/10 text-brand-500 border-brand/20',
  employer: 'bg-gold/10 text-gold-500 border-gold/20',
  admin: 'bg-ink/10 text-ink-700 border-ink-300 dark:bg-paper-100/10 dark:text-paper-100 dark:border-dark-600',
};

const ROLE_LABELS = {
  applicant: 'Applicant',
  employer: 'Employer',
  admin: 'Admin',
};

const RoleBadge = ({ role }) => {
  return (
    <span className={`badge border ${ROLE_STYLES[role] || ROLE_STYLES.applicant}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
};

export default RoleBadge;
