import { create } from 'zustand';

const useStore = create((set) => ({
  pdfFile: null,
  setPdfFile: (file) => set({ pdfFile: file })
}));

export default useStore;
