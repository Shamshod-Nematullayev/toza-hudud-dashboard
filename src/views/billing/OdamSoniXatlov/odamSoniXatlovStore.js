import { create } from 'zustand';

const odamSoniXatlovStore = create((set) => ({
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
  refreshTrigger: false,
  refresh: () => set((state) => ({ refreshTrigger: !state.refreshTrigger })),
  loading: false,
  setLoading: (loading) => set({ loading }),
  dalolatnomaData: { data: {}, mahalla: {} },
  setDalolatnomaData: (dalolatnomaData) => set({ dalolatnomaData }),
  openPrintSection: false,
  setOpenPrintSection: (openPrintSection) => set({ openPrintSection }),
  pdfFiles: [],
  setPdfFiles: (pdfFiles) => set({ pdfFiles: [pdfFiles[0]] }),
  clearPdfFiles: () => set({ pdfFiles: [] })
}));

export default odamSoniXatlovStore;
