import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { CATEGORIES, EXPERIENCE_LEVELS, JOB_TYPES } from '../../utils/constants';

const JobForm = ({ defaultValues, onSubmit, onCancel, submitting, submitLabel }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      location: '',
      jobType: 'Full Time',
      category: 'Engineering',
      experienceLevel: 'Entry Level',
      salaryMin: '',
      salaryMax: '',
      ...defaultValues,
    },
  });

  useEffect(() => {
    reset({
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      requirements: defaultValues?.requirements || '',
      location: defaultValues?.location || '',
      jobType: defaultValues?.jobType || 'Full Time',
      category: defaultValues?.category || 'Engineering',
      experienceLevel: defaultValues?.experienceLevel || 'Entry Level',
      salaryMin: defaultValues?.salaryMin ?? '',
      salaryMax: defaultValues?.salaryMax ?? '',
    });
  }, [defaultValues, reset]);

  const submitHandler = (data) => {
    onSubmit({
      ...data,
      salaryMin: data.salaryMin ? Number(data.salaryMin) : null,
      salaryMax: data.salaryMax ? Number(data.salaryMax) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-5" noValidate>
      <div>
        <label className="label-field">Job title *</label>
        <input className="input-field" placeholder="Frontend Engineer" {...register('title', { required: 'Job title is required' })} />
        {errors.title && <p className="field-error">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">Location *</label>
          <input className="input-field" placeholder="Remote, Manila PH" {...register('location', { required: 'Location is required' })} />
          {errors.location && <p className="field-error">{errors.location.message}</p>}
        </div>
        <div>
          <label className="label-field">Job type</label>
          <select className="input-field" {...register('jobType')}>
            {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">Category</label>
          <select className="input-field" {...register('category')}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label-field">Experience level</label>
          <select className="input-field" {...register('experienceLevel')}>
            {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">Minimum salary</label>
          <input type="number" className="input-field" placeholder="50000" {...register('salaryMin')} />
        </div>
        <div>
          <label className="label-field">Maximum salary</label>
          <input type="number" className="input-field" placeholder="80000" {...register('salaryMax')} />
        </div>
      </div>

      <div>
        <label className="label-field">Job description *</label>
        <textarea
          className="input-field min-h-[140px] resize-y"
          placeholder="Describe the role, responsibilities, and what success looks like…"
          {...register('description', { required: 'Job description is required' })}
        />
        {errors.description && <p className="field-error">{errors.description.message}</p>}
      </div>

      <div>
        <label className="label-field">Requirements</label>
        <textarea
          className="input-field min-h-[110px] resize-y"
          placeholder="List the skills, experience, or qualifications needed…"
          {...register('requirements')}
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-ink-300/60 pt-5 dark:border-dark-700">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel || 'Post job'}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
