import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, X } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const VerifyEmailBanner = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  if (!user || user.isEmailVerified || user.authProvider === 'google' || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    try {
      await authService.resendVerificationEmail();
      toast.success("We've sent a new verification link to your email.");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/10 p-4">
      <Mail className="h-5 w-5 flex-shrink-0 text-gold-500" />
      <div className="flex-1">
        <p className="text-sm font-medium text-ink dark:text-paper-100">Please verify your email address</p>
        <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-300">
          We sent a confirmation link to <strong>{user.email}</strong>. Check your inbox, or{' '}
          <button onClick={handleResend} disabled={sending} className="font-medium text-brand-500 underline hover:text-brand-600">
            {sending ? 'sending…' : 'resend the email'}
          </button>
          .
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 rounded-lg p-1 text-ink-400 hover:bg-paper-200 hover:text-ink dark:hover:bg-dark-800"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default VerifyEmailBanner;
