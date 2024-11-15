import { create } from 'zustand';

const useStore = create((set) => ({
  selectedMahalla: '0',
  setSelectedMahalla: (state) => set({ selectedMahalla: state }),
  mahallas: [],
  setMahallas: (state) => set({ mahallas: state }),
  minSaldo: '',
  setMinSaldo: (state) => set({ minSaldo: state }),
  maxSaldo: '',
  setMaxSaldo: (state) => set({ maxSaldo: state }),
  abonents: [],
  setAbonents: (state) => set({ abonents: state }),
  mainFunctionsDisabled: true,
  setMainFunctionsDisabled: (state) => set({ mainFunctionsDisabled: state }),
  loading: false,
  setLoading: (state) => set({ loading: state })
}));

export default useStore;
