import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, XCircle, Clock4, ArrowRight, Search } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Skeleton from '../../components/ui/Skeleton';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/dateHelpers';

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationService.getMine({ limit: 5 })
      .then((data) => setApplications(data.applications))
      .finally(() => setLoading(false));
  }, []);

  const counts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    { Pending: 0, Reviewed: 0, Accepted: 0, Rejected: 0 }
  );

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name?.split(' ')[0] || ''}`}
      subtitle="Here's where your job search stands."
      actions={
        <Link to="/jobs" className="btn-primary">
          <Search className="h-4 w-4" /> Browse jobs
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <div className="card p-5">
              <FileText className="h-5 w-5 text-ink-400" />
              <p className="mt-2 font-display text-2xl font-semibold text-ink dark:text-paper-100">{counts.Pending}</p>
              <p className="text-xs text-ink-400 dark:text-ink-300">Pending</p>
            </div>
            <div className="card p-5">
              <Clock4 className="h-5 w-5 text-status-reviewed" />
              <p className="mt-2 font-display text-2xl font-semibold text-ink dark:text-paper-100">{counts.Reviewed}</p>
              <p className="text-xs text-ink-400 dark:text-ink-300">Reviewed</p>
            </div>
            <div className="card p-5">
              <CheckCircle2 className="h-5 w-5 text-status-accepted" />
              <p className="mt-2 font-display text-2xl font-semibold text-ink dark:text-paper-100">{counts.Accepted}</p>
              <p className="text-xs text-ink-400 dark:text-ink-300">Accepted</p>
            </div>
            <div className="card p-5">
              <XCircle className="h-5 w-5 text-status-rejected" />
              <p className="mt-2 font-display text-2xl font-semibold text-ink dark:text-paper-100">{counts.Rejected}</p>
              <p className="text-xs text-ink-400 dark:text-ink-300">Rejected</p>
            </div>
          </>
        )}
      </div>

      <div className="card mt-6 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-ink dark:text-paper-100">Recent applications</h3>
          <Link to="/applicant/applications" className="flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-3 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Browse open roles and submit your first application."
            action={<Link to="/jobs" className="btn-primary">Browse jobs</Link>}
          />
        ) : (
          <div className="mt-3 divide-y divide-ink-300/60 dark:divide-dark-700">
            {applications.map((app) => (
              <div key={app._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink dark:text-paper-100">{app.job?.title}</p>
                  <p className="text-xs text-ink-400 dark:text-ink-300">
                    {app.job?.company?.companyName} · Applied {formatDate(app.appliedAt)}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicantDashboard;
