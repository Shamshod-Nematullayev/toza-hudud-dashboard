import { create } from 'zustand';
const useStore = create((set) => ({
  selectedRows: [],
  setSelectedRows: (rows) => set({ selectedRows: rows }),
  filters: {},
  setFilters: (filters) => set({ filters }),
  mahallas: [],
  setMahallas: (mahallas) => set({ mahallas: mahallas }),
  document: {},
  setDocument: (document) => set({ document }),
  showDialog: false,
  setShowDialog: (show) => set({ showDialog: show }),
  state: true,
  refresh: () => set(({ filters }) => ({ filters: { ...filters, state: !state } }))
}));

export default useStore;
