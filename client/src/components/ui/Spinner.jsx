const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-9 w-9 border-[3px]',
};

const Spinner = ({ size = 'md', className = '' }) => {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-ink-300 border-t-brand dark:border-dark-600 dark:border-t-brand-400 ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
