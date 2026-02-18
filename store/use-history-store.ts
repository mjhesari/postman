import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoryItem, HttpRequest, HttpResponse } from '@/types';
import { STORAGE_KEYS, MAX_HISTORY_ITEMS } from '@/lib/constants';
import { nanoid } from 'nanoid';

interface HistoryState {
  history: HistoryItem[];
  maxItems: number;
  
  // Actions
  addToHistory: (request: HttpRequest, response: HttpResponse) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  getHistoryItem: (id: string) => HistoryItem | null;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      maxItems: MAX_HISTORY_ITEMS,
      
      addToHistory: (request, response) =>
        set((state) => {
          const newItem: HistoryItem = {
            id: nanoid(),
            request: { ...request },
            response: { ...response },
            timestamp: Date.now(),
          };
          
          const newHistory = [newItem, ...state.history];
          
          // Keep only maxItems
          if (newHistory.length > state.maxItems) {
            newHistory.length = state.maxItems;
          }
          
          return { history: newHistory };
        }),
      
      clearHistory: () => set({ history: [] }),
      
      deleteHistoryItem: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),
      
      getHistoryItem: (id) => {
        return get().history.find((item) => item.id === id) || null;
      },
    }),
    {
      name: STORAGE_KEYS.HISTORY,
    }
  )
);
