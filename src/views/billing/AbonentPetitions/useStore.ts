import { toast } from 'react-toastify';
import api from 'utils/api';
import { create } from 'zustand';

interface Row {
  _id: string;
  id: number;
  documentType: string;
  accountNumber: string;
  aktSummasi: number;
  status: string;
  actStatus: string;
  fio: string;
}

interface IStore {
  rows: Row[];
  setRows: (rows: Row[]) => void;
  limit: number;
  setLimit: (limit: number) => void;
  totalPages: number;
  setTotalPages: (totalPages: number) => void;
  total: number;
  setTotal: (total: number) => void;
  pageNum: number;
  setPageNum: (pageNum: number) => void;
  documentNumber: string;
  setDocumentNumber: (documentNumber: string) => void;
  filter: any;
  setFilter: (filter: any) => void;
  showPrintSection: boolean;
  setShowPrintSection: (showPrintSection: boolean) => void;
  currentAriza: any;
  setCurrentAriza: (ariza: any) => void;
  abonentData: any;
  setAbonentData: (abonentData: any) => void;
  abonentData2: any;
  setAbonentData2: (abonentData2: any) => void;
  mahalla: any;
  setMahalla: (mahalla: any) => void;
  mahallaDublicat: any;
  setMahallaDublicat: (mahallaDublicat: any) => void;
  aktFileURL: string;
  setAktFileURL: (aktFileURL: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  reloadState: boolean;
  reload: () => void;
  updateFromTozamakon: (customFilter?: any) => Promise<void>;

  // Hybrid architecture state
  period: string;
  setPeriod: (period: string) => void;
  monthlyStats: any;
  isStatsLoading: boolean;
  fetchMonthlyStats: (month?: string) => Promise<void>;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  selectedArizaId: string | null;
  setSelectedArizaId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const useStore = create<IStore>((set, get) => ({
  rows: [],
  setRows: (rows) => set({ rows }),
  limit: 25,
  setLimit: (limit) => set({ limit }),
  totalPages: 0,
  setTotalPages: (totalPages) => set({ totalPages }),
  total: 0,
  setTotal: (total) => set({ total }),
  pageNum: 1,
  setPageNum: (pageNum) => set({ pageNum }),
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
    set({ abonentData });
  },
  abonentData2: {},
  setAbonentData2: (data) => set({ abonentData2: data }),
  mahalla: {},
  setMahalla: (mfy) => set({ mahalla: mfy }),
  mahallaDublicat: {},
  setMahallaDublicat: (mfy) => set({ mahallaDublicat: mfy }),
  aktFileURL: '',
  setAktFileURL: (aktFileURL) => set({ aktFileURL }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  reloadState: false,
  reload: () => set({ reloadState: !get().reloadState }),
  updateFromTozamakon: async (customFilter?: any) => {
    try {
      set({ isLoading: true });
      const filterToSend = customFilter !== undefined ? customFilter : get().filter || {};
      const res = await api.get('/arizalar/ids', { params: filterToSend });
      const ids: string[] = res.data?.data || [];

      if (!ids || ids.length === 0) {
        toast.info('Yangilash uchun akt kiritilgan arizalar topilmadi');
        return;
      }

      const chunkSize = 1000;
      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        await api.put('/arizalar/update-ariza-status', { arizaIds: chunk });
      }

      toast.success(
        `${ids.length} ta ariza bo‘yicha yangilash jarayoni boshlandi. Bildirishnoma orqali xabar qilinadi.`
      );
      get().reload();
    } catch (error: any) {
      console.error(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || error.message || 'Xatolik yuz berdi');
    } finally {
      set({ isLoading: false });
    }
  },

  // Hybrid architecture state
  period: new Date().toISOString().slice(0, 7),
  setPeriod: (period: string) => set({ period }),
  monthlyStats: null,
  isStatsLoading: false,
  fetchMonthlyStats: async (targetMonth?: string) => {
    const month = targetMonth || get().period;
    try {
      set({ isStatsLoading: true });
      const res = await api.get('/statistics/arizalar-monthly-report', {
        params: { month }
      });
      set({ monthlyStats: res.data?.data || null });
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    } finally {
      set({ isStatsLoading: false });
    }
  },
  activeCategory: null,
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  statusFilter: null,
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  selectedArizaId: null,
  setSelectedArizaId: (selectedArizaId) => set({ selectedArizaId }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery })
}));

export default useStore;
