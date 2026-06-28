import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Spinner from '../components/ui/Spinner';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { user, updateUser } = useAuth();

  const [checking, setChecking] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      setSuccess(false);
      return;
    }
    authService.verifyEmail(token)
      .then((res) => {
        setSuccess(true);
        if (user) updateUser(res.user);
      })
      .catch(() => setSuccess(false))
      .finally(() => setChecking(false));
  }, [token, user, updateUser]);

  if (checking) {
    return (
      <AuthLayout title="Verifying your email…" subtitle="">
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      </AuthLayout>
    );
  }

  if (!success) {
    return (
      <AuthLayout title="Link expired" subtitle="">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-status-rejected/10 text-status-rejected">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <p className="text-sm text-ink-500 dark:text-ink-300">
            This verification link is invalid or has expired. Log in and use the "Resend verification
            email" option to get a new one.
          </p>
          <Link to="/login" className="btn-primary mt-6">
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Email verified!" subtitle="">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-status-accepted/10 text-status-accepted">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <p className="text-sm text-ink-500 dark:text-ink-300">
          Your email address has been confirmed. You're all set.
        </p>
        <Link to={user ? '/' : '/login'} className="btn-primary mt-6">
          {user ? 'Continue' : 'Log in'}
        </Link>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
