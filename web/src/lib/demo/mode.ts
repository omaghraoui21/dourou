/**
 * Detection et activation du mode demo.
 *
 * Le mode demo est stocke dans un cookie (et non localStorage) afin d'etre
 * lisible a la fois cote client (pages) et cote serveur (middleware, layout).
 * Les mutations de donnees demo, elles, sont persistees dans localStorage
 * (voir demo/store.ts).
 */

import { DEFAULT_DEMO_USER_ID } from '@/lib/demo/data'
import { DEMO_COOKIE, DEMO_USER_COOKIE, DEMO_STORE_KEY } from '@/lib/demo/constants'

export { DEMO_COOKIE, DEMO_USER_COOKIE, DEMO_STORE_KEY }

const COOKIE_MAX_AGE = 60 * 60 * 24 // 24h

// ----- Lecture (client uniquement) -----
export function isDemoMode(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie
    .split('; ')
    .some((c) => c === `${DEMO_COOKIE}=1`)
}

export function getDemoUserId(): string {
  if (typeof document === 'undefined') return DEFAULT_DEMO_USER_ID
  const entry = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${DEMO_USER_COOKIE}=`))
  if (!entry) return DEFAULT_DEMO_USER_ID
  return decodeURIComponent(entry.split('=')[1] || '') || DEFAULT_DEMO_USER_ID
}

// ----- Ecriture (client uniquement) -----
export function setDemoUser(userId: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${DEMO_USER_COOKIE}=${encodeURIComponent(
    userId
  )}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
}

export function enableDemoMode(userId: string = DEFAULT_DEMO_USER_ID): void {
  if (typeof document === 'undefined') return
  // Repart d'un etat propre a chaque entree en demo
  try {
    localStorage.removeItem(DEMO_STORE_KEY)
  } catch {
    // ignore
  }
  document.cookie = `${DEMO_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
  setDemoUser(userId)
}

export function disableDemoMode(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0; samesite=lax`
  document.cookie = `${DEMO_USER_COOKIE}=; path=/; max-age=0; samesite=lax`
  try {
    localStorage.removeItem(DEMO_STORE_KEY)
  } catch {
    // ignore
  }
}
