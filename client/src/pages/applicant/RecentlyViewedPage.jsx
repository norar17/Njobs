import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import JobCard from '../../components/jobs/JobCard';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { userService } from '../../services/userService';

const RecentlyViewedPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getRecentlyViewed()
      .then((data) => setJobs(data.jobs))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Recently Viewed" subtitle="The last roles you looked at.">
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No recently viewed jobs"
          description="Jobs you open will show up here so you can find them again easily."
          action={<Link to="/jobs" className="btn-primary"><Search className="h-4 w-4" /> Browse jobs</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default RecentlyViewedPage;
