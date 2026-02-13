import { User } from '@/types';

/**
 * Super Admin Configuration
 * This is the permanent, hard-coded administrator account for the project lead developer.
 * This user has unrestricted access to all features and administrative functions.
 */
export const SUPER_ADMIN_CONFIG = {
  phone: '+21620495636',
  email: 'omaghraoui@gmail.com',
  firstName: 'Omar',
  lastName: 'Maghraoui',
  displayName: 'Principal Coder',
  badge: {
    icon: '👑',
    label: 'Master Admin',
    color: '#FFD700', // Gold color
  },
};

/**
 * Check if a phone number belongs to the Super Admin
 */
export const isSuperAdmin = (phone: string): boolean => {
  // Normalize phone number by removing spaces and special characters
  const normalizedPhone = phone.replace(/[\s\-()]/g, '');
  const normalizedSuperAdminPhone = SUPER_ADMIN_CONFIG.phone.replace(/[\s\-()]/g, '');
  return normalizedPhone === normalizedSuperAdminPhone;
};

/**
 * Get the Super Admin user object
 */
export const getSuperAdminUser = (): User => {
  return {
    id: 'super_admin_001',
    firstName: SUPER_ADMIN_CONFIG.firstName,
    lastName: SUPER_ADMIN_CONFIG.lastName,
    phone: SUPER_ADMIN_CONFIG.phone,
    email: SUPER_ADMIN_CONFIG.email,
    avatar: SUPER_ADMIN_CONFIG.badge.icon,
    trustScore: 5.0, // Maximum trust score
    role: 'super_admin',
    isVerified: true,
    createdAt: new Date('2024-01-01'), // Fixed creation date
  };
};

/**
 * Check if a user has super admin privileges
 */
export const hasSuperAdminPrivileges = (user: User | null): boolean => {
  return user?.role === 'super_admin' || isSuperAdmin(user?.phone || '');
};
