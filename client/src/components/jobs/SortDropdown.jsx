import { ArrowDownUp } from 'lucide-react';

const SortDropdown = ({ value, onChange }) => {
  return (
    <div className="relative">
      <select
        className="input-field appearance-none pr-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
      <ArrowDownUp className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
    </div>
  );
};

export default SortDropdown;
