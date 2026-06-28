import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Briefcase } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import MyJobsTable from '../../components/employer/MyJobsTable';
import JobForm from '../../components/employer/JobForm';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { jobService } from '../../services/jobService';

const MyJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobService.getMyJobs();
      setJobs(data.jobs);
    } catch {
      toast.error('Failed to load your job postings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleEditSubmit = async (data) => {
    setSubmitting(true);
    try {
      await jobService.update(editingJob._id, data);
      toast.success('Job updated successfully');
      setEditOpen(false);
      setEditingJob(null);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await jobService.remove(deleteTarget._id);
      toast.success('Job deleted');
      setDeleteTarget(null);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout
      title="My Job Postings"
      subtitle="Create, edit, and manage your active listings."
      actions={
        <Link to="/employer/jobs/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Post a job
        </Link>
      }
    >
      <div className="card">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Briefcase}
              title="No job postings yet"
              description="Create your first listing to start receiving applicants."
              action={<Link to="/employer/jobs/new" className="btn-primary"><Plus className="h-4 w-4" /> Post a job</Link>}
            />
          </div>
        ) : (
          <MyJobsTable jobs={jobs} onEdit={(job) => { setEditingJob(job); setEditOpen(true); }} onDelete={setDeleteTarget} />
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit job posting" size="xl">
        <JobForm
          defaultValues={editingJob}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditOpen(false)}
          submitting={submitting}
          submitLabel="Save changes"
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete job posting?"
        description={`This will permanently delete "${deleteTarget?.title}" and all associated applications. This cannot be undone.`}
        loading={deleting}
      />
    </DashboardLayout>
  );
};

export default MyJobsPage;
