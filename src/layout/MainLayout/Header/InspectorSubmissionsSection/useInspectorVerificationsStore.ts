import { create } from 'zustand';
import api from 'utils/api';
import { socket } from 'utils/socket';
import audio from '../../../../assets/audios/notification.wav';

export interface IVerificationCounts {
  shaxsniTasdiqlash: number;
  elektrKodi: number;
  xatlovOdamSoni: number;
  yangiAbonent: number;
  total: number;
}

export type VerificationPriority = 'low' | 'medium' | 'high';

export interface ICategorySetting {
  priority: VerificationPriority;
  muted: boolean;
}

export interface IVerificationSettings {
  soundEnabled: boolean;
  categories: {
    shaxsniTasdiqlash: ICategorySetting;
    elektrKodi: ICategorySetting;
    xatlovOdamSoni: ICategorySetting;
    yangiAbonent: ICategorySetting;
  };
}

const SETTINGS_STORAGE_KEY = 'inspector_verification_settings';

export const defaultVerificationSettings: IVerificationSettings = {
  soundEnabled: true,
  categories: {
    shaxsniTasdiqlash: { priority: 'high', muted: false },
    elektrKodi: { priority: 'low', muted: true },
    xatlovOdamSoni: { priority: 'medium', muted: false },
    yangiAbonent: { priority: 'medium', muted: false }
  }
};

const loadSettingsFromStorage = (): IVerificationSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        soundEnabled: parsed.soundEnabled ?? defaultVerificationSettings.soundEnabled,
        categories: {
          shaxsniTasdiqlash: {
            ...defaultVerificationSettings.categories.shaxsniTasdiqlash,
            ...(parsed.categories?.shaxsniTasdiqlash || {})
          },
          elektrKodi: {
            ...defaultVerificationSettings.categories.elektrKodi,
            ...(parsed.categories?.elektrKodi || {})
          },
          xatlovOdamSoni: {
            ...defaultVerificationSettings.categories.xatlovOdamSoni,
            ...(parsed.categories?.xatlovOdamSoni || {})
          },
          yangiAbonent: {
            ...defaultVerificationSettings.categories.yangiAbonent,
            ...(parsed.categories?.yangiAbonent || {})
          }
        }
      };
    }
  } catch (e) {
    console.warn('Failed to load inspector verification settings from localStorage:', e);
  }
  return defaultVerificationSettings;
};

interface InspectorVerificationsState {
  counts: IVerificationCounts;
  settings: IVerificationSettings;
  loading: boolean;
  fetchCounts: () => Promise<void>;
  updateSettings: (newSettings: IVerificationSettings) => void;
  resetSettings: () => void;
  getBadgeColor: () => 'error' | 'warning' | 'primary' | 'default';
  setupSocket: () => () => void;
}

const defaultCounts: IVerificationCounts = {
  shaxsniTasdiqlash: 0,
  elektrKodi: 0,
  xatlovOdamSoni: 0,
  yangiAbonent: 0,
  total: 0
};

export const useInspectorVerificationsStore = create<InspectorVerificationsState>((set, get) => ({
  counts: defaultCounts,
  settings: loadSettingsFromStorage(),
  loading: false,

  fetchCounts: async () => {
    try {
      const res = await api.get('/inspector-verifications/summary');
      if (res.data?.ok && res.data?.data) {
        set({ counts: res.data.data });
      }
    } catch (err) {
      console.warn('Failed to fetch inspector verifications summary:', err);
    }
  },

  updateSettings: (newSettings: IVerificationSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {}
    set({ settings: newSettings });
  },

  resetSettings: () => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultVerificationSettings));
    } catch (e) {}
    set({ settings: defaultVerificationSettings });
  },

  getBadgeColor: () => {
    const { counts, settings } = get();
    if (!counts || counts.total === 0) return 'default';

    const activePriorities: VerificationPriority[] = [];

    if (counts.shaxsniTasdiqlash > 0) {
      activePriorities.push(settings.categories.shaxsniTasdiqlash.priority);
    }
    if (counts.elektrKodi > 0) {
      activePriorities.push(settings.categories.elektrKodi.priority);
    }
    if (counts.xatlovOdamSoni > 0) {
      activePriorities.push(settings.categories.xatlovOdamSoni.priority);
    }
    if (counts.yangiAbonent > 0) {
      activePriorities.push(settings.categories.yangiAbonent.priority);
    }

    // Agar o'ta muhim (high) dan so'rov bo'lsa -> Qizil (error)
    if (activePriorities.includes('high')) {
      return 'error';
    }
    // Agar o'rtacha (medium) dan so'rov bo'lsa -> Sariq (warning)
    if (activePriorities.includes('medium')) {
      return 'warning';
    }
    // Agar faqat odatiy (low) dan so'rov bo'lsa -> Ko'k (primary)
    if (activePriorities.includes('low')) {
      return 'primary';
    }

    return 'default';
  },

  setupSocket: () => {
    const handleUpdate = (data: { counts: IVerificationCounts; extraData?: any }) => {
      if (data?.counts) {
        const prevCounts = get().counts;
        const currentSettings = get().settings;
        set({ counts: data.counts });

        // Tovush chalish mantiqi:
        if (currentSettings.soundEnabled) {
          let shouldPlaySound = false;

          // Qaysi bo'limda son oshganini tekshiramiz
          if (
            data.counts.shaxsniTasdiqlash > prevCounts.shaxsniTasdiqlash &&
            !currentSettings.categories.shaxsniTasdiqlash.muted
          ) {
            shouldPlaySound = true;
          }
          if (
            data.counts.elektrKodi > prevCounts.elektrKodi &&
            !currentSettings.categories.elektrKodi.muted
          ) {
            shouldPlaySound = true;
          }
          if (
            data.counts.xatlovOdamSoni > prevCounts.xatlovOdamSoni &&
            !currentSettings.categories.xatlovOdamSoni.muted
          ) {
            shouldPlaySound = true;
          }
          if (
            data.counts.yangiAbonent > prevCounts.yangiAbonent &&
            !currentSettings.categories.yangiAbonent.muted
          ) {
            shouldPlaySound = true;
          }

          if (shouldPlaySound) {
            try {
              new Audio(audio).play().catch(() => {});
            } catch (e) {}
          }
        }
      }
    };

    socket.on('inspector_verifications:update', handleUpdate);

    return () => {
      socket.off('inspector_verifications:update', handleUpdate);
    };
  }
}));
