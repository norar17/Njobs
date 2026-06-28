import { useState } from 'react';
import { Mail, Eye, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import FileTypeIcon from '../ui/FileTypeIcon';
import ResumePreviewModal from '../ui/ResumePreviewModal';
import { APPLICATION_STATUSES } from '../../utils/constants';
import { detectFileType } from '../../utils/fileType';
import { formatDate } from '../../utils/dateHelpers';

const ApplicantRow = ({ application, onStatusChange, updating }) => {
  const { applicant, job, resumeUrl, coverLetter, status, appliedAt } = application;
  const fileTypeInfo = resumeUrl ? detectFileType(resumeUrl) : null;
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="border-b border-ink-300/60 p-4 last:border-0 dark:border-dark-700">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/15 text-sm font-semibold text-brand-500">
            {applicant?.avatar?.url ? (
              <img src={applicant.avatar.url} alt={applicant.name} className="h-full w-full object-cover" />
            ) : (
              applicant?.name?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-ink dark:text-paper-100">{applicant?.name}</p>
            <p className="flex items-center gap-1 text-xs text-ink-400 dark:text-ink-300">
              <Mail className="h-3 w-3" /> {applicant?.email}
            </p>
            <p className="mt-1 text-xs text-ink-400 dark:text-ink-300">
              Applied to <span className="font-medium text-ink-500 dark:text-ink-200">{job?.title}</span> · {formatDate(appliedAt)}
            </p>
          </div>
        </div>

        <select
          value={status}
          onChange={(e) => onStatusChange(application._id, e.target.value)}
          disabled={updating}
          className="input-field !w-auto py-1.5 text-xs"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {applicant?.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {applicant.skills.slice(0, 6).map((skill) => (
            <span key={skill} className="rounded-full bg-paper-200 px-2 py-0.5 text-xs text-ink-500 dark:bg-dark-800 dark:text-ink-300">
              {skill}
            </span>
          ))}
        </div>
      )}

      {coverLetter && (
        <p className="mt-3 rounded-lg bg-paper-200/60 p-3 text-xs text-ink-500 dark:bg-dark-900/50 dark:text-ink-300 line-clamp-3">
          {coverLetter}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        {resumeUrl && (
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-600"
          >
            <FileTypeIcon fileNameOrUrl={resumeUrl} className="h-3.5 w-3.5" /> View resume ({fileTypeInfo?.label || 'Document'}) <Eye className="h-3 w-3" />
          </button>
        )}
        <Link
          to={`/messages?applicationId=${application._id}`}
          className="flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-600"
        >
          <MessageSquare className="h-3.5 w-3.5" /> Message
        </Link>
        <StatusBadge status={status} />
      </div>

      <ResumePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        resumeUrl={resumeUrl}
        fileName={applicant?.resume?.fileName}
      />
    </div>
  );
};

export default ApplicantRow;
