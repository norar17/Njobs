import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';
import AvatarUpload from '../../components/ui/AvatarUpload';
import ChangePasswordForm from '../../components/ui/ChangePasswordForm';
import PhoneVerificationField from '../../components/ui/PhoneVerificationField';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

const ProfileInfoForm = () => {
  const { user, updateUser } = useAuth();
  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  useEffect(() => {
    reset({ name: user?.name || '', email: user?.email || '' });
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      const res = await userService.updateProfile(data);
      updateUser(res.user);
      toast.success('Profile updated');
      reset({ ...data });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="label-field">Full name</label>
        <input className="input-field" {...register('name', { required: true })} />
      </div>
      <div>
        <label className="label-field">Email address</label>
        <input type="email" className="input-field" {...register('email', { required: true })} />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
};

const EmployerSettingsPage = () => {
  const { user, updateUser } = useAuth();
  const hasPassword = !!user?.hasPassword;

  return (
    <DashboardLayout title="Account Settings" subtitle="Manage your personal account information and security.">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card space-y-6 p-6">
          <div>
            <h3 className="font-display text-sm font-semibold text-ink dark:text-paper-100">Profile photo</h3>
            <div className="mt-4">
              <AvatarUpload user={user} onUpdated={updateUser} />
            </div>
          </div>
          <div className="border-t border-ink-300/60 pt-6 dark:border-dark-700">
            <h3 className="font-display text-sm font-semibold text-ink dark:text-paper-100">Account information</h3>
            <div className="mt-4">
              <ProfileInfoForm />
            </div>
          </div>
          <div className="border-t border-ink-300/60 pt-6 dark:border-dark-700">
            <PhoneVerificationField savedPhone={user?.phone} onVerified={updateUser} />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display text-sm font-semibold text-ink dark:text-paper-100">
            {hasPassword ? 'Change password' : 'Add a password'}
          </h3>
          <p className="mb-4 text-xs text-ink-400 dark:text-ink-300">
            {hasPassword
              ? "Use a strong password you don't use elsewhere."
              : 'You signed in with Google. Add a password to also log in with email and password.'}
          </p>
          <ChangePasswordForm hasPassword={hasPassword} onPasswordSet={() => updateUser({ hasPassword: true })} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerSettingsPage;
