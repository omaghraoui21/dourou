'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getMyTontines, type TontineWithRole } from '@/lib/data'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { TontineCard } from '@/components/tontine/TontineCard'
import { Plus, Coins } from 'lucide-react'

type FilterTab = 'all' | 'active' | 'completed' | 'draft'

export default function TontinesPage() {
  const router = useRouter()

  const [tontines, setTontines] = useState<TontineWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  useEffect(() => {
    async function fetchTontines() {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth')
          return
        }

        const userTontines = await getMyTontines(user.id)
        setTontines(userTontines)
      } catch (err) {
        console.error('Erreur lors du chargement des tontines:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTontines()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const filteredTontines = tontines.filter((t) => {
    if (activeTab === 'all') return true
    return t.status === activeTab
  })

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'Toutes', count: tontines.length },
    { key: 'active', label: 'Actives', count: tontines.filter((t) => t.status === 'active').length },
    { key: 'completed', label: 'Terminees', count: tontines.filter((t) => t.status === 'completed').length },
    { key: 'draft', label: 'Brouillons', count: tontines.filter((t) => t.status === 'draft').length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mes Tontines</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerez et suivez toutes vos tontines
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/create')}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-light text-slate-900 rounded-xl font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle tontine
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-gold/10 text-gold border border-gold/30'
                : 'bg-card border border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? 'bg-gold/20 text-gold' : 'bg-slate-700 text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tontines List */}
      {filteredTontines.length === 0 ? (
        <EmptyState
          icon={Coins}
          title={activeTab === 'all' ? 'Aucune tontine' : `Aucune tontine ${tabs.find((t) => t.key === activeTab)?.label.toLowerCase()}`}
          description={
            activeTab === 'all'
              ? 'Creez votre premiere tontine ou rejoignez-en une existante'
              : 'Aucune tontine ne correspond a ce filtre'
          }
          action={activeTab === 'all' ? 'Creer une tontine' : undefined}
          onAction={activeTab === 'all' ? () => router.push('/dashboard/create') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTontines.map((tontine) => (
            <TontineCard
              key={tontine.id}
              tontine={tontine}
              onClick={() => router.push(`/dashboard/tontine/${tontine.id}`)}
            />
          ))}
        </div>
      )}

      {/* FAB - Create Tontine (mobile) */}
      <button
        onClick={() => router.push('/dashboard/create')}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-gold hover:bg-gold-light text-slate-900 rounded-full shadow-lg flex items-center justify-center transition-colors z-30 sm:hidden"
        aria-label="Creer une tontine"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
