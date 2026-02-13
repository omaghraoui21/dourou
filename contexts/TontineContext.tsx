import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tontine } from '@/types';

interface TontineContextType {
  tontines: Tontine[];
  addTontine: (tontine: Omit<Tontine, 'id' | 'createdAt' | 'currentTour' | 'status'>) => Promise<void>;
  getTontineById: (id: string) => Tontine | undefined;
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
        // Parse dates
        const tontinesWithDates = parsedTontines.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          nextDeadline: new Date(t.nextDeadline),
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

  const addTontine = async (tontineData: Omit<Tontine, 'id' | 'createdAt' | 'currentTour' | 'status'>) => {
    try {
      // Generate a unique ID
      const id = `tontine_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const createdAt = new Date();

      const newTontine: Tontine = {
        ...tontineData,
        id,
        createdAt,
        currentTour: 1,
        status: 'active',
      };

      const updatedTontines = [...tontines, newTontine];
      setTontines(updatedTontines);
      await saveTontines(updatedTontines);
    } catch (error) {
      console.error('Error adding tontine:', error);
      throw error;
    }
  };

  const getTontineById = (id: string) => {
    return tontines.find((t) => t.id === id);
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
