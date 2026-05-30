import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

// Valeurs de repli pour eviter une erreur de construction si Supabase n'est pas
// configure (deploiement en mode demo uniquement). En mode demo, le middleware
// et le layout n'appellent de toute facon pas ce client.
const FALLBACK_URL = 'https://placeholder.supabase.co'
const FALLBACK_KEY = 'public-anon-placeholder'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
