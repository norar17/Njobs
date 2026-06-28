import { useState } from 'react';
import { ExternalLink, AlertTriangle, Download } from 'lucide-react';
import Modal from './Modal';
import FileTypeIcon from './FileTypeIcon';
import { detectFileType } from '../../utils/fileType';

const ResumePreviewModal = ({ open, onClose, resumeUrl, fileName }) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const fileTypeInfo = resumeUrl ? detectFileType(fileName || resumeUrl) : null;
  const isImage = fileTypeInfo?.kind === 'image';
  const isPdf = fileTypeInfo?.kind === 'pdf';
  const canEmbedPreview = isImage || isPdf;

  const googleViewerUrl = isPdf
    ? `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(resumeUrl || '')}`
    : null;

  return (
    <Modal open={open} onClose={onClose} title={fileName || 'Resume'} size="2xl">
      {!resumeUrl ? (
        <p className="text-sm text-ink-400 dark:text-ink-300">No resume available for this applicant.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-300/60 bg-paper-200 p-3.5 dark:border-dark-700 dark:bg-dark-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileTypeIcon fileNameOrUrl={fileName || resumeUrl} className="h-5 w-5 flex-shrink-0" />
              <p className="truncate text-sm font-medium text-ink dark:text-paper-100">{fileName || fileTypeInfo?.label}</p>
            </div>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex-shrink-0 text-xs"
            >
              <Download className="h-3.5 w-3.5" /> Open in new tab
            </a>
          </div>

          {canEmbedPreview && !loadFailed ? (
            isImage ? (
              <img
                src={resumeUrl}
                alt={fileName || 'Resume preview'}
                className="max-h-[65vh] w-full rounded-xl border border-ink-300/60 object-contain dark:border-dark-700"
                onError={() => setLoadFailed(true)}
              />
            ) : (
              <iframe
                src={googleViewerUrl}
                title={fileName || 'Resume preview'}
                className="h-[65vh] w-full rounded-xl border border-ink-300/60 dark:border-dark-700"
                onError={() => setLoadFailed(true)}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-300 bg-paper-200/60 p-10 text-center dark:border-dark-600 dark:bg-dark-900/50">
              <AlertTriangle className="h-6 w-6 text-gold-500" />
              <div>
                <p className="text-sm font-medium text-ink dark:text-paper-100">
                  {loadFailed ? "This file couldn't be previewed here" : 'Preview not available for this file type'}
                </p>
                <p className="mt-1 text-xs text-ink-400 dark:text-ink-300">
                  {fileTypeInfo?.label || 'This document'} files open best in a new tab.
                </p>
              </div>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs">
                Open document <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ResumePreviewModal;
