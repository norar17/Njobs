const Skeleton = ({ className = '' }) => {
  return <div className={`animate-pulse rounded-lg bg-ink-300/30 dark:bg-dark-700 ${className}`} />;
};

export default Skeleton;
