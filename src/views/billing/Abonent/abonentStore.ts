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
  documentLanguage: 'UZ' | 'ru' | 'uz-cyrl';
  setDocumentLanguage: (lang: 'UZ' | 'ru' | 'uz-cyrl') => void;
  cardDetails: null | AbonentCard;
  getCardDetails: (params: { residentId: number; lang: 'UZ' | 'ru' | 'uz-cyrl'; periodFrom: string; periodTo: string }) => void;
  clearCardDetails: () => void;
  getDebtCertificate: (residentId: number) => Promise<ErrorResponse | DebtCertificateResponse>;
  openDebtCertificateDialog: boolean;
  setOpenDebtCertificateDialog: (open: boolean) => void;
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
  setOpenPrintAbonentcardState: (open) => set({ openPrintAbonentcardState: open }),
  documentLanguage: 'UZ',
  setDocumentLanguage: (language) => set({ documentLanguage: language }),
  cardDetails: null,
  getCardDetails: async ({ lang, periodFrom, periodTo, residentId }) => {
    // const { data } = await api.get(`/abonents/print-card/${residentId}`, {
    //   params: {
    //     lang,
    //     periodFrom,
    //     periodTo
    //   }
    // });
    set({
      cardDetails: {
        currentPeriod: '3.2026',
        qrCodeImage:
          'iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQAAAACFI5MzAAADU0lEQVR4Xu3XMa7kKBAAUEjwFSCBq+EErmASMAm+gp3A1XACV8AJHn7/0Y57tHw73VVXZPEkWkBVQYOzF+DvgX/iIx/5io/8p6UCJGdKSfYCboUD80RMUh6uYGLh3Iusj4QLxKx1E0LEt++HgqnaQ96jsu6pyHAkLsA07sGmZ2ISQpxqzfJqlvy+np4AJP7EX/vWkRZeHbPQclsxfY3fSqVD4ZwUMKnKgZpfdiPNyLI4mMg+0zHvr6E72fIR6VDNPg+rnIcnUoetqkJWtc8AITQ+E7vKJewRbjOmv5d6I6ejE/R8WFlFFNr4ojuZx3DOJlivgZzZ8hq7kQoLwiykMbGlUCzMI7EJWidkgonzt/X0ReMhexUchsuxu2sm9gVGU03L9i3ClbzmuhdWSNQCaY3bYZ+X0+7Luexht8FNYtLAVPlEKlfn7vhXAg9ldN9LvZGzcEwFn6Bdosr5ej59WdZWj9JP7JiJTZes6ksFoE1HrG0/P6n1uqNdOfORc5xkMbnlo81/ZutL1Qhp4vFEMcCDu+5OV85t82OIX3vpwFgeSaWAhZkkIMbKEbhm4g+iyVEFbsmVSNJvs/XkdGKSdkZi3PZIvye7kyr0MMNcNbGhcM1fdCuADrYIwJXnFFz7aF/YUbCgeghRYPl22l05PZI2ysOzGW5JXc+0KxWTaCJsHUOzWatLd/lBlLUhUSHw4AF9W2lfponDyuFs9kRy/a7hGzkdl5tvIleZxDQ8Ek9NqENkhQqYczJPZG1nwFlrf7Bgiq63WV+Cp2yJgHm4+NE/koo4IlUQPzhuor7uQV/YquqEJrUtlRzbpVP8IOOS8LAlpDaHhXTmgZx5izJxZs8i2sV5rZKuVAoTxebYqha0FcwjkV6LMRRm2zultb5HQtxgHZIOEIdlvM7WF8CWkNqrgextpfraKbpyRgToOIN2kR2eqvAau5GK9DgbT5aztB62XO+fvsA9Jxgi4BMCCKgn0kwrx7WGaVyFNk+kgsHmiLUA0g9FXKrkBzEJtD7ktaqaTvrad/rCxVhoKw+uWu2/dbEfpL2DYutjLEovfj8d7iWC9uTy8lyKUPZr7FbancnCEc5cNGjP4kcCkG7/B/ZKx3bTCGweyL/GRz7yFR/5/8kvEhR/KgvRFxYAAAAASUVORK5CYII=',
        currentKSaldo: -1767,
        balanceDtoList: [
          {
            id: 590960367,
            accrual: 32000,
            additionalAccrual: 0,
            actAmount: 0,
            cashAmount: 0,
            eMoneyAmount: 65000,
            frozenActAmount: 0,
            frozenDebtSettlement: 0,
            frozenKSaldo: 0,
            frozenNSaldo: 0,
            frozenRevenue: 0,
            god: 2026,
            inhabitantCount: 4,
            kSaldo: -1767,
            kSaldoDt: 0,
            kSaldoKt: -1767,
            mes: '3',
            munisAmount: 0,
            nSaldo: 31233,
            nSaldoDt: 31233,
            nSaldoKt: 0,
            penaltyFee: 0,
            period: '3.2026',
            q1031Amount: 0,
            residentId: 13308006,
            organizationId: null,
            tariffId: 51578
          }
        ],
        accountNumber: '105120640239',
        address: "Samarqand viloyati Kattaqo'rg'on tumani Qumoq MFY (1-sektor) mahalla Кумок Кк ko'cha 0 uy",
        companyAddress: 'Самарқанд вилояти Каттақурғон тумани Муллакурпа МФЙ Чим ққ',
        companyBankAccount: '20208000900611603001',
        companyBankMFO: '01037',
        companyBankName: 'АТБ "Қишлоқ кўрилиш банк" Каттақўрғон филиали',
        companyDirector: 'Жумаева Гулмира',
        companyEmail: 'shersah401@gmail.com',
        companyInn: '303421898',
        companyName: '"ANVARJON BIZNES INVEST" MCHJ',
        companyPhone: '+998557052555',
        contractDate: '2020-05-15',
        contractNumber: '13308006',
        districtName: "Kattaqo'rg'on tumani",
        flatNumber: null,
        fullName: 'TO‘RAYEV BERDIYOR JUMAYEVICH',
        inhabitantCnt: 4,
        mahallaName: 'Qumoq MFY (1-sektor)',
        phone: '944715475',
        streetName: 'Кумок К\\к'
      }
    });
  },
  clearCardDetails: () => set({ cardDetails: null }),
  getDebtCertificate: async (residentId: number) => {
    try {
      const data = {
        id: 342725,
        residentId: 13308006,
        residentAccountNumber: '105120640239',
        fullName: 'TO‘RAYEV BERDIYOR JUMAYEVICH',
        mahallaName: 'Qumoq MFY (1-sektor)',
        streetName: 'Кумок К\\к',
        homeNumber: '0',
        flatNumber: null,
        inhabitantCount: 4,
        phone: '944715475',
        companyDirector: 'Жумаева Гулмира',
        companyName: '"ANVARJON BIZNES INVEST" MCHJ Davlat xususiy sherikchilik ',
        companyAddress: 'Самарқанд вилояти Каттақурғон тумани Муллакурпа МФЙ Чим ққ',
        companyPhone: '+998557052555',
        companyBank: 'АТБ "Қишлоқ кўрилиш банк" Каттақўрғон филиали',
        companyInn: '303421898',
        bankDetails: '01037 20208000900611603001',
        createdAt: '2026-03-17T14:46:07.134654951',
        currentBalance: -1767.2,
        qrCodeImageUrl: 'file.jpg*tozamakon/nfs/qrcode/2026/03/17/d4605c3ac5d74d998d493a9eb64373dd.jpg',
        publicUrl: '9d31a7c432c541e189ee6935b52982ed',
        fileId: 'file.pdf*tozamakon/nfs/reference/2026/03/17/db03b9c5e62a4ddba2c0feec6ede5b17.pdf'
      };
      const res = await api.get('/billing/download-file-from-billing/', {
        params: { fileId: data.qrCodeImageUrl },
        responseType: 'blob'
      });
      return;
      const response = await api.get('/abonents/debt-certificate/' + residentId);
      return response.data;
    } catch (error: any) {
      return error.response.data;
    }
  },
  openDebtCertificateDialog: false,
  setOpenDebtCertificateDialog: (open: boolean) => set({ openDebtCertificateDialog: open })
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

type AbonentCard = {
  accountNumber: string;
  address: null | string;
  balanceDtoList: Array<{
    accrual: number;
    actAmount: number;
    additionalAccrual: number;
    cashAmount: number;
    eMoneyAmount: number;
    frozenActAmount: number;
    frozenDebtSettlement: number;
    frozenKSaldo: number;
    frozenNSaldo: number;
    frozenRevenue: number;
    god: number;
    id: number;
    inhabitantCount: number;
    kSaldo: number;
    kSaldoDt: number;
    kSaldoKt: number;
    mes: string;
    munisAmount: number;
    nSaldo: number;
    nSaldoDt: number;
    nSaldoKt: number;
    organizationId: null | number;
    penaltyFee: number;
    period: string;
    q1031Amount: number;
    residentId: number;
    tariffId: number;
  }>;
  companyAddress: string;
  companyBankAccount: string;
  companyBankMFO: string;
  companyBankName: string;
  companyDirector: string;
  companyEmail: string;
  companyInn: string;
  companyName: string;
  companyPhone: string;
  contractDate: string | null;
  contractNumber: string | null;
  currentKSaldo: number;
  currentPeriod: string;
  districtName: string;
  flatNumber: string | null;
  fullName: string;
  inhabitantCnt: number;
  mahallaName: string;
  phone: string | null;
  qrCodeImage: string;
  streetName: string;
};

export interface ErrorResponse {
  code: string;
  message: string;
  time: string;
  traceId: string;
}
export interface DebtCertificateResponse {
  id: number;
  residentId: number;
  residentAccountNumber: string;
  fullName: string;
  mahallaName: string;
  streetName: string;
  homeNumber: string | null;
  flatNumber: string | null;
  inhabitantCount: number;
  phone: string | null;
  companyDirector: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyBank: string;
  companyInn: string;
  bankDetails: string;
  createdAt: string;
  currentBalance: number;
  qrCodeImageUrl: string;
  publicUrl: string;
  fileId: string;
}
