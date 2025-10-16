import { create } from 'zustand';

interface StoreState {
  rows: IRow[];
  setRows: (rows: any[]) => void;
  limit: number;
  setLimit: (limit: number) => void;
  totalPages: number;
  setTotalPages: (totalPages: number) => void;
  total: number;
  setTotal: (total: number) => void;
  pageNum: number;
  setPageNum: (pageNum: number) => void;
  fromDate: Date;
  setFromDate: (fromDate: Date) => void;
  toDate: Date;
  setToDate: (toDate: Date) => void;
  status: string;
  setStatus: (status: string) => void;
  filters: any;
  setFilters: (filters: any) => void;
  checked: any[];
  setChecked: (checked: any[]) => void;
}

interface IRow {
  id: number;
  _id: string;
  licshet: string;
  isSent: boolean;
  receiver: string;
  isSavedBilling: boolean;
  hybridMailId: string | number;
  sentOn: Date;
  warning_amount: number;
  sud_process_id_billing: string | number;
}

const useWarningLettersStore = create<StoreState>((set) => ({
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
  setFilters: (filters) => set({ filters }),
  checked: [],
  setChecked: (checked) => set({ checked })
}));

export default useWarningLettersStore;
