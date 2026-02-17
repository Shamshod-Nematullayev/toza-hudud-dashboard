import { toast } from 'react-toastify';
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
  pdfFile: File | null;
  setPdfFile: (file: File[]) => void;
  clearStore: () => void;
  fileIdOnBilling: string | null;
  uploadFileToBilling: () => Promise<void>;
  downloadTemplate: () => void;
  excelFile: File | null;
  setExcelFile: (file: File) => void;
  sendImportAktRequest: () => Promise<any>;
  getActPacks: () => Promise<void>;
  actPacks: IActPack[];
  selectedActPackId: number | '';
  setSelectedActPackId: (id: number | '') => void;
  packType: string;
  setPackType: (packType: string) => void;
}

export const useImportAktStore = create<StoreState>((set, get) => ({
  pdfFile: null,
  setPdfFile: (file: File[]) => set({ pdfFile: file[0] }),
  clearStore: () => set({ pdfFile: null, excelFile: null, selectedActPackId: '', packType: '' }),
  fileIdOnBilling: null,
  uploadFileToBilling: async () => {
    const { pdfFile: file } = get();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/billing/upload-file-tozamakon', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    set({ fileIdOnBilling: response.data.fileId });
  },
  downloadTemplate: () => {
    api.get('/download-templates/import-acts', { responseType: 'blob' }).then((response) => {
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'akt_import_template.xlsx';
      link.click();
    });
  },
  excelFile: null,
  setExcelFile: (file: File) => set({ excelFile: file }),
  sendImportAktRequest: async () => {
    const { fileIdOnBilling, excelFile } = get();
    if (!fileIdOnBilling || !excelFile) return toast.error('PDF yoki Excel fayl tanlanmagan');
    const formData = new FormData();
    formData.append('fileId', fileIdOnBilling);
    formData.append('file', excelFile);
    if (get().packType) formData.append('packType', get().packType);
    formData.append('actPackId', get().selectedActPackId.toString());

    const res = await api.post('/billing/import-acts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    toast.success(res.data.message);
    get().clearStore();
  },
  actPacks: [],
  getActPacks: async () => {
    const response = await api.get('/billing/act-packs');
    set({ actPacks: response.data });
  },
  selectedActPackId: '',
  setSelectedActPackId: (id: number | '') => set({ selectedActPackId: id }),
  packType: '',
  setPackType: (packType: string) => set({ packType })
}));
