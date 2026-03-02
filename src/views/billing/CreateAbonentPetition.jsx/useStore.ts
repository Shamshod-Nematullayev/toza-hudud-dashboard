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

export interface IRecalculationPeriod {
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
    biriktirilganNazoratchi?: any;
  };
  company: {
    id: number;
    name: string;
    locationName: string;
    manager: {
      fullName: string;
    };
    billingAdminName: string;
  };
}
export interface IAbonentData {
  id: number;
  accountNumber: string;
  fullName: string;
  kSaldo: number;
  mahallaName: string;
  mahallaId: number;
  streetName: string;
  house: {
    cadastralNumber: string;
    homeIndex: string;
    homeNumber: string;
    inhabitantCnt: number;
  };
  citizen: {
    passport: string;
    pnfl: string;
    phone: string;
  };
}

export const defaultAbonentData = {
  id: 0,
  accountNumber: '',
  fullName: '',
  kSaldo: 0,
  mahallaName: '',
  mahallaId: 0,
  streetName: '',
  house: {
    cadastralNumber: '',
    homeIndex: '',
    homeNumber: '',
    inhabitantCnt: 0
  },
  citizen: {
    passport: '',
    pnfl: '',
    phone: ''
  }
};

export interface IHisoblandiItem {
  month: number;
  year: number;
  hisoblandi: number;
  withQQS: number;
}

interface IAktSumma {
  total: number;
  totalWithQQS: number;
  withoutQQSTotal: number;
}

export type aktType = 'odam_soni' | 'dvaynik' | 'gps' | 'death' | 'viza';

export interface ImgType {
  file: File;
  document_id: string;
}

interface StoreState {
  aktType: aktType;
  showPrintSection: boolean;
  rowsDhjTable: dhjRow[];
  rows: any;
  rowsDublicat: any;
  abonentData: IAbonentData;
  abonentData2: IAbonentData;
  ariza: any;
  mahalla: IMahalla;
  mahallaDublicat: any;
  recalculationPeriods: IRecalculationPeriod[];
  yashovchiSoniInput: string;
  pasteImageDialogOpen: boolean;
  images: ImgType[];
  muzlatiladi: boolean;
  hisoblandiJadval: IHisoblandiItem[];
  aktSumma: IAktSumma;
  setAktSumma: (aktSumma: IAktSumma) => void;
  setHisoblandiJadval: (hisoblandiJadval: IHisoblandiItem[]) => void;
  setAktType: (aktType: aktType) => void;
  setShowPrintSection: (showPrintSection: boolean) => void;
  setRecalculationPeriods: (recalculationPeriods: any[]) => void;
  setRowsDhjTable: (rowsDhjTable: dhjRow[]) => void;
  setImages: (images: ImgType[]) => void;
  setAbonentData: (abonentData: IAbonentData) => void;
  setAbonentData2: (abonentData: IAbonentData) => void;
  setMahalla: (mahalla: IMahalla) => void;
  setMahallaDublicat: (mahalla: IMahalla) => void;
  setAriza: (ariza: any) => void;
  setYashovchiSoniInput: (yashovchiSoniInput: string | number) => void;
  setPasteImageDialogOpen: (pasteImageDialogOpen: boolean) => void;
  setMuzlatiladi: (muzlatiladi: boolean) => void;
  setInitialState: () => void;
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
  abonentData: defaultAbonentData,
  setAbonentData: (data) => set({ abonentData: data }),
  abonentData2: defaultAbonentData,
  setAbonentData2: (data) => set({ abonentData2: data }),
  ariza: {},
  setAriza: (data) => set({ ariza: data }),
  mahalla: {
    data: {},
    company: {
      id: 0,
      name: '',
      locationName: '',
      manager: { fullName: '' },
      billingAdminName: ''
    }
  },
  setMahalla: (mfy) => set({ mahalla: mfy }),
  mahallaDublicat: {},
  setMahallaDublicat: (mfy) => set({ mahallaDublicat: mfy }),
  recalculationPeriods: [],
  setRecalculationPeriods: (data: IRecalculationPeriod[]) => set({ recalculationPeriods: data }),
  yashovchiSoniInput: '',
  setYashovchiSoniInput: (data) => set({ yashovchiSoniInput: String(data) }),
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
      abonentData: defaultAbonentData,
      abonentData2: defaultAbonentData,
      ariza: {},
      mahalla: {
        data: {},
        company: {
          id: 0,
          name: '',
          locationName: '',
          manager: {
            fullName: ''
          },
          billingAdminName: ''
        }
      },
      mahallaDublicat: {},
      recalculationPeriods: [],
      yashovchiSoniInput: '',
      pasteImageDialogOpen: false,
      images: [],
      muzlatiladi: false
    }),
  hisoblandiJadval: [],
  setHisoblandiJadval: (hisoblandiJadval: IHisoblandiItem[]) => set({ hisoblandiJadval }),
  aktSumma: { total: 0, totalWithQQS: 0, withoutQQSTotal: 0 },
  setAktSumma: (aktSumma: IAktSumma) => set({ aktSumma })
}));
