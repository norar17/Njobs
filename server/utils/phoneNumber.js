const DEFAULT_COUNTRY_CODE = '+63';

export const normalizePhoneNumber = (rawPhone, fallbackCountryCode = DEFAULT_COUNTRY_CODE) => {
  if (!rawPhone) return null;

  const trimmed = rawPhone.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/[^0-9]/g, '');
    return digits ? `+${digits}` : null;
  }

  const digitsOnly = trimmed.replace(/[^0-9]/g, '');
  if (!digitsOnly) return null;

  const withoutLeadingZero = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
  return `${fallbackCountryCode}${withoutLeadingZero}`;
};

export const isValidE164 = (phone) => /^\+[1-9]\d{6,14}$/.test(phone || '');
