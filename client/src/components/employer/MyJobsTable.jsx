import { Link } from 'react-router-dom';
import { Pencil, Trash2, Users, Eye } from 'lucide-react';
import { JOB_STATUS_STYLES } from '../../utils/constants';
import { formatDate } from '../../utils/dateHelpers';

const MyJobsTable = ({ jobs, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-300/60 text-xs uppercase tracking-wide text-ink-400 dark:border-dark-700 dark:text-ink-300">
            <th className="px-4 py-3 font-medium">Job title</th>
            <th className="px-4 py-3 font-medium hidden md:table-cell">Location</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Applicants</th>
            <th className="px-4 py-3 font-medium hidden lg:table-cell">Posted</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const statusStyle = JOB_STATUS_STYLES[job.status] || JOB_STATUS_STYLES.active;
            return (
              <tr key={job._id} className="border-b border-ink-300/60 transition-colors hover:bg-paper-200/60 last:border-0 dark:border-dark-700 dark:hover:bg-dark-800/60">
                <td className="px-4 py-3.5">
                  <Link to={`/jobs/${job._id}`} className="font-medium text-ink hover:text-brand-500 dark:text-paper-100">
                    {job.title}
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-ink-500 dark:text-ink-300 hidden md:table-cell">{job.location}</td>
                <td className="px-4 py-3.5">
                  <span className={`badge border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>{statusStyle.label}</span>
                </td>
                <td className="px-4 py-3.5">
                  <Link to={`/employer/applicants?jobId=${job._id}`} className="flex items-center gap-1 text-ink-500 hover:text-brand-500 dark:text-ink-300">
                    <Users className="h-3.5 w-3.5" /> {job.applicantCount || 0}
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-ink-400 dark:text-ink-300 hidden lg:table-cell">{formatDate(job.createdAt)}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/jobs/${job._id}`} className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-200 hover:text-ink dark:hover:bg-dark-700 dark:hover:text-paper-100" title="View">
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button onClick={() => onEdit(job)} className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-200 hover:text-brand-500 dark:hover:bg-dark-700" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(job)} className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-200 hover:text-status-rejected dark:hover:bg-dark-700" title="Delete">
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
  );
};

export default MyJobsTable;
