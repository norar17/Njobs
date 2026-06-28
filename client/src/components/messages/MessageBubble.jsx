import { Download } from 'lucide-react';
import FileTypeIcon from '../ui/FileTypeIcon';
import { formatFileSize } from '../../utils/fileType';

const AttachmentPreview = ({ attachment, isOwn }) => {
  if (attachment.fileType === 'image') {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl">
        <img
          src={attachment.url}
          alt={attachment.fileName || 'Image attachment'}
          className="max-h-64 w-full max-w-xs object-cover"
        />
      </a>
    );
  }

  if (attachment.fileType === 'video') {
    return (
      <video
        src={attachment.url}
        controls
        className="max-h-64 w-full max-w-xs rounded-xl"
      />
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2.5 rounded-xl border p-3 ${
        isOwn
          ? 'border-white/20 bg-white/10'
          : 'border-ink-300/60 bg-paper-100 dark:border-dark-600 dark:bg-dark-900'
      }`}
    >
      <FileTypeIcon fileNameOrUrl={attachment.fileName} className="h-5 w-5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-xs font-medium ${isOwn ? 'text-white' : 'text-ink dark:text-paper-100'}`}>
          {attachment.fileName || 'Document'}
        </p>
        {attachment.size > 0 && (
          <p className={`text-[11px] ${isOwn ? 'text-white/70' : 'text-ink-400 dark:text-ink-300'}`}>
            {formatFileSize(attachment.size)}
          </p>
        )}
      </div>
      <Download className={`h-4 w-4 flex-shrink-0 ${isOwn ? 'text-white/80' : 'text-ink-400'}`} />
    </a>
  );
};

const MessageBubble = ({ message, isOwn, isLastOwnMessage, isSeen, otherPartyAvatar, otherPartyName }) => {
  const time = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const hasText = message.text && message.text.trim().length > 0;
  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[75%] sm:max-w-[60%]">
        {hasAttachments && (
          <div className="mb-1.5 space-y-1.5">
            {message.attachments.map((attachment, i) => (
              <AttachmentPreview key={i} attachment={attachment} isOwn={isOwn} />
            ))}
          </div>
        )}

        {hasText && (
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm ${
              isOwn ? 'bg-brand text-white' : 'bg-paper-200 text-ink dark:bg-dark-800 dark:text-paper-100'
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          </div>
        )}

        <div className={`mt-1 flex items-center gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <p className="text-[11px] text-ink-400 dark:text-ink-300">{time}</p>
        </div>

        {isOwn && isLastOwnMessage && isSeen && (
          <div className="mt-1 flex justify-end">
            <div className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-brand/15 text-[9px] font-semibold text-brand-500" title={`Seen by ${otherPartyName || ''}`}>
              {otherPartyAvatar ? (
                <img src={otherPartyAvatar} alt={otherPartyName || 'Seen'} className="h-full w-full object-cover" />
              ) : (
                otherPartyName?.charAt(0).toUpperCase() || '•'
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
