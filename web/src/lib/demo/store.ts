/**
 * Store de demonstration persiste dans localStorage.
 *
 * Permet au mode demo de se comporter comme une vraie application :
 * les declarations / confirmations de paiement et la creation de tontines
 * persistent pendant toute la session du navigateur.
 *
 * Client uniquement (utilise localStorage).
 */

'use client'

import { buildSeedSnapshot, type DemoSnapshot } from '@/lib/demo/data'
import { DEMO_STORE_KEY } from '@/lib/demo/constants'
import type {
  Profile,
  Tontine,
  TontineMember,
  Round,
  Payment,
  Notification,
} from '@/lib/database.types'

function read(): DemoSnapshot {
  if (typeof window === 'undefined') return buildSeedSnapshot()
  try {
    const raw = localStorage.getItem(DEMO_STORE_KEY)
    if (!raw) {
      const seed = buildSeedSnapshot()
      localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(seed))
      return seed
    }
    return JSON.parse(raw) as DemoSnapshot
  } catch {
    return buildSeedSnapshot()
  }
}

function write(snapshot: DemoSnapshot): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(snapshot))
  } catch {
    // ignore quota errors
  }
}

// ----- Lectures -----
export function getProfile(userId: string): Profile | null {
  return read().profiles.find((p) => p.id === userId) ?? null
}

export function getTontinesForUser(userId: string): (Tontine & { role?: string })[] {
  const snap = read()
  const memberships = snap.members.filter((m) => m.user_id === userId)
  return memberships
    .map((m) => {
      const tontine = snap.tontines.find((t) => t.id === m.tontine_id)
      if (!tontine) return null
      return { ...tontine, role: m.role ?? undefined }
    })
    .filter((t): t is Tontine & { role?: string } => t !== null)
}

export function getTontine(tontineId: string): Tontine | null {
  return read().tontines.find((t) => t.id === tontineId) ?? null
}

export function getMembers(tontineId: string): TontineMember[] {
  return read()
    .members.filter((m) => m.tontine_id === tontineId)
    .sort((a, b) => a.payout_order - b.payout_order)
}

export function getMembership(tontineId: string, userId: string): TontineMember | null {
  return (
    read().members.find((m) => m.tontine_id === tontineId && m.user_id === userId) ?? null
  )
}

export function getMember(memberId: string): TontineMember | null {
  return read().members.find((m) => m.id === memberId) ?? null
}

export function getRounds(tontineId: string): (Round & { beneficiary?: TontineMember | null })[] {
  const snap = read()
  return snap.rounds
    .filter((r) => r.tontine_id === tontineId)
    .sort((a, b) => a.round_number - b.round_number)
    .map((r) => ({
      ...r,
      beneficiary: r.beneficiary_id
        ? snap.members.find((m) => m.id === r.beneficiary_id) ?? null
        : null,
    }))
}

export function getRound(roundId: string): Round | null {
  return read().rounds.find((r) => r.id === roundId) ?? null
}

export function getCurrentRound(tontineId: string): Round | null {
  return (
    read().rounds.find((r) => r.tontine_id === tontineId && r.status === 'current') ?? null
  )
}

export function getPaymentsForRound(
  roundId: string
): (Payment & { member?: TontineMember | null })[] {
  const snap = read()
  return snap.payments
    .filter((p) => p.round_id === roundId)
    .map((p) => ({
      ...p,
      member: snap.members.find((m) => m.id === p.member_id) ?? null,
    }))
}

export function getPaymentsForUser(userId: string): Payment[] {
  const snap = read()
  const memberIds = snap.members.filter((m) => m.user_id === userId).map((m) => m.id)
  return snap.payments.filter((p) => memberIds.includes(p.member_id))
}

export function getNotifications(userId: string): Notification[] {
  return read()
    .notifications.filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// ----- Mutations -----
export function declarePayment(paymentId: string, method: string, reference: string): void {
  const snap = read()
  const payment = snap.payments.find((p) => p.id === paymentId)
  if (!payment) return
  payment.status = 'declared'
  payment.method = method as Payment['method']
  payment.reference = reference || null
  payment.declared_at = new Date().toISOString()

  // Notifier l'admin de la tontine
  const member = snap.members.find((m) => m.id === payment.member_id)
  const round = snap.rounds.find((r) => r.id === payment.round_id)
  if (member && round) {
    const admin = snap.members.find(
      (m) => m.tontine_id === round.tontine_id && m.role === 'admin'
    )
    if (admin?.user_id) {
      snap.notifications.unshift({
        id: `n-${Date.now()}`,
        user_id: admin.user_id,
        tontine_id: round.tontine_id,
        type: 'payment_declared',
        title: `${member.name} a declare un paiement`,
        body: `${member.name} a declare un paiement de ${payment.amount} DT. En attente de confirmation.`,
        read: false,
        created_at: new Date().toISOString(),
      })
    }
  }
  write(snap)
}

export function confirmPayment(paymentId: string): void {
  const snap = read()
  const payment = snap.payments.find((p) => p.id === paymentId)
  if (!payment) return
  payment.status = 'paid'
  payment.confirmed_at = new Date().toISOString()

  // Notifier le membre que son paiement est confirme
  const member = snap.members.find((m) => m.id === payment.member_id)
  if (member?.user_id) {
    snap.notifications.unshift({
      id: `n-${Date.now()}`,
      user_id: member.user_id,
      tontine_id: snap.rounds.find((r) => r.id === payment.round_id)?.tontine_id ?? null,
      type: 'payment_received',
      title: 'Paiement confirme',
      body: `Votre paiement de ${payment.amount} DT a ete confirme par l'administrateur.`,
      read: false,
      created_at: new Date().toISOString(),
    })
  }
  write(snap)
}

export function markNotificationRead(id: string): void {
  const snap = read()
  const notif = snap.notifications.find((n) => n.id === id)
  if (notif) {
    notif.read = true
    write(snap)
  }
}

export function markAllNotificationsRead(userId: string): void {
  const snap = read()
  snap.notifications.forEach((n) => {
    if (n.user_id === userId) n.read = true
  })
  write(snap)
}

export function createTontine(input: {
  creatorId: string
  creatorName: string
  creatorPhone: string | null
  title: string
  amount: number
  frequency: 'weekly' | 'monthly'
  totalMembers: number
  distribution: 'fixed' | 'random' | 'trust'
}): string {
  const snap = read()
  const id = `t-${Date.now()}`
  const now = new Date().toISOString()

  snap.tontines.push({
    id,
    creator_id: input.creatorId,
    title: input.title,
    amount: input.amount,
    frequency: input.frequency,
    currency: 'TND',
    total_members: input.totalMembers,
    current_round: 1,
    distribution_logic: input.distribution,
    status: 'draft',
    start_date: null,
    next_deadline: null,
    created_at: now,
    updated_at: now,
  })

  snap.members.push({
    id: `m-${Date.now()}`,
    tontine_id: id,
    user_id: input.creatorId,
    name: input.creatorName,
    phone: input.creatorPhone,
    payout_order: 1,
    role: 'admin',
    joined_at: now,
  })

  write(snap)
  return id
}
