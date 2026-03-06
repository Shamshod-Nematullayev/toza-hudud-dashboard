import { AbonentDetails, AbonentDetailsHistoryRow, DHJRow } from 'types/billing';
import api from 'utils/api';
import { create } from 'zustand';

export interface IAbonentPageStore {
  abonentDetails: AbonentDetails | null;
  dhjRows: DHJRow[];
  detailsHistory: AbonentDetailsHistoryRow[];
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
}

export const useAbonentStore = create<IAbonentPageStore>((set, get) => ({
  abonentDetails: null,
  dhjRows: [],
  detailsHistory: [],
  getDetails: async (residentId) => {
    const { data } = await api.get('/billing/get-abonent-details/' + residentId);
    set({ abonentDetails: data.abonentDetails });
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
  getDetailsFromDB: () => {},
  updateDetails: (details) => {},
  updatePhone: (phone: string) => {},
  getResidentCadastrs: () => {},
  getDatasForCompare: () => {}
}));
