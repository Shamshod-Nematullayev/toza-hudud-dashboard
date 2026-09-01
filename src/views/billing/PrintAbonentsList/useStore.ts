import { create } from 'zustand';

export interface IMahallaItem {
  id: number;
  name: string;
  reja?: number;
  abarotka_berildi?: boolean;
  inspectorName?: string;
  [key: string]: any;
}

export interface IAbonentRow {
  id: number;
  accountNumber: string;
  fullName: string;
  streetName: string;
  homeNumber?: string;
  homeIndex?: string;
  flatNumber?: string;
  inhabitantCnt: number;
  ksaldo: number;
  lastPaymentAmount?: number | string;
  lastPayDate?: string;
  electricityAccountNumber?: string;
  isElektrKodConfirm?: boolean;
  phone?: string;
  mahallaName?: string;
  mahallaId?: number;
  [key: string]: any;
}

export interface IFilters {
  identified: string;
  elektrAccountNumberConfirmed: string;
}

export interface IPrintAbonentsStore {
  selectedMahalla: number | string;
  setSelectedMahalla: (mahallaId: number | string) => void;
  mahallas: IMahallaItem[];
  setMahallas: (mahallas: IMahallaItem[]) => void;
  minSaldo: string | number;
  setMinSaldo: (minSaldo: string | number) => void;
  maxSaldo: string | number;
  setMaxSaldo: (maxSaldo: string | number) => void;
  abonents: IAbonentRow[];
  setAbonents: (abonents: IAbonentRow[]) => void;
  mainFunctionsDisabled: boolean;
  setMainFunctionsDisabled: (disabled: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onlyNotIdentited: boolean;
  setOnlyNotIdentited: (onlyNotIdentited: boolean) => void;
  etkStatus: string;
  setEtkStatus: (etkStatus: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const useStore = create<IPrintAbonentsStore>((set) => ({
  selectedMahalla: '',
  setSelectedMahalla: (selectedMahalla) => set({ selectedMahalla }),
  mahallas: [],
  setMahallas: (mahallas) => set({ mahallas }),
  minSaldo: '',
  setMinSaldo: (minSaldo) => set({ minSaldo }),
  maxSaldo: '',
  setMaxSaldo: (maxSaldo) => set({ maxSaldo }),
  abonents: [],
  setAbonents: (abonents) => set({ abonents }),
  mainFunctionsDisabled: true,
  setMainFunctionsDisabled: (mainFunctionsDisabled) => set({ mainFunctionsDisabled }),
  loading: false,
  setLoading: (loading) => set({ loading }),
  onlyNotIdentited: false,
  setOnlyNotIdentited: (onlyNotIdentited) => set({ onlyNotIdentited }),
  etkStatus: '',
  setEtkStatus: (etkStatus) => set({ etkStatus }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery })
}));

export default useStore;
