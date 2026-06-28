const ConversationListItem = ({ conversation, isActive, onClick, currentUserRole }) => {
  const isEmployerView = currentUserRole === 'employer';

  const displayName = isEmployerView
    ? conversation.applicant?.name
    : conversation.job?.company?.companyName || conversation.employer?.name;

  const avatarUrl = isEmployerView
    ? conversation.applicant?.avatar?.url
    : conversation.job?.company?.logo?.url;

  const avatarFallback = displayName?.charAt(0).toUpperCase() || '?';

  const lastMessageTime = conversation.lastMessageAt
    ? new Date(conversation.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${
        isActive ? 'bg-brand/10' : 'hover:bg-paper-200 dark:hover:bg-dark-800'
      }`}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/15 text-sm font-semibold text-brand-500">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          avatarFallback
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-ink dark:text-paper-100">{displayName}</p>
          {lastMessageTime && <span className="flex-shrink-0 text-[11px] text-ink-400 dark:text-ink-300">{lastMessageTime}</span>}
        </div>
        <p className="truncate text-xs text-ink-400 dark:text-ink-300">{conversation.job?.title}</p>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-ink-500 dark:text-ink-300">
            {conversation.lastMessage || 'No messages yet'}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ConversationListItem;
