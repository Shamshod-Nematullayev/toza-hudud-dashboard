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
  company: {
    billingAdminName: string;
    gpsOperatorName: string;
    id: number;
    locationName: string;
    managerName: string;
    name: string;
    phone: string;
  };
  setCompany: (company: CustomizationState['company']) => void;
  mahallalar: { id: number; name: string }[];
  setMahallalar: (mahallalar: CustomizationState['mahallalar']) => void;
}

const initialState = {
  customization: {
    isOpen: [],
    defaultId: 'default',
    fontFamily: FontFamily.Roboto,
    borderRadius: config.borderRadius,
    opened: true,
    mode: 'dark',
    documentVariantOdamSoni: '1'
  },
  company: {
    billingAdminName: '',
    gpsOperatorName: '',
    id: 0,
    locationName: '',
    managerName: '',
    name: '',
    phone: ''
  },
  mahallalar: []
};

const useCustomizationStore = create<CustomizationState>()(
  persist<CustomizationState>(
    (set) => ({
      ...initialState,
      setCustomization: (customization) =>
        set((state) => ({
          customization: { ...state.customization, ...customization }
        })),
      language: 'ru',
      setLanguage: (language) => set({ language }),
      resetCustomization: () => set({ customization: initialState.customization }),
      setCompany: (company) => set({ company }),
      setMahallalar: (mahallalar) => set({ mahallalar })
    }),
    {
      name: 'customization-store',
      storage: createJSONStorage(() => localStorage) // `zustand` uchun to‘g‘ri storage
    }
  )
);

export default useCustomizationStore;
