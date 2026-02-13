/**
 * Timezone Utilities for Dourou
 * All tontine operations are locked to Africa/Tunis timezone
 *
 * Ensures consistent deadlines, schedules, and timestamps across all users
 */

// Africa/Tunis timezone (GMT+1, no DST)
export const TUNIS_TIMEZONE = 'Africa/Tunis';
export const TUNIS_TIMEZONE_OFFSET = '+01:00';

/**
 * Get current date/time in Tunis timezone
 */
export const getTunisTime = (): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TUNIS_TIMEZONE }));
};

/**
 * Convert any date to Tunis timezone
 */
export const toTunisTime = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.toLocaleString('en-US', { timeZone: TUNIS_TIMEZONE }));
};

/**
 * Format date for display in Tunisian standard (DD/MM/YYYY)
 */
export const formatTunisianDate = (date: Date | string, locale: string = 'fr'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: TUNIS_TIMEZONE,
  };

  return new Intl.DateTimeFormat(locale, options).format(d);
};

/**
 * Format date and time for display (DD/MM/YYYY HH:MM)
 */
export const formatTunisianDateTime = (date: Date | string, locale: string = 'fr'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TUNIS_TIMEZONE,
  };

  return new Intl.DateTimeFormat(locale, options).format(d);
};

/**
 * Format time only (HH:MM)
 */
export const formatTunisianTime = (date: Date | string, locale: string = 'fr'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TUNIS_TIMEZONE,
  };

  return new Intl.DateTimeFormat(locale, options).format(d);
};

/**
 * Calculate next deadline based on frequency
 * @param startDate - Tontine start date
 * @param frequency - 'weekly' or 'monthly'
 * @param roundNumber - Current round number (0-indexed)
 */
export const calculateNextDeadline = (
  startDate: Date | string,
  frequency: 'weekly' | 'monthly',
  roundNumber: number = 0
): Date => {
  const start = toTunisTime(startDate);
  const deadline = new Date(start);

  if (frequency === 'weekly') {
    deadline.setDate(deadline.getDate() + (7 * (roundNumber + 1)));
  } else {
    deadline.setMonth(deadline.getMonth() + (roundNumber + 1));
  }

  return deadline;
};

/**
 * Check if a date is past deadline (in Tunis timezone)
 */
export const isPastDeadline = (deadline: Date | string): boolean => {
  const now = getTunisTime();
  const deadlineDate = toTunisTime(deadline);
  return now > deadlineDate;
};

/**
 * Get days remaining until deadline
 */
export const getDaysUntilDeadline = (deadline: Date | string): number => {
  const now = getTunisTime();
  const deadlineDate = toTunisTime(deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Format relative time (e.g., "2 days left", "3 hours left")
 */
export const formatRelativeDeadline = (deadline: Date | string, locale: string = 'fr'): string => {
  const days = getDaysUntilDeadline(deadline);

  if (days < 0) {
    return locale === 'ar' ? 'متأخر' : locale === 'en' ? 'Late' : 'En retard';
  }

  if (days === 0) {
    return locale === 'ar' ? 'اليوم' : locale === 'en' ? 'Today' : 'Aujourd\'hui';
  }

  if (days === 1) {
    return locale === 'ar' ? 'غدا' : locale === 'en' ? 'Tomorrow' : 'Demain';
  }

  if (locale === 'ar') {
    return `${days} أيام متبقية`;
  } else if (locale === 'en') {
    return `${days} days left`;
  } else {
    return `${days} jours restants`;
  }
};

/**
 * Format currency in Tunisian Dinar (TND/DT)
 */
export const formatTunisianCurrency = (amount: number, locale: string = 'fr'): string => {
  // Tunisian standard uses "DT" suffix
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (locale === 'ar') {
    return `${formatted} د.ت`; // Arabic: Dinar Tunisi
  } else if (locale === 'en') {
    return `${formatted} TND`;
  } else {
    return `${formatted} DT`; // French standard
  }
};

/**
 * Format currency for compact display (e.g., "1.2K DT")
 */
export const formatCompactCurrency = (amount: number, locale: string = 'fr'): string => {
  if (amount < 1000) {
    return formatTunisianCurrency(amount, locale);
  }

  const compact = (amount / 1000).toFixed(1);

  if (locale === 'ar') {
    return `${compact}ك د.ت`;
  } else if (locale === 'en') {
    return `${compact}K TND`;
  } else {
    return `${compact}K DT`;
  }
};

/**
 * Parse amount string to number (handles comma/dot differences)
 */
export const parseTunisianAmount = (amountStr: string): number => {
  // Remove currency symbols and spaces
  const cleaned = amountStr.replace(/[^\d.,]/g, '');

  // Handle comma as decimal separator (French/Tunisian standard)
  const normalized = cleaned.replace(',', '.');

  return parseFloat(normalized) || 0;
};

/**
 * Create ISO string in Tunis timezone
 * Useful for storing in database
 */
export const toTunisISOString = (date: Date | string): string => {
  const tunisDate = toTunisTime(date);
  return tunisDate.toISOString();
};

/**
 * Validate if date is in the future (Tunis timezone)
 */
export const isFutureDate = (date: Date | string): boolean => {
  const now = getTunisTime();
  const checkDate = toTunisTime(date);
  return checkDate > now;
};

/**
 * Get start of day in Tunis timezone
 */
export const getStartOfDay = (date: Date | string = new Date()): Date => {
  const tunisDate = toTunisTime(date);
  tunisDate.setHours(0, 0, 0, 0);
  return tunisDate;
};

/**
 * Get end of day in Tunis timezone
 */
export const getEndOfDay = (date: Date | string = new Date()): Date => {
  const tunisDate = toTunisTime(date);
  tunisDate.setHours(23, 59, 59, 999);
  return tunisDate;
};
