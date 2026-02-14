/**
 * Governance utility functions for checking permissions and restrictions
 */

import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/database.types';

type AccountStatus = 'active' | 'suspended' | 'banned';

/**
 * Check if a user can perform write operations
 */
export async function canUserWrite(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('account_status')
      .eq('id', userId)
      .single();

    if (error) {
      return { allowed: false, reason: 'Failed to check user status' };
    }

    if (profile.account_status === 'suspended') {
      return { allowed: false, reason: 'Your account is suspended' };
    }

    if (profile.account_status === 'banned') {
      return { allowed: false, reason: 'Your account is banned' };
    }

    return { allowed: true };
  } catch (error) {
    return { allowed: false, reason: 'Failed to verify permissions' };
  }
}

/**
 * Check if a tontine is frozen
 */
export async function isTontineFrozen(tontineId: string): Promise<{
  frozen: boolean;
  reason?: string;
  governanceFlag?: 'none' | 'under_review' | 'disputed';
}> {
  try {
    const { data: tontine, error } = await supabase
      .from('tontines')
      .select('is_frozen, frozen_reason, governance_flag')
      .eq('id', tontineId)
      .single();

    if (error) {
      return { frozen: false };
    }

    if (tontine.is_frozen) {
      return {
        frozen: true,
        reason: tontine.frozen_reason || 'This tontine is frozen',
        governanceFlag: tontine.governance_flag,
      };
    }

    return { frozen: false };
  } catch (error) {
    return { frozen: false };
  }
}

/**
 * Check if a user can perform operations on a tontine
 */
export async function canWriteToTontine(
  userId: string,
  tontineId: string
): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  // Check user status
  const userCheck = await canUserWrite(userId);
  if (!userCheck.allowed) {
    return userCheck;
  }

  // Check tontine frozen status
  const tontineCheck = await isTontineFrozen(tontineId);
  if (tontineCheck.frozen) {
    return {
      allowed: false,
      reason: tontineCheck.reason || 'This tontine is frozen',
    };
  }

  return { allowed: true };
}

/**
 * Check if app is in maintenance mode
 */
export async function isMaintenanceMode(): Promise<{
  enabled: boolean;
  message?: string;
  killSwitch?: boolean;
}> {
  try {
    const { data: settings, error } = await supabase
      .from('app_settings')
      .select('maintenance_mode, app_kill_switch, maintenance_message')
      .single();

    if (error) {
      return { enabled: false };
    }

    if (settings.app_kill_switch) {
      return {
        enabled: true,
        killSwitch: true,
        message: 'The app is currently unavailable',
      };
    }

    if (settings.maintenance_mode) {
      return {
        enabled: true,
        message: settings.maintenance_message || 'We are currently performing maintenance',
      };
    }

    return { enabled: false };
  } catch (error) {
    return { enabled: false };
  }
}

/**
 * Admin function: Set user account status
 */
export async function setUserStatus(
  targetUserId: string,
  status: AccountStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('set_user_status', {
      target_user_id: targetUserId,
      new_status: status,
      status_reason: reason,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Admin function: Toggle tontine freeze status
 */
export async function toggleTontineFreeze(
  tontineId: string,
  freeze: boolean,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('toggle_tontine_freeze', {
      target_tontine_id: tontineId,
      freeze_status: freeze,
      freeze_reason: reason,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Admin function: Set maintenance mode
 */
export async function setMaintenanceMode(
  enabled: boolean,
  message?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('set_maintenance_mode', {
      enabled,
      message,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Admin function: Set app kill switch
 */
export async function setAppKillSwitch(
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('set_app_kill_switch', {
      enabled,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Admin function: Get governance metrics
 */
export async function getGovernanceMetrics(): Promise<{
  success: boolean;
  data?: {
    suspended_users: number;
    banned_users: number;
    frozen_tontines: number;
    disputed_tontines: number;
    failed_invitations: number;
    late_payments: number;
  };
  error?: string;
}> {
  try {
    const { data, error } = await supabase.rpc('get_governance_metrics');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
