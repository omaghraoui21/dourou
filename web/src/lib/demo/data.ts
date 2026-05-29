/**
 * Donnees de demonstration (seed) pour le mode demo.
 *
 * Ce module est PUR (aucune dependance navigateur) afin de pouvoir etre importe
 * cote serveur (layout, middleware) comme cote client (store, pages).
 *
 * Le mode demo permet de tester l'integralite du parcours sans configurer
 * Supabase. Aucune donnee reelle, aucun fonds, aucun paiement.
 */

import type {
  Profile,
  Tontine,
  TontineMember,
  Round,
  Payment,
  Notification,
} from '@/lib/database.types'

export const DEFAULT_DEMO_USER_ID = 'u-ahmed'

// Identifiants demo (utilises aussi pour l'affichage du compte courant)
export const DEMO_USERS = [
  { id: 'u-ahmed', label: 'Ahmed Trabelsi', role: 'Admin de la tontine' },
  { id: 'u-nour', label: 'Nour Chaabane', role: 'Membre' },
] as const

// ----- Helpers de dates (relatives a maintenant pour rester realistes) -----
function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function daysAgo(days: number): string {
  return daysFromNow(-days)
}

// ============================================================
// PROFILS
// ============================================================
export const seedProfiles: Profile[] = [
  {
    id: 'u-ahmed',
    full_name: 'Ahmed Trabelsi',
    phone: '+21698000001',
    avatar_url: null,
    trust_score: 4.5,
    role: 'user',
    created_at: daysAgo(180),
    updated_at: daysAgo(2),
  },
  {
    id: 'u-fatma',
    full_name: 'Fatma Ben Youssef',
    phone: '+21698000002',
    avatar_url: null,
    trust_score: 4.8,
    role: 'user',
    created_at: daysAgo(150),
    updated_at: daysAgo(1),
  },
  {
    id: 'u-yassine',
    full_name: 'Yassine Khelifi',
    phone: '+21698000003',
    avatar_url: null,
    trust_score: 3.5,
    role: 'user',
    created_at: daysAgo(120),
    updated_at: daysAgo(3),
  },
  {
    id: 'u-nour',
    full_name: 'Nour Chaabane',
    phone: '+21698000004',
    avatar_url: null,
    trust_score: 3.0,
    role: 'user',
    created_at: daysAgo(90),
    updated_at: daysAgo(5),
  },
]

// ============================================================
// TONTINE
// ============================================================
export const seedTontines: Tontine[] = [
  {
    id: 't-sfax',
    creator_id: 'u-ahmed',
    title: 'Famille Sfax',
    amount: 200,
    frequency: 'monthly',
    currency: 'TND',
    total_members: 4,
    current_round: 1,
    distribution_logic: 'fixed',
    status: 'active',
    start_date: daysAgo(20),
    next_deadline: daysFromNow(10),
    created_at: daysAgo(25),
    updated_at: daysAgo(2),
  },
]

// ============================================================
// MEMBRES
// ============================================================
export const seedMembers: TontineMember[] = [
  {
    id: 'm-ahmed',
    tontine_id: 't-sfax',
    user_id: 'u-ahmed',
    name: 'Ahmed Trabelsi',
    phone: '+21698000001',
    payout_order: 1,
    role: 'admin',
    joined_at: daysAgo(25),
  },
  {
    id: 'm-fatma',
    tontine_id: 't-sfax',
    user_id: 'u-fatma',
    name: 'Fatma Ben Youssef',
    phone: '+21698000002',
    payout_order: 2,
    role: 'member',
    joined_at: daysAgo(24),
  },
  {
    id: 'm-yassine',
    tontine_id: 't-sfax',
    user_id: 'u-yassine',
    name: 'Yassine Khelifi',
    phone: '+21698000003',
    payout_order: 3,
    role: 'member',
    joined_at: daysAgo(24),
  },
  {
    id: 'm-nour',
    tontine_id: 't-sfax',
    user_id: 'u-nour',
    name: 'Nour Chaabane',
    phone: '+21698000004',
    payout_order: 4,
    role: 'member',
    joined_at: daysAgo(23),
  },
]

// ============================================================
// TOURS (ROUNDS)
// ============================================================
export const seedRounds: Round[] = [
  {
    id: 'r1',
    tontine_id: 't-sfax',
    round_number: 1,
    beneficiary_id: 'm-ahmed',
    status: 'current',
    scheduled_date: daysFromNow(10),
    completed_at: null,
    created_at: daysAgo(20),
  },
  {
    id: 'r2',
    tontine_id: 't-sfax',
    round_number: 2,
    beneficiary_id: 'm-fatma',
    status: 'upcoming',
    scheduled_date: daysFromNow(40),
    completed_at: null,
    created_at: daysAgo(20),
  },
  {
    id: 'r3',
    tontine_id: 't-sfax',
    round_number: 3,
    beneficiary_id: 'm-yassine',
    status: 'upcoming',
    scheduled_date: daysFromNow(70),
    completed_at: null,
    created_at: daysAgo(20),
  },
  {
    id: 'r4',
    tontine_id: 't-sfax',
    round_number: 4,
    beneficiary_id: 'm-nour',
    status: 'upcoming',
    scheduled_date: daysFromNow(100),
    completed_at: null,
    created_at: daysAgo(20),
  },
]

// ============================================================
// PAIEMENTS (Tour 1 en cours)
// Ahmed est beneficiaire du Tour 1 : il ne cotise pas a son propre pot.
// ============================================================
export const seedPayments: Payment[] = [
  {
    id: 'p-fatma',
    round_id: 'r1',
    member_id: 'm-fatma',
    amount: 200,
    method: 'd17',
    status: 'paid',
    reference: 'D17-2024-0012',
    declared_at: daysAgo(6),
    confirmed_at: daysAgo(5),
    created_at: daysAgo(20),
  },
  {
    id: 'p-yassine',
    round_id: 'r1',
    member_id: 'm-yassine',
    amount: 200,
    method: 'bank',
    status: 'declared',
    reference: 'VIR-558831',
    declared_at: daysAgo(1),
    confirmed_at: null,
    created_at: daysAgo(20),
  },
  {
    id: 'p-nour',
    round_id: 'r1',
    member_id: 'm-nour',
    amount: 200,
    method: null,
    status: 'unpaid',
    reference: null,
    declared_at: null,
    confirmed_at: null,
    created_at: daysAgo(20),
  },
]

// ============================================================
// NOTIFICATIONS (par utilisateur)
// ============================================================
export const seedNotifications: Notification[] = [
  {
    id: 'n1',
    user_id: 'u-ahmed',
    tontine_id: 't-sfax',
    type: 'payment_declared',
    title: 'Yassine a declare un paiement',
    body: 'Yassine Khelifi a declare un paiement de 200 DT pour le Tour 1. En attente de votre confirmation.',
    read: false,
    created_at: daysAgo(1),
  },
  {
    id: 'n2',
    user_id: 'u-ahmed',
    tontine_id: 't-sfax',
    type: 'payment_received',
    title: 'Paiement confirme',
    body: 'Fatma Ben Youssef a paye 200 DT pour le Tour 1.',
    read: true,
    created_at: daysAgo(5),
  },
  {
    id: 'n3',
    user_id: 'u-ahmed',
    tontine_id: 't-sfax',
    type: 'round_started',
    title: 'Tour 1 demarre',
    body: 'Le Tour 1 de la tontine "Famille Sfax" a commence. Vous etes le beneficiaire.',
    read: true,
    created_at: daysAgo(20),
  },
  {
    id: 'n4',
    user_id: 'u-nour',
    tontine_id: 't-sfax',
    type: 'reminder',
    title: 'Rappel de paiement',
    body: 'Votre contribution de 200 DT pour le Tour 1 est attendue avant l\'echeance.',
    read: false,
    created_at: daysAgo(1),
  },
  {
    id: 'n5',
    user_id: 'u-nour',
    tontine_id: 't-sfax',
    type: 'round_started',
    title: 'Tour 1 demarre',
    body: 'Le Tour 1 de la tontine "Famille Sfax" a commence. Beneficiaire : Ahmed Trabelsi.',
    read: true,
    created_at: daysAgo(20),
  },
]

// ----- Accesseurs purs (utilisables cote serveur) -----
export function getSeedProfileById(userId: string): Profile | undefined {
  return seedProfiles.find((p) => p.id === userId)
}

export interface DemoSnapshot {
  profiles: Profile[]
  tontines: Tontine[]
  members: TontineMember[]
  rounds: Round[]
  payments: Payment[]
  notifications: Notification[]
}

/** Retourne une copie profonde du seed pour initialiser le store. */
export function buildSeedSnapshot(): DemoSnapshot {
  return JSON.parse(
    JSON.stringify({
      profiles: seedProfiles,
      tontines: seedTontines,
      members: seedMembers,
      rounds: seedRounds,
      payments: seedPayments,
      notifications: seedNotifications,
    })
  )
}
