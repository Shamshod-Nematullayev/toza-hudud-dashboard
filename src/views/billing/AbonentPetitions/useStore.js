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
  setSort: (sort) => set({ sort })
}));

export default useStore;
