'use client'

import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { useUnreadCount } from '@/lib/useUnread'

interface NavbarProps {
  userName?: string
  avatarUrl?: string | null
}

export function Navbar({ userName = 'Utilisateur', avatarUrl }: NavbarProps) {
  const unread = useUnreadCount()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-gold">
          Dourou
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Tableau de bord
          </Link>
          <Link
            href="/dashboard/tontines"
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Mes Tontines
          </Link>
          <Link
            href="/dashboard/notifications"
            className="text-sm text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            Notifications
            {unread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-slate-900 text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
          <Link
            href="/dashboard/profile"
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Profil
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Avatar name={userName} size="sm" imageUrl={avatarUrl} />
          <span className="text-sm text-slate-300">{userName}</span>
        </div>
      </div>
    </header>
  )
}
