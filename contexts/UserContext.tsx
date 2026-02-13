import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { isSuperAdmin, getSuperAdminUser } from '@/config/superAdmin';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  isSuperAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@tontine_user';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Check if this is the super admin
        if (isSuperAdmin(parsedUser.phone)) {
          // Always use the super admin configuration
          setUserState(getSuperAdminUser());
        } else {
          setUserState(parsedUser);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = async (newUser: User | null) => {
    try {
      if (newUser) {
        // Check if this is the super admin phone
        if (isSuperAdmin(newUser.phone)) {
          // Override with super admin configuration
          const superAdminUser = getSuperAdminUser();
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(superAdminUser));
          setUserState(superAdminUser);
        } else {
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
          setUserState(newUser);
        }
      } else {
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        setUserState(null);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUserState(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const checkIsSuperAdmin = user ? isSuperAdmin(user.phone) : false;

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        isLoading,
        isSuperAdmin: checkIsSuperAdmin,
      }}
    >
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
