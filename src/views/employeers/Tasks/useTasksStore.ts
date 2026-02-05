import { GridSortDirection } from '@mui/x-data-grid';
import { FetchParams, FetchResult } from 'hooks/useServerDataGrid';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';
import api from 'utils/api';
import { create } from 'zustand';

interface IMahalla {
  id: number;
  mfy_rais_name: string;
  name: string;
}

export interface IFilters {
  accountNumber?: string;
  fullName?: string;
  mahallaId?: number;
  type?: 'electricity' | 'phone';
  nazoratchi_id?: number;
  status?: 'completed' | 'in-progress' | 'rejected';
}

interface ITasksStore {
  tasks: any[];
  openSETTDialogDate: boolean;
  setOpenSETTDialogDate: (open: boolean) => void;
  openInfoDialog: boolean;
  setOpenInfoDialog: (open: boolean) => void;
  file: File | null;
  setFile: (file: File) => void;
  clearFile: () => void;
  handleSETT: () => void;
  downloadTemplate: () => void;
  mahallalar: IMahalla[];
  setMahallalar: (mahallalar: IMahalla[]) => void;
  fetchMahallas: () => void;
  fetchTasks: ({ page, limit, sortField, sortDirection, filters }: FetchParams) => Promise<FetchResult<any>>;
  filters: IFilters;
  setFilters: (filters: IFilters) => void;
}

export const useTasksStore = create<ITasksStore>((set, get) => ({
  tasks: [],
  openSETTDialogDate: false,
  setOpenSETTDialogDate: (open: boolean) => set({ openSETTDialogDate: open }),
  openInfoDialog: false,
  setOpenInfoDialog: (open: boolean) => set({ openInfoDialog: open }),
  file: null,
  setFile: (file: File) => set({ file: file }),
  clearFile: () => set({ file: null }),
  handleSETT: async () => {
    await api.post(
      '/fetchTelegram/send-excel-to-telegram',
      {
        file: get().file
      },
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
  },
  downloadTemplate: async () => {
    try {
      const { data } = await api.get('/download-templates/send-excel-to-group', { responseType: 'arraybuffer' });
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'template.xlsx';
      link.click();
    } catch (error: any) {
      toast.error(error?.message as string);
    }
  },
  mahallalar: [],
  setMahallalar: (mahallalar: IMahalla[]) => set({ mahallalar: mahallalar }),
  fetchMahallas: async () => {
    try {
      const { data } = await api.get('/mahallas', {
        params: {
          page: 1,
          limit: 1000
        }
      });
      set({ mahallalar: data.data });
      get().fetchTasks({
        limit: 50,
        page: 1,
        filters: {},
        sortDirection: 'asc',
        sortField: 'id'
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  },
  fetchTasks: async (params) => {
    try {
      useLoaderStore.setState({ isLoading: true });
      const { data } = await api.get('/tasks', { params });
      const tasks =
        data.data.map((row: any, index: number) => ({
          ...row,
          mahallaId: get().mahallalar.find((m: IMahalla) => m.id == row.mahallaId)?.name || '',
          status: t(('tasksStatus.' + row.status) as 'tasksStatus.completed' | 'tasksStatus.in-progress' | 'tasksStatus.rejected'),
          index: index
        })) || [];

      set({ tasks });
      return {
        data: tasks || [],
        meta: {
          limit: data.meta.limit as number,
          page: data.meta.page as number,
          total: data.meta.total as number
        }
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      return {
        data: [],
        meta: {
          limit: 0,
          page: 0,
          total: 0
        }
      };
    } finally {
      useLoaderStore.setState({ isLoading: false });
    }
  },
  filters: {},
  setFilters: (filters: IFilters) => set({ filters })
}));
