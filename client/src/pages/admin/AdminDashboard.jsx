import { useState, useEffect } from 'react';
import { Users, Briefcase, FileText, Building2, Star, UserCheck, MailWarning } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import Skeleton from '../../components/ui/Skeleton';
import { adminService } from '../../services/adminService';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-ink-300/60 bg-paper-100 px-3 py-2 text-xs shadow-card-hover dark:border-dark-600 dark:bg-dark-800">
      <p className="font-medium text-ink dark:text-paper-100">{label}</p>
      <p className="text-brand-500">{payload[0].value} signups</p>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthlySignups, setMonthlySignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService.getStats()
      .then((data) => {
        setStats(data.stats);
        setMonthlySignups(data.monthlySignups);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load admin stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Admin Overview" subtitle="Platform-wide statistics and health.">
      {error && (
        <div className="mb-6 rounded-xl border border-status-rejected/30 bg-status-rejected/10 px-4 py-3 text-sm text-status-rejected">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {loading ? (
          Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <StatCard label="Total users" value={stats?.totalUsers ?? 0} icon={Users} color="brand" />
            <StatCard label="Applicants" value={stats?.totalApplicants ?? 0} icon={UserCheck} color="neutral" />
            <StatCard label="Employers" value={stats?.totalEmployers ?? 0} icon={Building2} color="gold" />
            <StatCard label="Active jobs" value={stats?.activeJobs ?? 0} icon={Briefcase} color="green" />
            <StatCard label="Applications" value={stats?.totalApplications ?? 0} icon={FileText} color="neutral" />
            <StatCard label="Reviews" value={stats?.totalReviews ?? 0} icon={Star} color="gold" />
            <StatCard label="Unverified emails" value={stats?.unverifiedEmails ?? 0} icon={MailWarning} color="neutral" />
          </>
        )}
      </div>

      <div className="card mt-6 p-5">
        <h3 className="font-display text-sm font-semibold text-ink dark:text-paper-100">New signups</h3>
        <p className="text-xs text-ink-400 dark:text-ink-300">User registrations over the last 6 months</p>
        <div className="mt-3">
          {loading ? (
            <Skeleton className="h-[260px]" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlySignups} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F766E" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0F766E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E0" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#8A8D99', fontSize: 12 }} axisLine={{ stroke: '#E8E6E0' }} tickLine={false} />
                <YAxis tick={{ fill: '#8A8D99', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#0F766E', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="signups" stroke="#0F766E" strokeWidth={2} fill="url(#signupGradient)" dot={{ r: 3, fill: '#0F766E', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
