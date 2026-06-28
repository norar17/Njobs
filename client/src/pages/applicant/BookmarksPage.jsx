import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bookmark, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import JobCard from '../../components/jobs/JobCard';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { userService } from '../../services/userService';

const BookmarksPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = () => {
    setLoading(true);
    userService.getBookmarks()
      .then((data) => setJobs(data.jobs))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleToggleBookmark = async (jobId) => {
    try {
      await userService.toggleBookmark(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast.success('Bookmark removed');
    } catch {
      toast.error('Failed to remove bookmark');
    }
  };

  return (
    <DashboardLayout title="Bookmarked Jobs" subtitle="Roles you've saved to come back to later.">
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="Save jobs you're interested in to find them quickly later."
          action={<Link to="/jobs" className="btn-primary"><Search className="h-4 w-4" /> Browse jobs</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} bookmarked onToggleBookmark={handleToggleBookmark} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default BookmarksPage;
