import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  GraduationCap,
  Bookmark,
  ExternalLink,
  Building2,
  Star,
} from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import RatingChip from '../components/ui/RatingChip';
import Skeleton from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import ApplyModal from '../components/jobs/ApplyModal';
import ReviewCard from '../components/reviews/ReviewCard';
import ReviewForm from '../components/reviews/ReviewForm';
import { jobService } from '../services/jobService';
import { companyService } from '../services/companyService';
import { applicationService } from '../services/applicationService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { formatSalary, formatDate } from '../utils/dateHelpers';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isApplicant } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [applyOpen, setApplyOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getOne(id);
      setJob(data.job);
    } catch (err) {
      setError(err.response?.data?.message || 'Job not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  useEffect(() => {
    if (user?.id) {
      userService.recordRecentlyViewed(id).catch(() => {});
    }
  }, [id, user?.id]);

  useEffect(() => {
    if (!job?.company?._id) return;
    setReviewsLoading(true);
    companyService.getReviews(job.company._id, { limit: 10 })
      .then((data) => setReviews(data.reviews))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [job?.company?._id]);

  useEffect(() => {
    if (!isApplicant) return;
    userService.getBookmarks().then((data) => {
      setBookmarked(data.jobs.some((j) => j._id === id));
    }).catch(() => {});
  }, [isApplicant, id]);

  const handleApplyClick = () => {
    if (!user) {
      toast.error('Log in as an applicant to apply');
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    if (!isApplicant) {
      toast.error('Only applicant accounts can apply to jobs');
      return;
    }
    setApplyOpen(true);
  };

  const handleApplySubmit = async (data) => {
    setApplying(true);
    try {
      await applicationService.apply({ job: id, coverLetter: data.coverLetter });
      toast.success('Application submitted!');
      setApplyOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!isApplicant) {
      toast.error('Log in as an applicant to bookmark jobs');
      return;
    }
    try {
      const data = await userService.toggleBookmark(id);
      setBookmarked(data.bookmarked);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update bookmark');
    }
  };

  const handleReviewSubmit = async (data) => {
    setSubmittingReview(true);
    try {
      const res = await companyService.createReview(job.company._id, data);
      setReviews((prev) => [res.review, ...prev]);
      toast.success('Review submitted — thanks for sharing!');
      setReviewFormOpen(false);
      fetchJob();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="h-40" />
          <Skeleton className="mt-6 h-96" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !job) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
          <h1 className="font-display text-xl font-semibold text-ink dark:text-paper-100">{error || 'Job not found'}</h1>
          <Link to="/jobs" className="btn-primary mt-5 inline-flex">Browse other jobs</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {job.company?.coverImage?.url && (
          <div
            className="h-32 w-full rounded-t-2xl border border-b-0 border-ink-300/60 dark:border-dark-700"
            style={{ backgroundImage: `url(${job.company.coverImage.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}
        <div className={`card p-6 ${job.company?.coverImage?.url ? '-mt-px rounded-t-none' : ''}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand/10 text-lg font-bold text-brand-500 ${job.company?.coverImage?.url ? '-mt-10 border-4 border-paper-100 dark:border-dark-850' : ''}`}>
                {job.company?.logo?.url ? (
                  <img src={job.company.logo.url} alt={job.company.companyName} className="h-full w-full object-cover" />
                ) : (
                  job.company?.companyName?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-ink dark:text-paper-100">{job.title}</h1>
                <Link to={`/companies/${job.company?._id}`} className="text-sm font-medium text-brand-500 hover:text-brand-600">
                  {job.company?.companyName}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-400 dark:text-ink-300">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.jobType}</span>
                  <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {job.experienceLevel}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Posted {formatDate(job.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleToggleBookmark} className="btn-secondary" title="Bookmark this job">
                <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-brand text-brand' : ''}`} />
              </button>
              <button onClick={handleApplyClick} className="btn-primary">
                Apply now
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-ink-300/60 pt-5 dark:border-dark-700">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-ink dark:text-paper-100">
              <DollarSign className="h-4 w-4 text-brand" /> {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
            <span className="badge border border-brand/20 bg-brand/10 text-brand-500">{job.category}</span>
            {job.company?.ratingCount > 0 && (
              <RatingChip average={job.company.ratingAverage} count={job.company.ratingCount} size="lg" />
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-ink dark:text-paper-100">Job description</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-500 dark:text-ink-300">{job.description}</p>

              {job.requirements && (
                <>
                  <h2 className="mt-6 font-display text-lg font-semibold text-ink dark:text-paper-100">Requirements</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-500 dark:text-ink-300">{job.requirements}</p>
                </>
              )}
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink dark:text-paper-100">
                  What people say about {job.company?.companyName}
                </h2>
                {isApplicant && (
                  <button onClick={() => setReviewFormOpen(true)} className="btn-ghost text-brand-500">
                    <Star className="h-4 w-4" /> Write a review
                  </button>
                )}
              </div>

              {reviewsLoading ? (
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="mt-4 text-sm text-ink-400 dark:text-ink-300">
                  No reviews yet. Be the first to share what it's like working here.
                </p>
              ) : (
                <div className="mt-2">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink dark:text-paper-100">
                <Building2 className="h-4 w-4 text-brand" /> About {job.company?.companyName}
              </h3>
              {job.company?.description && (
                <p className="mt-2 text-sm text-ink-500 dark:text-ink-300 line-clamp-4">{job.company.description}</p>
              )}
              <div className="mt-3 space-y-1.5 text-xs text-ink-400 dark:text-ink-300">
                {job.company?.industry && <p>Industry: {job.company.industry}</p>}
                {job.company?.size && <p>Size: {job.company.size} employees</p>}
                {job.company?.location && <p>HQ: {job.company.location}</p>}
              </div>
              {job.company?.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600"
                >
                  Visit website <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <Link
                to={`/companies/${job.company?._id}`}
                className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600"
              >
                View company profile <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSubmit={handleApplySubmit}
        submitting={applying}
        job={job}
        resume={user?.resume}
      />

      <Modal open={reviewFormOpen} onClose={() => setReviewFormOpen(false)} title={`Review ${job.company?.companyName}`} size="lg">
        <ReviewForm onSubmit={handleReviewSubmit} onCancel={() => setReviewFormOpen(false)} submitting={submittingReview} />
      </Modal>
    </PublicLayout>
  );
};

export default JobDetailsPage;
