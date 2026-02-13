import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tontine, TontineMember } from '@/types';

type CreateTontineData = Omit<Tontine, 'id' | 'createdAt' | 'currentTour' | 'status' | 'members' | 'startDate'>;

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
  clearTontines: () => Promise<void>;
}

const TontineContext = createContext<TontineContextType | undefined>(undefined);

const TONTINES_STORAGE_KEY = '@tontine_tontines';

export const TontineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTontines();
  }, []);

  const loadTontines = async () => {
    try {
      const savedTontines = await AsyncStorage.getItem(TONTINES_STORAGE_KEY);
      if (savedTontines) {
        const parsedTontines = JSON.parse(savedTontines);
        const tontinesWithDates = parsedTontines.map((t: Record<string, unknown>) => ({
          ...t,
          createdAt: new Date(t.createdAt as string),
          nextDeadline: new Date(t.nextDeadline as string),
          startDate: t.startDate ? new Date(t.startDate as string) : undefined,
          members: ((t.members as Record<string, unknown>[] | undefined) || []).map((m: Record<string, unknown>) => ({
            ...m,
            addedAt: new Date(m.addedAt as string),
          })),
          status: t.status || 'active',
        }));
        setTontines(tontinesWithDates);
      }
    } catch (error) {
      console.error('Error loading tontines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTontines = async (newTontines: Tontine[]) => {
    try {
      await AsyncStorage.setItem(TONTINES_STORAGE_KEY, JSON.stringify(newTontines));
    } catch (error) {
      console.error('Error saving tontines:', error);
      throw error;
    }
  };

  const updateTontineInternal = async (id: string, updates: Partial<Tontine>) => {
    const updatedTontines = tontines.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    setTontines(updatedTontines);
    await saveTontines(updatedTontines);
  };

  const addTontine = async (tontineData: CreateTontineData): Promise<Tontine> => {
    try {
      const id = `tontine_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const createdAt = new Date();

      const newTontine: Tontine = {
        ...tontineData,
        id,
        createdAt,
        currentTour: 1,
        status: 'draft',
        members: [],
      };

      const updatedTontines = [...tontines, newTontine];
      setTontines(updatedTontines);
      await saveTontines(updatedTontines);
      return newTontine;
    } catch (error) {
      console.error('Error adding tontine:', error);
      throw error;
    }
  };

  const getTontineById = (id: string) => {
    return tontines.find((t) => t.id === id);
  };

  const updateTontine = async (id: string, updates: Partial<Tontine>) => {
    try {
      await updateTontineInternal(id, updates);
    } catch (error) {
      console.error('Error updating tontine:', error);
      throw error;
    }
  };

  const addMemberToTontine = async (tontineId: string, name: string, phone: string) => {
    const tontine = tontines.find((t) => t.id === tontineId);
    if (!tontine) throw new Error('Tontine not found');
    if (tontine.members.length >= tontine.totalMembers) throw new Error('Group is full');

    const words = name.trim().split(/\s+/);
    const initials = words.length >= 2
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();

    const newMember: TontineMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: name.trim(),
      phone: phone.trim(),
      initials,
      payoutOrder: tontine.members.length + 1,
      addedAt: new Date(),
    };

    const updatedMembers = [...tontine.members, newMember];
    await updateTontineInternal(tontineId, { members: updatedMembers });
  };

  const removeMemberFromTontine = async (tontineId: string, memberId: string) => {
    const tontine = tontines.find((t) => t.id === tontineId);
    if (!tontine) throw new Error('Tontine not found');

    const updatedMembers = tontine.members
      .filter((m) => m.id !== memberId)
      .map((m, index) => ({ ...m, payoutOrder: index + 1 }));

    await updateTontineInternal(tontineId, { members: updatedMembers });
  };

  const reorderMembers = async (tontineId: string, reorderedMembers: TontineMember[]) => {
    await updateTontineInternal(tontineId, { members: reorderedMembers });
  };

  const launchTontine = async (tontineId: string) => {
    const tontine = tontines.find((t) => t.id === tontineId);
    if (!tontine) throw new Error('Tontine not found');
    if (tontine.members.length !== tontine.totalMembers) throw new Error('Not enough members');

    const startDate = new Date();
    const nextDeadline = new Date(startDate);
    if (tontine.frequency === 'weekly') {
      nextDeadline.setDate(nextDeadline.getDate() + 7);
    } else {
      nextDeadline.setMonth(nextDeadline.getMonth() + 1);
    }

    await updateTontineInternal(tontineId, {
      status: 'active',
      startDate,
      nextDeadline,
      currentTour: 1,
    });
  };

  const clearTontines = async () => {
    try {
      await AsyncStorage.removeItem(TONTINES_STORAGE_KEY);
      setTontines([]);
    } catch (error) {
      console.error('Error clearing tontines:', error);
    }
  };

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
