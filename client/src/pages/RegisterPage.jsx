import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, User, Briefcase } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import GoogleSignInButton from '../components/ui/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState('applicant');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, role });
      toast.success('Account created — welcome to NJobs!');
      navigate(role === 'employer' ? '/employer/dashboard' : '/applicant/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Choose how you'll use NJobs.">
      <div className="mb-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole('applicant')}
          className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all
            ${role === 'applicant'
              ? 'border-brand bg-brand/5 text-brand-500'
              : 'border-ink-300 text-ink-500 hover:bg-paper-200 dark:border-dark-600 dark:text-ink-300 dark:hover:bg-dark-800'}`}
        >
          <User className="h-5 w-5" />
          I'm job hunting
        </button>
        <button
          type="button"
          onClick={() => setRole('employer')}
          className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all
            ${role === 'employer'
              ? 'border-brand bg-brand/5 text-brand-500'
              : 'border-ink-300 text-ink-500 hover:bg-paper-200 dark:border-dark-600 dark:text-ink-300 dark:hover:bg-dark-800'}`}
        >
          <Briefcase className="h-5 w-5" />
          I'm hiring
        </button>
      </div>

      <GoogleSignInButton
        role={role}
        onSuccess={(user) => navigate(user.role === 'employer' ? '/employer/dashboard' : '/applicant/dashboard', { replace: true })}
      />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-ink-300/60 dark:bg-dark-700" />
        <span className="text-xs text-ink-400 dark:text-ink-300">or continue with email</span>
        <span className="h-px flex-1 bg-ink-300/60 dark:bg-dark-700" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="label-field">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="input-field"
            placeholder="Jane Doe"
            {...register('name', { required: 'Name is required', maxLength: { value: 60, message: 'Name is too long' } })}
          />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

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
          <label htmlFor="password" className="label-field">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="input-field pr-10"
              placeholder="At least 6 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
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

        <div>
          <label htmlFor="confirmPassword" className="label-field">Confirm password</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className="input-field"
            placeholder="Re-enter your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating account…' : (<><UserPlus className="h-4 w-4" /> Create account</>)}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-300">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-500 hover:text-brand-600">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
