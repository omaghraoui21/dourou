export type { Database, DbProfile, DbTontine, DbTontineMember, DbRound, DbPayment, DbInvitation, DbNotification, DbAuditLog } from './database';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  avatar: string;
  trustScore: number;
  role: 'admin' | 'member' | 'super_admin';
  isVerified: boolean;
  createdAt: Date;
}

export interface TontineMember {
  id: string;
  name: string;
  phone: string;
  initials: string;
  payoutOrder: number;
  addedAt: Date;
  userId?: string | null;
  role?: string | null;
}

export interface Tontine {
  id: string;
  name: string;
  contribution: number;
  frequency: 'weekly' | 'monthly';
  totalMembers: number;
  currentTour: number;
  distributionLogic: 'fixed' | 'random' | 'trust';
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
  nextDeadline: Date;
  startDate?: Date;
  members: TontineMember[];
  creatorId?: string;
  currency?: string;
}

export interface Tour {
  id: string;
  tontineId: string;
  tourNumber: number;
  recipientId: string;
  deadline: Date;
  status: 'current' | 'upcoming' | 'completed';
  payments: Payment[];
}

export interface Payment {
  id: string;
  tourId: string;
  userId: string;
  amount: number;
  method: 'cash' | 'bank' | 'd17' | 'flouci';
  status: 'unpaid' | 'declared' | 'paid' | 'late';
  declaredAt?: Date;
  confirmedAt?: Date;
  reference?: string;
}

export interface Member {
  id: string;
  tontineId: string;
  userId: string;
  user: User;
  joinedAt: Date;
  role: 'admin' | 'member';
  paymentStatus: 'unpaid' | 'declared' | 'paid' | 'late';
}

export interface Activity {
  id: string;
  type: 'payment' | 'tour_start' | 'tour_complete' | 'member_join';
  message: string;
  timestamp: Date;
  tontineId: string;
  tontineName: string;
}

export interface Invitation {
  id: string;
  tontineId: string;
  code: string;
  createdBy: string;
  expiresAt: Date;
  maxUses: number;
  usedCount: number;
  createdAt: Date;
  tontineName?: string;
}

export type TrustTier = 'novice' | 'reliable' | 'trusted' | 'elite' | 'master';

export const getTrustTier = (score: number): TrustTier => {
  if (score >= 4.5) return 'master';
  if (score >= 4.0) return 'elite';
  if (score >= 3.5) return 'trusted';
  if (score >= 3.0) return 'reliable';
  return 'novice';
};

export const generateToursFromTontine = (tontine: Tontine): Tour[] => {
  const sorted = [...tontine.members].sort((a, b) => a.payoutOrder - b.payoutOrder);
  const startDate = tontine.startDate || tontine.createdAt;

  return sorted.map((member, index) => {
    const deadline = new Date(startDate);
    if (tontine.frequency === 'weekly') {
      deadline.setDate(deadline.getDate() + ((index + 1) * 7));
    } else {
      deadline.setMonth(deadline.getMonth() + (index + 1));
    }

    let status: 'completed' | 'current' | 'upcoming';
    if (index < tontine.currentTour - 1) {
      status = 'completed';
    } else if (index === tontine.currentTour - 1) {
      status = 'current';
    } else {
      status = 'upcoming';
    }

    return {
      id: `tour_${tontine.id}_${index + 1}`,
      tontineId: tontine.id,
      tourNumber: index + 1,
      recipientId: member.id,
      deadline,
      status,
      payments: [],
    };
  });
};

// Helper to get initials from a name
export const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Generate 6-char invitation code
export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};
