import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import config from 'config';

export enum FontFamily {
  Roboto = 'Roboto, sans-serif',
  Poppins = 'Poppins, sans-serif',
  Inter = 'Inter, sans-serif',
  TimesNewRoman = 'Times New Roman, serif'
}

export interface ITableVisibleColumns {
  orderNum: boolean;
  accountNumber: boolean;
  fullName: boolean;
  streetName: boolean;
  homeNumber: boolean;
  homeIndex: boolean;
  flatNumber: boolean;
  inhabitantCnt: boolean;
  ksaldo: boolean;
  lastPayment: boolean;
  electricityAccountNumber: boolean;
  phone: boolean;
}

export interface IPrintTableCustomization {
  fontSize: number;
  alphabet: 'latin' | 'cyrillic';
  colorMode: 'color' | 'monochrome';
  lineDensity: 'compact' | 'normal';
  orientation?: 'portrait' | 'landscape';
  visibleColumns: ITableVisibleColumns;
}

interface CustomizationState {
  customization: {
    isOpen: string[];
    defaultId: string;
    fontFamily: FontFamily;
    borderRadius: number;
    opened: boolean;
    mode: string;
    documentVariantOdamSoni: 'ariza+dalolatnoma' | 'dalolatnoma' | 'ariza';
    boshliqIshtirokida: boolean;
    mfyRaisiIshtirok: boolean;
  };
  printTableSettings: IPrintTableCustomization;
  setPrintTableSettings: (settings: Partial<IPrintTableCustomization>) => void;
  user: {
    fullName: string;
    avatar: string;
    id: string;
    roles: string[];
    isTestUser: boolean;
    login: string;
  } | null;
  setUser: (user: CustomizationState['user']) => void;
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
  openMurojaatCount: number;
  setOpenMurojaatCount: (count: number) => void;
  logOut: () => void;
}

export const defaultVisibleColumns: ITableVisibleColumns = {
  orderNum: true,
  accountNumber: true,
  fullName: true,
  streetName: true,
  homeNumber: true,
  homeIndex: true,
  flatNumber: true,
  inhabitantCnt: true,
  ksaldo: true,
  lastPayment: true,
  electricityAccountNumber: true,
  phone: true
};

const defaultPrintTableSettings: IPrintTableCustomization = {
  fontSize: 12,
  alphabet: 'latin',
  colorMode: 'color',
  lineDensity: 'normal',
  orientation: 'portrait',
  visibleColumns: defaultVisibleColumns
};

const initialState = {
  customization: {
    isOpen: [],
    defaultId: 'default',
    fontFamily: FontFamily.Roboto,
    borderRadius: config.borderRadius,
    opened: true,
    mode: 'dark',
    documentVariantOdamSoni: 'ariza+dalolatnoma',
    boshliqIshtirokida: false,
    mfyRaisiIshtirok: true
  },
  printTableSettings: defaultPrintTableSettings,
  user: null,
  company: {
    billingAdminName: '',
    gpsOperatorName: '',
    id: 0,
    locationName: '',
    managerName: '',
    name: '',
    phone: ''
  },
  mahallalar: [],
  openMurojaatCount: 0
};

const useCustomizationStore = create<CustomizationState>()(
  persist<CustomizationState>(
    (set) => ({
      ...initialState,
      customization: { ...initialState.customization, documentVariantOdamSoni: 'ariza+dalolatnoma' },
      setCustomization: (customization) =>
        set((state) => ({
          customization: { ...state.customization, ...customization }
        })),
      setPrintTableSettings: (settings) =>
        set((state) => ({
          printTableSettings: { ...state.printTableSettings, ...settings }
        })),
      language: 'ru',
      setLanguage: (language) => set({ language }),
      resetCustomization: () => set({ customization: { ...initialState.customization, documentVariantOdamSoni: 'ariza+dalolatnoma' } }),
      setCompany: (company) =>
        set((state) => {
          if (state.company?.id !== company?.id) {
            return { company, mahallalar: [] };
          }
          return { company };
        }),
      setMahallalar: (mahallalar) => set({ mahallalar }),
      setUser: (user) => set({ user }),
      logOut: () =>
        set({
          user: null,
          company: { billingAdminName: '', gpsOperatorName: '', id: 0, locationName: '', managerName: '', name: '', phone: '' },
          mahallalar: []
        }),
      setOpenMurojaatCount: (count: number) => set({ openMurojaatCount: count })
    }),
    {
      name: 'customization-store',
      storage: createJSONStorage(() => localStorage) // `zustand` uchun to‘g‘ri storage
    }
  )
);

export default useCustomizationStore;
