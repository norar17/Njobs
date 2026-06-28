import { Search, MapPin, X } from 'lucide-react';
import { CATEGORIES, EXPERIENCE_LEVELS, JOB_TYPES } from '../../utils/constants';

const JobFilters = ({ filters, onChange }) => {
  const hasActiveFilters =
    filters.search || filters.location || filters.category || filters.experienceLevel || filters.jobType || filters.salaryMin;

  const clearAll = () => {
    onChange({
      ...filters,
      search: '',
      location: '',
      category: '',
      experienceLevel: '',
      jobType: '',
      salaryMin: '',
      page: 1,
    });
  };

  return (
    <div className="card space-y-5 p-5">
      <div>
        <label className="label-field">Search</label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Job title or company…"
            className="input-field pl-10"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
      </div>

      <div>
        <label className="label-field">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="City, country, or remote…"
            className="input-field pl-10"
            value={filters.location}
            onChange={(e) => onChange({ ...filters, location: e.target.value, page: 1 })}
          />
        </div>
      </div>

      <div>
        <label className="label-field">Category</label>
        <select
          className="input-field"
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value, page: 1 })}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Experience level</label>
        <select
          className="input-field"
          value={filters.experienceLevel}
          onChange={(e) => onChange({ ...filters, experienceLevel: e.target.value, page: 1 })}
        >
          <option value="">All levels</option>
          {EXPERIENCE_LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Job type</label>
        <select
          className="input-field"
          value={filters.jobType}
          onChange={(e) => onChange({ ...filters, jobType: e.target.value, page: 1 })}
        >
          <option value="">All types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Minimum salary</label>
        <select
          className="input-field"
          value={filters.salaryMin}
          onChange={(e) => onChange({ ...filters, salaryMin: e.target.value, page: 1 })}
        >
          <option value="">Any salary</option>
          <option value="30000">$30,000+</option>
          <option value="50000">$50,000+</option>
          <option value="80000">$80,000+</option>
          <option value="100000">$100,000+</option>
          <option value="150000">$150,000+</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button onClick={clearAll} className="btn-ghost w-full">
          <X className="h-4 w-4" /> Clear all filters
        </button>
      )}
    </div>
  );
};

export default JobFilters;
