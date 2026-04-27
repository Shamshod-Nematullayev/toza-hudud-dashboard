import { create } from 'zustand';

interface ICallFilters {
  accountNumber?: string;
  status?: string;
  priority?: string;
  mahallaId?: string | number;
}

interface CallerState {
  filters: ICallFilters;
  refreshTrigger: boolean;
  setFilter: (key: keyof ICallFilters, value: any) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  modals: {
    create: boolean;
    import: boolean;
  };
  importStats: any | null; // Importdan keyin Lordga hisobot ko'rsatish uchun
  setModal: (type: 'create' | 'import', open: boolean) => void;
  setImportStats: (stats: any) => void;
}

const initialFilters: ICallFilters = {
  status: 'all',
  priority: 'all',
  accountNumber: '',
  mahallaId: ''
};

export const useCallerStore = create<CallerState>((set) => ({
  filters: initialFilters,
  refreshTrigger: false,
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  applyFilters: () => set((state) => ({ refreshTrigger: !state.refreshTrigger })),
  resetFilters: () => set({ filters: initialFilters, refreshTrigger: !false }),
  modals: { create: false, import: false },
  importStats: null,
  setModal: (type, open) => set((state) => ({ modals: { ...state.modals, [type]: open } })),
  setImportStats: (stats) => set({ importStats: stats })
}));
