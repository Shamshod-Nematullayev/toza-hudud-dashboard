import { create } from 'zustand';

interface dhjRow {
  id: number;
  davr: string;
  saldo_n: number;
  nachis: number;
  saldo_k: number;
  akt: number;
  yashovchilar_soni: number;
  allPaymentsSum: number;
}

type aktType = 'odam_soni' | 'dvaynik' | 'gps' | 'death' | 'viza';

interface StoreState {
  aktType: aktType;
  showPrintSection: boolean;
  rowsDhjTable: dhjRow[];
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
  muzlatiladi: boolean;
  setAktType: (aktType: aktType) => void;
  setShowPrintSection: (showPrintSection: boolean) => void;
  setRowsDhjTable: (rowsDhjTable: dhjRow[]) => void;
  setImages: (images) => void;
}

const useStore = create<StoreState>((set) => ({
  aktType: 'odam_soni',
  setAktType: (aktType: aktType) => set({ aktType }),
  showPrintSection: false,
  setShowPrintSection: (showPrintSection: boolean) => set({ showPrintSection: showPrintSection }),
  rowsDhjTable: [],
  setRowsDhjTable: (rowsDhjTable: dhjRow[]) => set({ rowsDhjTable }),
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
