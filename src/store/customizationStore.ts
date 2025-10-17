import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import config from 'config';

export enum FontFamily {
  Roboto = 'Roboto, sans-serif',
  Poppins = 'Poppins, sans-serif',
  Inter = 'Inter, sans-serif',
  TimesNewRoman = 'Times New Roman, serif'
}
interface CustomizationState {
  customization: {
    isOpen: string[];
    defaultId: string;
    fontFamily: FontFamily;
    borderRadius: number;
    opened: boolean;
    mode: string;
    documentVariantOdamSoni: string;
  };
  setCustomization: (customization: Partial<CustomizationState['customization']>) => void;
  language: string;
  setLanguage: (lang: string) => void;
  resetCustomization: () => void;
}

const initialState = {
  isOpen: [],
  defaultId: 'default',
  fontFamily: FontFamily.Roboto,
  borderRadius: config.borderRadius,
  opened: true,
  mode: 'dark',
  documentVariantOdamSoni: '1'
};

const useCustomizationStore = create<CustomizationState>()(
  persist<CustomizationState>(
    (set) => ({
      customization: initialState,
      setCustomization: (customization) =>
        set((state) => ({
          customization: { ...state.customization, ...customization }
        })),
      language: 'ru',
      setLanguage: (language) => set({ language }),
      resetCustomization: () => set({ customization: initialState })
    }),
    {
      name: 'customization-store',
      storage: createJSONStorage(() => localStorage) // `zustand` uchun to‘g‘ri storage
    }
  )
);

export default useCustomizationStore;
