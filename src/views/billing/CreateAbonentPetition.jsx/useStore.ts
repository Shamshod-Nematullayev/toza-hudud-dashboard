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

type aktType = 'odam_soni' | 'dvaynik' | 'gps' | 'death' | 'viza';

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
  images: any;
  muzlatiladi: boolean;
  hisoblandiJadval: IHisoblandiItem[];
  aktSumma: IAktSumma;
  setAktSumma: (aktSumma: IAktSumma) => void;
  setHisoblandiJadval: (hisoblandiJadval: IHisoblandiItem[]) => void;
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
  abonentData: {
    id: 0,
    accountNumber: '',
    fullName: '',
    residentId: 0,
    kSaldo: 0,
    mahallaName: '',
    streetName: '',
    house: { cadastralNumber: '', homeIndex: '', homeNumber: '', inhabitantCnt: 0 },
    citizen: { passport: '', pnfl: '', phone: '' }
  },
  setAbonentData: (data) => set({ abonentData: data }),
  abonentData2: {
    id: 0,
    accountNumber: '',
    fullName: '',
    residentId: 0,
    kSaldo: 0,
    mahallaName: '',
    streetName: '',
    house: { cadastralNumber: '', homeIndex: '', homeNumber: '', inhabitantCnt: 0 },
    citizen: { passport: '', pnfl: '', phone: '' }
  },
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
      abonentData: {
        id: 0,
        accountNumber: '',
        fullName: '',
        kSaldo: 0,
        mahallaName: '',
        streetName: '',
        house: { cadastralNumber: '', homeIndex: '', homeNumber: '', inhabitantCnt: 0 },
        citizen: { passport: '', pnfl: '', phone: '' }
      },
      abonentData2: {
        id: 0,
        accountNumber: '',
        fullName: '',
        kSaldo: 0,
        mahallaName: '',
        streetName: '',
        house: { cadastralNumber: '', homeIndex: '', homeNumber: '', inhabitantCnt: 0 },
        citizen: { passport: '', pnfl: '', phone: '' }
      },
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
