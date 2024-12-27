import { create } from 'zustand';

const useStore = create((set) => ({
  rows: [],
  setRows: (rows) => set({ rows }),
  limit: 50,
  setLimit: (limit) => set({ limit }),
  totalPages: 0,
  setTotalPages: (totalPages) => set({ totalPages }),
  total: 0,
  setTotal: (total) => set({ total }),
  pageNum: 1,
  setPageNum: (pageNum) => set({ pageNum }),
  totalPages: 0,
  setTotalPages: (totalPages) => set({ totalPages }),
  filter: {},
  setFilter: (filter) => set({ filter }),
  sort: '',
  setSort: (sort) => set({ sort }),
  documentNumber: '',
  setDocumentNumber: (documentNumber) => set({ documentNumber }),
  showPrintSection: false,
  setShowPrintSection: (showPrintSection) => set({ showPrintSection }),
  currentAriza: {},
  setCurrentAriza: (ariza) => set({ currentAriza: ariza }),
  abonentData: {},
  setAbonentData: (data) => set({ abonentData: data }),
  abonentData2: {},
  setAbonentData2: (data) => set({ abonentData2: data }),
  mahalla: {},
  setMahalla: (mfy) => set({ mahalla: mfy }),
  mahallaDublicat: {},
  setMahallaDublicat: (mfy) => set({ mahallaDublicat: mfy })
}));

export default useStore;
