import { create } from 'zustand';

const useStore = create((set) => ({
  aktType: 'odam_soni',
  setAktType: (aktType) => set({ aktType }),
  rows: [],
  setRows: (files) => set({ rows: files }),
  rowsDublicat: [],
  setRowsDublicat: (files) => set({ rows: files }),
  abonentData: {},
  setAbonentData: (data) => set({ abonentData: data }),
  abonentData2: {},
  setAbonentData2: (data) => set({ abonentData2: data })
}));

export default useStore;
