/**
 * Utility functions for Arabic date formatting and exact YYYY-MM-DD preservation
 */

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export const getTodayLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Extracts YYYY-MM-DD from any date string (ISO or date-only) without UTC shifting
 */
export const normalizeDateToInputString = (dateVal?: string | null): string => {
  if (!dateVal) return getTodayLocalDateString();
  
  // If it's already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    return dateVal;
  }
  
  // If it contains T (e.g. 2026-08-16T14:30:00Z), take the date part
  if (dateVal.includes('T')) {
    const parts = dateVal.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(parts)) {
      return parts;
    }
  }

  // Fallback: parse through Date safely
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Ignore error and return today
  }

  return getTodayLocalDateString();
};

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

/**
 * Formats a date string into elegant Arabic display (e.g. "١٦ أغسطس ٢٠٢٦" or "16 أغسطس 2026")
 */
export const formatArabicDate = (dateVal?: string | null): string => {
  if (!dateVal) return '—';
  
  const normalized = normalizeDateToInputString(dateVal);
  const [yearStr, monthStr, dayStr] = normalized.split('-');
  
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  
  if (monthIndex >= 0 && monthIndex < 12) {
    const monthName = ARABIC_MONTHS[monthIndex];
    return `${day} ${monthName} ${year}`;
  }
  
  return normalized;
};
