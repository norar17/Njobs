import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Globe, MapPin, Users, Star } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import RatingChip from '../components/ui/RatingChip';
import JobCard from '../components/jobs/JobCard';
import ReviewCard from '../components/reviews/ReviewCard';
import ReviewForm from '../components/reviews/ReviewForm';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import { companyService } from '../services/companyService';
import { useAuth } from '../context/AuthContext';

const CompanyProfilePage = () => {
  const { id } = useParams();
  const { isApplicant } = useAuth();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [companyData, reviewsData] = await Promise.all([
        companyService.getOne(id),
        companyService.getReviews(id, { limit: 10 }),
      ]);
      setCompany(companyData.company);
      setJobs(companyData.jobs);
      setReviews(reviewsData.reviews);
    } catch (err) {
      setError(err.response?.data?.message || 'Company not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReviewSubmit = async (data) => {
    setSubmittingReview(true);
    try {
      await companyService.createReview(id, data);
      toast.success('Review submitted — thanks for sharing!');
      setReviewFormOpen(false);
      await load();
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
        </div>
      </PublicLayout>
    );
  }

  if (error || !company) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
          <h1 className="font-display text-xl font-semibold text-ink dark:text-paper-100">{error || 'Company not found'}</h1>
          <Link to="/jobs" className="btn-primary mt-5 inline-flex">Browse jobs</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className="h-40 w-full rounded-t-2xl border border-b-0 border-ink-300/60 bg-gradient-to-br from-brand/15 to-gold/10 dark:border-dark-700"
          style={
            company.coverImage?.url
              ? { backgroundImage: `url(${company.coverImage.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : undefined
          }
        />
        <div className="card -mt-px rounded-t-none p-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="-mt-12 flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-paper-100 bg-brand/10 text-xl font-bold text-brand-500 dark:border-dark-850">
              {company.logo?.url ? (
                <img src={company.logo.url} alt={company.companyName} className="h-full w-full object-cover" />
              ) : (
                company.companyName?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-ink dark:text-paper-100">{company.companyName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-500 dark:text-ink-300">
                {company.industry && <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {company.industry}</span>}
                {company.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {company.location}</span>}
                {company.size && <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {company.size} employees</span>}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-500 hover:text-brand-600">
                    <Globe className="h-4 w-4" /> Website
                  </a>
                )}
              </div>
              <div className="mt-3">
                <RatingChip average={company.ratingAverage} count={company.ratingCount} size="lg" />
              </div>
            </div>
          </div>
          {company.description && (
            <p className="mt-5 border-t border-ink-300/60 pt-5 text-sm leading-relaxed text-ink-500 dark:border-dark-700 dark:text-ink-300">
              {company.description}
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink dark:text-paper-100">
              Open positions ({jobs.length})
            </h2>
            <div className="mt-4 space-y-4">
              {jobs.length === 0 ? (
                <p className="text-sm text-ink-400 dark:text-ink-300">No open positions right now.</p>
              ) : (
                jobs.map((job) => <JobCard key={job._id} job={{ ...job, company }} />)
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink dark:text-paper-100">
                Employee reviews ({reviews.length})
              </h2>
              {isApplicant && (
                <button onClick={() => setReviewFormOpen(true)} className="btn-ghost text-brand-500">
                  <Star className="h-4 w-4" /> Write a review
                </button>
              )}
            </div>
            {reviews.length === 0 ? (
              <p className="mt-4 text-sm text-ink-400 dark:text-ink-300">No reviews yet for this company.</p>
            ) : (
              <div className="mt-2">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={reviewFormOpen} onClose={() => setReviewFormOpen(false)} title={`Review ${company.companyName}`} size="lg">
        <ReviewForm onSubmit={handleReviewSubmit} onCancel={() => setReviewFormOpen(false)} submitting={submittingReview} />
      </Modal>
    </PublicLayout>
  );
};

export default CompanyProfilePage;
