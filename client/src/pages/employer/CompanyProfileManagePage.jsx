import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Building2 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import CompanyLogoUpload from '../../components/employer/CompanyLogoUpload';
import CoverImageUpload from '../../components/employer/CoverImageUpload';
import RatingChip from '../../components/ui/RatingChip';
import Skeleton from '../../components/ui/Skeleton';
import { companyService } from '../../services/companyService';
import { COMPANY_SIZES } from '../../utils/constants';

const CompanyProfileManagePage = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    companyService.getMine()
      .then((data) => {
        if (data.company) {
          setCompany(data.company);
          reset(data.company);
        } else {
          setIsNew(true);
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (company) {
        const res = await companyService.update(company._id, data);
        setCompany(res.company);
        toast.success('Company profile updated');
      } else {
        const res = await companyService.create(data);
        setCompany(res.company);
        setIsNew(false);
        toast.success('Company profile created');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save company profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Company Profile" subtitle="Manage how applicants see your company.">
        <Skeleton className="h-96" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Company Profile" subtitle="Manage how applicants see your company.">
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="card p-6">
          {!company && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
              <Building2 className="h-5 w-5 text-brand-500" />
              <p className="text-sm text-ink-700 dark:text-paper-100">
                You haven't created a company profile yet. Fill this out before posting your first job.
              </p>
            </div>
          )}

          {company && (
            <div className="mb-6 space-y-5">
              <CoverImageUpload company={company} onUpdated={setCompany} />
              <CompanyLogoUpload company={company} onUpdated={setCompany} />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="label-field">Company name *</label>
              <input className="input-field" placeholder="Acme Corp" {...register('companyName', { required: 'Company name is required' })} />
              {errors.companyName && <p className="field-error">{errors.companyName.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field">Industry</label>
                <input className="input-field" placeholder="Software, Retail, Finance…" {...register('industry')} />
              </div>
              <div>
                <label className="label-field">Company size</label>
                <select className="input-field" {...register('size')}>
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label-field">Headquarters location</label>
                <input className="input-field" placeholder="Manila, Philippines" {...register('location')} />
              </div>
              <div>
                <label className="label-field">Website</label>
                <input type="url" className="input-field" placeholder="https://acme.com" {...register('website')} />
              </div>
            </div>

            <div>
              <label className="label-field">Company description</label>
              <textarea
                className="input-field min-h-[120px] resize-y"
                placeholder="Tell applicants what your company does and what it's like to work there…"
                {...register('description')}
              />
            </div>

            <div className="flex justify-end border-t border-ink-300/60 pt-5 dark:border-dark-700">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : company ? 'Save changes' : 'Create company profile'}
              </button>
            </div>
          </form>
        </div>

        {company && (
          <div className="card p-5">
            <h3 className="font-display text-sm font-semibold text-ink dark:text-paper-100">Your rating</h3>
            <p className="mb-4 text-xs text-ink-400 dark:text-ink-300">Based on applicant reviews</p>
            <RatingChip average={company.ratingAverage} count={company.ratingCount} size="lg" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyProfileManagePage;
