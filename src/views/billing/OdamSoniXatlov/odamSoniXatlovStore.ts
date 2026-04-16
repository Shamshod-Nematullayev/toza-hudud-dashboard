import api from 'utils/api';
import { create } from 'zustand';

interface XatlovState {
  // Data
  rows: any[];
  total: number;
  totalPages: number;
  pdfFile: File | null;

  // Pagination & Filter
  pagination: {
    page: number;
    limit: number;
    sort: string;
    filter: Record<string, any>;
  };

  ui: {
    isPrintModalOpen: boolean;
    loading: boolean;
    isUploading: boolean;
    refreshToggle: boolean; // Refresh uchun toggle
  };

  // Specific Data
  dalolatnoma: {
    _id: string;
    documentNumber: number;
    mahalla: {
      name: string;
      mfy_rais_name: string;
      biriktirilganNazoratchi: {
        inspector_name: string;
      };
    };
    rows: {
      accountNumber: string;
      fio: string;
      YASHOVCHILAR: number;
    }[];
    data: any;
    pdfFiles: any[];
    isPrinting: boolean;
  };

  // 2. Actionlar (Setterlar)
  setRows: (data: { rows: any[]; total: number; totalPages: number }) => void;
  updatePagination: (update: Partial<XatlovState['pagination']>) => void;
  setLoading: (status: boolean) => void;
  toggleRefresh: () => void;
  setPdfFiles: (files: FileList) => void;
  resetStore: () => void;
  setPrintModal: (isOpen: boolean) => void;
  fetchRows: () => void;
  setPdfFile: (file: File | null) => void;
}

const initialState = {
  rows: [],
  total: 0,
  totalPages: 0,
  pdfFile: null,
  pagination: {
    page: 1,
    limit: 50,
    sort: '',
    filter: {}
  },
  ui: {
    isPrintModalOpen: false,
    loading: false,
    isUploading: false,
    refreshToggle: false
  },
  dalolatnoma: {
    _id: '',
    documentNumber: 0,
    mahalla: {
      name: '',
      mfy_rais_name: '',
      biriktirilganNazoratchi: {
        inspector_name: ''
      }
    },
    rows: [],
    data: {},
    pdfFiles: [],
    isPrinting: false
  }
};

const useOdamSoniXatlovStore = create<XatlovState>((set, get) => ({
  ...initialState,

  // Ma'lumotlarni ommaviy yangilash (Bulk update)
  setRows: (data) => set((state) => ({ ...state, ...data })),

  // Paginatsiya va filtrni bitta funksiya orqali boshqarish
  updatePagination: (update) =>
    set((state) => ({
      pagination: { ...state.pagination, ...update }
    })),

  setLoading: (loading) => set({ ui: { ...get().ui, loading } }),

  toggleRefresh: () => set((state) => ({ ui: { ...state.ui, refreshToggle: !state.ui.refreshToggle } })),

  setPdfFiles: (files) =>
    set((state) => ({
      dalolatnoma: { ...state.dalolatnoma, pdfFiles: Array.from(files).slice(0, 1) }
    })),

  // Store-ni tozalash funksiyasi (Logout yoki sahifadan chiqishda kerak bo'ladi)
  resetStore: () => set(initialState),
  setPrintModal: (isOpen) => set((state) => ({ ui: { ...get().ui, isPrintModalOpen: isOpen } })),
  fetchRows: async () => {
    const { pagination, setLoading, setRows } = get(); // get() orqali joriy stateni olamiz

    setLoading(true);
    try {
      const {
        data
      }: {
        data: { data: any[]; meta: { totalPages: number; total: number } };
      } = await api.get(`/yashovchi-soni-xatlov`, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          ...pagination.filter
        }
      });

      // Ma'lumotni transformatsiya qilish (Mapping)
      const formattedRows = data.data.map((row, i) => ({
        id: (pagination.page - 1) * pagination.limit + i + 1,
        _id: row._id,
        abonentId: row.abonentId,
        accountNumber: row.KOD,
        fio: row.fio,
        currentInhabitantCount: row.currentInhabitantCount,
        YASHOVCHILAR: row.YASHOVCHILAR,
        mahallaId: {
          mahallaId: row.mahallaId,
          mahallaName: row.mahallaName
        },
        status: !row.document_id ? 'yangi' : 'xujjat yaratilgan'
      }));

      // Hammasini bitta set bilan yangilaymiz
      set((state) => ({
        rows: formattedRows,
        totalPages: data.meta.totalPages,
        total: data.meta.total
      }));
    } catch (error) {
      console.error("Xatlov ma'lumotlarini olishda xato:", error);
    } finally {
      setLoading(false);
    }
  },
  setPdfFile: (file) => set({ pdfFile: file })
}));

export default useOdamSoniXatlovStore;
