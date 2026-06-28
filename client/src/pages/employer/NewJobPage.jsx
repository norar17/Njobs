import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import JobForm from '../../components/employer/JobForm';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { companyService } from '../../services/companyService';
import { jobService } from '../../services/jobService';

const NewJobPage = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    companyService.getMine()
      .then((data) => setCompany(data.company))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      await jobService.create({ ...data, company: company._id });
      toast.success('Job posted successfully');
      navigate('/employer/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Post a Job" subtitle="Fill in the details below to publish a new opening.">
      {loading ? (
        <Skeleton className="h-96" />
      ) : !company ? (
        <EmptyState
          icon={Building2}
          title="Set up your company profile first"
          description="Before posting a job, create a company profile so applicants know who's hiring."
          action={<Link to="/employer/company" className="btn-primary">Create company profile</Link>}
        />
      ) : (
        <div className="card p-6">
          <JobForm onSubmit={handleSubmit} onCancel={() => navigate('/employer/jobs')} submitting={submitting} submitLabel="Post job" />
        </div>
      )}
    </DashboardLayout>
  );
};

export default NewJobPage;
