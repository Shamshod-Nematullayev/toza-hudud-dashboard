import { create } from 'zustand';

const useStore = create((set) => ({
  pdfFile: {},
  setPdfFile: (file) => set({ pdfFile: file })
}));

export default useStore;
