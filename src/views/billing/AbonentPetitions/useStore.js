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
  documentNumber: '',
  setDocumentNumber: (documentNumber) => set({ documentNumber }),
  filter: {},
  setFilter: (filter) => set({ filter }),
  showPrintSection: false,
  setShowPrintSection: (showPrintSection) => set({ showPrintSection }),
  currentAriza: {},
  setCurrentAriza: (ariza) => set({ currentAriza: ariza }),
  abonentData: {},
  setAbonentData: (abonentData) => {
    console.log(abonentData);
    set({ abonentData });
  },
  abonentData2: {},
  setAbonentData2: (data) => set({ abonentData2: data }),
  mahalla: {},
  setMahalla: (mfy) => set({ mahalla: mfy }),
  mahallaDublicat: {},
  setMahallaDublicat: (mfy) => set({ mahallaDublicat: mfy }),
  aktFileURL: {},
  setAktFileURL: (aktFileURL) => set({ aktFileURL }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading })
}));

export default useStore;
