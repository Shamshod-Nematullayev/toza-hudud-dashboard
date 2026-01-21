import api from 'utils/api';
import { create } from 'zustand';

type FilterFieldOptions = 'mahallaName' | 'driverName' | 'automobileNumber';

interface VisitGrafikState {
  rows: any[];
  fetchVisitGrafik: () => Promise<void>;
  filterField: FilterFieldOptions;
  filterValue: string;
  setFilterField: (field: FilterFieldOptions) => void;
  setFilterValue: (value: string) => void;
  clearFilter: () => void;
}

export const useVisitGrafikStore = create<VisitGrafikState>((set) => ({
  rows: [],
  filterField: 'mahallaName',
  filterValue: '',
  fetchVisitGrafik: async () => {
    try {
      const data = (await api.get('/automobiles')).data;
      set({ rows: data });
    } catch (error) {
      console.error('Error fetching visit grafik:', error);
    }
  },
  setFilterField: (field) => set({ filterField: field }),
  setFilterValue: (value: string) => set({ filterValue: value }),
  clearFilter: () => set({ filterField: 'mahallaName', filterValue: '' })
}));
