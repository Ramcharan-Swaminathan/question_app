import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Question Data Model:
 * {
 *   id: string,
 *   type: 'MCQ' | 'SHORT',
 *   question: string,
 *   options: string[] | null,
 *   answer: string,
 *   difficulty: 'Easy' | 'Medium' | 'Hard',
 *   topic: string,
 *
 *   // SRS Data
 *   nextReview: number (timestamp),
 *   interval: number (days),
 *   easeFactor: number,
 *   repetitions: number
 * }
 */

export const useQuestionStore = create(
  persist(
    (set, get) => ({
      questions: [],

      addQuestions: (newQuestions) => set((state) => ({
        questions: [...state.questions, ...newQuestions]
      })),

      updateQuestion: (id, updates) => set((state) => ({
        questions: state.questions.map(q => q.id === id ? { ...q, ...updates } : q)
      })),

      deleteQuestion: (id) => set((state) => ({
        questions: state.questions.filter(q => q.id !== id)
      })),

      getDueQuestions: () => {
        const now = Date.now();
        return get().questions.filter(q => q.nextReview <= now);
      },

      getStats: () => {
        const total = get().questions.length;
        const due = get().questions.filter(q => q.nextReview <= Date.now()).length;
        return { total, due };
      }
    }),
    {
      name: 'question-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
