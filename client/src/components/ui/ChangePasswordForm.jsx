import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { userService } from '../../services/userService';

const ChangePasswordForm = ({ hasPassword, onPasswordSet }) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm();
  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      await userService.changePassword({
        currentPassword: hasPassword ? data.currentPassword : undefined,
        newPassword: data.newPassword,
      });
      toast.success(hasPassword ? 'Password changed successfully' : 'Password created successfully');
      reset();
      onPasswordSet?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  if (!hasPassword) {
    return (
      <div>
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-brand-500" />
          <p className="text-sm text-ink-700 dark:text-paper-100">
            You signed up with Google, so there's no password on this account yet. Add one below if you'd
            also like to log in with email and password.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="label-field">New password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                className="input-field pr-10"
                {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
              />
              <button type="button" onClick={() => setShowNew((s) => !s)} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-400 hover:text-ink-600">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="field-error">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="label-field">Confirm password</label>
            <input
              type={showNew ? 'text' : 'password'}
              className="input-field"
              {...register('confirmPassword', { required: 'Please confirm your password', validate: (v) => v === newPassword || 'Passwords do not match' })}
            />
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Add password'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="label-field">Current password</label>
        <div className="relative">
          <input
            type={showCurrent ? 'text' : 'password'}
            className="input-field pr-10"
            {...register('currentPassword', { required: 'Current password is required' })}
          />
          <button type="button" onClick={() => setShowCurrent((s) => !s)} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-400 hover:text-ink-600">
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.currentPassword && <p className="field-error">{errors.currentPassword.message}</p>}
      </div>

      <div>
        <label className="label-field">New password</label>
        <div className="relative">
          <input
            type={showNew ? 'text' : 'password'}
            className="input-field pr-10"
            {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
          />
          <button type="button" onClick={() => setShowNew((s) => !s)} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-400 hover:text-ink-600">
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.newPassword && <p className="field-error">{errors.newPassword.message}</p>}
      </div>

      <div>
        <label className="label-field">Confirm new password</label>
        <input
          type={showNew ? 'text' : 'password'}
          className="input-field"
          {...register('confirmPassword', { required: 'Please confirm your new password', validate: (v) => v === newPassword || 'Passwords do not match' })}
        />
        {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Updating…' : 'Change password'}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
