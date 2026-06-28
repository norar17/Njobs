import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, EyeOff, Trash2, Briefcase } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { adminService } from '../../services/adminService';
import { useDebounce } from '../../hooks/useDebounce';
import { JOB_STATUS_STYLES } from '../../utils/constants';
import { formatDate } from '../../utils/dateHelpers';

const ManageJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [working, setWorking] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getJobs({ search: debouncedSearch || undefined, status: status || undefined, page, limit: 15 });
      setJobs(data.jobs);
      setMeta({ total: data.total, page: data.page, pages: data.pages });
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRemove = async () => {
    if (!removeTarget) return;
    setWorking(true);
    try {
      await adminService.removeJob(removeTarget._id);
      toast.success('Job removed from public listings');
      setRemoveTarget(null);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove job');
    } finally {
      setWorking(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setWorking(true);
    try {
      await adminService.deleteJob(deleteTarget._id);
      toast.success('Job permanently deleted');
      setDeleteTarget(null);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete job');
    } finally {
      setWorking(false);
    }
  };

  return (
    <DashboardLayout title="Manage Jobs" subtitle="Moderate job postings across the platform.">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by job title…"
            className="input-field pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input-field !w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="removed">Removed</option>
        </select>
      </div>

      <div className="card mt-5 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Briefcase} title="No jobs found" description="Try a different search or filter." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-300/60 text-xs uppercase tracking-wide text-ink-400 dark:border-dark-700 dark:text-ink-300">
                    <th className="px-4 py-3 font-medium">Job title</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Company</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Posted by</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const style = JOB_STATUS_STYLES[job.status] || JOB_STATUS_STYLES.active;
                    return (
                      <tr key={job._id} className="border-b border-ink-300/60 last:border-0 dark:border-dark-700">
                        <td className="px-4 py-3.5">
                          <Link to={`/jobs/${job._id}`} className="font-medium text-ink hover:text-brand-500 dark:text-paper-100">{job.title}</Link>
                        </td>
                        <td className="px-4 py-3.5 text-ink-500 dark:text-ink-300 hidden md:table-cell">{job.company?.companyName}</td>
                        <td className="px-4 py-3.5 text-ink-400 dark:text-ink-300 hidden lg:table-cell">{job.createdBy?.email}</td>
                        <td className="px-4 py-3.5">
                          <span className={`badge border ${style.bg} ${style.border} ${style.text}`}>{style.label}</span>
                        </td>
                        <td className="px-4 py-3.5 text-ink-400 dark:text-ink-300 hidden lg:table-cell">{formatDate(job.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {job.status !== 'removed' && (
                              <button onClick={() => setRemoveTarget(job)} className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-200 hover:text-gold-500 dark:hover:bg-dark-700" title="Remove from listings">
                                <EyeOff className="h-4 w-4" />
                              </button>
                            )}
                            <button onClick={() => setDeleteTarget(job)} className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-200 hover:text-status-rejected dark:hover:bg-dark-700" title="Delete permanently">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={15} onPageChange={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title="Remove job from listings?"
        description={`"${removeTarget?.title}" will be hidden from public job listings but kept in the database.`}
        confirmLabel="Remove"
        loading={working}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Permanently delete job?"
        description={`This will permanently delete "${deleteTarget?.title}" and all its applications. This cannot be undone.`}
        loading={working}
      />
    </DashboardLayout>
  );
};

export default ManageJobsPage;
