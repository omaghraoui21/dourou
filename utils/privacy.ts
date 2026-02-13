/**
 * Privacy Utilities for Dourou
 * Handles phone number masking and other privacy features
 */

/**
 * Mask phone number for display in shared views
 * Example: '+216 98 123 456' → '+216 •• ••• 456'
 *
 * @param phoneNumber - Full phone number (with or without country code)
 * @param goldBullets - Use gold-tinted bullets for luxury aesthetic
 * @returns Masked phone number string
 */
export const maskPhoneNumber = (
  phoneNumber: string,
  goldBullets: boolean = true
): string => {
  if (!phoneNumber) return '';

  // Clean phone number (remove spaces, dashes, etc.)
  const cleaned = phoneNumber.replace(/\s+/g, ' ').trim();

  // Detect Tunisian format: +216 XX XXX XXX
  if (cleaned.startsWith('+216')) {
    const parts = cleaned.split(' ');

    if (parts.length >= 4) {
      // +216 XX XXX XXX → +216 •• ••• XXX
      const lastThree = parts[parts.length - 1];
      const bullet = goldBullets ? '••' : '**';
      return `+216 ${bullet} ${bullet}${bullet} ${lastThree}`;
    }

    // Fallback: show last 3 digits
    const digits = cleaned.replace(/\D/g, '');
    const lastThree = digits.slice(-3);
    const bullet = goldBullets ? '••' : '**';
    return `+216 ${bullet} ${bullet}${bullet} ${lastThree}`;
  }

  // Generic phone number masking
  // Show first 3 and last 3 digits
  const digits = cleaned.replace(/\D/g, '');

  if (digits.length < 6) {
    // Too short, mask everything except last digit
    const bullet = goldBullets ? '•' : '*';
    return bullet.repeat(digits.length - 1) + digits.slice(-1);
  }

  const first = digits.slice(0, 3);
  const last = digits.slice(-3);
  const bullet = goldBullets ? '•' : '*';
  const maskedMiddle = bullet.repeat(Math.max(4, digits.length - 6));

  return `${first} ${maskedMiddle} ${last}`;
};

/**
 * Mask email address for privacy
 * Example: 'user@example.com' → 'u••r@example.com'
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '';

  const [local, domain] = email.split('@');

  if (local.length <= 2) {
    return `${local[0]}•@${domain}`;
  }

  const first = local[0];
  const last = local[local.length - 1];
  const middle = '•'.repeat(Math.min(local.length - 2, 3));

  return `${first}${middle}${last}@${domain}`;
};

/**
 * Format phone number for display (without masking)
 * Ensures consistent formatting across the app
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';

  const cleaned = phoneNumber.replace(/\D/g, '');

  // Tunisian format: +216 XX XXX XXX
  if (cleaned.startsWith('216') && cleaned.length === 11) {
    const code = '+216';
    const part1 = cleaned.slice(3, 5);
    const part2 = cleaned.slice(5, 8);
    const part3 = cleaned.slice(8, 11);
    return `${code} ${part1} ${part2} ${part3}`;
  }

  // Generic international format: +XXX XXX XXX XXX
  if (cleaned.length >= 10) {
    const formatted = cleaned.match(/.{1,3}/g);
    return '+' + formatted?.join(' ');
  }

  return phoneNumber;
};

/**
 * Check if user should see full phone number (owner or admin)
 */
export const canViewFullPhone = (
  userId: string,
  resourceOwnerId: string,
  isAdmin: boolean = false
): boolean => {
  return userId === resourceOwnerId || isAdmin;
};

/**
 * Sanitize sensitive data before logging
 */
export const sanitizeForLog = (data: any): any => {
  if (typeof data !== 'object' || data === null) return data;

  const sanitized = { ...data };

  // Mask phone numbers
  if (sanitized.phone) {
    sanitized.phone = maskPhoneNumber(sanitized.phone, false);
  }

  // Mask email
  if (sanitized.email) {
    sanitized.email = maskEmail(sanitized.email);
  }

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * Generate privacy-safe display name
 * Uses first name + masked last name
 */
export const getPrivacyDisplayName = (
  firstName: string,
  lastName: string
): string => {
  if (!firstName) return 'User';
  if (!lastName) return firstName;

  const maskedLast = lastName[0] + '•'.repeat(Math.min(lastName.length - 1, 3));
  return `${firstName} ${maskedLast}`;
};
