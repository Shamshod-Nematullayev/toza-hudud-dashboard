import { create } from 'zustand';

const useStore = create((set) => ({
  aktType: 'odam_soni',
  setAktType: (aktType) => set({ aktType }),
  showPrintSection: false,
  setShowPrintSection: (state) => set({ showPrintSection: state }),
  rows: [],
  setRows: (files) => set({ rows: files }),
  rowsDublicat: [],
  setRowsDublicat: (files) => set({ rows: files }),
  abonentData: {},
  setAbonentData: (data) => set({ abonentData: data }),
  abonentData2: {},
  setAbonentData2: (data) => set({ abonentData2: data }),
  ariza: {},
  setAriza: (data) => set({ ariza: data }),
  mahalla: {},
  setMahalla: (mfy) => set({ mahalla: mfy }),
  mahallaDublicat: {},
  setMahallaDublicat: (mfy) => set({ mahallaDublicat: mfy }),
  recalculationPeriods: [],
  setRecalculationPeriods: (data) => set({ recalculationPeriods: data }),
  yashovchiSoniInput: '',
  setYashovchiSoniInput: (data) => set({ yashovchiSoniInput: data })
}));

export default useStore;
