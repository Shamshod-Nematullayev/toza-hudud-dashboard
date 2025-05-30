import { create } from 'zustand';

const useActsStore = create((set) => ({
  playlist: [],
  setPlaylist: (playlist) => set({ playlist })
}));

export default useActsStore;
