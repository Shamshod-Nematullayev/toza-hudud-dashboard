import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import config from 'config';

const initialState = {
  isOpen: [],
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
      setCustomization: (customization) =>
        set((state) => ({
          customization: { ...state.customization, ...customization }
        })),
      resetCustomization: () => set({ customization: initialState })
    }),
    {
      name: 'customization-store',
      storage: createJSONStorage(() => localStorage) // `zustand` uchun to‘g‘ri storage
    }
  )
);

export default useCustomizationStore;
