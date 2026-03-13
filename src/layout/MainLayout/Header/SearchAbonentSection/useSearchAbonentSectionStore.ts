import { Navigate, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import router from 'routes';
import { IAbonent } from 'types/billing';
import api from 'utils/api';
import { create } from 'zustand';

interface AbonentSearchQuery {
  accountNumber?: string;
  balanceFrom?: number;
  balanceTo?: number;
  cadastralNumber?: string | null;
  contractNumber?: string;
  districtId?: number;
  electricityAccountNumber?: string;
  flatNumber?: string;
  foreignCitizen?: boolean;
  fullName?: string;
  homeIndex?: string;
  homeNumber?: string;
  identified?: boolean;
  inhabitantCnt?: number;
  mahallaId?: string;
  page?: number;
  passport?: string;
  phone?: string;
  pnfl?: string;
  size?: number;
  sort?: string;
  streetId?: string;
  mahallaBindStatus?: boolean;
  bindStatus?: boolean;
  id?: string;
  inn?: string;
}

interface Filters {
  abonentId?: string;
  accountNumber?: string;
  contractNumber?: string;
  electricityAccountNumber?: string;
  cadastrNumber?: string;
  inn?: string;
  name?: string;
  pnfl?: string;
  passport?: string;
  phone?: string;
  mahallaId?: string;
  streetId?: string;
  buildingId?: string;
  flatId?: string;
  homeIndex?: string;
}

interface StoreState {
  searchResults: { content: IAbonent[]; totalPages: number; totalElements: number };
  searchAbonent: (filtes: AbonentSearchQuery) => void;
  clearResults: () => void;
  openState: boolean;
  setOpenState: (open: boolean) => void;
  navigate: (to: string) => void;
  setNavigate: (n: (to: string) => void) => void;
}

export const useSearchAbonentSectionStore = create<StoreState>((set, get) => ({
  searchResults: {
    content: [],
    totalPages: 0,
    totalElements: 0
  },
  clearResults: () => set({ searchResults: { content: [], totalPages: 0, totalElements: 0 } }),
  searchAbonent: async (filters) => {
    const { data } = await api.get('/abonents/tozamakon', { params: filters });
    if (data.content.length === 0) return toast.warning('Abonent topilmadi', { autoClose: 2000 });
    if (data.content.length === 1) {
      get().navigate(`/abonent/${data.content[0].id}/details`);
      set({ openState: false });
      return;
    }
    set({ searchResults: data });
  },
  openState: false,
  setOpenState: (open: boolean) => set({ openState: open }),
  navigate: (to: string) => {
    redirect(to);
  },
  setNavigate: (n) => set({ navigate: n })
}));
