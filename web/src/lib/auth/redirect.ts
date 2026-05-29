export const AUTH_ERROR_INVALID_LINK = 'lien_invalide'

const DEFAULT_POST_AUTH_PATH = '/dashboard'

/** Relative in-app path only — blocks open redirects via `next`. */
export function safeAuthRedirectPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('@')) {
    return DEFAULT_POST_AUTH_PATH
  }
  return next
}
