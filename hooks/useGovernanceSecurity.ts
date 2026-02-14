/**
 * useGovernanceSecurity Hook
 *
 * Provides security and governance functions for risk mitigation:
 * - Ghost member prevention (eligibility checks)
 * - Velocity limit monitoring
 * - Admin succession monitoring
 * - Abuse metrics tracking
 */

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ===========================
// Types
// ===========================

export interface UserEligibility {
  eligible: boolean;
  reason?: 'user_not_found' | 'user_not_active' | 'insufficient_trust_score';
  status?: string;
  trust_score?: number;
  current_trust_score?: number;
  required_trust_score?: number;
}

export interface VelocityCheck {
  allowed: boolean;
  reason?: 'velocity_limit_exceeded';
  current_count: number;
  limit: number;
  recent_tontines?: string[];
}

export interface OrphanedTontine {
  tontine_id: string;
  tontine_name: string;
  tontine_status: string;
  creator_id: string;
  creator_name: string;
  creator_status: string;
  creator_phone: string;
  total_members: number;
  current_round: number;
  tontine_created_at: string;
  admin_count: number;
  other_admins: string | null;
}

export interface AbuseMetric {
  user_id: string;
  full_name: string;
  phone: string;
  trust_score: number;
  status: string;
  velocity_tontines_24h: number;
  recent_tontines: string[] | null;
  late_payments_count: number;
  overdue_payments_count: number;
  active_tontines_count: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface GovernanceSummary {
  orphaned_tontines: number;
  high_risk_users: number;
  velocity_violations_24h: number;
  suspended_users: number;
  banned_users: number;
  pending_payment_proofs: number;
  last_updated: string;
}

// ===========================
// Hook
// ===========================

export function useGovernanceSecurity() {
  /**
   * Ghost Member Prevention: Check if a user is eligible to be invited
   * Requirements: active status + minimum trust score
   */
  const checkUserEligibility = useCallback(async (userId: string): Promise<UserEligibility> => {
    try {
      const { data, error } = await supabase.rpc('check_user_eligibility_for_invite', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error checking user eligibility:', error);
        throw error;
      }

      return data as UserEligibility;
    } catch (error) {
      console.error('checkUserEligibility failed:', error);
      throw error;
    }
  }, []);

  /**
   * Velocity Check: Verify user hasn't joined too many tontines in 24h
   */
  const checkVelocityLimit = useCallback(async (userId: string): Promise<VelocityCheck> => {
    try {
      const { data, error } = await supabase.rpc('check_join_velocity_limit', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error checking velocity limit:', error);
        throw error;
      }

      return data as VelocityCheck;
    } catch (error) {
      console.error('checkVelocityLimit failed:', error);
      throw error;
    }
  }, []);

  /**
   * Get list of orphaned tontines (admin suspended/banned)
   */
  const getOrphanedTontines = useCallback(async (): Promise<OrphanedTontine[]> => {
    try {
      const { data, error } = await supabase
        .from('orphaned_tontines')
        .select('*');

      if (error) {
        console.error('Error fetching orphaned tontines:', error);
        throw error;
      }

      return (data as OrphanedTontine[]) || [];
    } catch (error) {
      console.error('getOrphanedTontines failed:', error);
      return [];
    }
  }, []);

  /**
   * Flag an orphaned tontine for governance intervention
   */
  const flagOrphanedTontine = useCallback(async (tontineId: string) => {
    try {
      const { data, error } = await supabase.rpc('flag_orphaned_tontine', {
        p_tontine_id: tontineId,
      });

      if (error) {
        console.error('Error flagging orphaned tontine:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('flagOrphanedTontine failed:', error);
      throw error;
    }
  }, []);

  /**
   * Get abuse monitoring metrics
   */
  const getAbuseMetrics = useCallback(async (): Promise<AbuseMetric[]> => {
    try {
      const { data, error } = await supabase
        .from('monitor_abuse_metrics')
        .select('*');

      if (error) {
        console.error('Error fetching abuse metrics:', error);
        throw error;
      }

      return (data as AbuseMetric[]) || [];
    } catch (error) {
      console.error('getAbuseMetrics failed:', error);
      return [];
    }
  }, []);

  /**
   * Get comprehensive governance summary for admin dashboard
   */
  const getGovernanceSummary = useCallback(async (): Promise<GovernanceSummary | null> => {
    try {
      const { data, error } = await supabase.rpc('get_governance_summary');

      if (error) {
        console.error('Error fetching governance summary:', error);
        throw error;
      }

      return data as GovernanceSummary;
    } catch (error) {
      console.error('getGovernanceSummary failed:', error);
      return null;
    }
  }, []);

  /**
   * Update user status (active, suspended, banned)
   * Admin only function
   */
  const updateUserStatus = useCallback(async (
    userId: string,
    status: 'active' | 'suspended' | 'banned',
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user status:', error);
        throw error;
      }

      // Log to audit trail
      await supabase.from('audit_log').insert({
        user_id: userId,
        action: `user_status_changed_to_${status}`,
        details: {
          new_status: status,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('updateUserStatus failed:', error);
      throw error;
    }
  }, []);

  /**
   * Get governance setting value
   */
  const getGovernanceSetting = useCallback(async (key: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('governance_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) {
        console.error('Error fetching governance setting:', error);
        return null;
      }

      return data?.value || null;
    } catch (error) {
      console.error('getGovernanceSetting failed:', error);
      return null;
    }
  }, []);

  /**
   * Update governance setting (admin only)
   */
  const updateGovernanceSetting = useCallback(async (
    key: string,
    value: string,
    userId: string,
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('governance_settings')
        .update({
          value,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('key', key);

      if (error) {
        console.error('Error updating governance setting:', error);
        throw error;
      }
    } catch (error) {
      console.error('updateGovernanceSetting failed:', error);
      throw error;
    }
  }, []);

  return {
    // Ghost member prevention
    checkUserEligibility,

    // Velocity monitoring
    checkVelocityLimit,

    // Admin succession
    getOrphanedTontines,
    flagOrphanedTontine,

    // Abuse monitoring
    getAbuseMetrics,
    getGovernanceSummary,

    // User management
    updateUserStatus,

    // Settings
    getGovernanceSetting,
    updateGovernanceSetting,
  };
}
