import { useRef, useState } from 'react';
import { Upload, Loader2, CheckCircle2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';
import FileTypeIcon from '../ui/FileTypeIcon';
import ResumePreviewModal from '../ui/ResumePreviewModal';
import { detectFileType, ACCEPTED_RESUME_EXTENSIONS, isAcceptedResumeFile } from '../../utils/fileType';

const ResumeUpload = ({ resume, onUpdated }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAcceptedResumeFile(file)) {
      toast.error('Please upload a PDF, Word, or Excel document');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Resume must be under 10MB');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const data = await userService.uploadResume(file);
      onUpdated(data.user);
      toast.success('Resume uploaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const fileTypeInfo = resume?.fileName ? detectFileType(resume.fileName) : null;

  return (
    <div>
      {resume?.url ? (
        <div className="flex items-center gap-3 rounded-xl border border-status-accepted/30 bg-status-accepted/5 p-4">
          <FileTypeIcon fileNameOrUrl={resume.fileName || resume.url} className="h-6 w-6 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink dark:text-paper-100">{resume.fileName || 'Resume on file'}</p>
            <p className="flex items-center gap-1 text-xs text-status-accepted">
              <CheckCircle2 className="h-3 w-3" /> {fileTypeInfo?.label || 'Document'} ·{' '}
              <button onClick={() => setPreviewOpen(true)} className="flex items-center gap-0.5 text-brand-500 hover:text-brand-600">
                <Eye className="h-3 w-3" /> Preview
              </button>
            </p>
          </div>
          <button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-secondary text-xs">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Replace'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-ink-300 bg-paper-200/60 p-8 text-center transition-colors hover:bg-paper-200 dark:border-dark-600 dark:bg-dark-900/50 dark:hover:bg-dark-800"
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-brand" /> : <Upload className="h-6 w-6 text-ink-400" />}
          <span className="text-sm font-medium text-ink dark:text-paper-100">
            {uploading ? 'Uploading…' : 'Upload your resume'}
          </span>
          <span className="text-xs text-ink-400 dark:text-ink-300">PDF, Word, or Excel. Detected automatically. Max 10MB.</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept={ACCEPTED_RESUME_EXTENSIONS} className="hidden" onChange={handleFileChange} />

      <ResumePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        resumeUrl={resume?.url}
        fileName={resume?.fileName}
      />
    </div>
  );
};

export default ResumeUpload;
