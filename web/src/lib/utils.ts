import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { t } from './translations'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `${amount} DT`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatPhone(phone: string): string {
  // Mask phone: show only last 2 digits
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 8) {
    const lastTwo = digits.slice(-2)
    return `+216 ** *** ${lastTwo}`
  }
  return phone
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value)
}

export function formatMaskedEmail(email: string, maxStars = 6): string {
  return email.replace(/(.{2})(.*)(@.*)/, (_, a, mid, domain) => {
    const hidden = mid.length > 0 ? '*'.repeat(Math.min(mid.length, maxStars)) : ''
    return `${a}${hidden}${domain}`
  })
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return t.dashboard.greeting_morning
  if (hour < 18) return t.dashboard.greeting_afternoon
  return t.dashboard.greeting_evening
}

export function getTrustTier(score: number): { name: string; color: string } {
  if (score >= 5) return { name: t.trust.master, color: 'text-yellow-400' }
  if (score >= 4) return { name: t.trust.elite, color: 'text-purple-400' }
  if (score >= 3) return { name: t.trust.trusted, color: 'text-blue-400' }
  if (score >= 2) return { name: t.trust.reliable, color: 'text-green-400' }
  return { name: t.trust.novice, color: 'text-slate-400' }
}

export function getTimeAgo(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'A l\'instant'
  if (diffMinutes < 60) return `Il y a ${diffMinutes}m`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 30) return `Il y a ${diffDays}j`
  return formatDate(date)
}
