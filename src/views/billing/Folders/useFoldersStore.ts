import { FetchData } from 'hooks/useServerDataGrid';
import api from 'utils/api';
import { create } from 'zustand';

interface StoreState {
  page: number;
  limit: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  fetchFunc: FetchData;
  getFolder: (id: string) => void;
  closeFolder: (id: string) => void;
  currentFolder: {
    id: number;
    _id: string;
    elements: any[];
  } | null;
  hideFolder: () => void;
}

const useFoldersStore = create<StoreState>((set, get) => ({
  page: 1,
  limit: 10,
  sortField: 'id',
  sortDirection: 'asc',
  filters: {},
  setFilters: (filters) => set({ filters }),
  fetchFunc: async ({ page, limit, sortField, sortDirection, filters }) => {
    const { data } = await api.get('/folders', {
      params: {
        page,
        limit,
        sortField,
        sortDirection,
        filters
      }
    });
    return { data: data.data, meta: { total: data.meta.total, page: data.meta.page, limit: data.meta.limit } };
  },
  getFolder: async (id: string) => {
    const { data } = await api.get(`/folders/${id}`);

    set({
      currentFolder: data.data
    });
  },
  closeFolder: async (id: string) => {
    if (!confirm("Haqiqatdan ham papkani yopmoqchimisiz? Yopilganidan keyin unga boshqa element qo'shib bo'lmaydi")) {
      return;
    }
    await api.post('/folders/close-folder', {
      folderId: id
    });
    set({ filters: { refresh: Date.now() } });
  },
  currentFolder: null,
  showFolderState: false,
  hideFolder: () => set({ currentFolder: null })
}));

export default useFoldersStore;
