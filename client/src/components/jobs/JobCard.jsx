import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Bookmark } from 'lucide-react';
import RatingChip from '../ui/RatingChip';
import { formatSalary, formatRelativeTime } from '../../utils/dateHelpers';

const JobCard = ({ job, bookmarked, onToggleBookmark }) => {
  const coverUrl = job.company?.coverImage?.url;

  return (
    <div className="card card-hover group relative overflow-hidden p-0">
      {coverUrl && (
        <div
          className="h-16 w-full"
          style={{ backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}

      <div className="relative p-5">
        {onToggleBookmark && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleBookmark(job._id);
            }}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-paper-200 hover:text-brand dark:hover:bg-dark-800"
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark job'}
          >
            <Bookmark className={`h-4.5 w-4.5 ${bookmarked ? 'fill-brand text-brand' : ''}`} />
          </button>
        )}

        <Link to={`/jobs/${job._id}`} className="block">
          <div className={`flex items-start gap-3 pr-8 ${coverUrl ? '-mt-9' : ''}`}>
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-paper-100 bg-brand/10 text-sm font-bold text-brand-500 dark:border-dark-850">
              {job.company?.logo?.url ? (
                <img src={job.company.logo.url} alt={job.company.companyName} className="h-full w-full object-cover" />
              ) : (
                job.company?.companyName?.charAt(0).toUpperCase() || '?'
              )}
            </div>
            <div className={`min-w-0 ${coverUrl ? 'pt-9' : ''}`}>
              <h3 className="font-display text-base font-semibold text-ink group-hover:text-brand-500 dark:text-paper-100">
                {job.title}
              </h3>
              <p className="text-sm text-ink-500 dark:text-ink-300">{job.company?.companyName || 'Unknown company'}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-400 dark:text-ink-300">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" /> {job.jobType}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {formatRelativeTime(job.createdAt)}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium text-ink dark:text-paper-100">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
            {job.company?.ratingCount > 0 && (
              <RatingChip average={job.company.ratingAverage} count={job.company.ratingCount} />
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
