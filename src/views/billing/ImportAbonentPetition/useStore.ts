import { toast } from 'react-toastify';
import api from 'utils/api';
import { create } from 'zustand';

interface StoreState {
  openCancelPetitionDialogState: boolean;
  openCancelPetitionDialog: () => void;
  closeCancelPetitionDialog: () => void;
  rejectAbonentPetition: (purpose: string) => Promise<any>;
  ariza: any;
  currentFile: {
    file: File;
  } | null;
  pdfFiles: {
    file: File;
  }[];
  removePdfFile: (file_name: string) => void;
}

const useStore = create<StoreState>((set, get) => ({
  openCancelPetitionDialogState: false,
  openCancelPetitionDialog: () => set({ openCancelPetitionDialogState: true }),
  closeCancelPetitionDialog: () => set({ openCancelPetitionDialogState: false }),

  rejectAbonentPetition: async (purpose) => {
    if (!get().ariza) return toast.error('Ariza topilmadi');
    const { data } = await api.post('/arizalar/cancel', {
      _id: get().ariza._id,
      canceling_description: purpose
    });

    if (!data.ok) {
      toast.error(data.message);
      return;
    }
    toast.success('Ariza bekor qilindi!');

    set({ ariza: {}, currentFile: null });
    get().removePdfFile(get().currentFile?.file.name || '');
    get().closeCancelPetitionDialog();
  },

  pdfFiles: [],
  setPdfFiles: (files) =>
    set({
      pdfFiles: files.sort((a, b) => {
        console.log(a);
        const extractNumber = (name) => {
          const match = name.match(/^\d+/); // Fayl nomining boshidagi raqamlarni olish
          return match ? parseInt(match[0], 10) : null;
        };

        const numA = extractNumber(a.file.name || a);
        const numB = extractNumber(b.file.name || b);

        // Agar ikkalasida ham raqam bo'lsa, ularni raqam bo'yicha solishtiramiz
        if (numA !== null && numB !== null) {
          return numA - numB;
        }

        // Agar faqat birida raqam bo'lsa, raqamli fayl birinchi keladi
        if (numA !== null) return -1;
        if (numB !== null) return 1;

        console.log(a);
        // Ikkalasida ham raqam bo'lmasa, alfavit bo'yicha solishtiramiz
        return (a.file.name || a).localeCompare(b.file.name || b);
      })
    }),
  removePdfFile: (file_name) => set((state) => ({ pdfFiles: state.pdfFiles.filter(({ file }) => file.name != file_name) })),
  currentFile: {},
  setCurrentFile: (file_name) =>
    set((state) => {
      return { currentFile: state.pdfFiles.find(({ file }) => file.name == file_name) };
    }),
  ariza: {},
  setAriza: (ariza) => set({ ariza })
}));

export default useStore;
