import { create } from 'zustand';

const useArizaStore = create((set) => ({
  ariza: {},
  setAriza: (ariza) => set({ ariza }),
  aktFileURL: null,
  setAktFileURL: (aktFileURL) => set({ aktFileURL }),
  showModal: false,
  setShowModal: (showModal) => set({ showModal }),
  pasteImgModalOpen: false,
  setPasteImgModalOpen: (state) => set({ pasteImgModalOpen: state }),
  updateState: false,
  updatePage: () => set((state) => ({ updateState: !state.updateState }))
}));

export default useArizaStore;
