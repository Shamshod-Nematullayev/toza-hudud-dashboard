import { create } from 'zustand';

interface StoreState {
  aktType: string;
  showPrintSection: boolean;
  rowsDhjTable: any;
  rows: any;
  rowsDublicat: any;
  abonentData: any;
  abonentData2: any;
  ariza: any;
  mahalla: any;
  mahallaDublicat: any;
  recalculationPeriods: any;
  yashovchiSoniInput: string;
  pasteImageDialogOpen: boolean;
  images: any;
  setImages: (images) => void;
  muzlatiladi: boolean;
}

const useStore = create<StoreState>((set) => ({
  aktType: 'odam_soni',
  setAktType: (aktType) => set({ aktType }),
  showPrintSection: false,
  setShowPrintSection: (state) => set({ showPrintSection: state }),
  rowsDhjTable: [],
  setRowsDhjTable: (rowsDhjTable) => set({ rowsDhjTable }),
  rows: [],
  setRows: (files) => set({ rows: files }),
  rowsDublicat: [],
  setRowsDublicat: (files) => set({ rows: files }),
  abonentData: {},
  setAbonentData: (data) => set({ abonentData: data }),
  abonentData2: {},
  setAbonentData2: (data) => set({ abonentData2: data }),
  ariza: {},
  setAriza: (data) => set({ ariza: data }),
  mahalla: {},
  setMahalla: (mfy) => set({ mahalla: mfy }),
  mahallaDublicat: {},
  setMahallaDublicat: (mfy) => set({ mahallaDublicat: mfy }),
  recalculationPeriods: [],
  setRecalculationPeriods: (data) => set({ recalculationPeriods: data }),
  yashovchiSoniInput: '',
  setYashovchiSoniInput: (data) => set({ yashovchiSoniInput: data }),
  pasteImageDialogOpen: false,
  setPasteImageDialogOpen: (pasteImageDialogOpen) => set({ pasteImageDialogOpen }),
  images: [],
  setImages: (images) => set({ images }),
  muzlatiladi: false,
  setMuzlatiladi: (muzlatiladi) => set({ muzlatiladi }),
  setInitialState: () =>
    set({
      aktType: 'odam_soni',
      showPrintSection: false,
      rowsDhjTable: [],
      rows: [],
      rowsDublicat: [],
      abonentData: {},
      abonentData2: {},
      ariza: {},
      mahalla: {},
      mahallaDublicat: {},
      recalculationPeriods: [],
      yashovchiSoniInput: '',
      pasteImageDialogOpen: false,
      images: [],
      muzlatiladi: false
    })
}));

export default useStore;
