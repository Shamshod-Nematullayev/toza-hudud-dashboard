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
  status?: 'completed' | 'in-progress' | 'rejected' | 'checking';
  _nonce?: number;
}

export interface ITask {
  accountNumber: string;
  fullName: string;
  id: number;
  mahallaId: number;
  companyId: number;
  type: 'phone' | 'electricity';
  nazoratchi_id: number;
  nazoratchiName: string;
  status: 'completed' | 'in-progress' | 'rejected' | 'checking';
  purpose: string;
  fileId?: string;
  rejectedReason?: string;
  rejectedReasonType?: string;
  rejectedAt?: string | Date;
  rejectedBy?: string;
  legalAccountNumber?: string;
  caoto?: number | string;
  legalDetails?: any;
  _id?: string;
}

export interface ITaskStats {
  totalTasks: number;
  completedTasks: number;
  checkingTasks?: number;
  inProgressTasks: number;
  rejectedTasks: number;
  phoneTasks: number;
  electricityTasks: number;
  completionRate: number;
}

interface ITasksStore {
  tasks: any[];
  stats: ITaskStats | null;
  statsLoading: boolean;
  fetchStats: () => Promise<void>;
  triggerUpdateStatus: () => Promise<void>;
  triggerGenerateTasks: () => Promise<void>;
  openSETTDialogDate: boolean;
  setOpenSETTDialogDate: (open: boolean) => void;
  openInfoDialog: boolean;
  setOpenInfoDialog: (open: boolean) => void;
  openFilterDrawer: boolean;
  setOpenFilterDrawer: (open: boolean) => void;
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
  applyQuickFilter: (filterUpdate: {
    type?: '' | 'electricity' | 'phone';
    status?: '' | 'completed' | 'in-progress' | 'rejected' | 'checking';
  }) => void;
  triggerRefresh: () => void;
  downloadExcel: () => void;
  accountNumber: string;
  fullName: string;
  mahallaId: string;
  type: '' | 'electricity' | 'phone';
  nazoratchi_id: number | '';
  status: '' | 'completed' | 'in-progress' | 'rejected' | 'checking';
  setAccountNumber: (accountNumber: string) => void;
  setFullName: (fullName: string) => void;
  setMahallaId: (mahallaId: string) => void;
  setType: (type: '' | 'electricity' | 'phone') => void;
  setNazoratchiId: (nazoratchi_id: number | '') => void;
  setStatus: (status: '' | 'completed' | 'in-progress' | 'rejected' | 'checking') => void;
  openEditTaskDialog: boolean;
  handleOpenEditTaskDialog: (taskId: string) => void;
  handleCloseEditTaskDialog: () => void;
  openRejectDialog: boolean;
  rejectTargetTask: ITask | null;
  handleOpenRejectDialog: (task: ITask) => void;
  handleCloseRejectDialog: () => void;
  task: ITask | null;
  setTask: (task: ITask | null) => void;
  handleSaveTask: () => void;
}

export const useTasksStore = create<ITasksStore>((set, get) => ({
  tasks: [],
  stats: null,
  statsLoading: false,
  fetchStats: async () => {
    try {
      set({ statsLoading: true });
      const { data } = await api.get('/tasks/stats');
      set({ stats: data.data });
    } catch (err) {
      console.error('Task stats loading error:', err);
    } finally {
      set({ statsLoading: false });
    }
  },
  triggerUpdateStatus: async () => {
    try {
      useLoaderStore.setState({ isLoading: true });
      const { data } = await api.post('/tasks/trigger-update-status');
      toast.success(data.message || 'Topshiriqlar holati yangilandi!');
      await get().fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Topshiriqlar holatini yangilashda xatolik');
    } finally {
      useLoaderStore.setState({ isLoading: false });
    }
  },
  triggerGenerateTasks: async () => {
    try {
      useLoaderStore.setState({ isLoading: true });
      const { data } = await api.post('/tasks/trigger-generate-tasks');
      toast.success(data.message || 'Topshiriqlar yangilandi!');
      await get().fetchStats();
      get().triggerRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Topshiriqlarni yuklashda xatolik');
    } finally {
      useLoaderStore.setState({ isLoading: false });
    }
  },
  openSETTDialogDate: false,
  setOpenSETTDialogDate: (open: boolean) => set({ openSETTDialogDate: open }),
  openInfoDialog: false,
  setOpenInfoDialog: (open: boolean) => set({ openInfoDialog: open }),
  openFilterDrawer: false,
  setOpenFilterDrawer: (open: boolean) => set({ openFilterDrawer: open }),
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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  },
  fetchTasks: async (params) => {
    try {
      const { page, limit, sortField, sortDirection, filters } = params;
      const cleanParams: Record<string, any> = {
        page,
        limit
      };

      if (sortField && sortField !== 'rowNumber') {
        cleanParams.sortField = sortField;
        cleanParams.sortDirection = sortDirection || 'asc';
      }

      if (filters) {
        const cleanFilters: Record<string, any> = {};
        if (filters.accountNumber?.trim()) cleanFilters.accountNumber = filters.accountNumber.trim();
        if (filters.fullName?.trim()) cleanFilters.fullName = filters.fullName.trim();
        if (filters.mahallaId) cleanFilters.mahallaId = Number(filters.mahallaId);
        if (filters.type) cleanFilters.type = filters.type;
        if (filters.nazoratchi_id) cleanFilters.nazoratchi_id = Number(filters.nazoratchi_id);
        if (filters.status) cleanFilters.status = filters.status;
        cleanParams.filters = cleanFilters;
      }

      const { data } = await api.get('/tasks', { params: cleanParams });
      const tasks =
        data.data.map((row: any, index: number) => ({
          ...row,
          mahallaId: get().mahallalar.find((m: IMahalla) => m.id == row.mahallaId)?.name || '',
          status: row.status,
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
    }
  },
  filters: {},
  setFilters: (filters: IFilters) => set({ filters: { ...filters, _nonce: Date.now() } }),
  triggerRefresh: () => {
    const { accountNumber, fullName, mahallaId, type, nazoratchi_id, status } = get();
    let filters: IFilters = { _nonce: Date.now() };
    if (accountNumber) filters.accountNumber = accountNumber;
    if (fullName) filters.fullName = fullName;
    if (mahallaId) filters.mahallaId = Number(mahallaId);
    if (type) filters.type = type;
    if (nazoratchi_id) filters.nazoratchi_id = Number(nazoratchi_id);
    if (status) filters.status = status;
    set({ filters });
  },
  applyQuickFilter: (patch) => {
    const isTotal = patch.type === '' && patch.status === '';
    if (isTotal) {
      set({
        accountNumber: '',
        fullName: '',
        mahallaId: '',
        nazoratchi_id: '',
        type: '',
        status: '',
        filters: { _nonce: Date.now() }
      });
      return;
    }

    const nextType = patch.type !== undefined ? patch.type : get().type;
    const nextStatus = patch.status !== undefined ? patch.status : get().status;

    let filters: IFilters = { _nonce: Date.now() };
    if (get().accountNumber) filters.accountNumber = get().accountNumber;
    if (get().fullName) filters.fullName = get().fullName;
    if (get().mahallaId) filters.mahallaId = Number(get().mahallaId);
    if (nextType) filters.type = nextType;
    if (get().nazoratchi_id) filters.nazoratchi_id = Number(get().nazoratchi_id);
    if (nextStatus) filters.status = nextStatus;

    set({
      type: nextType,
      status: nextStatus,
      filters
    });
  },
  downloadExcel: () => {
    const currentFilters = get().filters;
    const cleanFilters: Record<string, any> = {};
    if (currentFilters.accountNumber?.trim()) cleanFilters.accountNumber = currentFilters.accountNumber.trim();
    if (currentFilters.fullName?.trim()) cleanFilters.fullName = currentFilters.fullName.trim();
    if (currentFilters.mahallaId) cleanFilters.mahallaId = Number(currentFilters.mahallaId);
    if (currentFilters.type) cleanFilters.type = currentFilters.type;
    if (currentFilters.nazoratchi_id) cleanFilters.nazoratchi_id = Number(currentFilters.nazoratchi_id);
    if (currentFilters.status) cleanFilters.status = currentFilters.status;

    api
      .get('/tasks/excel', {
        responseType: 'blob',
        params: {
          filters: cleanFilters
        }
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'tasks.xlsx';
        link.click();
      });
  },
  accountNumber: '',
  fullName: '',
  mahallaId: '',
  type: '',
  nazoratchi_id: '',
  status: '',
  setAccountNumber: (accountNumber: string) => set({ accountNumber: accountNumber }),
  setFullName: (fullName: string) => set({ fullName: fullName }),
  setMahallaId: (mahallaId: string) => set({ mahallaId: mahallaId }),
  setType: (type: '' | 'electricity' | 'phone') => set({ type: type }),
  setNazoratchiId: (nazoratchi_id: number | '') => set({ nazoratchi_id: nazoratchi_id }),
  setStatus: (status: '' | 'completed' | 'in-progress' | 'rejected' | 'checking') => set({ status: status }),
  openEditTaskDialog: false,
  handleOpenEditTaskDialog: async (taskId) => {
    useLoaderStore.setState({ isLoading: true });
    try {
      const task = (await api.get(`/tasks/${taskId}`)).data;
      set({ task, openEditTaskDialog: true });
    } catch (error) {
    } finally {
      useLoaderStore.setState({ isLoading: false });
    }
    set({ openEditTaskDialog: true });
  },
  handleCloseEditTaskDialog: () => set({ openEditTaskDialog: false }),
  openRejectDialog: false,
  rejectTargetTask: null,
  handleOpenRejectDialog: (task) => set({ openRejectDialog: true, rejectTargetTask: task }),
  handleCloseRejectDialog: () => set({ openRejectDialog: false, rejectTargetTask: null }),
  setTask: (task) => set({ task: task }),
  task: null,
  handleSaveTask: async () => {
    const currentTask = get().task;
    if (!currentTask) return;

    if (currentTask.status === 'rejected' && !currentTask.fileId) {
      toast.warning(
        "Topshiriqni 'Bajarib bo'lmaydi' holatiga o'tkazish uchun asoslantiruvchi hujjat yuklanishi shart! Iltimos, jadvaldagi maxsus qizil tugma orqali yakunlang."
      );
      return;
    }

    try {
      await api.put(`/tasks/${currentTask._id}`, currentTask);
      toast.success(t('successMessages.successSave'));
      get().handleCloseEditTaskDialog();
      get().triggerRefresh();
      get().fetchStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (error?.message as string));
    }
  }
}));
