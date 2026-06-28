import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SlidersHorizontal, X, Briefcase } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import JobCard from '../components/jobs/JobCard';
import JobFilters from '../components/jobs/JobFilters';
import SortDropdown from '../components/jobs/SortDropdown';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { jobService } from '../services/jobService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

const DEFAULT_FILTERS = {
  search: '',
  location: '',
  category: '',
  experienceLevel: '',
  jobType: '',
  salaryMin: '',
  sort: 'newest',
  page: 1,
  limit: 10,
};

const JobsPage = () => {
  const { isApplicant, user } = useAuth();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
  }));
  const debouncedSearch = useDebounce(filters.search, 400);
  const debouncedLocation = useDebounce(filters.location, 400);

  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getAll({
        search: debouncedSearch || undefined,
        location: debouncedLocation || undefined,
        category: filters.category || undefined,
        experienceLevel: filters.experienceLevel || undefined,
        jobType: filters.jobType || undefined,
        salaryMin: filters.salaryMin || undefined,
        sort: filters.sort,
        page: filters.page,
        limit: filters.limit,
      });
      setJobs(data.jobs);
      setMeta({ total: data.total, page: data.page, pages: data.pages });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, debouncedLocation, filters.category, filters.experienceLevel, filters.jobType, filters.salaryMin, filters.sort, filters.page, filters.limit]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (!isApplicant) return;
    userService.getBookmarks().then((data) => {
      setBookmarkedIds(new Set(data.jobs.map((j) => j._id)));
    }).catch(() => {});
  }, [isApplicant, user]);

  const handleToggleBookmark = async (jobId) => {
    if (!isApplicant) {
      toast.error('Log in as an applicant to bookmark jobs');
      return;
    }
    try {
      const data = await userService.toggleBookmark(jobId);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (data.bookmarked) next.add(jobId);
        else next.delete(jobId);
        return next;
      });
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update bookmark');
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink dark:text-paper-100">Find your next role</h1>
            <p className="text-sm text-ink-500 dark:text-ink-300">{meta.total} open position{meta.total !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="btn-secondary lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          {}
          <div className="hidden lg:block">
            <JobFilters filters={filters} onChange={setFilters} />
          </div>

          {}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-ink/50 dark:bg-black/70" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-paper p-5 dark:bg-dark-950">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-base font-semibold text-ink dark:text-paper-100">Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)} className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-200 dark:hover:bg-dark-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <JobFilters filters={filters} onChange={setFilters} />
              </div>
            </div>
          )}

          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="hidden text-sm text-ink-500 dark:text-ink-300 sm:block">
                Showing {jobs.length} of {meta.total} results
              </p>
              <div className="ml-auto w-40">
                <SortDropdown value={filters.sort} onChange={(sort) => setFilters((f) => ({ ...f, sort }))} />
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-status-rejected/30 bg-status-rejected/10 px-4 py-3 text-sm text-status-rejected">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-44" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No jobs match your search"
                description="Try adjusting your filters or search terms to see more results."
              />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      bookmarked={bookmarkedIds.has(job._id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>
                <div className="card mt-4">
                  <Pagination
                    page={meta.page}
                    pages={meta.pages}
                    total={meta.total}
                    limit={filters.limit}
                    onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default JobsPage;
