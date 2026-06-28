import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText, ExternalLink, X, Search, MessageSquare } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { applicationService } from '../../services/applicationService';
import { APPLICATION_STATUSES } from '../../utils/constants';
import { formatDate } from '../../utils/dateHelpers';

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await applicationService.getMine({ status: status || undefined, page, limit: 10 });
      setApplications(data.applications);
      setMeta({ total: data.total, page: data.page, pages: data.pages });
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      await applicationService.withdraw(withdrawTarget._id);
      toast.success('Application withdrawn');
      setWithdrawTarget(null);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <DashboardLayout title="My Applications" subtitle="Track the status of every job you've applied to.">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="text-sm font-medium text-ink-500 dark:text-ink-300">Filter by status:</span>
        <button
          onClick={() => { setStatus(''); setPage(1); }}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${!status ? 'bg-brand text-white' : 'bg-paper-200 text-ink-500 hover:bg-paper-300 dark:bg-dark-800 dark:text-ink-300 dark:hover:bg-dark-700'}`}
        >
          All
        </button>
        {APPLICATION_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${status === s ? 'bg-brand text-white' : 'bg-paper-200 text-ink-500 hover:bg-paper-300 dark:bg-dark-800 dark:text-ink-300 dark:hover:bg-dark-700'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card mt-5">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : applications.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={FileText}
              title="No applications found"
              description="Try a different filter, or browse open roles to apply."
              action={<Link to="/jobs" className="btn-primary"><Search className="h-4 w-4" /> Browse jobs</Link>}
            />
          </div>
        ) : (
          <>
            <div className="divide-y divide-ink-300/60 dark:divide-dark-700">
              {applications.map((app) => (
                <div key={app._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <Link to={`/jobs/${app.job?._id}`} className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-brand-500 dark:text-paper-100">
                      {app.job?.title} <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    </Link>
                    <p className="text-xs text-ink-400 dark:text-ink-300">
                      {app.job?.company?.companyName} · {app.job?.location} · Applied {formatDate(app.appliedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/messages?applicationId=${app._id}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-600"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Message
                    </Link>
                    <StatusBadge status={app.status} />
                    {app.status === 'Pending' && (
                      <button
                        onClick={() => setWithdrawTarget(app)}
                        className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-status-rejected/10 hover:text-status-rejected"
                        title="Withdraw application"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={10} onPageChange={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={handleWithdraw}
        title="Withdraw application?"
        description={`This will withdraw your application for ${withdrawTarget?.job?.title || 'this job'}. You can reapply later if it's still open.`}
        confirmLabel="Withdraw"
        loading={withdrawing}
      />
    </DashboardLayout>
  );
};

export default MyApplicationsPage;
