'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { RoundCard } from '@/components/tontine/RoundCard'
import { PaymentRow } from '@/components/tontine/PaymentRow'
import { formatCurrency, formatPhone } from '@/lib/utils'
import { ArrowLeft, Users, Calendar, Coins } from 'lucide-react'
import type { Tontine, TontineMember, Round, Payment } from '@/lib/database.types'

type Tab = 'members' | 'rounds' | 'payments'

interface RoundWithBeneficiary extends Round {
  beneficiary?: TontineMember | null
}

interface PaymentWithMember extends Payment {
  member?: TontineMember | null
}

export default function TontineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const tontineId = params.id as string

  const [tontine, setTontine] = useState<Tontine | null>(null)
  const [members, setMembers] = useState<TontineMember[]>([])
  const [rounds, setRounds] = useState<RoundWithBeneficiary[]>([])
  const [payments, setPayments] = useState<PaymentWithMember[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('members')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch tontine
        const { data: tontineData } = await supabase
          .from('tontines')
          .select('*')
          .eq('id', tontineId)
          .single()

        if (tontineData) setTontine(tontineData)

        // Fetch members
        const { data: membersData } = await supabase
          .from('tontine_members')
          .select('*')
          .eq('tontine_id', tontineId)
          .order('payout_order', { ascending: true })

        if (membersData) setMembers(membersData)

        // Fetch rounds with beneficiary info
        const { data: roundsData } = await supabase
          .from('rounds')
          .select('*, beneficiary:tontine_members(*)')
          .eq('tontine_id', tontineId)
          .order('round_number', { ascending: true })

        if (roundsData) {
          setRounds(
            roundsData.map((r) => ({
              ...r,
              beneficiary: r.beneficiary as unknown as TontineMember | null,
            }))
          )
        }

        // Fetch payments for the current round
        const currentRound = roundsData?.find((r) => r.status === 'current')
        if (currentRound) {
          const { data: paymentsData } = await supabase
            .from('payments')
            .select('*, member:tontine_members(*)')
            .eq('round_id', currentRound.id)

          if (paymentsData) {
            setPayments(
              paymentsData.map((p) => ({
                ...p,
                member: p.member as unknown as TontineMember | null,
              }))
            )
          }
        }
      } catch (err) {
        console.error('Error fetching tontine:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tontineId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!tontine) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Tontine introuvable</p>
      </div>
    )
  }

  const statusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge variant="active">Active</Badge>
      case 'completed':
        return <Badge variant="completed">Terminee</Badge>
      default:
        return <Badge variant="draft">Brouillon</Badge>
    }
  }

  const frequencyLabel = tontine.frequency === 'weekly' ? 'semaine' : 'mois'

  const tabs: { id: Tab; label: string }[] = [
    { id: 'members', label: 'Membres' },
    { id: 'rounds', label: 'Tours' },
    { id: 'payments', label: 'Paiements' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-card border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-white">{tontine.title}</h1>
            {statusBadge(tontine.status)}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Coins className="w-4 h-4" />
              {formatCurrency(tontine.amount)} / {frequencyLabel}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {members.length}/{tontine.total_members} membres
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card rounded-xl p-1 border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-gold/10 text-gold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'members' && (
        <div className="space-y-3">
          {members.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={member.name}
                  size="md"
                  isAdmin={member.role === 'admin'}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {member.name}
                    </p>
                    {member.role === 'admin' && (
                      <Badge variant="active">Admin</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {member.phone ? formatPhone(member.phone) : 'Telephone non renseigne'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Ordre</span>
                  <p className="text-sm font-semibold text-white">
                    #{member.payout_order}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'rounds' && (
        <div className="space-y-3">
          {rounds.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-slate-400">Aucun tour programme</p>
            </Card>
          ) : (
            rounds.map((round) => (
              <RoundCard
                key={round.id}
                round={round}
                beneficiaryName={round.beneficiary?.name || 'Non assigne'}
                onClick={() =>
                  router.push(`/dashboard/tontine/${tontineId}/round/${round.id}`)
                }
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-3">
          {payments.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-slate-400">Aucun paiement pour le tour en cours</p>
            </Card>
          ) : (
            payments.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                memberName={payment.member?.name || 'Inconnu'}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
