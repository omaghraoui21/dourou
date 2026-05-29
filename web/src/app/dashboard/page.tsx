'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getCurrentUser,
  getProfile,
  getMyTontines,
  type TontineWithRole,
} from '@/lib/data'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { TontineCard } from '@/components/tontine/TontineCard'
import { getGreeting, formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Coins, PiggyBank, Calendar } from 'lucide-react'
import type { Profile } from '@/lib/database.types'

export default function DashboardPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [tontines, setTontines] = useState<TontineWithRole[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth')
          return
        }

        const [profileData, userTontines] = await Promise.all([
          getProfile(user.id),
          getMyTontines(user.id),
        ])

        if (profileData) setProfile(profileData)
        setTontines(userTontines)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const activeTontines = tontines.filter((t) => t.status === 'active')
  const totalSavings = activeTontines.reduce((sum, t) => sum + t.amount, 0)
  const nextDeadline = activeTontines
    .filter((t) => t.next_deadline)
    .sort((a, b) => new Date(a.next_deadline!).getTime() - new Date(b.next_deadline!).getTime())[0]
    ?.next_deadline

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {getGreeting()}{profile?.full_name ? `, ${profile.full_name}` : ''} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Voici un apercu de vos tontines
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Epargne active</p>
              <p className="text-lg font-bold text-white">{formatCurrency(totalSavings)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Tontines actives</p>
              <p className="text-lg font-bold text-white">{activeTontines.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Prochain versement</p>
              <p className="text-lg font-bold text-white">
                {nextDeadline ? formatDate(nextDeadline) : '-'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tontines List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Mes tontines</h2>
        {tontines.length === 0 ? (
          <EmptyState
            icon={Coins}
            title="Aucune tontine"
            description="Creez votre premiere tontine ou rejoignez-en une existante"
            action="Creer une tontine"
            onAction={() => router.push('/dashboard/create')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tontines.map((tontine) => (
              <TontineCard
                key={tontine.id}
                tontine={tontine}
                onClick={() => router.push(`/dashboard/tontine/${tontine.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB - Create Tontine */}
      <button
        onClick={() => router.push('/dashboard/create')}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-gold hover:bg-gold-light text-slate-900 rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
        aria-label="Creer une tontine"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
