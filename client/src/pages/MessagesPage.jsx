import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Send, MessageSquare, ArrowLeft, Paperclip, X, Loader2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import ConversationListItem from '../components/messages/ConversationListItem';
import MessageBubble from '../components/messages/MessageBubble';
import { messageService } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ACCEPTED_CHAT_ATTACHMENT_EXTENSIONS, formatFileSize } from '../utils/fileType';

const getDisplayName = (conversation, role) => {
  if (role === 'employer') return conversation.applicant?.name;
  return conversation.job?.company?.companyName || conversation.employer?.name;
};

const getDisplayAvatar = (conversation, role) => {
  if (role === 'employer') return conversation.applicant?.avatar?.url;
  return conversation.job?.company?.logo?.url;
};

const getOtherPersonIdentity = (conversation, role) => {
  if (role === 'employer') {
    return { name: conversation.applicant?.name, avatar: conversation.applicant?.avatar?.url };
  }
  return { name: conversation.employer?.name, avatar: conversation.employer?.avatar?.url };
};

const MessagesPage = () => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [conversationSeenAt, setConversationSeenAt] = useState({});

  const [pendingFile, setPendingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const data = await messageService.getConversations();
      setConversations(data.conversations);

      const applicationId = searchParams.get('applicationId');
      if (applicationId) {
        const opened = await messageService.openConversation(applicationId);
        setActiveConversation(opened.conversation);
        setMobileShowThread(true);
      }
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const loadMessages = useCallback(async (conversationId) => {
    setLoadingMessages(true);
    try {
      const data = await messageService.getMessages(conversationId);
      setMessages(data.messages);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (!activeConversation) return;
    loadMessages(activeConversation._id);

    setConversations((prev) =>
      prev.map((c) => (c._id === activeConversation._id ? { ...c, unreadCount: 0 } : c))
    );

    if (socket) {
      socket.emit('conversation:join', activeConversation._id);
      socket.emit('messages:read', { conversationId: activeConversation._id });
    }

    return () => {
      if (socket) socket.emit('conversation:leave', activeConversation._id);
    };
  }, [activeConversation, socket, loadMessages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (activeConversation && message.conversation === activeConversation._id) {
        setMessages((prev) => [...prev, message]);
        socket.emit('messages:read', { conversationId: activeConversation._id });
      }
      setConversations((prev) =>
        prev.map((c) =>
          c._id === message.conversation
            ? { ...c, lastMessage: message.text || 'Sent an attachment', lastMessageAt: message.createdAt }
            : c
        )
      );
    };

    const handleConversationUpdated = ({ conversationId, lastMessage, lastMessageAt }) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conversationId);
        if (!exists) {
          fetchConversations();
          return prev;
        }
        return prev.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage,
                lastMessageAt,
                unreadCount: activeConversation?._id === conversationId ? 0 : (c.unreadCount || 0) + 1,
              }
            : c
        );
      });
    };

    const handleMessagesSeen = ({ conversationId, readBy, readAt }) => {
      if (readBy === user.id) return;
      setConversationSeenAt((prev) => ({ ...prev, [conversationId]: readAt }));
    };

    const handleTypingStart = ({ userId }) => {
      if (activeConversation && userId !== user.id) setOtherTyping(true);
    };
    const handleTypingStop = () => setOtherTyping(false);

    socket.on('message:new', handleNewMessage);
    socket.on('conversation:updated', handleConversationUpdated);
    socket.on('messages:seen', handleMessagesSeen);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('conversation:updated', handleConversationUpdated);
      socket.off('messages:seen', handleMessagesSeen);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, activeConversation, user, fetchConversations]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, otherTyping, pendingFile]);

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    setMobileShowThread(true);
  };

  const handleTyping = () => {
    if (!socket || !activeConversation) return;
    socket.emit('typing:start', { conversationId: activeConversation._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { conversationId: activeConversation._id });
    }, 1500);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File must be under 25MB');
      e.target.value = '';
      return;
    }
    setPendingFile(file);
    e.target.value = '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if ((!text && !pendingFile) || !activeConversation) return;

    setSending(true);

    if (pendingFile) {
      setUploadProgress(0);
      try {
        const data = await messageService.sendAttachment(
          activeConversation._id,
          pendingFile,
          text,
          setUploadProgress
        );
        setMessages((prev) => [...prev, data.message]);
        if (socket) {
          socket.emit('attachment:sent', { conversationId: activeConversation._id, message: data.message });
        }
        setDraft('');
        setPendingFile(null);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to send attachment');
      } finally {
        setSending(false);
        setUploadProgress(0);
      }
      return;
    }

    setDraft('');

    if (socket && connected) {
      socket.emit('message:send', { conversationId: activeConversation._id, text }, (res) => {
        setSending(false);
        if (!res?.success) {
          toast.error(res?.message || 'Failed to send message');
        }
      });
    } else {
      try {
        const data = await messageService.sendMessage(activeConversation._id, text);
        setMessages((prev) => [...prev, data.message]);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to send message');
      } finally {
        setSending(false);
      }
    }
  };

  const displayName = activeConversation ? getDisplayName(activeConversation, user.role) : '';
  const displayAvatar = activeConversation ? getDisplayAvatar(activeConversation, user.role) : null;
  const otherPerson = activeConversation ? getOtherPersonIdentity(activeConversation, user.role) : { name: '', avatar: null };

  const lastOwnMessageId = [...messages].reverse().find((m) => m.sender._id === user.id)?._id;
  const seenAt = activeConversation ? conversationSeenAt[activeConversation._id] : null;

  return (
    <DashboardLayout title="Messages" subtitle="Chat directly with employers and applicants about a specific application.">
      <div className="card grid h-[calc(100vh-220px)] min-h-[480px] grid-cols-1 overflow-hidden md:grid-cols-[320px_1fr]">
        <div className={`flex min-h-0 flex-col border-r border-ink-300/60 dark:border-dark-700 ${mobileShowThread ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-shrink-0 border-b border-ink-300/60 p-4 dark:border-dark-700">
            <h3 className="font-display text-sm font-semibold text-ink dark:text-paper-100">Conversations</h3>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {loadingConversations ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={MessageSquare}
                  title="No conversations yet"
                  description={
                    user.role === 'employer'
                      ? 'Conversations open once you message an applicant from your applicants list.'
                      : 'Conversations open once an employer reaches out about your application.'
                  }
                />
              </div>
            ) : (
              conversations.map((conversation) => (
                <ConversationListItem
                  key={conversation._id}
                  conversation={conversation}
                  isActive={activeConversation?._id === conversation._id}
                  onClick={() => handleSelectConversation(conversation)}
                  currentUserRole={user.role}
                />
              ))
            )}
          </div>
        </div>

        <div className={`flex min-h-0 flex-col ${mobileShowThread ? 'flex' : 'hidden md:flex'}`}>
          {!activeConversation ? (
            <div className="flex h-full items-center justify-center p-8">
              <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a conversation from the list to view messages." />
            </div>
          ) : (
            <>
              <div className="flex flex-shrink-0 items-center gap-3 border-b border-ink-300/60 p-4 dark:border-dark-700">
                <button onClick={() => setMobileShowThread(false)} className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-200 dark:hover:bg-dark-800 md:hidden">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/15 text-sm font-semibold text-brand-500">
                  {displayAvatar ? (
                    <img src={displayAvatar} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    displayName?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink dark:text-paper-100">{displayName}</p>
                  <p className="truncate text-xs text-ink-400 dark:text-ink-300">{activeConversation.job?.title}</p>
                </div>
                {connected && <span className="ml-auto h-2 w-2 flex-shrink-0 rounded-full bg-status-accepted" title="Connected" />}
              </div>

              <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {loadingMessages ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-2/3" />)}
                  </div>
                ) : messages.length === 0 ? (
                  <p className="py-10 text-center text-sm text-ink-400 dark:text-ink-300">
                    No messages yet. Say hello to get the conversation started.
                  </p>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isOwn={message.sender._id === user.id}
                      isLastOwnMessage={message._id === lastOwnMessageId}
                      isSeen={!!seenAt && new Date(seenAt) >= new Date(message.createdAt)}
                      otherPartyAvatar={otherPerson.avatar}
                      otherPartyName={otherPerson.name}
                    />
                  ))
                )}
                {otherTyping && (
                  <p className="text-xs italic text-ink-400 dark:text-ink-300">{displayName} is typing…</p>
                )}
              </div>

              {pendingFile && (
                <div className="flex flex-shrink-0 items-center gap-3 border-t border-ink-300/60 px-4 py-2.5 dark:border-dark-700">
                  <Paperclip className="h-4 w-4 flex-shrink-0 text-brand" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink dark:text-paper-100">{pendingFile.name}</p>
                    <p className="text-[11px] text-ink-400 dark:text-ink-300">{formatFileSize(pendingFile.size)}</p>
                  </div>
                  {sending && uploadProgress > 0 && (
                    <span className="text-xs text-ink-400 dark:text-ink-300">{uploadProgress}%</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPendingFile(null)}
                    className="rounded-lg p-1 text-ink-400 hover:bg-paper-200 hover:text-status-rejected dark:hover:bg-dark-800"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="flex flex-shrink-0 items-center gap-2 border-t border-ink-300/60 p-3 dark:border-dark-700">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_CHAT_ATTACHMENT_EXTENSIONS}
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  className="btn-secondary flex-shrink-0 px-3"
                  title="Attach a file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message…"
                  className="input-field flex-1"
                  maxLength={4000}
                />
                <button type="submit" disabled={sending || (!draft.trim() && !pendingFile)} className="btn-primary flex-shrink-0 px-3.5">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;
