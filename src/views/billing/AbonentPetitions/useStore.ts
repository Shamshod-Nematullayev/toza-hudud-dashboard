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
  updateFromTozamakon: () => void;
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
    console.log(abonentData);
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
  updateFromTozamakon: async () => {
    try {
      set({ isLoading: true });
      const { data } = (await api.get('/arizalar/ids', { params: get().filter })).data as { data: { ids: string[] } };

      await api.put('/arizalar/update-ariza-status', { arizaIds: data });

      toast.success('Yangilash jarayoni boshlandi, bildirishnoma orqali xabar qilinadi.');
    } catch (error: any) {
      console.error(error.response?.data?.message || error.message);
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useStore;
