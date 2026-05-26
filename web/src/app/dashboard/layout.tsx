import { Navbar } from '@/components/layout/Navbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userName: string | undefined
  let avatarUrl: string | null = null

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={userName} avatarUrl={avatarUrl} />
      <main className="pt-16 pb-20 md:pb-8 px-4">
        <div className="max-w-6xl mx-auto py-6">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
