import { create } from 'zustand';
const useStore = create((set) => ({
  selectedRows: [],
  setSelectedRows: (rows) => set({ selectedRows: rows }),
  filters: {},
  setFilters: (filters) => set({ filters })
}));

export default useStore;
