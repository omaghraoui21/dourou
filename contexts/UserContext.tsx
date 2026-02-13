import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@fastshot/auth';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { isSuperAdmin, getSuperAdminUser } from '@/config/superAdmin';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  updateProfile: (updates: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Derive initials from a full name string.
 * Takes the first letter of up to the first two words.
 */
function getInitialsFromName(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Split a full name into firstName and lastName.
 * Splits on the first space; if no space, firstName is the full name and lastName is empty.
 */
function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: '' };
  }
  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  };
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [user, setUserState] = useState<User | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  /**
   * Fetch the user's profile from the profiles table and convert to the app's User model.
   */
  const fetchAndSetProfile = useCallback(async (authUserId: string, authUserPhone?: string) => {
    setIsProfileLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        setIsProfileLoading(false);
        return;
      }

      if (!profile) {
        setIsProfileLoading(false);
        return;
      }

      const phone = profile.phone || authUserPhone || '';

      // Check super admin by phone number
      if (isSuperAdmin(phone)) {
        const superAdminUser = getSuperAdminUser();
        // Preserve the real auth user id for DB operations
        setUserState({ ...superAdminUser, id: authUserId });
        setIsProfileLoading(false);
        return;
      }

      const fullName = profile.full_name || '';
      const { firstName, lastName } = splitFullName(fullName);

      const appUser: User = {
        id: authUserId,
        firstName,
        lastName,
        phone,
        avatar: getInitialsFromName(fullName),
        trustScore: profile.trust_score ?? 3.0,
        role: 'member',
        isVerified: true,
        createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
      };

      setUserState(appUser);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  // Extract auth user fields to use as stable dependencies
  const authUser = auth.user;
  const authUserId = authUser?.id;
  const authUserPhone = authUser?.phone;

  // Sync auth state changes with the user profile
  useEffect(() => {
    if (auth.isLoading) return;

    if (auth.isAuthenticated && authUserId) {
      fetchAndSetProfile(authUserId, authUserPhone ?? undefined);
    } else {
      // Not authenticated - clear user state
      setUserState(null);
    }
  }, [auth.isAuthenticated, auth.isLoading, authUserId, authUserPhone, fetchAndSetProfile]);

  /**
   * Update the user's profile in the database and sync local state.
   */
  const updateProfile = useCallback(async (updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }) => {
    if (!user) {
      throw new Error('Cannot update profile: no user is logged in.');
    }

    // Build the DB update payload
    const dbUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Determine the new full name
    const newFirstName = updates.firstName ?? user.firstName;
    const newLastName = updates.lastName ?? user.lastName;
    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      const fullName = newLastName ? `${newFirstName} ${newLastName}` : newFirstName;
      dbUpdates.full_name = fullName;
    }

    if (updates.phone !== undefined) {
      dbUpdates.phone = updates.phone;
    }

    if (updates.avatarUrl !== undefined) {
      dbUpdates.avatar_url = updates.avatarUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error.message);
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    // Update local state
    const fullName = newLastName ? `${newFirstName} ${newLastName}` : newFirstName;
    setUserState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        firstName: newFirstName,
        lastName: newLastName,
        phone: updates.phone ?? prev.phone,
        avatar: getInitialsFromName(fullName),
      };
    });
  }, [user]);

  /**
   * Backward-compatible setUser that also syncs to the database.
   */
  const setUser = useCallback(async (newUser: User | null) => {
    if (!newUser) {
      setUserState(null);
      return;
    }

    // Check super admin
    if (isSuperAdmin(newUser.phone)) {
      setUserState({ ...getSuperAdminUser(), id: newUser.id });
      return;
    }

    setUserState(newUser);

    // Attempt to sync to DB
    try {
      const fullName = newUser.lastName
        ? `${newUser.firstName} ${newUser.lastName}`
        : newUser.firstName;

      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: newUser.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', newUser.id);
    } catch (err) {
      console.error('Error syncing user to database:', err);
    }
  }, []);

  /**
   * Log out the user via the auth provider and clear local state.
   */
  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      setUserState(null);
    } catch (err) {
      console.error('Error during logout:', err);
      throw err;
    }
  }, [auth]);

  const checkIsSuperAdmin = user ? isSuperAdmin(user.phone) : false;

  const isLoading = auth.isLoading || isProfileLoading;

  const value = useMemo<UserContextType>(() => ({
    user,
    setUser,
    logout,
    isLoading,
    isSuperAdmin: checkIsSuperAdmin,
    isAuthenticated: auth.isAuthenticated,
    updateProfile,
  }), [user, setUser, logout, isLoading, checkIsSuperAdmin, auth.isAuthenticated, updateProfile]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
