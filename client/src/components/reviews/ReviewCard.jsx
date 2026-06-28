import StarRating from '../ui/StarRating';
import { formatDate } from '../../utils/dateHelpers';

const ReviewCard = ({ review }) => {
  return (
    <div className="border-b border-ink-300/60 py-5 last:border-0 dark:border-dark-700">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand/15 text-sm font-semibold text-brand-500">
            {review.author?.avatar?.url ? (
              <img src={review.author.avatar.url} alt={review.author.name} className="h-full w-full object-cover" />
            ) : (
              review.author?.name?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-ink dark:text-paper-100">{review.author?.name || 'Anonymous'}</p>
            {review.jobTitleAtCompany && (
              <p className="text-xs text-ink-400 dark:text-ink-300">{review.jobTitleAtCompany}</p>
            )}
          </div>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>

      {review.title && (
        <p className="mt-3 font-display text-sm font-semibold text-ink dark:text-paper-100">{review.title}</p>
      )}
      <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-300">{review.comment}</p>
      <p className="mt-2 text-xs text-ink-400 dark:text-ink-400">{formatDate(review.createdAt)}</p>
    </div>
  );
};

export default ReviewCard;
