import { Star } from 'lucide-react';

const sizeMap = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };

const StarRating = ({ value = 0, size = 'md', interactive = false, onChange }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="inline-flex items-center gap-0.5">
      {stars.map((star) => {
        const filled = star <= Math.round(value);
        return (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            aria-label={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
          >
            <Star
              className={`${sizeMap[size]} ${filled ? 'fill-gold text-gold' : 'fill-transparent text-ink-300 dark:text-dark-600'}`}
              strokeWidth={1.75}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
