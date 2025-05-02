import { create } from 'zustand';

export const useUserStore = create((set) => ({
  settingsModalOpenState: false,
  openSettingsModal: () => set({ settingsModalOpenState: true }),
  closeSettingsModal: () => set({ settingsModalOpenState: false })
}));
