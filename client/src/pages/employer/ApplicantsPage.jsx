import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import ApplicantRow from '../../components/employer/ApplicantRow';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import Pagination from '../../components/ui/Pagination';
import { employerService } from '../../services/employerService';
import { APPLICATION_STATUSES } from '../../utils/constants';

const ApplicantsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get('jobId') || '';

  const [applications, setApplications] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employerService.getApplicants({
        jobId: jobId || undefined,
        status: status || undefined,
        page,
        limit: 10,
      });
      setApplications(data.applications);
      setMeta({ total: data.total, page: data.page, pages: data.pages });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  }, [jobId, status, page]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await employerService.updateApplicationStatus(applicationId, newStatus);
      setApplications((prev) => prev.map((a) => (a._id === applicationId ? { ...a, status: newStatus } : a)));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const clearJobFilter = () => {
    searchParams.delete('jobId');
    setSearchParams(searchParams);
  };

  return (
    <DashboardLayout title="Applicants" subtitle={jobId ? 'Viewing applicants for a specific job.' : 'All applicants across your job postings.'}>
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
        {jobId && (
          <button onClick={clearJobFilter} className="ml-auto text-xs font-medium text-brand-500 hover:text-brand-600">
            Clear job filter
          </button>
        )}
      </div>

      <div className="card mt-5">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : applications.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Users} title="No applicants found" description="Once people start applying, they'll show up here." />
          </div>
        ) : (
          <>
            <div>
              {applications.map((app) => (
                <ApplicantRow key={app._id} application={app} onStatusChange={handleStatusChange} updating={updatingId === app._id} />
              ))}
            </div>
            <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={10} onPageChange={setPage} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicantsPage;
