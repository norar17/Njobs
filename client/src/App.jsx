import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import MessagesPage from './pages/MessagesPage';
import NotFoundPage from './pages/NotFoundPage';

import ApplicantDashboard from './pages/applicant/ApplicantDashboard';
import MyApplicationsPage from './pages/applicant/MyApplicationsPage';
import BookmarksPage from './pages/applicant/BookmarksPage';
import RecentlyViewedPage from './pages/applicant/RecentlyViewedPage';
import ApplicantProfilePage from './pages/applicant/ApplicantProfilePage';

import EmployerDashboard from './pages/employer/EmployerDashboard';
import MyJobsPage from './pages/employer/MyJobsPage';
import NewJobPage from './pages/employer/NewJobPage';
import ApplicantsPage from './pages/employer/ApplicantsPage';
import CompanyProfileManagePage from './pages/employer/CompanyProfileManagePage';
import EmployerSettingsPage from './pages/employer/EmployerSettingsPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageJobsPage from './pages/admin/ManageJobsPage';
import ModerationPage from './pages/admin/ModerationPage';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#171C28', color: '#FAFAF8', border: '1px solid #272D38', fontSize: '14px' },
          success: { iconTheme: { primary: '#0F766E', secondary: '#171C28' } },
          error: { iconTheme: { primary: '#DC2626', secondary: '#171C28' } },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/companies/:id" element={<CompanyProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route path="/applicant/dashboard" element={<ProtectedRoute allowedRoles={['applicant']}><ApplicantDashboard /></ProtectedRoute>} />
        <Route path="/applicant/applications" element={<ProtectedRoute allowedRoles={['applicant']}><MyApplicationsPage /></ProtectedRoute>} />
        <Route path="/applicant/bookmarks" element={<ProtectedRoute allowedRoles={['applicant']}><BookmarksPage /></ProtectedRoute>} />
        <Route path="/applicant/recently-viewed" element={<ProtectedRoute allowedRoles={['applicant']}><RecentlyViewedPage /></ProtectedRoute>} />
        <Route path="/applicant/profile" element={<ProtectedRoute allowedRoles={['applicant']}><ApplicantProfilePage /></ProtectedRoute>} />

        <Route path="/employer/dashboard" element={<ProtectedRoute allowedRoles={['employer', 'admin']}><EmployerDashboard /></ProtectedRoute>} />
        <Route path="/employer/jobs" element={<ProtectedRoute allowedRoles={['employer', 'admin']}><MyJobsPage /></ProtectedRoute>} />
        <Route path="/employer/jobs/new" element={<ProtectedRoute allowedRoles={['employer', 'admin']}><NewJobPage /></ProtectedRoute>} />
        <Route path="/employer/applicants" element={<ProtectedRoute allowedRoles={['employer', 'admin']}><ApplicantsPage /></ProtectedRoute>} />
        <Route path="/employer/company" element={<ProtectedRoute allowedRoles={['employer', 'admin']}><CompanyProfileManagePage /></ProtectedRoute>} />
        <Route path="/employer/settings" element={<ProtectedRoute allowedRoles={['employer', 'admin']}><EmployerSettingsPage /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsersPage /></ProtectedRoute>} />
        <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><ManageJobsPage /></ProtectedRoute>} />
        <Route path="/admin/moderation" element={<ProtectedRoute allowedRoles={['admin']}><ModerationPage /></ProtectedRoute>} />

        <Route path="/messages" element={<ProtectedRoute allowedRoles={['applicant', 'employer']}><MessagesPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const tree = (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );

  if (!googleClientId) return tree;

  return <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>;
}

export default App;
