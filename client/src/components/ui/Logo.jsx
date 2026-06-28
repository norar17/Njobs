const SIZE_MAP = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
};

const Logo = ({ size = 'md', className = '' }) => {
  return (
    <img
      src="/NorarJob.png"
      alt="NJobs"
      className={`${SIZE_MAP[size]} rounded-xl object-contain ${className}`}
    />
  );
};

export default Logo;
