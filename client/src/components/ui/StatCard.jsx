const colorMap = {
  brand: { text: 'text-brand-500', bg: 'bg-brand/10', border: 'border-brand/20' },
  gold: { text: 'text-gold-500', bg: 'bg-gold/10', border: 'border-gold/20' },
  green: { text: 'text-status-accepted', bg: 'bg-status-accepted/10', border: 'border-status-accepted/20' },
  red: { text: 'text-status-rejected', bg: 'bg-status-rejected/10', border: 'border-status-rejected/20' },
  neutral: { text: 'text-ink dark:text-paper-100', bg: 'bg-ink-300/20 dark:bg-dark-700', border: 'border-ink-300 dark:border-dark-600' },
};

const StatCard = ({ label, value, icon: Icon, color = 'neutral' }) => {
  const c = colorMap[color];
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-300">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink dark:text-paper-100">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${c.bg} ${c.border}`}>
          <Icon className={`h-5 w-5 ${c.text}`} strokeWidth={1.9} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
