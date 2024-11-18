import { create } from 'zustand';

const useStore = create((set) => ({
  showDialog: false,
  setShowDialog: (state) => set({ showDialog: state }),
  pdfFiles: [],
  setPdfFiles: (files) => set({ pdfFiles: files }),
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
