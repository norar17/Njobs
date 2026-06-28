import { Star } from 'lucide-react';

const RatingChip = ({ average = 0, count = 0, size = 'md' }) => {
  if (!count) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-ink-300/20 px-2.5 py-1 text-xs font-medium text-ink-500 dark:bg-dark-700 dark:text-ink-300">
        No reviews yet
      </span>
    );
  }

  const textSize = size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 ${textSize} font-semibold text-gold-500 border border-gold/20`}>
      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
      {average.toFixed(1)}
      <span className="font-normal text-gold-500/80">({count})</span>
    </span>
  );
};

export default RatingChip;
