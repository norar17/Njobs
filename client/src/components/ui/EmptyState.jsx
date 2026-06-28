const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 bg-paper-200/60 px-6 py-16 text-center animate-fadeIn dark:border-dark-700 dark:bg-dark-900/50">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-paper-100 border border-ink-300 dark:bg-dark-800 dark:border-dark-700">
          <Icon className="h-6 w-6 text-ink-400" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="font-display text-base font-semibold text-ink dark:text-paper-100">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-500 dark:text-ink-300">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
