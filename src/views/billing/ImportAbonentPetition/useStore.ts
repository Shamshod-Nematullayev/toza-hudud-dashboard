import { IAriza } from 'types/models';
import { create } from 'zustand';

interface State {
  showDialog: boolean;
  setShowDialog: (state: boolean) => void;
  pdfFiles: any[];
  setPdfFiles: (files: any[]) => void;
  currentFile: any;
  setCurrentFile: (file_name: string) => void;
  removePdfFile: (file_name: string) => void;
  ariza: IAriza | null;
  setAriza: (ariza: IAriza | null) => void;
}

function sortFilesByNumber(files: any[]) {
  return files.sort((a, b) => {
    const extractNumber = (name: string) => {
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
  });
}

const useStore = create<State>((set) => ({
  showDialog: false,
  setShowDialog: (state) => set({ showDialog: state }),
  pdfFiles: [],
  setPdfFiles: (files) => set({ pdfFiles: sortFilesByNumber(files) }),
  removePdfFile: (file_name) => set((state) => ({ pdfFiles: state.pdfFiles.filter(({ file }) => file.name != file_name) })),
  currentFile: {},
  setCurrentFile: (file_name) => set((state) => ({ currentFile: state.pdfFiles.find(({ file }) => file.name == file_name) })),
  ariza: null,
  setAriza: (ariza) => set({ ariza })
}));

export default useStore;
