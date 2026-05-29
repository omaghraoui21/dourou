import { cookies } from 'next/headers'
import { Navbar } from '@/components/layout/Navbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { DemoBanner } from '@/components/demo/DemoBanner'
import { DEMO_COOKIE, DEMO_USER_COOKIE } from '@/lib/demo/constants'
import { getSeedProfileById, DEFAULT_DEMO_USER_ID } from '@/lib/demo/data'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const isDemo = cookieStore.get(DEMO_COOKIE)?.value === '1'

  let userName: string | undefined
  let avatarUrl: string | null = null

  if (isDemo) {
    // Mode demo : on resout le nom depuis le seed (pas d'appel Supabase)
    const demoUserId = cookieStore.get(DEMO_USER_COOKIE)?.value || DEFAULT_DEMO_USER_ID
    const profile = getSeedProfileById(demoUserId)
    userName = profile?.full_name || undefined
  } else {
    // Mode reel : on recupere le profil via Supabase
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single()

        if (profile) {
          userName = profile.full_name || undefined
          avatarUrl = profile.avatar_url || null
        }
      }
    } catch {
      // Supabase non configure : on continue sans profil (le client redirigera)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={userName} avatarUrl={avatarUrl} />
      <DemoBanner />
      <main className={`${isDemo ? 'pt-[104px]' : 'pt-16'} pb-20 md:pb-8 px-4`}>
        <div className="max-w-6xl mx-auto py-6">{children}</div>
      </main>
      <MobileNav />
    </div>
  )
}
