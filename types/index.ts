export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string;
  trustScore: number;
  createdAt: Date;
}

export interface Tontine {
  id: string;
  name: string;
  contribution: number;
  frequency: 'weekly' | 'monthly';
  totalMembers: number;
  currentTour: number;
  distributionLogic: 'fixed' | 'random' | 'trust';
  status: 'active' | 'completed';
  createdAt: Date;
  nextDeadline: Date;
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
  status: 'paid' | 'pending' | 'late';
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
  paymentStatus: 'paid' | 'pending' | 'late';
}

export interface Activity {
  id: string;
  type: 'payment' | 'tour_start' | 'tour_complete' | 'member_join';
  message: string;
  timestamp: Date;
  tontineId: string;
  tontineName: string;
}

export type TrustTier = 'novice' | 'reliable' | 'trusted' | 'elite' | 'master';

export const getTrustTier = (score: number): TrustTier => {
  if (score >= 4.5) return 'master';
  if (score >= 4.0) return 'elite';
  if (score >= 3.5) return 'trusted';
  if (score >= 3.0) return 'reliable';
  return 'novice';
};
