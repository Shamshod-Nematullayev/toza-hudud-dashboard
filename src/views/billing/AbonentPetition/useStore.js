import { create } from 'zustand';

const useArizaStore = create((set) => ({
  ariza: {},
  setAriza: (ariza) => set({ ariza })
}));

export default useArizaStore;
