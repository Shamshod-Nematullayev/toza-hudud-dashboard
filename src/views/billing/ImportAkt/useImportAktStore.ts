import api from 'utils/api';
import { create } from 'zustand';

interface IActPack {
  id: number;
  createdDate: string;
  districtId: number;
  name: string;
  packType: string;
}
interface StoreState {
  file: File | null;
  setFile: (file: File) => void;
  clearFile: () => void;
  fileIdOnBilling: string | null;
  uploadFileToBilling: () => Promise<void>;
  downloadTemplate: () => void;
  excelFile: File | null;
  setExcelFile: (file: File) => void;
  sendImportAktRequest: () => Promise<void>;
  getActPacks: () => Promise<void>;
  actPacks: IActPack[];
  selectedActPackId: number | null;
  setSelectedActPackId: (id: number | null) => void;
}

export const useNotificationStore = create<StoreState>((set, get) => ({
  file: null,
  setFile: (file: File) => set({ file }),
  clearFile: () => set({ file: null }),
  fileIdOnBilling: null,
  uploadFileToBilling: async () => {
    const { file } = get();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/billing/akt/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    set({ fileIdOnBilling: response.data.fileId });
  },
  downloadTemplate: () => {
    const link = document.createElement('a');
    link.href = '/templates/akt_import_template.xlsx';
    link.download = 'akt_import_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  excelFile: null,
  setExcelFile: (file: File) => set({ excelFile: file }),
  sendImportAktRequest: async () => {
    const { fileIdOnBilling, excelFile } = get();
    if (!fileIdOnBilling || !excelFile) return;

    const formData = new FormData();
    formData.append('fileId', fileIdOnBilling);
    formData.append('excelFile', excelFile);

    await api.post('/billing/akt/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  actPacks: [],
  getActPacks: async () => {
    const response = await api.get('/billing/akt/packs');
    set({ actPacks: response.data.actPacks });
  },
  selectedActPackId: null,
  setSelectedActPackId: (id: number | null) => set({ selectedActPackId: id })
}));
