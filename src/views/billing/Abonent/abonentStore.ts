import { AbonentDetails, AbonentDetailsHistoryRow, DHJRow, IAbonentFromDB } from 'types/billing';
import api from 'utils/api';
import { create } from 'zustand';

export interface IAbonentPageStore {
  abonentDetails: (AbonentDetails & { cadastrs?: string[] }) | null;
  dhjRows: DHJRow[];
  detailsHistory: AbonentDetailsHistoryRow[];
  abonentDetailsFromDB: IAbonentFromDB | null;
  /** * Abonent ma'lumotlari.
   * TozaMakondan olinadi.
   */
  getDetails: (residentId: number) => void;
  getDhjRows: () => void;
  getDetailsHistory: () => void;
  /** * Ma'lumotlarni bevosita bazadan (MongoDB) olish.
   * TozaMakondan olinmaydi.
   */
  getDetailsFromDB: () => void;
  updateDetails: (details: AbonentDetails) => void;
  updatePhone: (phone: string) => void;
  getResidentCadastrs: () => void;
  getDatasForCompare: () => void;
  openChangePhoneDialogState: boolean;
  setOpenChangePhoneDialog: (open: boolean) => void;
}

export const useAbonentStore = create<IAbonentPageStore>((set, get) => ({
  abonentDetails: null,
  dhjRows: [],
  detailsHistory: [],
  abonentDetailsFromDB: null,
  getDetails: async (residentId) => {
    const { data } = await api.get('/billing/get-abonent-details/' + residentId);
    set({ abonentDetails: data });
  },
  getDhjRows: async () => {
    const { abonentDetails } = get();
    if (!abonentDetails?.id) return;

    const { data } = await api.get('/billing/get-abonent-dxj-by-id', { params: { residentId: abonentDetails.id } });

    set({ dhjRows: data.rows });
  },
  getDetailsHistory: async () => {
    const { abonentDetails } = get();
    if (!abonentDetails?.id) return;

    const { data } = await api.get('/billing/get-abonent-details-history/' + abonentDetails.id);

    set({ detailsHistory: data.detailsHistory });
  },
  getDetailsFromDB: async () => {
    const { data } = await api.get('/billing/get-abonent-details-from-db/' + get().abonentDetails?.id);
    set({ abonentDetailsFromDB: data.abonentDetailsFromDB });
  },
  updateDetails: async (details) => {
    const { data } = await api.put('/billing/update-abonent-details', details);
    set({ abonentDetails: data.abonentDetails });
  },
  updatePhone: async (phone: string) => {
    const { data } = await api.put('/billing/update-abonent-phone', { phone });
    set({ abonentDetails: data.abonentDetails });
  },
  getResidentCadastrs: async () => {
    const { data } = await api.get('/billing/get-resident-cadastrs/' + get().abonentDetails?.id);
    set({ abonentDetails: { ...get().abonentDetails, cadastrs: data.cadastrs } as AbonentDetails & { cadastrs: string[] } });
  },
  getDatasForCompare: async () => {
    // Bu funksiya abonent ma'lumotlarini HET, Kadastr, IIB bazalaridan ma'lumot olib ularni solishturish uchun ishlatiladi. Hozircha bu funksiya ichida hech qanday kod yo'q, chunki bu funksiya uchun backendda endpoint mavjud emas.
  },
  openChangePhoneDialogState: false,
  setOpenChangePhoneDialog: (open) => set({ openChangePhoneDialogState: open })
}));
