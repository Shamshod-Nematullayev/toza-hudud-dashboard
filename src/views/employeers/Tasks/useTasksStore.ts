import api from 'utils/api';
import { create } from 'zustand';

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
  }
}));
