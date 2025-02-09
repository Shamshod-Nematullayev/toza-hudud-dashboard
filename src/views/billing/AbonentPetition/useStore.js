import { create } from 'zustand';

const useArizaStore = create((set) => ({
  ariza: {},
  setAriza: (ariza) => set({ ariza }),
  aktFileURL: null, 
  setAktFileURL: (aktFileURL) => set({aktFileURL}),
  showModal: false, 
  setShowModal: (showModal) => set({showModal})
}));

export default useArizaStore;
