import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Flag, ShieldCheck, Star } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import Pagination from '../../components/ui/Pagination';
import StarRating from '../../components/ui/StarRating';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/dateHelpers';

const ModerationPage = () => {
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getReviews({ flagged: filter || undefined, page, limit: 15 });
      setReviews(data.reviews);
      setMeta({ total: data.total, page: data.page, pages: data.pages });
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleFlag = async (review) => {
    try {
      const data = await adminService.toggleFlagReview(review._id);
      setReviews((prev) => prev.map((r) => (r._id === review._id ? data.review : r)));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update review');
    }
  };

  return (
    <DashboardLayout title="Moderation" subtitle="Review and moderate company reviews flagged or reported on the platform.">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="text-sm font-medium text-ink-500 dark:text-ink-300">Show:</span>
        <button
          onClick={() => { setFilter(''); setPage(1); }}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${!filter ? 'bg-brand text-white' : 'bg-paper-200 text-ink-500 hover:bg-paper-300 dark:bg-dark-800 dark:text-ink-300 dark:hover:bg-dark-700'}`}
        >
          All reviews
        </button>
        <button
          onClick={() => { setFilter('true'); setPage(1); }}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === 'true' ? 'bg-brand text-white' : 'bg-paper-200 text-ink-500 hover:bg-paper-300 dark:bg-dark-800 dark:text-ink-300 dark:hover:bg-dark-700'}`}
        >
          Flagged only
        </button>
      </div>

      <div className="card mt-5">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Star} title="No reviews found" description="There's nothing to moderate here right now." />
          </div>
        ) : (
          <>
            <div className="divide-y divide-ink-300/60 dark:divide-dark-700">
              {reviews.map((review) => (
                <div key={review._id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} size="sm" />
                      {review.isFlagged && (
                        <span className="badge border border-status-rejected/30 bg-status-rejected/10 text-status-rejected">
                          <Flag className="h-3 w-3" /> Flagged
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-ink dark:text-paper-100">
                      {review.author?.name} on {review.company?.companyName}
                    </p>
                    <p className="mt-1 text-sm text-ink-500 dark:text-ink-300 line-clamp-2">{review.comment}</p>
                    <p className="mt-1 text-xs text-ink-400 dark:text-ink-300">{formatDate(review.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleToggleFlag(review)}
                    className={review.isFlagged ? 'btn-secondary text-xs' : 'btn-danger text-xs'}
                  >
                    {review.isFlagged ? <><ShieldCheck className="h-3.5 w-3.5" /> Unflag</> : <><Flag className="h-3.5 w-3.5" /> Flag</>}
                  </button>
                </div>
              ))}
            </div>
            <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={15} onPageChange={setPage} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ModerationPage;
