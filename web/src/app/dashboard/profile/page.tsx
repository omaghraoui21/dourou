'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getCurrentUser,
  getProfile,
  getProfileStats,
  signOut,
} from '@/lib/data'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { TrustScoreDisplay } from '@/components/tontine/TrustScoreDisplay'
import { formatDate } from '@/lib/utils'
import { LogOut, Globe } from 'lucide-react'
import type { Profile } from '@/lib/database.types'

export default function ProfilePage() {
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    paymentRate: 0,
    months: 0,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth')
          return
        }

        const [profileData, profileStats] = await Promise.all([
          getProfile(user.id),
          getProfileStats(user.id),
        ])

        if (profileData) setProfile(profileData)

        // Calculate months since registration
        let months = 0
        if (profileData?.created_at) {
          const diff = new Date().getTime() - new Date(profileData.created_at).getTime()
          months = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24 * 30)))
        }

        setStats({ ...profileStats, months })
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) return null

  const trustScore = profile.trust_score || 3.0
  const maskedPhone = profile.phone
    ? `+216 ** *** ${profile.phone.slice(-2)}`
    : 'Non renseigne'

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* User Card */}
      <Card className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar name={profile.full_name || 'U'} size="lg" />
          <h2 className="text-lg font-semibold text-white mt-3">
            {profile.full_name || 'Utilisateur'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">{maskedPhone}</p>
          <p className="text-xs text-slate-500 mt-1">
            Membre depuis {formatDate(profile.created_at)}
          </p>
        </div>
      </Card>

      {/* Trust Score */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-slate-400 mb-4">Score de confiance</h3>
        <TrustScoreDisplay score={trustScore} />
        <p className="text-xs text-slate-500 text-center mt-3">
          Base sur votre ponctualite et historique de paiement
        </p>
      </Card>

      {/* Statistics */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">Statistiques</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.active}</p>
            <p className="text-xs text-slate-400 mt-1">Tontines actives</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
            <p className="text-xs text-slate-400 mt-1">Tontines terminees</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.paymentRate}%</p>
            <p className="text-xs text-slate-400 mt-1">Taux de paiement</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.months}</p>
            <p className="text-xs text-slate-400 mt-1">Mois d&apos;anciennete</p>
          </Card>
        </div>
      </div>

      {/* Settings */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-white">Langue</span>
          </div>
          <span className="text-sm text-slate-400">Francais</span>
        </div>
      </Card>

      {/* Logout */}
      <Button
        variant="danger"
        size="lg"
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4" />
        Se deconnecter
      </Button>
    </div>
  )
}
