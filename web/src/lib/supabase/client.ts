import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

// Valeurs de repli pour permettre un deploiement en "mode demo uniquement"
// (sans Supabase configure). Le client se construit sans erreur ; seules les
// vraies requetes reseau echoueront, ce qui est attendu dans ce mode.
const FALLBACK_URL = 'https://placeholder.supabase.co'
const FALLBACK_KEY = 'public-anon-placeholder'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY
  )
}
