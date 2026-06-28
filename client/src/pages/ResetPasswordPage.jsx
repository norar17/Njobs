import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Spinner from '../components/ui/Spinner';
import { passwordResetService } from '../services/passwordResetService';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const newPassword = watch('newPassword');

  useEffect(() => {
    if (!token) {
      setChecking(false);
      setValid(false);
      return;
    }
    passwordResetService.verifyToken(token)
      .then(() => setValid(true))
      .catch(() => setValid(false))
      .finally(() => setChecking(false));
  }, [token]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await passwordResetService.resetWithToken(token, data.newPassword);
      toast.success('Password reset successfully — you can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <AuthLayout title="Verifying link…" subtitle="">
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      </AuthLayout>
    );
  }

  if (!valid) {
    return (
      <AuthLayout title="Link expired" subtitle="">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-status-rejected/10 text-status-rejected">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <p className="text-sm text-ink-500 dark:text-ink-300">
            This reset link is invalid or has expired. Reset links are only valid for 5 minutes — please
            request a new one.
          </p>
          <Link to="/forgot-password" className="btn-primary mt-6">
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Make it something you haven't used before.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="label-field">New password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-10"
              {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-400 hover:text-ink-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && <p className="field-error">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="label-field">Confirm new password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="input-field"
            {...register('confirmPassword', { required: 'Please confirm your password', validate: (v) => v === newPassword || 'Passwords do not match' })}
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
