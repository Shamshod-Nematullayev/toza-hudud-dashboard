import { AbonentDetails, AbonentDetailsHistoryRow, DHJRow, IAbonentFromDB, IAct, IBalancePredict, IncomeStatRow } from 'types/billing';
import api from 'utils/api';
import { create } from 'zustand';
import {
  AbonentCard,
  DebtCertificateResponse,
  ErrorResponse,
  BlockReport,
  CadastrDetais,
  HETSuccessResponse,
  HetAbonentResponse,
  IAbonentPetition,
  PermamentsResponse,
  MvdAddress
} from './types';
import { toast } from 'react-toastify';

const initialState = {
  abonentDetails: null,
  dhjRows: [],
  detailsHistory: [],
  abonentDetailsFromDB: null,
  incomeStats: [],
  balancePredicts: null,
  acts: [],
  editDialogOpenState: false,
  residentPhoto: null,
  cadastrAbonent: undefined,
  abonentDetailsHetLoading: false,
  abonentDetailsCadastrLoading: false,
  abonentSupplementaryRefreshNonce: 0,
  hetAbonent: undefined,
  openPhotoModalState: false,
  openEditElectricAccountState: false,
  openPrintAbonentcardState: false,
  cardDetails: null,
  openDebtCertificateDialog: false,
  openIIBInhabitantsDialog: false,
  openAddInhabitantsDialog: false,
  abonentPetitions: [],
  openChangePhoneDialogState: false,
  abonentMvdAddress: null,
  ui: {
    mvdAddressLoading: false,
    mvdAddressModalOpenState: false
  }
};

export interface IAbonentPageStore {
  abonentDetails: (AbonentDetails & { cadastrs?: string[] }) | null;
  dhjRows: DHJRow[];
  detailsHistory: AbonentDetailsHistoryRow[];
  abonentDetailsFromDB: IAbonentFromDB | null;
  incomeStats: IncomeStatRow[];
  balancePredicts: IBalancePredict | null;
  acts: IAct[];
  abonentPetitions: IAbonentPetition[];
  residentPhoto: string | null;
  abonentMvdAddress: MvdAddress | null;
  fetchAbonentMvdAddress: (pnfl: string) => void;
  ui: {
    mvdAddressLoading: boolean;
    mvdAddressModalOpenState: boolean;
  };
  closeMvdAddressModal: () => void;
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
  updateElectricity: (params: { residentId: number; electricityAccountNumber: string; electricityCoato: string }) => void;
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
  setResidentPhoto: (photo: string) => void;
  getCitizensDetails: (params: {
    pnfl: string;
    passport: string;
    birthDate: string;
    photoStatus?: 'WITH_PHOTO' | 'WITHOUT_PHOTO';
  }) => Promise<{
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
    photo: string | null;
    email: string | null;
  }>;
  openPrintAbonentcardState: boolean;
  setOpenPrintAbonentcardState: (open: boolean) => void;
  documentLanguage: 'UZ' | 'ru' | 'uz-cyrl';
  setDocumentLanguage: (lang: 'UZ' | 'ru' | 'uz-cyrl') => void;
  cardDetails: null | AbonentCard;
  getCardDetails: (params: { residentId: number; lang: 'UZ' | 'ru' | 'uz-cyrl'; periodFrom: string; periodTo: string }) => void;
  clearCardDetails: () => void;
  getDebtCertificate: (residentId: number) => Promise<ErrorResponse | DebtCertificateResponse>;
  openDebtCertificateDialog: boolean;
  setOpenDebtCertificateDialog: (open: boolean) => void;
  verifyIdentity: (residentId: number, identify: boolean) => void;
  openIIBInhabitantsDialog: boolean;
  setOpenIIBInhabitantsDialog: (open: boolean) => void;
  getIIBInhabitants: (cadastralNumber: string) => Promise<PermamentsResponse>;
  addInhabitantsToAbonent: (residentId: number, inhabitantCount: number, file: File) => void;
  openAddInhabitantsDialog: boolean;
  setOpenAddInhabitantsDialog: (open: boolean) => void;
  openPhotoModalState: boolean;
  setOpenPhotoModal: (open: boolean) => void;
  openEditElectricAccountState: boolean;
  setOpenEditElectricAccountState: (open: boolean) => void;
  getHetAbonent: (params: { personalAccount: string; coato: string }) => Promise<HetAbonentResponse>;
  hetAbonent: HETSuccessResponse | undefined;
  setHetAbonent: (hetAbonent: HETSuccessResponse | undefined) => void;
  cadastrAbonent: CadastrDetais | undefined;
  fetchCadastrAbonent: (cadastr: string) => Promise<void>;
  /** AbonentDetails HET kartochkasi yuklanishi (layout boshqaradi) */
  abonentDetailsHetLoading: boolean;
  /** AbonentDetails kadastr kartochkasi yuklanishi */
  abonentDetailsCadastrLoading: boolean;
  /** Qo\'shimcha ma\'lumotlarni qayta yuklash uchun (refresh tugmasi) */
  abonentSupplementaryRefreshNonce: number;
  /** Abonent kartasi: batafsil, tushum, bashorat va HET/kadastr/blok */
  refreshAbonentDetailsPage: (residentId: number, periodEndYear: string) => Promise<void>;
  blockReport?: BlockReport;
  fetchBlockReport: (residentId: number) => void;
  resetStore: () => void;
}

export const useAbonentStore = create<IAbonentPageStore>((set, get) => ({
  ...initialState,
  documentLanguage: 'UZ',
  getDetails: async (residentId) => {
    const { data } = await api.get('/billing/get-abonent-details/' + residentId);
    set({ abonentDetails: { ...data, citizen: { ...data.citizen, photo: null } } });
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
  setOpenChangePhoneDialog: (open) => set({ openChangePhoneDialogState: open }),
  getIncomeStats: async (residentId) => {
    const { data } = await api.get('/abonents/income-statistics/' + residentId);
    set({ incomeStats: data });
  },
  getIncomePredicts: async (residentId, period) => {
    set({ balancePredicts: null });
    const { data } = await api.get('/abonents/balance-recalc-predict', { params: { period, residentId } });
    set({ balancePredicts: data });
  },
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
  getAbonentPetitions: async (residentId) => {
    const { data } = await api.get('/arizalar', {
      params: {
        resident_id: residentId,
        limit: 100
      }
    });
    set({ abonentPetitions: data.data.map((row: any, i: number) => ({ ...row, createdAt: new Date(row.createdAt), id: i + 1 })) });
  },
  setEditDialogOpenState: (state) => set({ editDialogOpenState: state }),

  getCitizensDetails: async (params) => {
    const { data } = await api.get('/abonents/citizens', { params });
    return data;
  },
  setOpenPrintAbonentcardState: (open) => set({ openPrintAbonentcardState: open }),
  setDocumentLanguage: (language) => set({ documentLanguage: language }),
  getCardDetails: async ({ lang, periodFrom, periodTo, residentId }) => {
    const { data } = await api.get(`/abonents/card/${residentId}`, {
      params: {
        lang,
        periodFrom,
        periodTo
      }
    });
    set({
      cardDetails: data
    });
  },
  clearCardDetails: () => set({ cardDetails: null }),
  getDebtCertificate: async (residentId: number) => {
    const { data } = await api.get('/abonents/nodebt-certificate/' + residentId);
    if ('qrCodeImageUrl' in data) {
      const res = (
        await api.get('/billing/download-file-from-billing/', {
          params: { file_id: data.qrCodeImageUrl },
          responseType: 'blob'
        })
      ).data;
      const blobUrl = URL.createObjectURL(res);
      data.qrCodeImageUrl = blobUrl;
    }
    return data;
  },
  setOpenDebtCertificateDialog: (open: boolean) => set({ openDebtCertificateDialog: open }),
  verifyIdentity: async (residentId, identified) => {
    await api.patch('/abonents/verify-identity/' + residentId, { identified });
    const details = get().abonentDetails;
    if (!details) return;
    set({ abonentDetails: { ...details, identified } });
  },
  setOpenIIBInhabitantsDialog: (open: boolean) => set({ openIIBInhabitantsDialog: open }),
  getIIBInhabitants: async (cadastralNumber) => {
    const { data } = await api.get('/abonents/iib-inhabitants', { params: { cadastralNumber } });
    return data;
  },
  addInhabitantsToAbonent: async (residentId, inhabitantCount, file) => {
    const formData = new FormData();
    formData.append('inhabitantCount', inhabitantCount.toString());
    formData.append('file', file);
    await api.post('/abonents/add-inhabitants/' + residentId, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    await get().getDetails(residentId);
    await get().getDhjRows();
    set({ openAddInhabitantsDialog: false });
  },
  setOpenAddInhabitantsDialog: (open: boolean) => set({ openAddInhabitantsDialog: open }),
  setResidentPhoto: (photo: string) => {
    const details = get().abonentDetails;
    if (!details?.citizen) return;
    set({
      abonentDetails: { ...details, citizen: { ...details.citizen, photo } }
    });
  },
  setOpenPhotoModal: (open: boolean) => set({ openPhotoModalState: open }),
  setOpenEditElectricAccountState: (open: boolean) => set({ openEditElectricAccountState: open }),
  getHetAbonent: async (params) => {
    return (await api.get('/abonents/het-abonent', { params })).data;
  },
  updateElectricity: async (params) => {
    const details = get().abonentDetails;
    if (!details) return;
    await api.patch('/abonents/electricity/' + params.residentId, params);
    set({
      abonentDetails: { ...details, electricityAccountNumber: params.electricityAccountNumber, electricityCoato: params.electricityCoato }
    });
  },
  setHetAbonent: (abonent) => set({ hetAbonent: abonent }),
  refreshAbonentDetailsPage: async (residentId, periodEndYear) => {
    if (Number.isNaN(residentId)) return;
    await get().getDetails(residentId);
    await Promise.all([get().getIncomeStats(residentId), get().getIncomePredicts(residentId, periodEndYear)]);
    set((s) => ({ abonentSupplementaryRefreshNonce: s.abonentSupplementaryRefreshNonce + 1 }));
  },
  fetchCadastrAbonent: async (cadastralNumber) => {
    const { data } = await api.get('/abonents/cadastr-details', { params: { cadastralNumber } });
    const details = get().abonentDetails;
    if (!details || details.house.cadastralNumber !== cadastralNumber) return;
    set({ cadastrAbonent: data });
  },
  fetchBlockReport: async (residentId: number) => {
    const { data } = await api.get('/abonents/het-warning-report', { params: { residentId } });
    const current = get().abonentDetails;
    if (!current || current.id !== residentId) return;
    set({ blockReport: data });
  },
  resetStore: () => set(initialState),
  closeMvdAddressModal: () => {
    const { ui } = get();
    set({ ui: { ...ui, mvdAddressModalOpenState: false } });
  },
  fetchAbonentMvdAddress: async (pnfl) => {
    const { ui, abonentMvdAddress } = get();
    set({ ui: { ...ui, mvdAddressLoading: true } });
    try {
      if (abonentMvdAddress) return set({ ui: { ...ui, mvdAddressLoading: false, mvdAddressModalOpenState: true } });
      const { data } = await api.get('/abonents/mvd-address/' + pnfl);
      return set({ abonentMvdAddress: data, ui: { ...ui, mvdAddressLoading: false, mvdAddressModalOpenState: true } });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message);
      set({ ui: { ...ui, mvdAddressLoading: false } });
    }
  }
}));
