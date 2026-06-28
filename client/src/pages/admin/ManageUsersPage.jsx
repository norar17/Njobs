import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Ban, CheckCircle2, Trash2, Users } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import RoleBadge from '../../components/ui/RoleBadge';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { adminService } from '../../services/adminService';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/dateHelpers';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ search: debouncedSearch || undefined, role: role || undefined, page, limit: 15 });
      setUsers(data.users);
      setMeta({ total: data.total, page: data.page, pages: data.pages });
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, role, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleBan = async (user) => {
    try {
      const data = await adminService.toggleBanUser(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data.user : u)));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.deleteUser(deleteTarget.id);
      toast.success('User deleted');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout title="Manage Users" subtitle="View, suspend, or remove accounts on the platform.">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            className="input-field pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input-field !w-auto" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          <option value="applicant">Applicants</option>
          <option value="employer">Employers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="card mt-5 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Users} title="No users found" description="Try a different search or filter." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-300/60 text-xs uppercase tracking-wide text-ink-400 dark:border-dark-700 dark:text-ink-300">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-ink-300/60 last:border-0 dark:border-dark-700">
                      <td className="px-4 py-3.5 font-medium text-ink dark:text-paper-100">{user.name}</td>
                      <td className="px-4 py-3.5 text-ink-500 dark:text-ink-300 hidden md:table-cell">{user.email}</td>
                      <td className="px-4 py-3.5"><RoleBadge role={user.role} /></td>
                      <td className="px-4 py-3.5 text-ink-400 dark:text-ink-300 hidden lg:table-cell">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        {user.isBanned ? (
                          <span className="badge border border-status-rejected/30 bg-status-rejected/10 text-status-rejected">Suspended</span>
                        ) : (
                          <span className="badge border border-status-accepted/30 bg-status-accepted/10 text-status-accepted">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {user.role !== 'admin' && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleBan(user)}
                              className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-200 dark:hover:bg-dark-700"
                              title={user.isBanned ? 'Reinstate user' : 'Suspend user'}
                            >
                              {user.isBanned ? <CheckCircle2 className="h-4 w-4 text-status-accepted" /> : <Ban className="h-4 w-4 text-gold-500" />}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="rounded-lg p-1.5 text-ink-400 hover:bg-paper-200 hover:text-status-rejected dark:hover:bg-dark-700"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={meta.page} pages={meta.pages} total={meta.total} limit={15} onPageChange={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete user?"
        description={`This will permanently delete ${deleteTarget?.name}'s account and all associated data (applications, jobs, reviews). This cannot be undone.`}
        loading={deleting}
      />
    </DashboardLayout>
  );
};

export default ManageUsersPage;
