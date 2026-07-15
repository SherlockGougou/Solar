/**
 * Settings store for user preferences that persist across sessions.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  language: 'zh' | 'en';
  useUTC: boolean;
  sidebarCollapsed: boolean;
  infoPanelCollapsed: boolean;

  setLanguage: (lang: 'zh' | 'en') => void;
  setUseUTC: (v: boolean) => void;
  toggleSidebar: () => void;
  toggleInfoPanel: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'zh',
      useUTC: false,
      sidebarCollapsed: false,
      infoPanelCollapsed: false,

      setLanguage: (lang) => set({ language: lang }),
      setUseUTC: (v) => set({ useUTC: v }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleInfoPanel: () => set((s) => ({ infoPanelCollapsed: !s.infoPanelCollapsed })),
    }),
    { name: 'solar-settings' },
  ),
);
