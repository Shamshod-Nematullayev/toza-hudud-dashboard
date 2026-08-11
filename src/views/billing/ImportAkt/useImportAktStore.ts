import { toast } from 'react-toastify';
import api from 'utils/api';
import { create } from 'zustand';
import useLoaderStore from 'store/loaderStore';

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
  downloadTemplate: () => Promise<void>;
  excelFile: File | null;
  setExcelFile: (file: File | null) => void;
  sendImportAktRequest: () => Promise<boolean>;
  getActPacks: () => Promise<void>;
  actPacks: IActPack[];
  selectedActPackId: number | '';
  setSelectedActPackId: (id: number | '') => void;
  packType: string;
  setPackType: (packType: string) => void;
  isImporting: boolean;
  isUploadingPdf: boolean;
  isDownloadingTemplate: boolean;
  isFetchingPacks: boolean;
}

export const useImportAktStore = create<StoreState>((set, get) => ({
  pdfFile: null,
  excelFile: null,
  fileIdOnBilling: null,
  actPacks: [],
  selectedActPackId: '',
  packType: '',
  isImporting: false,
  isUploadingPdf: false,
  isDownloadingTemplate: false,
  isFetchingPacks: false,

  setPdfFile: (file: File[]) => {
    if (!file || file.length === 0) {
      set({ pdfFile: null, fileIdOnBilling: null });
    } else {
      set({ pdfFile: file[0], fileIdOnBilling: null });
    }
  },

  setExcelFile: (file: File | null) => set({ excelFile: file }),

  clearStore: () =>
    set({
      pdfFile: null,
      excelFile: null,
      selectedActPackId: '',
      packType: '',
      fileIdOnBilling: null,
      isUploadingPdf: false,
      isImporting: false
    }),

  uploadFileToBilling: async () => {
    const { pdfFile: file } = get();
    if (!file) return;

    set({ isUploadingPdf: true, fileIdOnBilling: null });
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/billing/upload-file-tozamakon', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.fileId) {
        set({ fileIdOnBilling: response.data.fileId });
      } else {
        toast.error('PDF faylni yuklashda fileId olinmadi');
      }
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || 'PDF faylini serverga yuklashda xatolik yuz berdi';
      toast.error(msg);
    } finally {
      set({ isUploadingPdf: false });
    }
  },

  downloadTemplate: async () => {
    set({ isDownloadingTemplate: true });
    try {
      const response = await api.get('/download-templates/import-acts', { responseType: 'blob' });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'akt_import_template.xlsx';
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Shablon yuklab olindi');
    } catch (error: any) {
      console.error(error);
      toast.error('Shablonni yuklab olishda xatolik yuz berdi');
    } finally {
      set({ isDownloadingTemplate: false });
    }
  },

  sendImportAktRequest: async () => {
    const { fileIdOnBilling, pdfFile, isUploadingPdf, excelFile, selectedActPackId, packType } = get();

    if (!pdfFile) {
      toast.error('Asoslantiruvchi PDF fayli yuklanmagan!');
      return false;
    }

    if (isUploadingPdf || !fileIdOnBilling) {
      toast.error('PDF fayli hali serverga yuklanmoqda, iltimos kuting...');
      return false;
    }

    if (!excelFile) {
      toast.error('Aktlar kiritilgan Excel fayli tanlanmagan!');
      return false;
    }

    if (!selectedActPackId && !packType) {
      toast.error('Akt pachkasi yoki yangi pachka turi tanlanishi shart!');
      return false;
    }

    set({ isImporting: true });
    const { setIsLoading } = useLoaderStore.getState();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('fileId', fileIdOnBilling);
      formData.append('file', excelFile);
      if (packType) formData.append('packType', packType);
      if (selectedActPackId) formData.append('actPackId', selectedActPackId.toString());

      const res = await api.post('/billing/import-acts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.ok === false) {
        toast.error(res.data.message || 'Import qilishda xatolik kuzatildi');
        return false;
      } else {
        toast.success(res.data.message || 'Aktlar muvaffaqiyatli import qilindi!');
        get().clearStore();
        return true;
      }
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || error?.message || 'Import qilishda xatolik yuz berdi';
      toast.error(msg);
      return false;
    } finally {
      set({ isImporting: false });
      setIsLoading(false);
    }
  },

  getActPacks: async () => {
    set({ isFetchingPacks: true });
    try {
      const response = await api.get('/billing/act-packs');
      set({ actPacks: response.data || [] });
    } catch (error: any) {
      console.error(error);
    } finally {
      set({ isFetchingPacks: false });
    }
  },

  selectedActPackId: '',
  setSelectedActPackId: (id: number | '') => set({ selectedActPackId: id }),
  packType: '',
  setPackType: (packType: string) => set({ packType })
}));
