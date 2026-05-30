'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getCurrentUser,
  getTontine,
  getMyMembership,
  getRound,
  getMember,
  getPaymentsForRound,
  declarePayment,
  confirmPayment,
  type PaymentWithMember,
} from '@/lib/data'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PaymentRow } from '@/components/tontine/PaymentRow'
import { DeclarePaymentModal } from '@/components/tontine/DeclarePaymentModal'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Crown } from 'lucide-react'
import type { Round, TontineMember, Tontine } from '@/lib/database.types'

export default function RoundDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tontineId = params.id as string
  const roundId = params.roundId as string

  const [tontine, setTontine] = useState<Tontine | null>(null)
  const [round, setRound] = useState<Round | null>(null)
  const [beneficiary, setBeneficiary] = useState<TontineMember | null>(null)
  const [payments, setPayments] = useState<PaymentWithMember[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [declareModalOpen, setDeclareModalOpen] = useState(false)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth')
          return
        }
        setCurrentUserId(user.id)

        const [tontineData, membership, roundData, paymentsData] = await Promise.all([
          getTontine(tontineId),
          getMyMembership(tontineId, user.id),
          getRound(roundId),
          getPaymentsForRound(roundId),
        ])

        if (tontineData) setTontine(tontineData)
        if (membership) setIsAdmin(membership.role === 'admin')
        if (roundData) setRound(roundData)
        setPayments(paymentsData)

        if (roundData?.beneficiary_id) {
          const beneficiaryData = await getMember(roundData.beneficiary_id)
          if (beneficiaryData) setBeneficiary(beneficiaryData)
        }
      } catch (err) {
        console.error('Error fetching round:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [roundId, tontineId, router])

  const handleDeclare = (paymentId: string) => {
    setSelectedPaymentId(paymentId)
    setDeclareModalOpen(true)
  }

  const handleDeclareSubmit = async (method: string, reference: string) => {
    if (!selectedPaymentId) return

    const { error } = await declarePayment(selectedPaymentId, method, reference)

    if (!error) {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === selectedPaymentId
            ? {
                ...p,
                status: 'declared' as const,
                method: method as PaymentWithMember['method'],
                reference,
              }
            : p
        )
      )
      setDeclareModalOpen(false)
      setSelectedPaymentId(null)
    }
  }

  const handleConfirm = async (paymentId: string) => {
    setConfirmingId(paymentId)
    const { error } = await confirmPayment(paymentId)

    if (!error) {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId ? { ...p, status: 'paid' as const } : p
        )
      )
    }
    setConfirmingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!round || !tontine) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Tour introuvable</p>
      </div>
    )
  }

  const paidCount = payments.filter((p) => p.status === 'paid').length
  const totalExpected = payments.length
  const progressPercent = totalExpected > 0 ? (paidCount / totalExpected) * 100 : 0

  const statusBadge = (status: string | null) => {
    switch (status) {
      case 'current':
        return <Badge variant="active">En cours</Badge>
      case 'completed':
        return <Badge variant="completed">Termine</Badge>
      default:
        return <Badge variant="draft">A venir</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-card border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">
              Tour {round.round_number}
            </h1>
            {statusBadge(round.status)}
          </div>
          <p className="text-slate-400 text-sm">{tontine.title}</p>
        </div>
      </div>

      {/* Beneficiary Card */}
      {beneficiary && (
        <Card className="p-5 border-gold/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={beneficiary.name} size="lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-slate-900" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gold uppercase font-medium tracking-wide">
                Beneficiaire du Tour {round.round_number}
              </p>
              <p className="text-lg font-semibold text-white">{beneficiary.name}</p>
              <p className="text-sm text-slate-400">
                Recevra {formatCurrency(tontine.amount * (tontine.total_members - 1))}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">Progression de la cagnotte</span>
          <span className="text-sm font-medium text-white">
            {paidCount}/{totalExpected} paiements recus
          </span>
        </div>
        <ProgressBar value={progressPercent} />
        <p className="text-xs text-slate-500 mt-2">
          {formatCurrency(paidCount * tontine.amount)} / {formatCurrency(totalExpected * tontine.amount)} collectes
        </p>
      </Card>

      {/* Payments List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Paiements des membres
        </h2>
        <div className="space-y-3">
          {payments.map((payment) => {
            const isOwnPayment = payment.member?.user_id === currentUserId
            const canDeclare = isOwnPayment && payment.status === 'unpaid'
            const canConfirm = isAdmin && payment.status === 'declared'

            return (
              <PaymentRow
                key={payment.id}
                payment={payment}
                memberName={payment.member?.name || 'Inconnu'}
                action={
                  canDeclare ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDeclare(payment.id)}
                    >
                      Declarer
                    </Button>
                  ) : canConfirm ? (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={confirmingId === payment.id}
                      onClick={() => handleConfirm(payment.id)}
                    >
                      Confirmer
                    </Button>
                  ) : undefined
                }
              />
            )
          })}
        </div>
      </div>

      {/* Declare Payment Modal */}
      <DeclarePaymentModal
        isOpen={declareModalOpen}
        onClose={() => {
          setDeclareModalOpen(false)
          setSelectedPaymentId(null)
        }}
        amount={tontine.amount}
        onSubmit={handleDeclareSubmit}
      />
    </div>
  )
}
