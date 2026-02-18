import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SidebarTab, RequestTab, ResponseTab } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

interface UIState {
  sidebarOpen: boolean;
  sidebarTab: SidebarTab;
  requestTab: RequestTab;
  responseTab: ResponseTab;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setRequestTab: (tab: RequestTab) => void;
  setResponseTab: (tab: ResponseTab) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarTab: 'collections',
      requestTab: 'params',
      responseTab: 'body',
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarTab: (tab) => set({ sidebarTab: tab }),
      setRequestTab: (tab) => set({ requestTab: tab }),
      setResponseTab: (tab) => set({ responseTab: tab }),
    }),
    {
      name: STORAGE_KEYS.UI_STATE,
    }
  )
);
