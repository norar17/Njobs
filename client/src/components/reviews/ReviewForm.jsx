import { useState } from 'react';
import { useForm } from 'react-hook-form';
import StarRating from '../ui/StarRating';

const ReviewForm = ({ onSubmit, onCancel, submitting }) => {
  const [rating, setRating] = useState(0);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const submitHandler = (data) => {
    if (!rating) return;
    onSubmit({ ...data, rating });
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4" noValidate>
      <div>
        <label className="label-field">Your rating</label>
        <StarRating value={rating} size="lg" interactive onChange={setRating} />
        {!rating && <p className="mt-1 text-xs text-ink-400">Tap a star to rate</p>}
      </div>

      <div>
        <label className="label-field">Review title</label>
        <input className="input-field" placeholder="Sum it up in a few words" {...register('title', { maxLength: 120 })} />
      </div>

      <div>
        <label className="label-field">Your role there (optional)</label>
        <input className="input-field" placeholder="e.g. Frontend Engineer" {...register('jobTitleAtCompany')} />
      </div>

      <div>
        <label className="label-field">Your review</label>
        <textarea
          className="input-field min-h-[110px] resize-y"
          placeholder="What was it like working with this company?"
          {...register('comment', { required: 'Please share a few words about your experience', maxLength: 2000 })}
        />
        {errors.comment && <p className="field-error">{errors.comment.message}</p>}
      </div>

      <div className="flex justify-end gap-3 border-t border-ink-300/60 pt-4 dark:border-dark-700">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting || !rating}>
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
