import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import config from 'config';
import api from 'utils/api';
import Cookies from 'js-cookie';

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

export interface IMenuItemCustomization {
  order?: string[];     // User-defined order of item IDs
  hidden?: string[];    // IDs of hidden items
}

export interface IMenuCustomizationSettings {
  groupOrder?: string[];                           // Order of main groups
  hiddenGroups?: string[];                         // Hidden group IDs
  itemsByGroup?: Record<string, IMenuItemCustomization>; // Per-group item customization
  pinnedPages?: string[];                          // URLs of pages pinned to the Header
  showCompanySelectorInHeader?: boolean;           // Whether CompanySelector is visible in the main Header
}

export type ThemeMode = 'light' | 'dark' | 'system';

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const getEffectiveThemeMode = (mode?: string | ThemeMode): 'light' | 'dark' => {
  if (!mode || mode === 'system' || mode === 'auto') {
    return getSystemTheme();
  }
  return mode === 'dark' ? 'dark' : 'light';
};

interface CustomizationState {
  customization: {
    isOpen: string[];
    defaultId: string;
    fontFamily: FontFamily;
    borderRadius: number;
    opened: boolean;
    mode: ThemeMode;
    documentVariantOdamSoni: 'ariza+dalolatnoma' | 'dalolatnoma' | 'ariza';
    boshliqIshtirokida: boolean;
    mfyRaisiIshtirok: boolean;
    fuqaroIshtirok: boolean;
  };
  printTableSettings: IPrintTableCustomization;
  setPrintTableSettings: (settings: Partial<IPrintTableCustomization>) => void;
  menuSettings: IMenuCustomizationSettings;
  setMenuSettings: (settings: Partial<IMenuCustomizationSettings>) => void;
  resetMenuSettings: () => void;
  favoriteReports: string[];
  setFavoriteReports: (reports: string[]) => void;
  toggleFavoriteReport: (reportId: string) => void;
  applyServerCustomization: (serverData: any) => void;
  syncCustomizationToServer: () => void;
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
  customizationDrawerOpen: boolean;
  setCustomizationDrawerOpen: (open: boolean) => void;
  toggleCustomizationDrawer: () => void;
  company: {
    billingAdminName: string;
    gpsOperatorName: string;
    id: number;
    locationName: string;
    managerName: string;
    name: string;
    phone: string;
    premium?: boolean;
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

export const defaultMenuSettings: IMenuCustomizationSettings = {
  groupOrder: [],
  hiddenGroups: [],
  itemsByGroup: {},
  pinnedPages: [],
  showCompanySelectorInHeader: false
};

const initialState = {
  customization: {
    isOpen: [],
    defaultId: 'default',
    fontFamily: FontFamily.Roboto,
    borderRadius: config.borderRadius,
    opened: true,
    mode: 'dark' as ThemeMode,
    documentVariantOdamSoni: 'ariza+dalolatnoma' as 'ariza+dalolatnoma' | 'dalolatnoma' | 'ariza',
    boshliqIshtirokida: false,
    mfyRaisiIshtirok: true,
    fuqaroIshtirok: true
  },
  printTableSettings: defaultPrintTableSettings,
  menuSettings: defaultMenuSettings,
  favoriteReports: [] as string[],
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
  openMurojaatCount: 0,
  customizationDrawerOpen: false
};

let syncTimer: any = null;

const syncCustomizationToServerDebounced = (state: CustomizationState) => {
  if (typeof window === 'undefined') return;
  const token = Cookies.get('accessToken');
  if (!token || !state.user) return;

  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  syncTimer = setTimeout(async () => {
    try {
      await api.put('/auth/customization', {
        customization: {
          customization: state.customization,
          favoriteReports: state.favoriteReports,
          language: state.language,
          menuSettings: state.menuSettings,
          printTableSettings: state.printTableSettings
        }
      });
    } catch (e) {
      console.warn('Customization serverga saqlanmadi:', e);
    }
  }, 500);
};

const useCustomizationStore = create<CustomizationState>()(
  persist<CustomizationState>(
    (set, get) => ({
      ...initialState,
      customization: { ...initialState.customization, documentVariantOdamSoni: 'ariza+dalolatnoma' },
      setCustomization: (customization) =>
        set((state) => {
          const nextState = {
            ...state,
            customization: { ...state.customization, ...customization }
          };
          syncCustomizationToServerDebounced(nextState);
          return nextState;
        }),
      setPrintTableSettings: (settings) =>
        set((state) => {
          const nextState = {
            ...state,
            printTableSettings: { ...state.printTableSettings, ...settings }
          };
          syncCustomizationToServerDebounced(nextState);
          return nextState;
        }),
      setMenuSettings: (settings) =>
        set((state) => {
          const nextState = {
            ...state,
            menuSettings: { ...state.menuSettings, ...settings }
          };
          syncCustomizationToServerDebounced(nextState);
          return nextState;
        }),
      resetMenuSettings: () =>
        set((state) => {
          const nextState = {
            ...state,
            menuSettings: defaultMenuSettings
          };
          syncCustomizationToServerDebounced(nextState);
          return nextState;
        }),
      favoriteReports: [],
      setFavoriteReports: (reports) =>
        set((state) => {
          const nextState = { ...state, favoriteReports: reports };
          syncCustomizationToServerDebounced(nextState);
          return nextState;
        }),
      toggleFavoriteReport: (reportId) =>
        set((state) => {
          const exists = state.favoriteReports.includes(reportId);
          const updated = exists
            ? state.favoriteReports.filter((id) => id !== reportId)
            : [...state.favoriteReports, reportId];
          const nextState = { ...state, favoriteReports: updated };
          syncCustomizationToServerDebounced(nextState);
          return nextState;
        }),
      applyServerCustomization: (serverData) => {
        if (!serverData || typeof serverData !== 'object') return;
        set((state) => {
          const rawCust = serverData.customization ? serverData.customization : serverData;
          const innerCust = rawCust.customization ? rawCust.customization : rawCust;

          const newCustomization = {
            ...state.customization,
            ...(innerCust.mode ? { mode: innerCust.mode } : {}),
            ...(innerCust.fontFamily ? { fontFamily: innerCust.fontFamily } : {}),
            ...(innerCust.borderRadius !== undefined ? { borderRadius: innerCust.borderRadius } : {}),
            ...(innerCust.documentVariantOdamSoni ? { documentVariantOdamSoni: innerCust.documentVariantOdamSoni } : {})
          };

          const newFavorites = Array.isArray(rawCust.favoriteReports)
            ? rawCust.favoriteReports
            : Array.isArray(serverData.favoriteReports)
              ? serverData.favoriteReports
              : state.favoriteReports;

          const newLanguage = rawCust.language || serverData.language || state.language;
          const newMenuSettings = rawCust.menuSettings || serverData.menuSettings || state.menuSettings;
          const newPrintTableSettings = rawCust.printTableSettings || serverData.printTableSettings || state.printTableSettings;

          return {
            customization: newCustomization,
            favoriteReports: newFavorites,
            language: newLanguage,
            menuSettings: newMenuSettings,
            printTableSettings: newPrintTableSettings
          };
        });
      },
      syncCustomizationToServer: () => {
        syncCustomizationToServerDebounced(get());
      },
      language: 'ru',
      setLanguage: (language) =>
        set((state) => {
          const nextState = { ...state, language };
          syncCustomizationToServerDebounced(nextState);
          return nextState;
        }),
      resetCustomization: () =>
        set((state) => {
          const nextState = {
            ...state,
            customization: { ...initialState.customization, documentVariantOdamSoni: 'ariza+dalolatnoma' as const }
          };
          syncCustomizationToServerDebounced(nextState);
          return nextState;
        }),
      customizationDrawerOpen: false,
      setCustomizationDrawerOpen: (open) => set({ customizationDrawerOpen: open }),
      toggleCustomizationDrawer: () => set((state) => ({ customizationDrawerOpen: !state.customizationDrawerOpen })),
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
      setOpenMurojaatCount: (count: any) => {
        const num = typeof count === 'number' ? count : typeof count?.openMurojaatCount === 'number' ? count.openMurojaatCount : 0;
        set({ openMurojaatCount: num });
      }
    }),
    {
      name: 'customization-store',
      storage: createJSONStorage(() => localStorage) // `zustand` uchun to‘g‘ri storage
    }
  )
);

export default useCustomizationStore;
