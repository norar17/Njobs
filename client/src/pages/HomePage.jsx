import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Building2, Users, ArrowRight } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import JobCard from '../components/jobs/JobCard';
import Skeleton from '../components/ui/Skeleton';
import { jobService } from '../services/jobService';

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await jobService.getAll({ sort: 'newest', limit: 6, page: 1 });
        setRecentJobs(data.jobs);
      } catch {
        
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <PublicLayout>
      {}
      <section className="relative overflow-hidden border-b border-ink-300/60 bg-paper-100 dark:border-dark-700 dark:bg-dark-900">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-brand/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge border border-brand/20 bg-brand/10 text-brand-500">
              Now live — post jobs and find talent
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-ink dark:text-paper-100 sm:text-5xl">
              Find your next role. <span className="text-brand">Or your next hire.</span>
            </h1>
            <p className="mt-4 text-lg text-ink-500 dark:text-ink-300">
              Search thousands of openings, apply in one click, and see honest ratings
              from people who've actually worked there.
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  placeholder="Job title or keyword"
                  className="input-field pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  placeholder="Location"
                  className="input-field pl-10"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary px-6">
                <Search className="h-4 w-4" /> Search
              </button>
            </form>
          </div>

          <div className="mx-auto mt-12 flex max-w-md items-center justify-between gap-4 text-center">
            <div>
              <p className="font-display text-2xl font-bold text-ink dark:text-paper-100">
                <Briefcase className="mb-1 inline h-5 w-5 text-brand" /> Active
              </p>
              <p className="text-xs text-ink-400 dark:text-ink-300">Job postings updated daily</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-ink dark:text-paper-100">
                <Building2 className="mb-1 inline h-5 w-5 text-brand" /> Rated
              </p>
              <p className="text-xs text-ink-400 dark:text-ink-300">Companies reviewed by applicants</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-ink dark:text-paper-100">
                <Users className="mb-1 inline h-5 w-5 text-brand" /> Direct
              </p>
              <p className="text-xs text-ink-400 dark:text-ink-300">Apply straight to employers</p>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink dark:text-paper-100">Recently posted</h2>
          <button onClick={() => navigate('/jobs')} className="flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600">
            View all jobs <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)
          ) : recentJobs.length === 0 ? (
            <p className="col-span-full text-center text-sm text-ink-400 dark:text-ink-300">
              No jobs posted yet — check back soon.
            </p>
          ) : (
            recentJobs.map((job) => <JobCard key={job._id} job={job} />)
          )}
        </div>
      </section>

      {}
      <section className="border-t border-ink-300/60 bg-paper-100 dark:border-dark-700 dark:bg-dark-900">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold text-ink dark:text-paper-100">Hiring? Get in front of applicants today.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500 dark:text-ink-300">
            Create a company profile, post your openings, and manage applicants from one dashboard.
          </p>
          <button onClick={() => navigate('/register')} className="btn-primary mt-6">
            Post a job <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </PublicLayout>
  );
};

export default HomePage;
