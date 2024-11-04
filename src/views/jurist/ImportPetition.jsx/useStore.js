import { create } from 'zustand';

const useStore = create((set) => ({
  pdfFiles: [],
  setPdfFiles: (files) => set({ pdfFiles: files }),
  currentFile: {},
  setCurrentFile: (file_name) =>
    set((state) => {
      console.log(state, file_name);
      return { currentFile: state.pdfFiles.find(({ file }) => file.name == file_name) };
    })
}));

export default useStore;
