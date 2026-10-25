import { create } from 'zustand';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { getCurrentPendingPeriod, getPendingPeriodRange } from './utils/periodHelper';

export interface PendingActSummary {
  totalCount: number;
  totalAmount: number;
  pendingCount: number;
  pendingAmount: number;
  processingCount: number;
  processingAmount: number;
  completedCount: number;
  completedAmount: number;
  failedCount: number;
  failedAmount: number;
}

export interface PendingActByDocumentType {
  _id: string;
  count: number;
  totalAmount: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
}

interface PendingActsStore {
  // Period & cycle state
  period: string;
  setPeriod: (period: string) => void;

  // Stats state
  stats: {
    summary: PendingActSummary;
    byDocumentType: PendingActByDocumentType[];
  } | null;
  isStatsLoading: boolean;
  fetchStats: (targetPeriod?: string) => Promise<void>;

  // DataGrid table state
  rows: any[];
  setRows: (rows: any[]) => void;
  total: number;
  setTotal: (total: number) => void;
  pageNum: number;
  setPageNum: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Reload trigger
  reloadState: number;
  reload: () => void;

  // Navigation & selection
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedActId: string | null;
  setSelectedActId: (id: string | null) => void;

  // Actions
  retryAct: (id: string) => Promise<any>; // yangilangan akt (yoki null)
  bulkRetry: (ids?: string[]) => Promise<boolean>;
  deleteAct: (id: string, resetAriza?: boolean) => Promise<boolean>;
}

const useStore = create<PendingActsStore>((set, get) => ({
  period: getCurrentPendingPeriod(),
  setPeriod: (period: string) => set({ period }),

  stats: null,
  isStatsLoading: false,
  fetchStats: async (targetPeriod?: string) => {
    const period = targetPeriod || get().period;
    const { fromDate, toDate } = getPendingPeriodRange(period);

    try {
      set({ isStatsLoading: true });
      const res = await api.get('/pending-acts/stats', {
        params: {
          period,
          from_date: fromDate,
          to_date: toDate
        }
      });
      set({ stats: res.data?.data || null });
    } catch (err: any) {
      console.error('Error fetching pending acts stats:', err);
    } finally {
      set({ isStatsLoading: false });
    }
  },

  rows: [],
  setRows: (rows) => set({ rows }),
  total: 0,
  setTotal: (total) => set({ total }),
  pageNum: 1,
  setPageNum: (pageNum) => set({ pageNum }),
  limit: 20,
  setLimit: (limit) => set({ limit }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  reloadState: 0,
  reload: () => set((state) => ({ reloadState: state.reloadState + 1 })),

  activeCategory: null,
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  statusFilter: null,
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectedActId: null,
  setSelectedActId: (selectedActId) => set({ selectedActId }),

  // Bitta akt so'rov ichida kiritiladi (job emas), natija kelguncha kutamiz
  retryAct: async (id: string) => {
    const toastId = toast.loading('Akt TozaMakonga kiritilmoqda...');
    try {
      const res = await api.post(`/pending-acts/${id}/retry`);
      toast.update(toastId, {
        render: res.data?.message || 'Akt kiritildi',
        type: 'success',
        isLoading: false,
        autoClose: 4000
      });
      get().reload();
      return res.data?.data || null;
    } catch (err: any) {
      toast.update(toastId, {
        render: err?.response?.data?.message || 'Qayta urinishda xatolik yuz berdi',
        type: 'error',
        isLoading: false,
        autoClose: 8000
      });
      get().reload();
      return err?.response?.data?.data || null;
    }
  },

  bulkRetry: async (ids?: string[]) => {
    try {
      const payload: any = {};
      if (ids && ids.length) {
        payload.ids = ids;
      } else {
        payload.period = get().period;
      }
      const res = await api.post('/pending-acts/bulk-retry', payload);
      toast.success(res.data?.message || 'Jarayon boshlandi');
      get().reload();
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Ommaviy qayta urinishda xatolik yuz berdi');
      return false;
    }
  },

  deleteAct: async (id: string, resetAriza = false) => {
    try {
      await api.delete(`/pending-acts/${id}`, {
        params: { resetAriza: resetAriza ? 'true' : 'false' }
      });
      toast.success('Muvaffaqiyatli o‘chirildi');
      get().reload();
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'O‘chirishda xatolik yuz berdi');
      return false;
    }
  }
}));

export default useStore;
