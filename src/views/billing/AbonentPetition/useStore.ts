import { create } from 'zustand';

interface ArizaStore {
  ariza: any;
  setAriza: (ariza: any) => void;
  aktFileURL: string | null;
  setAktFileURL: (aktFileURL: string | null) => void;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  pasteImgModalOpen: boolean;
  setPasteImgModalOpen: (state: boolean) => void;
  updateState: boolean;
  updatePage: () => void;
}

const useArizaStore = create<ArizaStore>((set) => ({
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
