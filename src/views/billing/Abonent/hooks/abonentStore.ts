import {
  AbonentDetails,
  AbonentDetailsHistoryRow,
  DHJRow,
  IAbonent as IBillingAbonent,
  IAbonentFromDB,
  IAct,
  IBalancePredict,
  IncomeStatRow
} from 'types/billing';
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
  MvdAddress,
  ElectricityBalanceResponse
} from '../types';
import { toast } from 'react-toastify';
import { IAriza } from 'types/models';
import { IAbonent, searchAbonentFromTozamakon } from 'services/searchAbonentFromTozamakon';
import { Debitor } from 'views/billing/Debitors/types';
import { fixFileName } from 'utils/fixFileName';
import { addToOutbox, OutboxItem, PENDING_UPDATES_CHANGED_EVENT } from 'utils/abonentOutbox';

// Bizning serverga umuman yetib bormagan so'rovni (internet uzilishi) bir necha marta qayta yuboramiz.
// Baribir yetmasa, o'zgarish brauzerda saqlanadi (abonentOutbox) va internet qaytganda yuboriladi.
// Server javob bergan bo'lsa (xato bo'lsa ham) qayta yubormaymiz: navbat bilan server o'zi shug'ullanadi.
async function sendAbonentUpdate(
  item: Omit<OutboxItem, 'id' | 'createdAt'>,
  delaysMs = [2000, 5000, 10000]
): Promise<{ data: { queued?: boolean; message?: string } }> {
  for (let i = 0; ; i++) {
    try {
      const res = await api.request({ method: item.method, url: item.url, data: item.body });
      if (res.data?.queued) window.dispatchEvent(new Event(PENDING_UPDATES_CHANGED_EVENT));
      return res;
    } catch (error: any) {
      if (error?.response) throw error;
      if (i >= delaysMs.length) {
        addToOutbox(item);
        return {
          data: { queued: true, message: "Internet yo'q. O'zgarish saqlandi va internet qaytganda avtomatik yuboriladi." }
        };
      }
      await new Promise((r) => setTimeout(r, delaysMs[i]));
    }
  }
}

/** Qidiruv natijasidagi (GreenZone) abonentni sahifa formatiga keltiradi — TozaMakon javobi kelguncha ko'rsatish uchun. */
type SearchedAbonent = (IAbonent | IBillingAbonent) & { contractNumber?: string | null; regionName?: string | null };

function abonentPreviewFromSearch(a: SearchedAbonent): AbonentDetails {
  return {
    id: a.id,
    accountNumber: a.accountNumber,
    residentType: 'INDIVIDUAL',
    electricityAccountNumber: a.electricityAccountNumber || '',
    electricityCoato: a.electricityCoato || '',
    companyId: 0,
    companyName: '',
    streetId: a.streetId,
    mahallaId: a.mahallaId,
    regionId: 0,
    streetName: a.streetName || '',
    mahallaName: a.mahallaName || '',
    regionName: a.regionName || '',
    fullName: a.fullName,
    contractNumber: a.contractNumber || null,
    contractDate: a.contractDate || '',
    homePhone: a.homePhone,
    active: !a.deletedAt,
    description: a.description,
    phone: a.phone || null,
    citizen: {
      firstName: '',
      lastName: '',
      foreignCitizen: a.foreignCitizen,
      patronymic: null,
      inn: a.inn,
      pnfl: a.pinfl || '',
      passport: a.passport || '',
      birthDate: a.birthDate || '',
      passportGivenDate: a.passportGivenDate || '',
      passportIssuer: '',
      passportExpireDate: '',
      email: null,
      photo: null
    },
    house: {
      id: 0,
      type: 'HOUSE',
      cadastralNumber: a.cadastralNumber || '',
      homeNumber: a.homeNumber || '',
      flatNumber: a.flatNumber ? String(a.flatNumber) : undefined,
      homeIndex: a.homeIndex ? String(a.homeIndex) : undefined,
      inhabitantCnt: a.inhabitantCnt || 0,
      miaInhabitantCnt: null
    },
    balance: {
      period: a.period || '',
      kSaldo: a.ksaldo || 0,
      frozenActAmount: 0,
      frozenDebtSettlement: 0,
      frozenKSaldo: 0,
      frozenNSaldo: 0,
      frozenRevenue: 0,
      rate: '',
      accrual: a.accrual || 0
    },
    identified: a.identified
  };
}

const initialState: IAbonentPageDataStore = {
  abonentDetails: null,
  abonentPreview: null,
  abonentDetailsFailed: false,
  dhjRows: [],
  dhjRowsResidentId: null,
  dhjRowsLoading: false,
  dhjPreview: null,
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
  abonentPetitionsLoading: false,
  openChangePhoneDialogState: false,
  abonentMvdAddress: null,
  currentArizaId: '',
  ui: {
    mvdAddressLoading: false,
    mvdAddressModalOpenState: false,
    abonentPetitionModalOpenState: false,
    residentCadastrsLoading: false,
    residentCadastrsModalOpen: false
  },
  documentLanguage: 'UZ',
  blockReport: undefined,
  similarAbonentsByElectricity: [],
  similarAbonentsByCadastr: [],
  similarAbonentsByPinfl: [],
  abonentCadastrs: [],
  abonentDebitorStatus: null,
  tozaMakonHistory: [],
  tozaMakonHistoryLoading: false,
  openTozaMakonHistoryDialogState: false
};

interface IAbonentPageDataStore {
  abonentDetails: AbonentDetails | null;
  /**
   * Qidiruvda topilgan (GreenZone/Mongo) qisqa ma'lumot — faqat ko'rsatish uchun.
   * TozaMakondan `abonentDetails` kelguncha sahifa bo'sh turmasligi uchun. Tahrirlash amallarida ishlatilmaydi.
   */
  abonentPreview: AbonentDetails | null;
  /** TozaMakondan batafsil ma'lumot olinmadi (preview bo'lsa shuni ko'rsatishda davom etamiz) */
  abonentDetailsFailed: boolean;
  abonentCadastrs: string[];
  dhjRows: DHJRow[];
  /** `dhjRows` qaysi abonentga tegishli — tab qayta ochilganda qayta so'rov yubormaslik uchun */
  dhjRowsResidentId: number | null;
  dhjRowsLoading: boolean;
  /**
   * DHJ ning birinchi qatorlari (TozaMakondagidek 15 ta) — to'liq ro'yxat kelguncha jadvalda ko'rsatish uchun.
   * Faqat ko'rsatish uchun: ariza va boshqa amallar to'liq `dhjRows` ni kutadi.
   */
  dhjPreview: { residentId: number; rows: DHJRow[]; total: number } | null;
  detailsHistory: AbonentDetailsHistoryRow[];
  abonentDetailsFromDB: IAbonentFromDB | null;
  incomeStats: IncomeStatRow[];
  balancePredicts: IBalancePredict | null;
  acts: IAct[];
  abonentPetitions: IAriza[];
  abonentPetitionsLoading: boolean;
  residentPhoto: string | null;
  abonentMvdAddress: MvdAddress | null;
  currentArizaId: string;
  ui: {
    mvdAddressLoading: boolean;
    mvdAddressModalOpenState: boolean;
    abonentPetitionModalOpenState: boolean;
    residentCadastrsLoading: boolean;
    residentCadastrsModalOpen: boolean;
  };
  openChangePhoneDialogState: boolean;
  editDialogOpenState: boolean;
  openPrintAbonentcardState: boolean;
  documentLanguage: 'UZ' | 'ru' | 'uz-cyrl';
  cardDetails: null | AbonentCard;
  openDebtCertificateDialog: boolean;
  openIIBInhabitantsDialog: boolean;
  openAddInhabitantsDialog: boolean;
  openPhotoModalState: boolean;
  openEditElectricAccountState: boolean;
  hetAbonent: HETSuccessResponse | undefined;
  cadastrAbonent: CadastrDetais | undefined;
  abonentDetailsHetLoading: boolean;
  abonentDetailsCadastrLoading: boolean;
  abonentSupplementaryRefreshNonce: number;
  blockReport?: BlockReport;
  similarAbonentsByElectricity: IAbonent[];
  similarAbonentsByCadastr: IAbonent[];
  similarAbonentsByPinfl: IAbonent[];
  abonentDebitorStatus: null | Debitor;
  tozaMakonHistory: any[];
  tozaMakonHistoryLoading: boolean;
  openTozaMakonHistoryDialogState: boolean;
}

export interface IAbonentPageActionsStore {
  fetchAbonentMvdAddress: (pnfl: string) => void;
  closeAbonentPetitionModal: () => void;
  openAbonentPetitionModal: (ariza_id: string) => void;
  closeMvdAddressModal: () => void;
  /** * Abonent ma'lumotlari.
   * TozaMakondan olinadi.
   */
  getDetails: (residentId: number) => Promise<void>;
  /** Qidiruv natijasini sahifaga o'tishdan oldin saqlab qo'yadi (darhol ko'rsatish uchun). */
  setAbonentPreview: (abonent: SearchedAbonent) => void;
  /** DHJ ning barcha qatorlarini bir marta yuklaydi (sahifalash klient tomonda). residentId berilmasa abonentDetails.id olinadi. */
  getDhjRows: (residentId?: number) => Promise<void>;
  getDetailsHistory: (accountNumber: number | string) => Promise<void>;
  /** * Ma'lumotlarni bevosita bazadan (MongoDB) olish.
   * TozaMakondan olinmaydi.
   */
  getDetailsFromDB: () => void;
  updateDetails: (details: Partial<AbonentDetails>) => Promise<void>;
  updatePhone: (phone: string) => Promise<void>;
  updateElectricity: (params: { residentId: number; electricityAccountNumber: string; electricityCoato: string }) => void;
  getResidentCadastrs: (pnfl: string | number) => void;
  getDatasForCompare: () => void;
  setOpenChangePhoneDialog: (open: boolean) => void;
  getIncomeStats: (residentId: number) => Promise<void>;
  getIncomePredicts: (residentId: number, period: string) => Promise<void>;
  getAbonentActs: (residentId: number) => void;
  downLoadActPdfFile: (fileId: string) => void;
  getAbonentPetitions: (residentId: number, accountNumber?: string) => Promise<void>;

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

  setOpenPrintAbonentcardState: (open: boolean) => void;

  setDocumentLanguage: (lang: 'UZ' | 'ru' | 'uz-cyrl') => void;

  getCardDetails: (params: {
    residentId?: number;
    accountNumber?: string;
    lang: 'UZ' | 'ru' | 'uz-cyrl';
    periodFrom: string;
    periodTo: string;
  }) => void;
  clearCardDetails: () => void;
  getDebtCertificate: (residentId: number) => Promise<ErrorResponse | DebtCertificateResponse>;

  setOpenDebtCertificateDialog: (open: boolean) => void;
  verifyIdentity: (residentId: number, identify: boolean) => void;

  setOpenIIBInhabitantsDialog: (open: boolean) => void;
  getIIBInhabitants: (cadastralNumber: string, residentId?: number) => Promise<PermamentsResponse>;
  addInhabitantsToAbonent: (residentId: number, inhabitantCount: number, file: File) => Promise<void>;

  setOpenAddInhabitantsDialog: (open: boolean) => void;

  setOpenPhotoModal: (open: boolean) => void;

  setOpenEditElectricAccountState: (open: boolean) => void;
  getHetAbonent: (params: { personalAccount: string; coato: string }) => Promise<HetAbonentResponse>;
  getElectricityBalance: (params: { account: string; coato?: string }) => Promise<ElectricityBalanceResponse>;

  setHetAbonent: (hetAbonent: HETSuccessResponse | undefined) => void;

  fetchCadastrAbonent: (cadastr: string) => Promise<void>;
  /** AbonentDetails HET kartochkasi yuklanishi (layout boshqaradi) */

  /** AbonentDetails kadastr kartochkasi yuklanishi */

  /** Qo\'shimcha ma\'lumotlarni qayta yuklash uchun (refresh tugmasi) */

  /** Abonent kartasi: batafsil, tushum, bashorat va HET/kadastr/blok */
  refreshAbonentDetailsPage: (residentId: number, periodEndYear: string) => Promise<void>;

  fetchBlockReport: (residentId: number) => void;
  /** `keepPreviewFor` berilsa va preview shu abonentga tegishli bo'lsa, preview saqlanib qoladi. */
  resetStore: (keepPreviewFor?: number) => void;
  getSimilarAbonentsByElectricity: (electrycityAccountNumber: string) => Promise<any>;
  getSimilarAbonentsByCadastr: (cadastralNumber: string) => Promise<any>;
  getSimilarAbonentsByPinfl: (pinfl: string) => Promise<any>;
  getAbonentDebitorStatus: (residentId: number) => Promise<any>;
  getTozaMakonHistory: (residentId: number) => Promise<void>;
  setOpenTozaMakonHistoryDialog: (open: boolean) => void;
}

export type IAbonentPageStore = IAbonentPageDataStore & IAbonentPageActionsStore;

let dhjRequestId = 0;
export const DHJ_PREVIEW_SIZE = 15;

export const useAbonentStore = create<IAbonentPageStore>((set, get) => ({
  ...initialState,
  getDetails: async (residentId) => {
    set({ abonentDetailsFailed: false });
    try {
      const { data } = await api.get('/billing/get-abonent-details/' + residentId);
      set({ abonentDetails: { ...data, citizen: { ...data.citizen, photo: null } } });
    } catch (error) {
      set({ abonentDetailsFailed: true });
      throw error;
    }
  },
  setAbonentPreview: (abonent) => set({ abonentPreview: abonentPreviewFromSearch(abonent) }),
  getDhjRows: async (residentIdArg) => {
    const residentId = residentIdArg ?? get().abonentDetails?.id;
    if (!residentId) return;

    const size = 100;
    const fetchPage = (page: number, pageSize = size) =>
      api.get('/billing/get-abonent-dxj-by-id', { params: { residentId, page, size: pageSize } }).then((res) => res.data);

    const requestId = ++dhjRequestId;
    set({ dhjRowsLoading: true });

    // Kichik sahifa TozaMakonda tez hisoblanadi — uni darhol ko'rsatamiz, to'liq ro'yxat parallel yuklanadi
    if (get().dhjRowsResidentId !== residentId) {
      fetchPage(1, DHJ_PREVIEW_SIZE)
        .then((first) => {
          if (requestId !== dhjRequestId || get().dhjRowsResidentId === residentId) return;
          set({ dhjPreview: { residentId, rows: first.rows, total: first.meta?.total ?? first.rows.length } });
        })
        .catch(() => {});
    }

    try {
      const first = await fetchPage(1);
      let rows: DHJRow[] = first.rows;
      const totalPages = Math.ceil((first.meta?.total ?? rows.length) / size);
      if (totalPages > 1) {
        const rest = await Promise.all(Array.from({ length: totalPages - 1 }, (_, i) => fetchPage(i + 2)));
        rows = rows.concat(...rest.map((r) => r.rows));
      }
      // Shu orada boshqa abonent so'ralgan bo'lsa eski javobni yozmaymiz
      if (requestId !== dhjRequestId) return;
      set({ dhjRows: rows, dhjRowsResidentId: residentId });
    } finally {
      if (requestId === dhjRequestId) set({ dhjRowsLoading: false });
    }
  },
  getDetailsHistory: async (accountNumber) => {
    if (!accountNumber) return;
    const { data } = await api.get('/abonents/history/' + accountNumber);

    set({ detailsHistory: data });
  },
  getDetailsFromDB: async () => {
    const { data } = await api.get('/billing/get-abonent-details-from-db/' + get().abonentDetails?.id);
    set({ abonentDetailsFromDB: data.abonentDetailsFromDB });
  },
  updateDetails: async (details) => {
    const prev = get().abonentDetails;
    if (prev && details.id === prev.id) {
      set({ abonentDetails: { ...prev, ...details } as AbonentDetails });
    }
    try {
      const { data } = await sendAbonentUpdate({
        method: 'put',
        url: '/abonents/details/' + details.id,
        body: details,
        residentId: Number(details.id),
        accountNumber: details.accountNumber || prev?.accountNumber,
        fullName: details.fullName || prev?.fullName,
        type: 'details'
      });
      if (data?.queued) toast.info(data.message, { autoClose: 8000 });
      // Telefon o'zgargan bo'lsa, Debitor telefon statusini qayta yuklash:
      if (details.id && details.phone !== undefined && details.phone !== prev?.phone) {
        void get()
          .getAbonentDebitorStatus(details.id)
          .catch(() => {});
      }
      if (details.house?.cadastralNumber) {
        void get().getSimilarAbonentsByCadastr(details.house.cadastralNumber);
      }
      if (details.citizen?.pnfl) {
        void get().getSimilarAbonentsByPinfl(details.citizen.pnfl);
      }
    } catch (error) {
      if (prev && get().abonentDetails?.id === prev.id) {
        set({ abonentDetails: prev });
      }
      throw error;
    }
  },
  // Xodim kutmasligi uchun: telefon darhol ekranda yangilanadi, so'rov fonda ketadi.
  // TozaMakon ishlamasa server o'zgarishni navbatga yozadi (202) va keyin o'zi kiritadi.
  updatePhone: async (phone: string) => {
    const abonentDetails = get().abonentDetails;
    if (!abonentDetails) return;
    const residentId = abonentDetails.id;
    const prevPhone = abonentDetails.phone;
    set({ abonentDetails: { ...abonentDetails, phone } });
    try {
      const { data } = await sendAbonentUpdate({
        method: 'patch',
        url: '/abonents/update-phone/' + residentId,
        body: { phone },
        residentId,
        accountNumber: abonentDetails.accountNumber,
        fullName: abonentDetails.fullName,
        type: 'phone',
        phone
      });
      if (data?.queued) {
        toast.info(data.message, { autoClose: 8000 });
        return;
      }
      // 🌟 Bazadan yangilangan Debitor statusini (checking/Umid bor) qayta yuklash
      void get()
        .getAbonentDebitorStatus(residentId)
        .catch(() => {});
    } catch (error: any) {
      // Faqat TozaMakon raqamni rad etganda (ma'lumot xato) eski qiymatga qaytamiz
      const current = get().abonentDetails;
      if (current?.id === residentId && current.phone === phone) set({ abonentDetails: { ...current, phone: prevPhone } });
      toast.error(`Telefon saqlanmadi: ${error?.response?.data?.message || error?.message || 'xatolik'}`);
    }
  },

  getResidentCadastrs: async (pnfl) => {
    const { ui } = get();
    set({ ui: { ...ui, residentCadastrsLoading: true } });
    try {
      const { data } = await api.get('/abonents/cadastrs', { params: { pnfl } });
      set({ ui: { ...get().ui, residentCadastrsModalOpen: true }, abonentCadastrs: data });
    } catch (error) {
      throw error;
    } finally {
      set({ ui: { ...get().ui, residentCadastrsLoading: false } });
    }
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
    link.download = fixFileName(fileId.split('*')[0]);
    link.click();
  },
  getAbonentPetitions: async (residentId, accountNumber) => {
    set({ abonentPetitionsLoading: true });
    try {
      const accNumber = accountNumber || get().abonentDetails?.accountNumber || get().abonentPreview?.accountNumber;
      const { data } = await api.get('/arizalar', {
        params: {
          resident_id: residentId,
          ...(accNumber ? { account_number: accNumber } : {}),
          limit: 100
        }
      });
      set({
        abonentPetitions: (data.data || []).map((row: any, i: number) => ({
          ...row,
          createdAt: new Date(row.createdAt),
          id: i + 1
        }))
      });
    } catch (err) {
      console.error(err);
    } finally {
      set({ abonentPetitionsLoading: false });
    }
  },
  setEditDialogOpenState: (state) => set({ editDialogOpenState: state }),

  getCitizensDetails: async (params) => {
    const { data } = await api.get('/abonents/citizens', { params });
    return data;
  },
  setOpenPrintAbonentcardState: (open) => set({ openPrintAbonentcardState: open }),
  setDocumentLanguage: (language) => set({ documentLanguage: language }),
  getCardDetails: async ({ lang, periodFrom, periodTo, residentId, accountNumber }) => {
    if (!residentId && !accountNumber) return toast.error('Majburiy qiymatlar kiritilmadi. Abonent id yoki hisob raqami kiritilmadi.');
    if (!residentId) {
      residentId = (await api.get('/abonents/abonent-id-from-all-accounts/' + accountNumber)).data.id;
    }
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
  getIIBInhabitants: async (cadastralNumber, residentId) => {
    const { data } = await api.get('/abonents/iib-inhabitants', { params: { cadastralNumber, residentId } });
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
  getElectricityBalance: async (params) => {
    return (await api.get('/abonents/electricity-balance', { params })).data;
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
    const { data } = await api.get('/abonents/het-warning-report/' + residentId);
    const current = get().abonentDetails;
    if (!current || current.id !== residentId) return;
    set({ blockReport: data });
  },
  resetStore: (keepPreviewFor) => {
    const preview = get().abonentPreview;
    set({ ...initialState, abonentPreview: keepPreviewFor && preview?.id === keepPreviewFor ? preview : null });
  },
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
  },
  closeAbonentPetitionModal: () => set({ ui: { ...get().ui, abonentPetitionModalOpenState: false }, currentArizaId: '' }),
  openAbonentPetitionModal: (ariza_id) => set({ ui: { ...get().ui, abonentPetitionModalOpenState: true }, currentArizaId: ariza_id }),
  getSimilarAbonentsByElectricity: async (electricityAccountNumber) => {
    const { content } = await searchAbonentFromTozamakon({ electricityAccountNumber });
    const filtered = content.filter((a) => a.electricityAccountNumber == electricityAccountNumber);
    set({ similarAbonentsByElectricity: filtered });
    return filtered;
  },
  getSimilarAbonentsByCadastr: async (cadastralNumber) => {
    if (!cadastralNumber || !cadastralNumber.trim()) {
      set({ similarAbonentsByCadastr: [] });
      return [];
    }
    const cleanCadastr = cadastralNumber.trim();
    try {
      const { content } = await searchAbonentFromTozamakon({ cadastralNumber: cleanCadastr });
      const filtered = (content || []).filter((a) => a.cadastralNumber?.trim() === cleanCadastr);
      set({ similarAbonentsByCadastr: filtered });
      return filtered;
    } catch (e) {
      console.error('getSimilarAbonentsByCadastr error:', e);
      set({ similarAbonentsByCadastr: [] });
      return [];
    }
  },
  getSimilarAbonentsByPinfl: async (pinfl) => {
    if (!pinfl || !pinfl.trim()) {
      set({ similarAbonentsByPinfl: [] });
      return [];
    }
    const cleanPinfl = pinfl.trim();
    try {
      const { content } = await searchAbonentFromTozamakon({ pnfl: cleanPinfl });
      const filtered = (content || []).filter((a) => a.pinfl?.trim() === cleanPinfl || (a as any).pnfl?.trim() === cleanPinfl);
      set({ similarAbonentsByPinfl: filtered });
      return filtered;
    } catch (e) {
      console.error('getSimilarAbonentsByPinfl error:', e);
      set({ similarAbonentsByPinfl: [] });
      return [];
    }
  },
  getAbonentDebitorStatus: async (residentId) => {
    const { data } = await api.get('/debitors/resident/' + residentId, { headers: { 'hide-error': true } });
    set({ abonentDebitorStatus: data.data });
    return data;
  },
  getTozaMakonHistory: async (residentId) => {
    set({ tozaMakonHistoryLoading: true });
    try {
      const { data } = await api.get('/abonents/history-tozamakon/' + residentId, {
        params: { page: 0, size: 100 }
      });
      const historyList = Array.isArray(data) ? data : data && Array.isArray(data.content) ? data.content : [];
      set({ tozaMakonHistory: historyList });
    } catch (error) {
      toast.error('Tizimdagi amallar tarixini yuklashda xatolik yuz berdi');
      set({ tozaMakonHistory: [] });
      throw error;
    } finally {
      set({ tozaMakonHistoryLoading: false });
    }
  },
  setOpenTozaMakonHistoryDialog: (open) => set({ openTozaMakonHistoryDialogState: open })
}));
