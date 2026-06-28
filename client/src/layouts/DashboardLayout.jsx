import { useState } from 'react';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import DashboardTopbar from '../components/layout/DashboardTopbar';
import VerifyEmailBanner from '../components/ui/VerifyEmailBanner';

const DashboardLayout = ({ title, subtitle, actions, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper dark:bg-dark-950">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[260px]">
        <DashboardTopbar title={title} subtitle={subtitle} actions={actions} onMenuClick={() => setSidebarOpen(true)} />
        <main className="px-5 py-6 lg:px-8 lg:py-8">
          <VerifyEmailBanner />
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
