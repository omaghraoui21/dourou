/**
 * Security & Anti-Abuse Utilities for Dourou
 * Implements rate limiting, cooling-off periods, and abuse prevention
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTunisTime } from './timezone';

// Storage keys
const INVITATION_ATTEMPTS_KEY = 'dourou_invitation_attempts';
const INVITATION_COOLDOWN_KEY = 'dourou_invitation_cooldown';
const PAYMENT_DECLARATIONS_KEY = 'dourou_payment_declarations';

// Rate limiting constants
const MAX_INVITATION_ATTEMPTS = 3;
const COOLDOWN_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const PAYMENT_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_PAYMENT_DECLARATIONS_PER_MINUTE = 5;

export interface RateLimitResult {
  allowed: boolean;
  attemptsLeft?: number;
  cooldownEndsAt?: Date;
  message?: string;
}

/**
 * Track failed invitation code attempts
 * After 3 failed attempts, user must wait before trying again
 */
export const trackInvitationAttempt = async (
  success: boolean
): Promise<RateLimitResult> => {
  try {
    // Check if user is in cooldown period
    const cooldownData = await AsyncStorage.getItem(INVITATION_COOLDOWN_KEY);
    if (cooldownData) {
      const cooldownEnd = new Date(JSON.parse(cooldownData));
      const now = getTunisTime();

      if (now < cooldownEnd) {
        return {
          allowed: false,
          cooldownEndsAt: cooldownEnd,
          message: 'Too many failed attempts. Please wait before trying again.',
        };
      } else {
        // Cooldown expired, clear it
        await AsyncStorage.removeItem(INVITATION_COOLDOWN_KEY);
        await AsyncStorage.removeItem(INVITATION_ATTEMPTS_KEY);
      }
    }

    // If successful, clear attempts
    if (success) {
      await AsyncStorage.removeItem(INVITATION_ATTEMPTS_KEY);
      return { allowed: true };
    }

    // Track failed attempt
    const attemptsData = await AsyncStorage.getItem(INVITATION_ATTEMPTS_KEY);
    const attempts = attemptsData ? JSON.parse(attemptsData) : { count: 0, timestamps: [] };

    attempts.count += 1;
    attempts.timestamps.push(getTunisTime().toISOString());

    // Check if exceeded max attempts
    if (attempts.count >= MAX_INVITATION_ATTEMPTS) {
      // Trigger cooldown
      const cooldownEnd = new Date(getTunisTime().getTime() + COOLDOWN_DURATION_MS);
      await AsyncStorage.setItem(
        INVITATION_COOLDOWN_KEY,
        JSON.stringify(cooldownEnd.toISOString())
      );

      return {
        allowed: false,
        attemptsLeft: 0,
        cooldownEndsAt: cooldownEnd,
        message: `Too many failed attempts. Please wait ${Math.ceil(
          COOLDOWN_DURATION_MS / 60000
        )} minutes before trying again.`,
      };
    }

    // Save updated attempts
    await AsyncStorage.setItem(INVITATION_ATTEMPTS_KEY, JSON.stringify(attempts));

    return {
      allowed: true,
      attemptsLeft: MAX_INVITATION_ATTEMPTS - attempts.count,
    };
  } catch (error) {
    console.error('Failed to track invitation attempt:', error);
    // Fail open for user experience
    return { allowed: true };
  }
};

/**
 * Check if user is in invitation cooldown period
 */
export const checkInvitationCooldown = async (): Promise<RateLimitResult> => {
  try {
    const cooldownData = await AsyncStorage.getItem(INVITATION_COOLDOWN_KEY);
    if (!cooldownData) {
      return { allowed: true };
    }

    const cooldownEnd = new Date(JSON.parse(cooldownData));
    const now = getTunisTime();

    if (now < cooldownEnd) {
      const attemptsData = await AsyncStorage.getItem(INVITATION_ATTEMPTS_KEY);
      const attempts = attemptsData ? JSON.parse(attemptsData) : { count: 0 };

      return {
        allowed: false,
        attemptsLeft: 0,
        cooldownEndsAt: cooldownEnd,
        message: `Too many failed attempts (${attempts.count}). Please wait before trying again.`,
      };
    }

    // Cooldown expired, clear it
    await AsyncStorage.removeItem(INVITATION_COOLDOWN_KEY);
    await AsyncStorage.removeItem(INVITATION_ATTEMPTS_KEY);

    return { allowed: true };
  } catch (error) {
    console.error('Failed to check invitation cooldown:', error);
    return { allowed: true };
  }
};

/**
 * Get remaining cooldown time in seconds
 */
export const getRemainingCooldownTime = async (): Promise<number> => {
  try {
    const cooldownData = await AsyncStorage.getItem(INVITATION_COOLDOWN_KEY);
    if (!cooldownData) return 0;

    const cooldownEnd = new Date(JSON.parse(cooldownData));
    const now = getTunisTime();

    const remaining = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000);
    return Math.max(0, remaining);
  } catch (error) {
    return 0;
  }
};

/**
 * Format cooldown time for display
 */
export const formatCooldownTime = (seconds: number, locale: string = 'fr'): string => {
  if (seconds <= 0) return '';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    if (locale === 'ar') {
      return `${minutes} دقيقة${remainingSeconds > 0 ? ` و ${remainingSeconds} ثانية` : ''}`;
    } else if (locale === 'en') {
      return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
    } else {
      return `${minutes} min${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
    }
  }

  if (locale === 'ar') {
    return `${remainingSeconds} ثانية`;
  } else if (locale === 'en') {
    return `${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

/**
 * Rate limit payment declarations to prevent spam
 * Max 5 declarations per minute
 */
export const checkPaymentDeclarationLimit = async (): Promise<RateLimitResult> => {
  try {
    const now = getTunisTime();
    const windowStart = new Date(now.getTime() - PAYMENT_RATE_LIMIT_WINDOW_MS);

    const declarationsData = await AsyncStorage.getItem(PAYMENT_DECLARATIONS_KEY);
    let declarations: string[] = declarationsData ? JSON.parse(declarationsData) : [];

    // Remove old timestamps outside the rate limit window
    declarations = declarations.filter(
      (timestamp) => new Date(timestamp) > windowStart
    );

    // Check if limit exceeded
    if (declarations.length >= MAX_PAYMENT_DECLARATIONS_PER_MINUTE) {
      return {
        allowed: false,
        message: 'Too many payment declarations. Please wait a moment before trying again.',
      };
    }

    // Add current timestamp
    declarations.push(now.toISOString());
    await AsyncStorage.setItem(PAYMENT_DECLARATIONS_KEY, JSON.stringify(declarations));

    return {
      allowed: true,
      attemptsLeft: MAX_PAYMENT_DECLARATIONS_PER_MINUTE - declarations.length,
    };
  } catch (error) {
    console.error('Failed to check payment declaration limit:', error);
    // Fail open for user experience
    return { allowed: true };
  }
};

/**
 * Clear all rate limiting data (for testing or on successful operations)
 */
export const clearRateLimits = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      INVITATION_ATTEMPTS_KEY,
      INVITATION_COOLDOWN_KEY,
      PAYMENT_DECLARATIONS_KEY,
    ]);
  } catch (error) {
    console.error('Failed to clear rate limits:', error);
  }
};

/**
 * Validate invitation code format
 * Must be 6 alphanumeric characters
 */
export const validateInvitationCodeFormat = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
};

/**
 * Generate secure invitation code
 * 6-character alphanumeric, avoiding ambiguous characters (O, 0, I, 1, L)
 */
export const generateSecureInvitationCode = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let code = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }

  return code;
};

/**
 * Check if a tontine is joinable (status must be 'draft')
 */
export const isTontineJoinable = (status: string): boolean => {
  return status === 'draft';
};

/**
 * Validate payment method
 */
export const isValidPaymentMethod = (method: string): boolean => {
  const validMethods = ['cash', 'bank', 'd17', 'flouci'];
  return validMethods.includes(method.toLowerCase());
};

/**
 * Sanitize user input to prevent XSS and injection
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Validate tontine title
 */
export const validateTontineTitle = (title: string): { valid: boolean; error?: string } => {
  const sanitized = sanitizeInput(title);

  if (!sanitized || sanitized.length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters' };
  }

  if (sanitized.length > 50) {
    return { valid: false, error: 'Title must be less than 50 characters' };
  }

  return { valid: true };
};

/**
 * Validate contribution amount
 */
export const validateContributionAmount = (
  amount: number
): { valid: boolean; error?: string } => {
  if (!amount || amount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }

  if (amount > 1000000) {
    return { valid: false, error: 'Amount is too large' };
  }

  return { valid: true };
};
