import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSettingsStore = create(
  persist(
    (set) => ({
      apiKey: '',
      isDarkMode: false,
      notificationFrequency: 'daily', // daily, weekly
      preferredDifficulty: 'medium', // easy, medium, hard
      setApiKey: (key) => set({ apiKey: key }),
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setNotificationFrequency: (freq) => set({ notificationFrequency: freq }),
      setPreferredDifficulty: (diff) => set({ preferredDifficulty: diff }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
