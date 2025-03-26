import { create } from 'zustand';

const useStore = create((set) => ({
  selectedRows: [],
  setSelectedRows: (rows) => set({ selectedRows: rows }),
  rowsForPrint: [],
  setRowsForPrint: (rows) => set({ rowsForPrint: rows }),
  filter: {},
  setFilter: (filter) => set({ filter }),
  malumotnomaData: {},
  setMalumotnomaData: (data) => set({ malumotnomaData: data })
}));

export default useStore;
