import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ open, onClose, onConfirm, title, description, confirmLabel = 'Delete', loading = false }) => {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-status-rejected/10 border border-status-rejected/30">
          <AlertTriangle className="h-5 w-5 text-status-rejected" />
        </div>
        <p className="text-sm text-ink-500 pt-1.5 dark:text-ink-300">{description}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
