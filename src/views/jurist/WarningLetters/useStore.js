import { create } from 'zustand';

const useWarningLettersStore = create((set) => ({
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
  fromDate: new Date(),
  setFromDate: (fromDate) => set({ fromDate }),
  toDate: new Date(),
  setToDate: (toDate) => set({ toDate }),
  status: null,
  setStatus: (status) => set({ status }),
  filters: {},
  setFilters: (filters) => set({ filters })
}));

export default useWarningLettersStore;
