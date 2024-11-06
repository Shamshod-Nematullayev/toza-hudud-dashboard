import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import config from 'config';

const initialState = {
  isOpen: [], // for active default menu
  defaultId: 'default',
  fontFamily: config.fontFamily,
  borderRadius: config.borderRadius,
  opened: true,
  mode: 'dark'
};

const useCustomizationStore = create(
  persist(
    (set) => ({
      customization: initialState,
      setCustomization: (customization) => set((state) => ({ customization: { ...state.customization, ...customization } }))
    }),
    {
      name: 'customization-store',
      storage: window.localStorage
    }
  )
);

export default useCustomizationStore;
