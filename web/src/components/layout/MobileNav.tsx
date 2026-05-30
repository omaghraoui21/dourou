'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Coins, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUnreadCount } from '@/lib/useUnread'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Accueil' },
  { href: '/dashboard/tontines', icon: Coins, label: 'Tontines' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Alertes' },
  { href: '/dashboard/profile', icon: User, label: 'Profil' },
]

export function MobileNav() {
  const pathname = usePathname()
  const unread = useUnreadCount()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-lg border-t border-white/5">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const showBadge = item.href === '/dashboard/notifications' && unread > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1',
                isActive ? 'text-gold' : 'text-slate-400'
              )}
            >
              <span className="relative">
                <item.icon className="w-5 h-5" />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-gold text-slate-900 text-[10px] font-bold flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </span>
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
