import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import GoogleSignInButton from '../components/ui/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';
import {
  getRememberedCredentials,
  saveRememberedCredentials,
  clearRememberedCredentials,
} from '../utils/rememberedCredentials';

const dashboardPathFor = (role) => {
  if (role === 'employer') return '/employer/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/applicant/dashboard';
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    const remembered = getRememberedCredentials();
    if (remembered) {
      setValue('email', remembered.email);
      setValue('password', remembered.password);
      setRememberMe(true);
    }
  }, [setValue]);

  const goToDashboard = (role) => {
    navigate(location.state?.from || dashboardPathFor(role), { replace: true });
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const result = await login(data);
      if (rememberMe) {
        saveRememberedCredentials(data.email, data.password);
      } else {
        clearRememberedCredentials();
      }
      toast.success('Welcome back!');
      goToDashboard(result.user.role);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue your job search or manage your listings.">
      <GoogleSignInButton onSuccess={(user) => goToDashboard(user.role)} />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-ink-300/60 dark:bg-dark-700" />
        <span className="text-xs text-ink-400 dark:text-ink-300">or continue with email</span>
        <span className="h-px flex-1 bg-ink-300/60 dark:bg-dark-700" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="label-field">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input-field"
            placeholder="you@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
            })}
          />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label-field">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-brand-500 hover:text-brand-600">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="input-field pr-10"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-400 hover:text-ink-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-300">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => {
              setRememberMe(e.target.checked);
              if (!e.target.checked) clearRememberedCredentials();
            }}
            className="h-4 w-4 rounded border-ink-300 text-brand focus:ring-brand dark:border-dark-600"
          />
          Remember my email and password on this device
        </label>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Logging in…' : (<><LogIn className="h-4 w-4" /> Log in</>)}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-300">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-brand-500 hover:text-brand-600">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
