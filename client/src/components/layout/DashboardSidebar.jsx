import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bookmark,
  Building2,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  X,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messageService } from '../../services/messageService';
import BrandLogo from '../ui/Logo';

const NAV_BY_ROLE = {
  applicant: [
    { to: '/applicant/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/applicant/applications', label: 'My Applications', icon: FileText },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/applicant/bookmarks', label: 'Bookmarked Jobs', icon: Bookmark },
    { to: '/applicant/recently-viewed', label: 'Recently Viewed', icon: Clock },
    { to: '/applicant/profile', label: 'Profile & Resume', icon: Settings },
  ],
  employer: [
    { to: '/employer/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/employer/jobs', label: 'My Job Postings', icon: Briefcase },
    { to: '/employer/applicants', label: 'Applicants', icon: Users },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/employer/company', label: 'Company Profile', icon: Building2 },
    { to: '/employer/settings', label: 'Account Settings', icon: Settings },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/jobs', label: 'Manage Jobs', icon: Briefcase },
    { to: '/admin/moderation', label: 'Moderation', icon: ShieldCheck },
  ],
};

const DashboardSidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navItems = NAV_BY_ROLE[user?.role] || [];
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || user.role === 'admin') return;
    messageService.getUnreadCount().then((data) => setUnreadCount(data.totalUnread)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      messageService.getUnreadCount().then((data) => setUnreadCount(data.totalUnread)).catch(() => {});
    };
    socket.on('conversation:updated', handleUpdate);
    return () => socket.off('conversation:updated', handleUpdate);
  }, [socket]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-ink/50 dark:bg-black/70 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col border-r border-ink-300/60 bg-paper-100 transition-transform duration-200 dark:border-dark-700 dark:bg-dark-900 lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo />
            <span className="font-display text-[16px] font-bold text-ink dark:text-paper-100">
              N<span className="text-brand">Jobs</span>
            </span>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-200 dark:hover:bg-dark-800 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 border
                ${
                  isActive
                    ? 'bg-brand/10 text-brand-500 border-brand/20'
                    : 'border-transparent text-ink-500 hover:bg-paper-200 hover:text-ink dark:text-ink-300 dark:hover:bg-dark-800 dark:hover:text-paper-100'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
              {label}
              {to === '/messages' && unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-ink-300/60 p-3 dark:border-dark-700">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/15 text-sm font-semibold text-brand-500">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink dark:text-paper-100">{user?.name}</p>
              <p className="truncate text-xs text-ink-400 dark:text-ink-300">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex-shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-paper-200 hover:text-status-rejected dark:hover:bg-dark-800"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
