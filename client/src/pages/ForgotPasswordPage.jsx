import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, MessageSquare, CheckCircle2, ArrowLeft } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import PhoneInput from '../components/ui/PhoneInput';
import { passwordResetService } from '../services/passwordResetService';

const ResetWithSmsCodeForm = ({ phone }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await passwordResetService.resetWithCode(phone, data.code, data.newPassword);
      toast.success('Password reset successfully — you can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Enter your code" subtitle={`We sent a 6-digit code to ${phone}. It expires in 5 minutes.`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="label-field">6-digit code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            className="input-field text-center text-lg tracking-[0.3em]"
            placeholder="000000"
            {...register('code', {
              required: 'Code is required',
              pattern: { value: /^\d{6}$/, message: 'Enter the 6-digit code' },
            })}
          />
          {errors.code && <p className="field-error">{errors.code.message}</p>}
        </div>

        <div>
          <label className="label-field">New password</label>
          <input
            type={showNew ? 'text' : 'password'}
            className="input-field"
            {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
          />
          {errors.newPassword && <p className="field-error">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="label-field">Confirm new password</label>
          <input
            type={showNew ? 'text' : 'password'}
            className="input-field"
            {...register('confirmPassword', { required: 'Please confirm your password', validate: (v) => v === newPassword || 'Passwords do not match' })}
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-300">
          <input type="checkbox" checked={showNew} onChange={(e) => setShowNew(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-brand focus:ring-brand dark:border-dark-600" />
          Show password
        </label>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </AuthLayout>
  );
};

const ForgotPasswordPage = () => {
  const [method, setMethod] = useState('email');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [smsCodeSent, setSmsCodeSent] = useState(false);
  const [phoneForVerify, setPhoneForVerify] = useState('');

  const { register, handleSubmit, control, formState: { errors } } = useForm();

  const onSubmitEmail = async (data) => {
    setSubmitting(true);
    try {
      await passwordResetService.requestEmailReset(data.email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitSms = async (data) => {
    setSubmitting(true);
    try {
      await passwordResetService.requestSmsReset(data.phone);
      setPhoneForVerify(data.phone);
      setSmsCodeSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand-500">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="text-sm text-ink-500 dark:text-ink-300">
            If an account exists with that email, we've sent a password reset link to it. The link
            expires in <strong className="text-ink dark:text-paper-100">5 minutes</strong>.
          </p>
          <Link to="/login" className="btn-secondary mt-6">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (smsCodeSent) {
    return <ResetWithSmsCodeForm phone={phoneForVerify} />;
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="Choose how you'd like to reset it.">
      <div className="mb-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMethod('email')}
          className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all ${
            method === 'email'
              ? 'border-brand bg-brand/5 text-brand-500'
              : 'border-ink-300 text-ink-500 hover:bg-paper-200 dark:border-dark-600 dark:text-ink-300 dark:hover:bg-dark-800'
          }`}
        >
          <Mail className="h-5 w-5" />
          Email link
        </button>
        <button
          type="button"
          onClick={() => setMethod('sms')}
          className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all ${
            method === 'sms'
              ? 'border-brand bg-brand/5 text-brand-500'
              : 'border-ink-300 text-ink-500 hover:bg-paper-200 dark:border-dark-600 dark:text-ink-300 dark:hover:bg-dark-800'
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          SMS code
        </button>
      </div>

      {method === 'email' ? (
        <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4" noValidate>
          <div>
            <label className="label-field">Email address</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
              })}
            />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onSubmitSms)} className="space-y-4" noValidate>
          <div>
            <label className="label-field">Phone number</label>
            <Controller
              name="phone"
              control={control}
              rules={{ required: 'Phone number is required' }}
              render={({ field }) => <PhoneInput value={field.value} onChange={field.onChange} />}
            />
            {errors.phone && <p className="field-error">{errors.phone.message}</p>}
            <p className="mt-1.5 text-xs text-ink-400 dark:text-ink-300">
              Use the phone number saved on your profile.
            </p>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Sending…' : 'Send 6-digit code'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-300">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-brand-500 hover:text-brand-600">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
