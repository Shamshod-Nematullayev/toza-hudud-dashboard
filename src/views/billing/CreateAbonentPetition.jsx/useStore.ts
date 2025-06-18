import { Dayjs } from 'dayjs';
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

interface IRecalculationPeriod {
  period: string;
  withQQSTotal: number;
  withoutQQSTotal: number;
  total: number;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

export interface IMahalla {
  data: {
    id?: number;
    name?: string;
    mfy_rais_name?: string;
  };
  company: {
    id: number;
    name: string;
    locationName: string;
    managerName: string;
    billingAdminName: string;
  };
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
  mahalla: IMahalla;
  mahallaDublicat: any;
  recalculationPeriods: IRecalculationPeriod[];
  yashovchiSoniInput: string;
  pasteImageDialogOpen: boolean;
  images: any;
  muzlatiladi: boolean;
  setAktType: (aktType: aktType) => void;
  setShowPrintSection: (showPrintSection: boolean) => void;
  setRecalculationPeriods: (recalculationPeriods: any[]) => void;
  setRowsDhjTable: (rowsDhjTable: dhjRow[]) => void;
  setImages: (images) => void;
}

export const useStore = create<StoreState>((set) => ({
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
  mahalla: {
    data: {},
    company: {
      id: 0,
      name: '',
      locationName: '',
      managerName: '',
      billingAdminName: ''
    }
  },
  setMahalla: (mfy) => set({ mahalla: mfy }),
  mahallaDublicat: {},
  setMahallaDublicat: (mfy) => set({ mahallaDublicat: mfy }),
  recalculationPeriods: [],
  setRecalculationPeriods: (data: IRecalculationPeriod[]) => set({ recalculationPeriods: data }),
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
      mahalla: {
        data: {},
        company: {
          id: 0,
          name: '',
          locationName: '',
          managerName: '',
          billingAdminName: ''
        }
      },
      mahallaDublicat: {},
      recalculationPeriods: [],
      yashovchiSoniInput: '',
      pasteImageDialogOpen: false,
      images: [],
      muzlatiladi: false
    })
}));
