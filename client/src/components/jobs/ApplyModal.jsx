import { useForm } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import FileTypeIcon from '../ui/FileTypeIcon';
import { detectFileType } from '../../utils/fileType';

const ApplyModal = ({ open, onClose, onSubmit, submitting, job, resume }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const fileTypeInfo = resume?.fileName ? detectFileType(resume.fileName) : null;

  return (
    <Modal open={open} onClose={onClose} title={`Apply to ${job?.title || 'this job'}`} size="lg">
      {!resume?.url ? (
        <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/10 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-gold-500" />
          <div className="text-sm text-ink-700 dark:text-paper-100">
            <p className="font-medium">You need a resume on file to apply.</p>
            <p className="mt-1 text-ink-500 dark:text-ink-300">
              Head to your profile to upload one, then come back to apply.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="flex items-center gap-3 rounded-xl border border-ink-300/60 bg-paper-200 p-3.5 dark:border-dark-700 dark:bg-dark-800">
            <FileTypeIcon fileNameOrUrl={resume.fileName || resume.url} className="h-5 w-5" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink dark:text-paper-100">{resume.fileName || 'Your resume'}</p>
              <p className="text-xs text-ink-400 dark:text-ink-300">
                {fileTypeInfo?.label || 'Document'} · This will be sent with your application
              </p>
            </div>
          </div>

          <div>
            <label className="label-field">Cover letter (optional)</label>
            <textarea
              className="input-field min-h-[140px] resize-y"
              placeholder="Tell the employer why you're a great fit for this role…"
              {...register('coverLetter', { maxLength: { value: 4000, message: 'Cover letter is too long' } })}
            />
            {errors.coverLetter && <p className="field-error">{errors.coverLetter.message}</p>}
          </div>

          <div className="flex justify-end gap-3 border-t border-ink-300/60 pt-4 dark:border-dark-700">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ApplyModal;
