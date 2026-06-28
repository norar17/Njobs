import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, CheckCircle2, Clock4, Plus, Star } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import ApplicationsPerJobChart from '../../components/employer/ApplicationsPerJobChart';
import Skeleton from '../../components/ui/Skeleton';
import RatingChip from '../../components/ui/RatingChip';
import { employerService } from '../../services/employerService';
import { useAuth } from '../../context/AuthContext';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    employerService.getStats()
      .then((data) => {
        setStats(data.stats);
        setChartData(data.applicationsPerJob);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name?.split(' ')[0] || ''}`}
      subtitle="Here's how your job postings are performing."
      actions={
        <Link to="/employer/jobs/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Post a job
        </Link>
      }
    >
      {error && (
        <div className="mb-6 rounded-xl border border-status-rejected/30 bg-status-rejected/10 px-4 py-3 text-sm text-status-rejected">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <StatCard label="Active jobs" value={stats?.activeJobs ?? 0} icon={Briefcase} color="brand" />
            <StatCard label="Total applicants" value={stats?.totalApplications ?? 0} icon={Users} color="gold" />
            <StatCard label="Accepted" value={stats?.accepted ?? 0} icon={CheckCircle2} color="green" />
            <StatCard label="Pending review" value={stats?.pending ?? 0} icon={Clock4} color="neutral" />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display text-sm font-semibold text-ink dark:text-paper-100">Applicants per job posting</h3>
          <p className="text-xs text-ink-400 dark:text-ink-300">Your top job postings by applicant volume</p>
          <div className="mt-3">
            {loading ? <Skeleton className="h-[240px]" /> : <ApplicationsPerJobChart data={chartData} />}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-sm font-semibold text-ink dark:text-paper-100">Your company rating</h3>
          <p className="text-xs text-ink-400 dark:text-ink-300">Based on applicant reviews</p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 py-6">
            <Star className="h-9 w-9 fill-gold text-gold" />
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <RatingChip average={stats?.ratingAverage || 0} count={stats?.ratingCount || 0} size="lg" />
            )}
            <Link to="/employer/company" className="text-xs font-medium text-brand-500 hover:text-brand-600">
              Manage company profile
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
