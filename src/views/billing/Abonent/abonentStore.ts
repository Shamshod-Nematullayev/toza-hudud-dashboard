import { AbonentDetails, AbonentDetailsHistoryRow, DHJRow, IAbonentFromDB, IAct, IBalancePredict, IncomeStatRow } from 'types/billing';
import api from 'utils/api';
import { create } from 'zustand';

export interface IAbonentPageStore {
  abonentDetails: (AbonentDetails & { cadastrs?: string[] }) | null;
  dhjRows: DHJRow[];
  detailsHistory: AbonentDetailsHistoryRow[];
  abonentDetailsFromDB: IAbonentFromDB | null;
  incomeStats: IncomeStatRow[];
  balancePredicts: IBalancePredict | null;
  acts: IAct[];
  abonentPetitions: IAbonentPetition[];
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
  getIncomeStats: (residentId: number) => void;
  getIncomePredicts: (residentId: number, period: string) => void;
  getAbonentActs: (residentId: number) => void;
  downLoadActPdfFile: (fileId: string) => void;
  getAbonentPetitions: (residentId: number) => void;
  editDialogOpenState: boolean;
  setEditDialogOpenState: (state: boolean) => void;
  residentPhoto: string | null;
  getResidentPhoto: (residentId: number) => void;
  getCitizensDetails: (params: { pnfl: string; passport: string; birthDate: string }) => Promise<{
    birthDate: string;
    firstName: string;
    patronymic: string;
    lastName: string;
    foreignCitizen: boolean;
    inn: string | null;
    passport: string;
    passportExpireDate: string;
    passportGivenDate: string;
    passportIssuer: string;
    pnfl: string;
  }>;
  openPrintAbonentcardState: boolean;
  setOpenPrintAbonentcardState: (open: boolean) => void;
}

export const useAbonentStore = create<IAbonentPageStore>((set, get) => ({
  abonentDetails: null,
  dhjRows: [],
  detailsHistory: [],
  abonentDetailsFromDB: null,
  incomeStats: [],
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
    await api.put('/abonents/details/' + details.id, details);
    set({ abonentDetails: details });
  },
  updatePhone: async (phone: string) => {
    const abonentDetails = get().abonentDetails;
    if (!abonentDetails) return;
    await api.patch('/abonents/update-phone/' + get().abonentDetails?.id, { phone });
    set({ abonentDetails: { ...abonentDetails, phone } });
  },

  getResidentCadastrs: async () => {
    const { data } = await api.get('/billing/get-resident-cadastrs/' + get().abonentDetails?.id);
    set({ abonentDetails: { ...get().abonentDetails, cadastrs: data.cadastrs } as AbonentDetails & { cadastrs: string[] } });
  },
  getDatasForCompare: async () => {
    // Bu funksiya abonent ma'lumotlarini HET, Kadastr, IIB bazalaridan ma'lumot olib ularni solishturish uchun ishlatiladi. Hozircha bu funksiya ichida hech qanday kod yo'q, chunki bu funksiya uchun backendda endpoint mavjud emas.
  },
  openChangePhoneDialogState: false,
  setOpenChangePhoneDialog: (open) => set({ openChangePhoneDialogState: open }),
  getIncomeStats: async (residentId) => {
    const { data } = await api.get('/abonents/income-statistics/' + residentId);
    set({ incomeStats: data });
  },
  balancePredicts: null,
  getIncomePredicts: async (residentId, period) => {
    const { data } = await api.get('/abonents/balance-recalc-predict', { params: { period, residentId } });
    set({ balancePredicts: data });
  },
  acts: [],
  getAbonentActs: async (residentId) => {
    const { data } = await api.get('/billing/get-abonent-acts/' + residentId, {
      params: {
        residentId
      }
    });
    set({
      acts: data.rows.map((row: any, i: number) => ({
        ...row,
        orderNum: i + 1,
        createdAt: new Date(row.createdAt),
        confirmedAt: row.confirmedAt ? new Date(row.confirmedAt) : null,
        warnedAt: row.warnedAt ? new Date(row.warnedAt) : null,
        canceledAt: row.canceledAt ? new Date(row.canceledAt) : null
      }))
    });
  },
  downLoadActPdfFile: async (fileId) => {
    const { data } = await api.get('/billing/download-file-from-billing', {
      responseType: 'blob',
      params: {
        file_id: fileId
      }
    });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileId.split('*')[0];
    link.click();
  },
  abonentPetitions: [],
  getAbonentPetitions: async (residentId) => {
    const { data } = await api.get('/arizalar', {
      params: {
        resident_id: residentId,
        limit: 100
      }
    });
    set({ abonentPetitions: data.data.map((row: any, i: number) => ({ ...row, createdAt: new Date(row.createdAt), id: i + 1 })) });
  },
  editDialogOpenState: false,
  setEditDialogOpenState: (state) => set({ editDialogOpenState: state }),
  residentPhoto: null,
  getResidentPhoto: async (residentId) => {
    const { data } = await api.get('/billing/get-resident-photo/' + residentId);
    set({ residentPhoto: data });
  },
  getCitizensDetails: async (params) => {
    const { data } = await api.get('/abonents/citizens', { params });
    return data;
  },
  openPrintAbonentcardState: false,
  setOpenPrintAbonentcardState: (open) => set({ openPrintAbonentcardState: open })
}));

interface IAbonentPetition {
  abonentId: number;
  document_number: number;
  aktSummasi: number;
  akt_date: string;
  akt_id: string;
  akt_pachka_id: string;
  asosiy_licshet: string;
  ikkilamchi_licshet: string;
  comment: string;
  document_type: string;
  fullName: string;
  is_canceled: boolean;
  licshet: string;
  muzlatiladi: boolean;
  next_prescribed_cnt: number;
  sana: string;
  status: 'yangi' | 'qabul qilindi' | 'tasdiqlangan' | 'bekor qilindi' | 'akt_kiritilgan' | 'qayta_akt_kiritilgan';
}
