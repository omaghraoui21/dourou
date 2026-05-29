/**
 * Couche d'acces aux donnees unifiee.
 *
 * Chaque fonction route automatiquement vers :
 *  - le store de demonstration (localStorage) si le mode demo est actif ;
 *  - Supabase (backend reel) sinon.
 *
 * Cela permet aux pages d'etre identiques quel que soit le mode, et de tester
 * l'integralite du produit sans configurer Supabase.
 *
 * Client uniquement.
 */

'use client'

import { createClient } from '@/lib/supabase/client'
import { isDemoMode, getDemoUserId, disableDemoMode } from '@/lib/demo/mode'
import * as demo from '@/lib/demo/store'
import type {
  Profile,
  Tontine,
  TontineMember,
  Round,
  Payment,
  Notification,
} from '@/lib/database.types'

export type TontineWithRole = Tontine & { role?: string }
export type RoundWithBeneficiary = Round & { beneficiary?: TontineMember | null }
export type PaymentWithMember = Payment & { member?: TontineMember | null }

export interface CurrentUser {
  id: string
  email?: string | null
  phone?: string | null
}

// ============================================================
// AUTH / SESSION
// ============================================================
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (isDemoMode()) {
    const id = getDemoUserId()
    const profile = demo.getProfile(id)
    return {
      id,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
    }
  }
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
  }
}

export async function signOut(): Promise<void> {
  if (isDemoMode()) {
    disableDemoMode()
    return
  }
  const supabase = createClient()
  await supabase.auth.signOut()
}

// ============================================================
// PROFIL
// ============================================================
export async function getProfile(userId: string): Promise<Profile | null> {
  if (isDemoMode()) {
    return demo.getProfile(userId)
  }
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data ?? null
}

// ============================================================
// TONTINES
// ============================================================
export async function getMyTontines(userId: string): Promise<TontineWithRole[]> {
  if (isDemoMode()) {
    return demo.getTontinesForUser(userId)
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('tontine_members')
    .select('tontine_id, role, tontines(*)')
    .eq('user_id', userId)

  if (!data) return []
  return data
    .filter((m) => m.tontines)
    .map((m) => ({
      ...(m.tontines as unknown as Tontine),
      role: m.role || undefined,
    }))
}

export async function getTontine(tontineId: string): Promise<Tontine | null> {
  if (isDemoMode()) {
    return demo.getTontine(tontineId)
  }
  const supabase = createClient()
  const { data } = await supabase.from('tontines').select('*').eq('id', tontineId).single()
  return data ?? null
}

export async function getMembers(tontineId: string): Promise<TontineMember[]> {
  if (isDemoMode()) {
    return demo.getMembers(tontineId)
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('tontine_members')
    .select('*')
    .eq('tontine_id', tontineId)
    .order('payout_order', { ascending: true })
  return data ?? []
}

export async function getMyMembership(
  tontineId: string,
  userId: string
): Promise<TontineMember | null> {
  if (isDemoMode()) {
    return demo.getMembership(tontineId, userId)
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('tontine_members')
    .select('*')
    .eq('tontine_id', tontineId)
    .eq('user_id', userId)
    .single()
  return data ?? null
}

export async function getMember(memberId: string): Promise<TontineMember | null> {
  if (isDemoMode()) {
    return demo.getMember(memberId)
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('tontine_members')
    .select('*')
    .eq('id', memberId)
    .single()
  return data ?? null
}

export async function createTontine(input: {
  user: CurrentUser
  profile: Profile | null
  title: string
  amount: number
  frequency: 'weekly' | 'monthly'
  totalMembers: number
  distribution: 'fixed' | 'random' | 'trust'
}): Promise<{ id: string | null; error?: string }> {
  if (isDemoMode()) {
    const id = demo.createTontine({
      creatorId: input.user.id,
      creatorName: input.profile?.full_name || 'Admin',
      creatorPhone: input.profile?.phone || input.user.phone || null,
      title: input.title,
      amount: input.amount,
      frequency: input.frequency,
      totalMembers: input.totalMembers,
      distribution: input.distribution,
    })
    return { id }
  }

  const supabase = createClient()
  const { data: tontine, error: tontineError } = await supabase
    .from('tontines')
    .insert({
      creator_id: input.user.id,
      title: input.title,
      amount: input.amount,
      frequency: input.frequency,
      total_members: input.totalMembers,
      distribution_logic: input.distribution,
      status: 'draft',
    })
    .select()
    .single()

  if (tontineError) return { id: null, error: tontineError.message }
  if (!tontine) return { id: null, error: 'Creation echouee' }

  await supabase.from('tontine_members').insert({
    tontine_id: tontine.id,
    user_id: input.user.id,
    name: input.profile?.full_name || 'Admin',
    phone: input.profile?.phone || input.user.phone || null,
    payout_order: 1,
    role: 'admin',
  })

  return { id: tontine.id }
}

// ============================================================
// TOURS (ROUNDS)
// ============================================================
export async function getRounds(tontineId: string): Promise<RoundWithBeneficiary[]> {
  if (isDemoMode()) {
    return demo.getRounds(tontineId)
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('rounds')
    .select('*, beneficiary:tontine_members(*)')
    .eq('tontine_id', tontineId)
    .order('round_number', { ascending: true })

  if (!data) return []
  return data.map((r) => ({
    ...r,
    beneficiary: r.beneficiary as unknown as TontineMember | null,
  }))
}

export async function getRound(roundId: string): Promise<Round | null> {
  if (isDemoMode()) {
    return demo.getRound(roundId)
  }
  const supabase = createClient()
  const { data } = await supabase.from('rounds').select('*').eq('id', roundId).single()
  return data ?? null
}

export async function getCurrentRound(tontineId: string): Promise<Round | null> {
  if (isDemoMode()) {
    return demo.getCurrentRound(tontineId)
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('rounds')
    .select('*')
    .eq('tontine_id', tontineId)
    .eq('status', 'current')
    .single()
  return data ?? null
}

// ============================================================
// PAIEMENTS
// ============================================================
export async function getPaymentsForRound(roundId: string): Promise<PaymentWithMember[]> {
  if (isDemoMode()) {
    return demo.getPaymentsForRound(roundId)
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('payments')
    .select('*, member:tontine_members(*)')
    .eq('round_id', roundId)

  if (!data) return []
  return data.map((p) => ({
    ...p,
    member: p.member as unknown as TontineMember | null,
  }))
}

export async function getPaymentsForUser(userId: string): Promise<Payment[]> {
  if (isDemoMode()) {
    return demo.getPaymentsForUser(userId)
  }
  const supabase = createClient()
  const { data: memberIds } = await supabase
    .from('tontine_members')
    .select('id')
    .eq('user_id', userId)

  if (!memberIds || memberIds.length === 0) return []
  const ids = memberIds.map((m) => m.id)
  const { data } = await supabase.from('payments').select('*').in('member_id', ids)
  return data ?? []
}

export async function declarePayment(
  paymentId: string,
  method: string,
  reference: string
): Promise<{ error?: string }> {
  if (isDemoMode()) {
    demo.declarePayment(paymentId, method, reference)
    return {}
  }
  const supabase = createClient()
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'declared',
      method: method as Payment['method'],
      reference: reference || null,
      declared_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
  return { error: error?.message }
}

export async function confirmPayment(paymentId: string): Promise<{ error?: string }> {
  if (isDemoMode()) {
    demo.confirmPayment(paymentId)
    return {}
  }
  const supabase = createClient()
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'paid',
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
  return { error: error?.message }
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export async function getNotifications(userId: string): Promise<Notification[]> {
  if (isDemoMode()) {
    return demo.getNotifications(userId)
  }
  const supabase = createClient()
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function markNotificationRead(id: string): Promise<void> {
  if (isDemoMode()) {
    demo.markNotificationRead(id)
    return
  }
  const supabase = createClient()
  await supabase.from('notifications').update({ read: true }).eq('id', id)
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (isDemoMode()) {
    demo.markAllNotificationsRead(userId)
    return
  }
  const supabase = createClient()
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
}

// ============================================================
// STATS (profil)
// ============================================================
export async function getProfileStats(userId: string): Promise<{
  active: number
  completed: number
  paymentRate: number
}> {
  const tontines = await getMyTontines(userId)
  const active = tontines.filter((t) => t.status === 'active').length
  const completed = tontines.filter((t) => t.status === 'completed').length

  // Le taux de paiement ne compte que les contributions DECIDEES
  // (payees ou en retard). Les paiements encore en attente (unpaid/declared,
  // non echus) ne penalisent pas le membre. Sans historique decide : 100%.
  const payments = await getPaymentsForUser(userId)
  const resolved = payments.filter(
    (p) => p.status === 'paid' || p.status === 'late'
  ).length
  const paid = payments.filter((p) => p.status === 'paid').length
  const paymentRate = resolved > 0 ? Math.round((paid / resolved) * 100) : 100

  return { active, completed, paymentRate }
}
