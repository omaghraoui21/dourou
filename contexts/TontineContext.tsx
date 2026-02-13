import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Tontine, TontineMember, getInitials } from '@/types';
import { useAuth } from '@fastshot/auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CreateTontineData = {
  name: string;
  contribution: number;
  frequency: 'weekly' | 'monthly';
  totalMembers: number;
  distributionLogic: 'fixed' | 'random' | 'trust';
  nextDeadline: Date;
};

interface TontineContextType {
  tontines: Tontine[];
  addTontine: (tontine: CreateTontineData) => Promise<Tontine>;
  getTontineById: (id: string) => Tontine | undefined;
  updateTontine: (id: string, updates: Partial<Tontine>) => Promise<void>;
  addMemberToTontine: (tontineId: string, name: string, phone: string) => Promise<void>;
  removeMemberFromTontine: (tontineId: string, memberId: string) => Promise<void>;
  reorderMembers: (tontineId: string, members: TontineMember[]) => Promise<void>;
  launchTontine: (tontineId: string) => Promise<void>;
  isLoading: boolean;
  refreshTontines: () => Promise<void>;
  clearTontines: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a DB tontine row + its member rows into the app-level Tontine type. */
function dbRowToTontine(
  row: {
    id: string;
    title: string;
    amount: number;
    frequency: string;
    total_members: number;
    current_round: number | null;
    distribution_logic: string | null;
    status: string | null;
    created_at: string | null;
    next_deadline: string | null;
    start_date: string | null;
    creator_id: string;
    currency: string | null;
  },
  memberRows: {
    id: string;
    name: string;
    phone: string | null;
    payout_order: number;
    joined_at: string | null;
    user_id: string | null;
    role: string | null;
  }[],
): Tontine {
  const members: TontineMember[] = memberRows
    .sort((a, b) => a.payout_order - b.payout_order)
    .map((m) => ({
      id: m.id,
      name: m.name,
      phone: m.phone ?? '',
      initials: getInitials(m.name),
      payoutOrder: m.payout_order,
      addedAt: m.joined_at ? new Date(m.joined_at) : new Date(),
      userId: m.user_id,
      role: m.role,
    }));

  return {
    id: row.id,
    name: row.title,
    contribution: row.amount,
    frequency: (row.frequency as 'weekly' | 'monthly') ?? 'monthly',
    totalMembers: row.total_members,
    currentTour: row.current_round ?? 1,
    distributionLogic: (row.distribution_logic as 'fixed' | 'random' | 'trust') ?? 'fixed',
    status: (row.status as 'draft' | 'active' | 'completed') ?? 'draft',
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    nextDeadline: row.next_deadline ? new Date(row.next_deadline) : new Date(),
    startDate: row.start_date ? new Date(row.start_date) : undefined,
    members,
    creatorId: row.creator_id,
    currency: row.currency ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const TontineContext = createContext<TontineContextType | undefined>(undefined);

export const TontineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Keep a ref so real-time callbacks always have the latest userId without
  // needing to re-subscribe every time it changes identity-wise.
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // -------------------------------------------------------------------------
  // Fetch all tontines the current user can see
  // -------------------------------------------------------------------------

  const fetchTontines = useCallback(async (): Promise<Tontine[]> => {
    const uid = userIdRef.current;
    if (!uid) return [];

    try {
      // 1. Get IDs of tontines the user is a member of
      const { data: membershipRows, error: membershipError } = await supabase
        .from('tontine_members')
        .select('tontine_id')
        .eq('user_id', uid);

      if (membershipError) {
        console.error('Error fetching memberships:', membershipError);
        throw membershipError;
      }

      const memberTontineIds = (membershipRows ?? []).map((r) => r.tontine_id);

      // 2. Fetch tontines where user is creator OR is a member
      let query = supabase.from('tontines').select('*');

      if (memberTontineIds.length > 0) {
        // creator_id = uid OR id in memberTontineIds
        query = query.or(`creator_id.eq.${uid},id.in.(${memberTontineIds.join(',')})`);
      } else {
        query = query.eq('creator_id', uid);
      }

      const { data: tontineRows, error: tontineError } = await query;

      if (tontineError) {
        console.error('Error fetching tontines:', tontineError);
        throw tontineError;
      }

      if (!tontineRows || tontineRows.length === 0) return [];

      // 3. Fetch all members for these tontines in one query
      const tontineIds = tontineRows.map((t) => t.id);
      const { data: allMembers, error: membersError } = await supabase
        .from('tontine_members')
        .select('*')
        .in('tontine_id', tontineIds);

      if (membersError) {
        console.error('Error fetching tontine members:', membersError);
        throw membersError;
      }

      // Group members by tontine_id
      const membersByTontine: Record<string, typeof allMembers> = {};
      for (const m of allMembers ?? []) {
        if (!membersByTontine[m.tontine_id]) {
          membersByTontine[m.tontine_id] = [];
        }
        membersByTontine[m.tontine_id].push(m);
      }

      // 4. Convert to app types
      return tontineRows.map((row) =>
        dbRowToTontine(row, membersByTontine[row.id] ?? []),
      );
    } catch (error) {
      console.error('fetchTontines failed:', error);
      return [];
    }
  }, []);

  // -------------------------------------------------------------------------
  // refreshTontines – public method to re-fetch everything from Supabase
  // -------------------------------------------------------------------------

  const refreshTontines = useCallback(async () => {
    setIsLoading(true);
    try {
      const fresh = await fetchTontines();
      setTontines(fresh);
    } catch (error) {
      console.error('refreshTontines error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTontines]);

  // -------------------------------------------------------------------------
  // Initial load + reload when user changes
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!userId) {
      setTontines([]);
      setIsLoading(false);
      return;
    }
    refreshTontines();
  }, [userId, refreshTontines]);

  // -------------------------------------------------------------------------
  // Real-time subscriptions
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('tontine-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tontines' },
        () => {
          // Any change on the tontines table – refresh
          refreshTontines();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tontine_members' },
        () => {
          // Any change on tontine_members – refresh
          refreshTontines();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refreshTontines]);

  // -------------------------------------------------------------------------
  // getTontineById
  // -------------------------------------------------------------------------

  const getTontineById = useCallback(
    (id: string): Tontine | undefined => {
      return tontines.find((t) => t.id === id);
    },
    [tontines],
  );

  // -------------------------------------------------------------------------
  // addTontine
  // -------------------------------------------------------------------------

  const addTontine = useCallback(
    async (data: CreateTontineData): Promise<Tontine> => {
      if (!userId) throw new Error('Not authenticated');

      // Build the optimistic tontine so we can return it immediately
      const optimisticId = crypto.randomUUID?.() ?? `temp_${Date.now()}`;
      const now = new Date();

      const optimisticMember: TontineMember = {
        id: `temp_member_${Date.now()}`,
        name: user?.user_metadata?.full_name ?? user?.email ?? 'You',
        phone: '',
        initials: getInitials(user?.user_metadata?.full_name ?? user?.email ?? 'You'),
        payoutOrder: 1,
        addedAt: now,
        userId,
        role: 'admin',
      };

      const optimisticTontine: Tontine = {
        id: optimisticId,
        name: data.name,
        contribution: data.contribution,
        frequency: data.frequency,
        totalMembers: data.totalMembers,
        currentTour: 1,
        distributionLogic: data.distributionLogic,
        status: 'draft',
        createdAt: now,
        nextDeadline: data.nextDeadline,
        members: [optimisticMember],
        creatorId: userId,
      };

      // Optimistic UI update
      setTontines((prev) => [...prev, optimisticTontine]);

      try {
        // Insert into tontines table
        const { data: insertedTontine, error: insertError } = await supabase
          .from('tontines')
          .insert({
            title: data.name,
            amount: data.contribution,
            frequency: data.frequency,
            total_members: data.totalMembers,
            distribution_logic: data.distributionLogic,
            next_deadline: data.nextDeadline.toISOString(),
            creator_id: userId,
            status: 'draft',
            current_round: 1,
          })
          .select()
          .single();

        if (insertError) {
          // Revert optimistic update
          setTontines((prev) => prev.filter((t) => t.id !== optimisticId));
          throw insertError;
        }

        // Insert the creator as a member with role=admin, payout_order=1
        const { error: memberError } = await supabase
          .from('tontine_members')
          .insert({
            tontine_id: insertedTontine.id,
            user_id: userId,
            name: user?.user_metadata?.full_name ?? user?.email ?? 'Admin',
            phone: user?.phone ?? null,
            role: 'admin',
            payout_order: 1,
          });

        if (memberError) {
          // Clean up: delete the tontine we just created
          await supabase.from('tontines').delete().eq('id', insertedTontine.id);
          setTontines((prev) => prev.filter((t) => t.id !== optimisticId));
          throw memberError;
        }

        // Replace the optimistic entry with the real one
        const realTontine = dbRowToTontine(insertedTontine, [
          {
            id: `${insertedTontine.id}_creator`,
            name: user?.user_metadata?.full_name ?? user?.email ?? 'Admin',
            phone: user?.phone ?? null,
            payout_order: 1,
            joined_at: new Date().toISOString(),
            user_id: userId,
            role: 'admin',
          },
        ]);

        setTontines((prev) =>
          prev.map((t) => (t.id === optimisticId ? realTontine : t)),
        );

        // Do a background refresh to ensure consistency
        refreshTontines();

        return realTontine;
      } catch (error) {
        console.error('addTontine error:', error);
        // Ensure optimistic entry is removed on any error
        setTontines((prev) => prev.filter((t) => t.id !== optimisticId));
        throw error;
      }
    },
    [userId, user, refreshTontines],
  );

  // -------------------------------------------------------------------------
  // updateTontine
  // -------------------------------------------------------------------------

  const updateTontine = useCallback(
    async (id: string, updates: Partial<Tontine>): Promise<void> => {
      if (!userId) throw new Error('Not authenticated');

      // Build the DB-level updates
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.title = updates.name;
      if (updates.contribution !== undefined) dbUpdates.amount = updates.contribution;
      if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
      if (updates.totalMembers !== undefined) dbUpdates.total_members = updates.totalMembers;
      if (updates.currentTour !== undefined) dbUpdates.current_round = updates.currentTour;
      if (updates.distributionLogic !== undefined) dbUpdates.distribution_logic = updates.distributionLogic;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.nextDeadline !== undefined) dbUpdates.next_deadline = updates.nextDeadline instanceof Date ? updates.nextDeadline.toISOString() : updates.nextDeadline;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate instanceof Date ? updates.startDate.toISOString() : updates.startDate;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;

      // Optimistic update
      setTontines((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      );

      try {
        if (Object.keys(dbUpdates).length > 0) {
          const { error } = await supabase
            .from('tontines')
            .update(dbUpdates)
            .eq('id', id);

          if (error) throw error;
        }
      } catch (error) {
        console.error('updateTontine error:', error);
        // Revert by re-fetching
        await refreshTontines();
        throw error;
      }
    },
    [userId, refreshTontines],
  );

  // -------------------------------------------------------------------------
  // addMemberToTontine
  // -------------------------------------------------------------------------

  const addMemberToTontine = useCallback(
    async (tontineId: string, name: string, phone: string): Promise<void> => {
      if (!userId) throw new Error('Not authenticated');

      const tontine = tontines.find((t) => t.id === tontineId);
      if (!tontine) throw new Error('Tontine not found');
      if (tontine.members.length >= tontine.totalMembers) throw new Error('Group is full');

      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();
      const newPayoutOrder = tontine.members.length + 1;

      // Build optimistic member
      const optimisticMember: TontineMember = {
        id: `temp_member_${Date.now()}`,
        name: trimmedName,
        phone: trimmedPhone,
        initials: getInitials(trimmedName),
        payoutOrder: newPayoutOrder,
        addedAt: new Date(),
      };

      // Optimistic update
      setTontines((prev) =>
        prev.map((t) =>
          t.id === tontineId
            ? { ...t, members: [...t.members, optimisticMember] }
            : t,
        ),
      );

      try {
        const { error } = await supabase
          .from('tontine_members')
          .insert({
            tontine_id: tontineId,
            name: trimmedName,
            phone: trimmedPhone || null,
            payout_order: newPayoutOrder,
          });

        if (error) throw error;

        // Background refresh for consistency
        refreshTontines();
      } catch (error) {
        console.error('addMemberToTontine error:', error);
        // Revert optimistic update
        setTontines((prev) =>
          prev.map((t) =>
            t.id === tontineId
              ? { ...t, members: t.members.filter((m) => m.id !== optimisticMember.id) }
              : t,
          ),
        );
        throw error;
      }
    },
    [userId, tontines, refreshTontines],
  );

  // -------------------------------------------------------------------------
  // removeMemberFromTontine
  // -------------------------------------------------------------------------

  const removeMemberFromTontine = useCallback(
    async (tontineId: string, memberId: string): Promise<void> => {
      if (!userId) throw new Error('Not authenticated');

      const tontine = tontines.find((t) => t.id === tontineId);
      if (!tontine) throw new Error('Tontine not found');

      const previousMembers = tontine.members;

      // Optimistic update: remove member and reindex payout orders
      const updatedMembers = previousMembers
        .filter((m) => m.id !== memberId)
        .map((m, index) => ({ ...m, payoutOrder: index + 1 }));

      setTontines((prev) =>
        prev.map((t) =>
          t.id === tontineId ? { ...t, members: updatedMembers } : t,
        ),
      );

      try {
        // Delete from DB
        const { error: deleteError } = await supabase
          .from('tontine_members')
          .delete()
          .eq('id', memberId);

        if (deleteError) throw deleteError;

        // Re-index remaining members' payout_order
        const remainingMembers = updatedMembers;
        for (const member of remainingMembers) {
          // Skip temp members that haven't been persisted
          if (member.id.startsWith('temp_')) continue;

          const { error: updateError } = await supabase
            .from('tontine_members')
            .update({ payout_order: member.payoutOrder })
            .eq('id', member.id);

          if (updateError) {
            console.error('Error reindexing member:', updateError);
          }
        }

        // Background refresh for consistency
        refreshTontines();
      } catch (error) {
        console.error('removeMemberFromTontine error:', error);
        // Revert optimistic update
        setTontines((prev) =>
          prev.map((t) =>
            t.id === tontineId ? { ...t, members: previousMembers } : t,
          ),
        );
        throw error;
      }
    },
    [userId, tontines, refreshTontines],
  );

  // -------------------------------------------------------------------------
  // reorderMembers
  // -------------------------------------------------------------------------

  const reorderMembers = useCallback(
    async (tontineId: string, members: TontineMember[]): Promise<void> => {
      if (!userId) throw new Error('Not authenticated');

      const tontine = tontines.find((t) => t.id === tontineId);
      if (!tontine) throw new Error('Tontine not found');

      const previousMembers = tontine.members;

      // Optimistic update
      setTontines((prev) =>
        prev.map((t) =>
          t.id === tontineId ? { ...t, members } : t,
        ),
      );

      try {
        // The unique constraint on (tontine_id, payout_order) is DEFERRABLE
        // INITIALLY DEFERRED, so within a single transaction the constraint is
        // only checked at commit time. We use a two-pass approach:
        // Pass 1: Set all payout_orders to temporary high values to avoid
        //         transient uniqueness violations.
        // Pass 2: Set the final payout_order values.

        const OFFSET = 10000;

        // Pass 1 – temporary high values
        for (let i = 0; i < members.length; i++) {
          const member = members[i];
          if (member.id.startsWith('temp_')) continue;

          const { error } = await supabase
            .from('tontine_members')
            .update({ payout_order: OFFSET + i })
            .eq('id', member.id);

          if (error) throw error;
        }

        // Pass 2 – final values
        for (let i = 0; i < members.length; i++) {
          const member = members[i];
          if (member.id.startsWith('temp_')) continue;

          const { error } = await supabase
            .from('tontine_members')
            .update({ payout_order: member.payoutOrder })
            .eq('id', member.id);

          if (error) throw error;
        }

        // Background refresh for consistency
        refreshTontines();
      } catch (error) {
        console.error('reorderMembers error:', error);
        // Revert optimistic update
        setTontines((prev) =>
          prev.map((t) =>
            t.id === tontineId ? { ...t, members: previousMembers } : t,
          ),
        );
        throw error;
      }
    },
    [userId, tontines, refreshTontines],
  );

  // -------------------------------------------------------------------------
  // launchTontine
  // -------------------------------------------------------------------------

  const launchTontine = useCallback(
    async (tontineId: string): Promise<void> => {
      if (!userId) throw new Error('Not authenticated');

      const tontine = tontines.find((t) => t.id === tontineId);
      if (!tontine) throw new Error('Tontine not found');
      if (tontine.members.length !== tontine.totalMembers) {
        throw new Error('Not enough members to launch');
      }

      const startDate = new Date();
      const nextDeadline = new Date(startDate);
      if (tontine.frequency === 'weekly') {
        nextDeadline.setDate(nextDeadline.getDate() + 7);
      } else {
        nextDeadline.setMonth(nextDeadline.getMonth() + 1);
      }

      // Optimistic update
      setTontines((prev) =>
        prev.map((t) =>
          t.id === tontineId
            ? { ...t, status: 'active' as const, startDate, nextDeadline, currentTour: 1 }
            : t,
        ),
      );

      try {
        // Update the tontine record
        const { error: updateError } = await supabase
          .from('tontines')
          .update({
            status: 'active',
            start_date: startDate.toISOString(),
            next_deadline: nextDeadline.toISOString(),
            current_round: 1,
          })
          .eq('id', tontineId);

        if (updateError) throw updateError;

        // Generate rounds for each member based on payout order
        const sortedMembers = [...tontine.members].sort(
          (a, b) => a.payoutOrder - b.payoutOrder,
        );

        const rounds = sortedMembers.map((member, index) => {
          const scheduledDate = new Date(startDate);
          if (tontine.frequency === 'weekly') {
            scheduledDate.setDate(scheduledDate.getDate() + (index + 1) * 7);
          } else {
            scheduledDate.setMonth(scheduledDate.getMonth() + (index + 1));
          }

          return {
            tontine_id: tontineId,
            round_number: index + 1,
            beneficiary_id: member.id,
            scheduled_date: scheduledDate.toISOString(),
            status: index === 0 ? 'current' : 'upcoming',
          };
        });

        if (rounds.length > 0) {
          const { error: roundsError } = await supabase
            .from('rounds')
            .insert(rounds);

          if (roundsError) {
            console.error('Error inserting rounds:', roundsError);
            throw roundsError;
          }
        }

        // Background refresh for consistency
        refreshTontines();
      } catch (error) {
        console.error('launchTontine error:', error);
        // Revert optimistic update
        await refreshTontines();
        throw error;
      }
    },
    [userId, tontines, refreshTontines],
  );

  // -------------------------------------------------------------------------
  // clearTontines
  // -------------------------------------------------------------------------

  const clearTontines = useCallback(async (): Promise<void> => {
    if (!userId) {
      setTontines([]);
      return;
    }

    try {
      // Delete tontines created by this user (cascade will handle members/rounds)
      const { error } = await supabase
        .from('tontines')
        .delete()
        .eq('creator_id', userId);

      if (error) {
        console.error('clearTontines error:', error);
        throw error;
      }

      setTontines([]);
    } catch (error) {
      console.error('clearTontines error:', error);
      // Still clear local state
      setTontines([]);
      throw error;
    }
  }, [userId]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <TontineContext.Provider
      value={{
        tontines,
        addTontine,
        getTontineById,
        updateTontine,
        addMemberToTontine,
        removeMemberFromTontine,
        reorderMembers,
        launchTontine,
        isLoading,
        refreshTontines,
        clearTontines,
      }}
    >
      {children}
    </TontineContext.Provider>
  );
};

export const useTontines = () => {
  const context = useContext(TontineContext);
  if (!context) {
    throw new Error('useTontines must be used within TontineProvider');
  }
  return context;
};
