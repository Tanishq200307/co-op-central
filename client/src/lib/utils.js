import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function initialsFromName(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function firstInitialFromName(name = '', fallback = '?') {
  return name.trim().charAt(0).toUpperCase() || fallback;
}

export function formatCurrencyRange({
  min,
  max,
  currency = 'CAD',
  period = 'hourly',
} = {}) {
  if (!min && !max) return 'Compensation not listed';

  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });

  const suffixMap = {
    hourly: '/hr',
    monthly: '/mo',
    annual: '/yr',
  };

  const lower = min ? formatter.format(min) : null;
  const upper = max ? formatter.format(max) : null;

  if (lower && upper) return `${lower} - ${upper}${suffixMap[period] || ''}`;
  return `${lower || upper}${suffixMap[period] || ''}`;
}
