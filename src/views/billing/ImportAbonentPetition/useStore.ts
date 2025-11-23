interface IAriza {
  _id: string;
  sana: string;
  document_type: string;
  document_number: number;
  licshet: string;
  comment: string;
  aktSummasi: number;
  next_prescribed_cnt: number;
  status: string;
  is_canceled: boolean;
  __v: number;
  aktInfo: IActInfo;
  akt_id: string;
  akt_pachka_id: string;
  akt_date: string;
  actStatus: string;
  tempPhotos: string[];
  companyId: number;
  version: number;
  abonentId: number;
  fullName: string;
}

interface IActInfo {
  createdByFullName: string | null;
  updatedByFullName: string | null;
  warnedByFullName: string | null;
  confirmedByFullName: string | null;
  canceledByFullName: string | null;
  residentFullName: string | null;
  inhabitantCnt: number | null;
  mahallaName: string | null;
  streetName: string | null;
  houseNumber: string | null;
  flatNumber: number | null;
  accountNumber: string;
  id: number;
  actNumber: string;
  actPackId: number;
  actPackName: string;
  actStatus: string;
  actType: string;
  amount: number;
  amountWithQQS: number | null;
  amountWithoutQQS: number | null;
  canceledAt: string | null;
  canceledBy: number | null;
  cancellationConclusion: string | null;
  companyId: number;
  confirmedAt: string | null;
  confirmedBy: number | null;
  createdAt: string;
  createdBy: number;
  currentInhabitantCount: number | null;
  description: string;
  districtId: number;
  endPeriod: string | null;
  fileId: string;
  oldInhabitantCount: number | null;
  packType: string;
  regionId: number;
  residentId: number;
  startPeriod: string | null;
  updatedAt: string | null;
  updatedBy: number;
  warnedAt: string;
  warnedBy: number;
  warningConclusion: string;
  currentFile: {
    file: File;
  } | null;
  pdfFiles: {
    file: File;
    url: string;
    blob: Blob;
  }[];
  setPdfFiles: (files: { file: File; url: string; blob: Blob }[]) => void;
  removePdfFile: (file_name: string) => void;
  setCurrentFile: (file_name: string) => void;
}
import { toast } from 'react-toastify';
import api from 'utils/api';
import { create } from 'zustand';

interface StoreState {
  openCancelPetitionDialogState: boolean;
  openCancelPetitionDialog: () => void;
  closeCancelPetitionDialog: () => void;
  rejectAbonentPetition: (purpose: string) => Promise<any>;
  ariza: IAriza | null;
  setAriza: (ariza: IAriza) => void;
  pdfFiles: { file: File; url: string; blob: Blob }[];
  setPdfFiles: (files: { file: File; url: string; blob: Blob }[]) => void;
  removePdfFile: (file_name: string) => void;
  currentFile: { file: File; url: string; blob: Blob } | null;
  setCurrentFile: (file_name: string) => void;
}

const useStore = create<StoreState>((set, get) => ({
  openCancelPetitionDialogState: false,
  openCancelPetitionDialog: () => set({ openCancelPetitionDialogState: true }),
  closeCancelPetitionDialog: () => set({ openCancelPetitionDialogState: false }),

  rejectAbonentPetition: async (purpose) => {
    if (!get().ariza) return toast.error('Ariza topilmadi');
    const { data } = await api.post('/arizalar/cancel', {
      _id: get().ariza?._id,
      canceling_description: purpose
    });

    if (!data.ok) {
      toast.error(data.message);
      return;
    }
    toast.success('Ariza bekor qilindi!');

    set({ ariza: null, currentFile: null });
    get().removePdfFile(get().currentFile?.file.name || '');
    get().closeCancelPetitionDialog();
  },

  pdfFiles: [],
  setPdfFiles: (files) =>
    set({
      pdfFiles: files.sort((a, b) => {
        console.log(a);
        const extractNumber = (name: string) => {
          const match = name.match(/^\d+/); // Fayl nomining boshidagi raqamlarni olish
          return match ? parseInt(match[0], 10) : null;
        };

        const numA = extractNumber(a.file.name);
        const numB = extractNumber(b.file.name);

        // Agar ikkalasida ham raqam bo'lsa, ularni raqam bo'yicha solishtiramiz
        if (numA !== null && numB !== null) {
          return numA - numB;
        }

        // Agar faqat birida raqam bo'lsa, raqamli fayl birinchi keladi
        if (numA !== null) return -1;
        if (numB !== null) return 1;

        console.log(a);
        // Ikkalasida ham raqam bo'lmasa, alfavit bo'yicha solishtiramiz
        return a.file.name.localeCompare(b.file.name);
      })
    }),
  removePdfFile: (file_name) => set((state) => ({ pdfFiles: state.pdfFiles.filter(({ file }) => file.name != file_name) })),
  currentFile: null,
  setCurrentFile: (file_name) =>
    set((state) => {
      return { currentFile: state.pdfFiles.find(({ file }) => file.name == file_name) };
    }),
  ariza: null,
  setAriza: (ariza) => set({ ariza })
}));

export default useStore;
