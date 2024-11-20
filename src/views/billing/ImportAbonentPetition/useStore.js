import { create } from 'zustand';

const useStore = create((set) => ({
  showDialog: false,
  setShowDialog: (state) => set({ showDialog: state }),
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
