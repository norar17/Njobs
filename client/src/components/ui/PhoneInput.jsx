import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+63', country: 'PH', flag: '🇵🇭', label: 'Philippines' },
  { code: '+1', country: 'US', flag: '🇺🇸', label: 'United States' },
  { code: '+44', country: 'GB', flag: '🇬🇧', label: 'United Kingdom' },
  { code: '+61', country: 'AU', flag: '🇦🇺', label: 'Australia' },
  { code: '+65', country: 'SG', flag: '🇸🇬', label: 'Singapore' },
  { code: '+971', country: 'AE', flag: '🇦🇪', label: 'UAE' },
  { code: '+966', country: 'SA', flag: '🇸🇦', label: 'Saudi Arabia' },
  { code: '+852', country: 'HK', flag: '🇭🇰', label: 'Hong Kong' },
  { code: '+81', country: 'JP', flag: '🇯🇵', label: 'Japan' },
  { code: '+82', country: 'KR', flag: '🇰🇷', label: 'South Korea' },
  { code: '+86', country: 'CN', flag: '🇨🇳', label: 'China' },
  { code: '+91', country: 'IN', flag: '🇮🇳', label: 'India' },
  { code: '+60', country: 'MY', flag: '🇲🇾', label: 'Malaysia' },
  { code: '+62', country: 'ID', flag: '🇮🇩', label: 'Indonesia' },
];

const parseE164 = (value) => {
  if (!value) return { dialCode: '+63', national: '' };
  const match = COUNTRY_CODES.find((c) => value.startsWith(c.code));
  if (match) {
    return { dialCode: match.code, national: value.slice(match.code.length).trim() };
  }
  return { dialCode: '+63', national: value.replace(/^\+/, '') };
};

const PhoneInput = ({ value, onChange, placeholder = '912 345 6789' }) => {
  const initial = parseE164(value);
  const [dialCode, setDialCode] = useState(initial.dialCode);
  const [national, setNational] = useState(initial.national);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emitChange = (nextDialCode, nextNational) => {
    const digitsOnly = nextNational.replace(/[^0-9]/g, '');
    const normalized = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
    onChange(digitsOnly ? `${nextDialCode}${normalized}` : '');
  };

  const handleNationalChange = (e) => {
    const raw = e.target.value;
    setNational(raw);
    emitChange(dialCode, raw);
  };

  const handleSelectCountry = (code) => {
    setDialCode(code);
    setDropdownOpen(false);
    emitChange(code, national);
  };

  const selected = COUNTRY_CODES.find((c) => c.code === dialCode) || COUNTRY_CODES[0];

  return (
    <div className="flex gap-2">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className="input-field flex w-[100px] items-center justify-between gap-1 px-3"
        >
          <span className="flex items-center gap-1.5 text-sm">
            <span>{selected.flag}</span>
            <span>{selected.code}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
        </button>
        {dropdownOpen && (
          <div className="absolute left-0 top-full z-20 mt-1.5 max-h-64 w-56 overflow-y-auto rounded-xl border border-ink-300/60 bg-paper-100 p-1.5 shadow-card-hover dark:border-dark-700 dark:bg-dark-850">
            {COUNTRY_CODES.map((c) => (
              <button
                key={c.country}
                type="button"
                onClick={() => handleSelectCountry(c.code)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink-700 hover:bg-paper-200 dark:text-paper-100 dark:hover:bg-dark-800"
              >
                <span>{c.flag}</span>
                <span className="flex-1 truncate">{c.label}</span>
                <span className="text-ink-400 dark:text-ink-300">{c.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <input
        type="tel"
        className="input-field flex-1"
        placeholder={placeholder}
        value={national}
        onChange={handleNationalChange}
      />
    </div>
  );
};

export default PhoneInput;
