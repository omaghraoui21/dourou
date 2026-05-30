'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isDemoMode, getDemoUserId, setDemoUser, disableDemoMode } from '@/lib/demo/mode'
import { DEMO_USERS } from '@/lib/demo/data'
import { FlaskConical, ChevronDown, X } from 'lucide-react'

export function DemoBanner() {
  const router = useRouter()
  const [demo, setDemo] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setDemo(isDemoMode())
    setUserId(getDemoUserId())
  }, [])

  if (!demo) return null

  const current = DEMO_USERS.find((u) => u.id === userId) ?? DEMO_USERS[0]

  const handleSwitch = (id: string) => {
    setDemoUser(id)
    setMenuOpen(false)
    // Recharge pour que toutes les pages refletent la nouvelle identite
    window.location.reload()
  }

  const handleExit = () => {
    disableDemoMode()
    router.push('/')
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-30 bg-gold/10 border-b border-gold/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FlaskConical className="w-4 h-4 text-gold flex-shrink-0" />
          <span className="text-xs text-gold font-medium truncate">
            Mode demo
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 truncate">
            - donnees fictives, aucun paiement reel
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Selecteur de compte demo */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-white/10 text-xs text-white hover:border-gold/40 transition-colors"
            >
              <span className="truncate max-w-[120px]">{current.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-card border border-white/10 rounded-xl shadow-xl overflow-hidden">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSwitch(u.id)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors ${
                      u.id === userId ? 'text-gold' : 'text-slate-300'
                    }`}
                  >
                    <span className="block font-medium">{u.label}</span>
                    <span className="block text-[11px] text-slate-500">{u.role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleExit}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
            aria-label="Quitter le mode demo"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quitter</span>
          </button>
        </div>
      </div>
    </div>
  )
}
