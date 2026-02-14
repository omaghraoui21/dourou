import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/database.types';

type AppSettings = Tables<'app_settings'>;
type Profile = Tables<'profiles'>;
type Tontine = Tables<'tontines'>;

interface GovernanceState {
  // App-level controls
  maintenanceMode: boolean;
  appKillSwitch: boolean;
  maintenanceMessage: string | null;

  // User account status
  accountStatus: 'active' | 'suspended' | 'banned';
  suspendedReason: string | null;
  bannedReason: string | null;
  suspendedAt: string | null;
  bannedAt: string | null;

  // Loading and error states
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to check app-wide governance settings and user account status
 */
export function useGovernance() {
  const [state, setState] = useState<GovernanceState>({
    maintenanceMode: false,
    appKillSwitch: false,
    maintenanceMessage: null,
    accountStatus: 'active',
    suspendedReason: null,
    bannedReason: null,
    suspendedAt: null,
    bannedAt: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const checkGovernance = async () => {
      try {
        // Check app settings
        const { data: appSettings, error: appError } = await supabase
          .from('app_settings')
          .select('*')
          .single();

        if (appError && appError.code !== 'PGRST116') {
          throw appError;
        }

        // Check user profile if logged in
        const { data: { user } } = await supabase.auth.getUser();

        let profile: Profile | null = null;
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          profile = profileData;
        }

        if (mounted) {
          setState({
            maintenanceMode: appSettings?.maintenance_mode || false,
            appKillSwitch: appSettings?.app_kill_switch || false,
            maintenanceMessage: appSettings?.maintenance_message || null,
            accountStatus: profile?.account_status || 'active',
            suspendedReason: profile?.suspended_reason || null,
            bannedReason: profile?.banned_reason || null,
            suspendedAt: profile?.suspended_at || null,
            bannedAt: profile?.banned_at || null,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        if (mounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: err as Error,
          }));
        }
      }
    };

    checkGovernance();

    // Subscribe to app settings changes
    const appSettingsChannel = supabase
      .channel('app_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_settings',
        },
        () => {
          checkGovernance();
        }
      )
      .subscribe();

    // Subscribe to profile changes (if logged in)
    const profileChannel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          checkGovernance();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      appSettingsChannel.unsubscribe();
      profileChannel.unsubscribe();
    };
  }, []);

  return state;
}

/**
 * Hook to check if a specific tontine is frozen
 */
export function useTontineFrozen(tontineId: string | null) {
  const [state, setState] = useState<{
    isFrozen: boolean;
    frozenReason: string | null;
    frozenAt: string | null;
    governanceFlag: 'none' | 'under_review' | 'disputed';
    governanceNotes: string | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    isFrozen: false,
    frozenReason: null,
    frozenAt: null,
    governanceFlag: 'none',
    governanceNotes: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const checkTontine = async () => {
      if (!tontineId) {
        if (mounted) {
          setState({
            isFrozen: false,
            frozenReason: null,
            frozenAt: null,
            governanceFlag: 'none',
            governanceNotes: null,
            isLoading: false,
            error: null,
          });
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tontines')
          .select('is_frozen, frozen_reason, frozen_at, governance_flag, governance_notes')
          .eq('id', tontineId)
          .single();

        if (error) throw error;

        if (mounted) {
          setState({
            isFrozen: data.is_frozen,
            frozenReason: data.frozen_reason,
            frozenAt: data.frozen_at,
            governanceFlag: data.governance_flag,
            governanceNotes: data.governance_notes,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        if (mounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: err as Error,
          }));
        }
      }
    };

    checkTontine();

    // Subscribe to tontine changes
    if (tontineId) {
      const channel = supabase
        .channel(`tontine_${tontineId}_changes`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tontines',
            filter: `id=eq.${tontineId}`,
          },
          () => {
            checkTontine();
          }
        )
        .subscribe();

      return () => {
        mounted = false;
        channel.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [tontineId]);

  return state;
}

/**
 * Check if user can perform write operations
 */
export function useCanWrite() {
  const { accountStatus, maintenanceMode, appKillSwitch } = useGovernance();

  return (
    accountStatus === 'active' &&
    !maintenanceMode &&
    !appKillSwitch
  );
}

/**
 * Check if user can perform operations on a specific tontine
 */
export function useCanWriteTontine(tontineId: string | null) {
  const canWrite = useCanWrite();
  const { isFrozen } = useTontineFrozen(tontineId);

  return canWrite && !isFrozen;
}
