import { confirmDialog } from 'ui-component/ConfirmDialog';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';
import { AbonentDetails, Balance, IAbonent } from 'types/billing';
import { AbonentCard } from 'views/billing/Abonent/types';
import api from 'utils/api';
import { AutoMobile } from 'views/gpsMonitoring/VisitGrafikPage/useVisitGrafikStore';
import { create } from 'zustand';
import type { LatLngPoint } from 'services/abonentLocation';

export interface dhjRow {
  id: number;
  davr: string;
  saldo_n: number;
  nachis: number;
  saldo_k: number;
  akt: number;
  yashovchilar_soni: number;
  allPaymentsSum: number;
}

interface IPeriod extends IRecalculationPeriod {
  startDate: Dayjs;
  endDate: Dayjs;
}

export interface IRecalculationPeriod {
  id?: number;
  period?: string;
  from?: string;
  to?: string;
  total: number;
  withQQSTotal: number;
  withoutQQSTotal: number;
  /** Ko'p bosqichli: shu davrda necha kishiga hisoblanadi (mutlaq son) */
  yashovchilar_soni?: number;
  /** Kalkulyator (oddiy, viza, o'lim): davr bitta kishilik summa — kreditor −1 kishi, debitor +1 kishi */
  yashovchiDelta?: number;
  periodType?: 'debitor' | 'kreditor';
  /** DHJ va ro'yxatdagi rang (hex, '#' siz). Ko'p bosqichlida bosqich rangi bilan bir xil */
  color?: string;
  startDate: Dayjs;
  endDate: Dayjs;
}

export interface IMahalla {
  data: any;
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
export type IAbonentData = AbonentDetails;

export const defaultAbonentData: AbonentDetails = {
  id: 0,
  accountNumber: '',
  fullName: '',
  balance: {
    period: '',
    kSaldo: 0,
    frozenActAmount: 0,
    frozenDebtSettlement: 0,
    frozenKSaldo: 0,
    frozenNSaldo: 0,
    frozenRevenue: 0,
    rate: '',
    accrual: 0
  },
  mahallaName: '',
  mahallaId: 0,
  streetName: '',
  house: {
    cadastralNumber: '',
    homeIndex: '',
    homeNumber: '',
    inhabitantCnt: 0,
    id: 0,
    latitude: 0,
    longitude: 0,
    temporaryCadastralNumber: '',
    type: 'HOUSE'
  },
  phone: '',
  citizen: {
    passport: '',
    pnfl: '',
    birthDate: '',
    email: '',
    firstName: '',
    lastName: '',
    patronymic: '',
    foreignCitizen: false,
    inn: '',
    passportExpireDate: '',
    passportGivenDate: '',
    passportIssuer: '',
    photo: ''
  },
  active: false,
  streetId: 0,
  companyId: 0,
  companyName: '',
  contractDate: '',
  contractNumber: '',
  description: '',
  electricityAccountNumber: '',
  electricityCoato: '',
  homePhone: '',
  identified: false,
  regionId: 0,
  regionName: '',
  residentType: 'INDIVIDUAL'
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

export type aktType = 'odam_soni' | 'dvaynik' | 'gps' | 'death' | 'viza' | 'cancelContract' | 'pul_kuchirish' | 'yashovchi_kuchirish' | null;

/** Yashovchi ko'chirish sabablari (dalolatnomaga yoziladi) */
export const kuchirishSabablari = [
  'Turmushga chiqqanligi sababli',
  'Uylanib alohida yashayotganligi sababli',
  "Boshqa xonadonga ko'chib o'tganligi sababli",
  "Qarindoshinikiga ko'chib o'tganligi sababli",
  "Yangi uy-joy sotib olganligi sababli",
  'Ijaraga ko\'chib o\'tganligi sababli'
] as const;

/** Yashovchi ko'chirish formasi: asosiy abonentdan (abonentData) qabul qiluvchiga (abonentData2) */
export interface IKuchirishInput {
  soni: string;
  sabab: string;
  /** Ko'chirilgan shaxs(lar) F.I.Sh */
  shaxslar: string;
  /** Ko'chgan oy: undan keyingi yopilgan oylar ikkala abonentda qayta hisoblanadi */
  oy: Dayjs | null;
  /** Qabul qiluvchining qayta hisob davri va summasi (asosiyniki — recalculationPeriods/aktSumma) */
  toPeriods: IRecalculationPeriod[];
  toAktSumma: IAktSumma;
}

/** Arizada saqlanadigan ko'chirish ma'lumoti (backend IKuchirish) */
export interface IKuchirish {
  soni: number;
  sabab: string;
  shaxslar?: string;
  oy: string;
  fromCurrentCnt: number;
  fromNextCnt: number;
  toAbonentId: number;
  toLicshet: string;
  toFio: string;
  toCurrentCnt: number;
  toNextCnt: number;
  toAktSumma: { total: number; withQQSTotal: number; withoutQQSTotal: number };
}

/** Shartnomani bekor qilish sabablari (backend cancelContractReasons bilan bir xil) */
export const cancelContractReasons = {
  mahallada_mavjud_emas: 'Mahallada mavjud emas',
  texnik_xatolik: "Texnik xatolik (noto'g'ri shaxsga ochilgan)",
  takroriy: 'Takroriy (ortiqcha) ochilgan',
  boshqa: 'Boshqa sabab'
} as const;
export type CancelContractReason = keyof typeof cancelContractReasons;

/** Arizada saqlanadigan shartnoma bekor qilish ma'lumoti */
export interface ICancelContract {
  sabab: CancelContractReason;
  /** Asos: kelgan xat, o'rganish natijasi va h.k. */
  asos?: string;
  kSaldo?: number;
  inhabitantCnt?: number;
}

export const emptyBekorQilish = (): { sabab: CancelContractReason; asos: string } => ({ sabab: 'mahallada_mavjud_emas', asos: '' });

export const emptyKuchirish = (): IKuchirishInput => ({
  soni: '1',
  sabab: kuchirishSabablari[0],
  shaxslar: '',
  oy: dayjs().startOf('month'),
  toPeriods: [],
  toAktSumma: { total: 0, totalWithQQS: 0, withoutQQSTotal: 0 }
});

/**
 * [from, to] oylarida yashovchi soni `delta` ga o'zgargandek qayta hisob (yashovchi ko'chirish).
 * Kishi ayrilsa (delta < 0) ortiqcha hisoblangan — musbat (kreditor), qo'shilsa — manfiy (debitor).
 * Oyda yashovchi `delta` dan kam bo'lsa, faqat borini ayiradi. DHJ da yo'q oy hisobga kirmaydi.
 */
export function calcDeltaPeriod(rows: dhjRow[], jadval: IHisoblandiItem[], from: Dayjs, to: Dayjs, delta: number): IRecalculationPeriod | null {
  let total = 0;
  let withQQSTotal = 0;
  let months = 0;
  for (const row of rows) {
    const d = davrToMonth(row.davr);
    if (!d || d.isBefore(from, 'month') || d.isAfter(to, 'month')) continue;
    const tariff = jadval.find((r) => r.year === d.year() && r.month === d.month() + 1);
    if (!tariff) continue;
    const effective = Math.max(delta, -(Number(row.yashovchilar_soni) || 0));
    const diff = -effective * tariff.hisoblandi;
    total += diff;
    if (tariff.withQQS) withQQSTotal += diff;
    months++;
  }
  if (!months) return null;
  return {
    startDate: from.startOf('month'),
    endDate: to.endOf('month'),
    total,
    withQQSTotal,
    withoutQQSTotal: total - withQQSTotal,
    yashovchiDelta: delta,
    periodType: total >= 0 ? 'kreditor' : 'debitor'
  };
}

export interface ITransferCreditor {
  id: number;
  residentId: number;
  accountNumber: string;
  fullName: string;
  amount: number;
  kSaldo: number;
  phone?: string;
  mahallaName?: string;
}

/** Odam soni arizasidagi qayta hisob turi */
export type RecalcMode = 'oddiy' | 'kop_bosqichli';

/** Ko'p bosqichli qayta hisobning bitta bosqichi (formadagi holat) */
export interface IStageInput {
  /** Boshlanish oyi */
  from: Dayjs | null;
  /** Tugash oyi (shu oy ham kiradi). Joriy oy tanlansa — "hozirgacha", soni yashovchiSoniInput ga bog'lanadi */
  to: Dayjs | null;
  /** Shu davrda yashagan kishilar soni */
  count: string;
}

/** Arizada saqlanadigan bosqich (dalolatnomada summasiz ko'rsatiladi). Oylar MM.YYYY */
export interface IBosqich {
  from: string;
  to: string;
  count: number;
  /** Bosqich ariza yaratilgan oygacha davom etadi: dalolatnomada "... oyidan boshlab" deb yoziladi */
  hozirgacha?: boolean;
}

export const emptyStage = (): IStageInput => ({ from: null, to: null, count: '' });

/** DHJ dagi davr ("MM.YYYY") ni oy boshiga aylantiradi */
export function davrToMonth(davr: string): Dayjs | null {
  const [month, year] = String(davr || '').split('.').map(Number);
  if (!month || !year) return null;
  return dayjs(new Date(year, month - 1, 1));
}

/** DHJ dagi eng birinchi oy (abonent ochilgan oy): undan oldingi davrni qayta hisoblab bo'lmaydi */
export function getDhjFirstMonth(rows: Pick<dhjRow, 'davr'>[]): Dayjs | null {
  let first: Dayjs | null = null;
  for (const row of rows) {
    const d = davrToMonth(row.davr);
    if (d && (!first || d.isBefore(first))) first = d;
  }
  return first;
}

/** Qayta hisob qilinadigan oxirgi oy: joriy oy hali hisoblanmagan, u yangi yashovchi soni bilan hisoblanadi */
export function getLastClosedMonth(): Dayjs {
  return dayjs().startOf('month').subtract(1, 'month');
}

/** Bosqich joriy oygacha yetib boradimi (u holda soni = yangi yashovchi soni) */
export const isCurrentStage = (stage: IStageInput) => !!stage.to?.isValid() && stage.to.isSame(dayjs(), 'month');

/** Bosqichning amaldagi kishi soni: joriy oygacha boradigan bosqichda — formadagi yangi yashovchi soni */
export const stageCount = (stage: IStageInput, nextCount: string) => (isCurrentStage(stage) ? nextCount : stage.count);

/**
 * Har bir bosqichni tekshiradi. Natija: bosqichlar bo'yicha xato matnlari (null — xato yo'q).
 * Davrlari kesishgan bosqichlarning ikkalasi ham xato deb belgilanadi.
 */
export function validateStages(stages: IStageInput[], nextCount: string, dhjFirstMonth: Dayjs | null): (string | null)[] {
  const now = dayjs();
  const errors: (string | null)[] = stages.map((stage, i) => {
    const n = i + 1;
    const { from, to } = stage;
    const count = stageCount(stage, nextCount);
    if (!from?.isValid() || !to?.isValid()) return `${n}-bosqich: dan va gacha oylarini kiriting`;
    if (from.isAfter(to, 'month')) return `${n}-bosqich: boshlanish oyi tugash oyidan keyin bo'lishi mumkin emas`;
    if (dhjFirstMonth && from.isBefore(dhjFirstMonth, 'month'))
      return `${n}-bosqich: abonent DHJ si ${dhjFirstMonth.format('MM.YYYY')} dan boshlanadi, undan oldingi davrni qayta hisoblab bo'lmaydi`;
    if (to.isAfter(now, 'month')) return `${n}-bosqich: kelajakdagi oyni tanlab bo'lmaydi`;
    if (count === '' || isNaN(Number(count)) || Number(count) < 0 || !Number.isInteger(Number(count)))
      return `${n}-bosqich: yashovchi sonini kiriting`;
    return null;
  });

  // Kesishishlarni tekshirish (to'liq kiritilgan bosqichlar orasida)
  for (let i = 0; i < stages.length; i++) {
    for (let j = i + 1; j < stages.length; j++) {
      const a = stages[i];
      const b = stages[j];
      if (!a.from?.isValid() || !a.to?.isValid() || !b.from?.isValid() || !b.to?.isValid()) continue;
      const overlap = !a.from.isAfter(b.to, 'month') && !b.from.isAfter(a.to, 'month');
      if (overlap) {
        const msg = `${i + 1}- va ${j + 1}-bosqich davrlari kesishib ketgan`;
        errors[i] = errors[i] || msg;
        errors[j] = errors[j] || msg;
      }
    }
  }
  return errors;
}

/**
 * [from, to] oylari uchun DHJ dagi har oyni `count` kishiga qayta hisoblaydi.
 * Akt summasi = (DHJ dagi o'sha oy soni − haqiqiy soni) × tarif:
 * kam kishi yashagan bo'lsa ortiqcha hisoblangan — musbat (kreditor, qarz kamayadi),
 * ko'p kishi yashagan bo'lsa kam hisoblangan — manfiy (debitor, qarz qo'shiladi).
 * DHJ da yo'q oy (abonent ochilmagan davr) hisobga kirmaydi.
 */
export function calcStagePeriod(
  rows: dhjRow[],
  jadval: IHisoblandiItem[],
  from: Dayjs,
  to: Dayjs,
  count: number
): IRecalculationPeriod | null {
  let total = 0;
  let withQQSTotal = 0;
  let months = 0;
  for (const row of rows) {
    const d = davrToMonth(row.davr);
    if (!d || d.isBefore(from, 'month') || d.isAfter(to, 'month')) continue;
    const tariff = jadval.find((r) => r.year === d.year() && r.month === d.month() + 1);
    if (!tariff) continue;
    const diff = ((Number(row.yashovchilar_soni) || 0) - count) * tariff.hisoblandi;
    total += diff;
    if (tariff.withQQS) withQQSTotal += diff;
    months++;
  }
  if (!months) return null;
  return {
    startDate: from.startOf('month'),
    endDate: to.endOf('month'),
    total,
    withQQSTotal,
    withoutQQSTotal: total - withQQSTotal,
    yashovchilar_soni: count,
    periodType: total >= 0 ? 'kreditor' : 'debitor'
  };
}

/** Qayta hisob davri qaysi oylarni qamraydi (kalkulyatordagi qoida: 15-sanadan keyin boshlansa keyingi oydan, 15-gacha tugasa oldingi oygacha) */
export function periodMonthRange(period: Pick<IRecalculationPeriod, 'startDate' | 'endDate'>): { from: Dayjs; to: Dayjs } | null {
  const start = dayjs(period.startDate);
  const end = dayjs(period.endDate);
  if (!start.isValid() || !end.isValid()) return null;
  return {
    from: (start.date() > 15 ? start.add(1, 'month') : start).startOf('month'),
    to: (end.date() > 15 ? end : end.subtract(1, 'month')).startOf('month')
  };
}

export type AbonentLookupTarget = 'main' | 'dublicate';

export interface AbonentLookupState {
  loading: boolean;
  /** Abonent topilmagani yoki server/tarmoq xatosi haqidagi xabar */
  error: string | null;
}

const idleLookup: AbonentLookupState = { loading: false, error: null };

// Hisob raqam o'zgarganda eski (sekin) so'rov javobi yangisini bosib ketmasligi uchun
const abonentLookupSeq: Record<AbonentLookupTarget, number> = { main: 0, dublicate: 0 };

export interface ImgType {
  file: File;
  document_id: string;
}

interface StoreActionsState {
  setAktSumma: (aktSumma: IAktSumma) => void;
  setHisoblandiJadval: (hisoblandiJadval: IHisoblandiItem[]) => void;
  setAktType: (aktType: aktType) => void;
  setBekorQilish: (patch: Partial<{ sabab: CancelContractReason; asos: string }>) => void;
  setShowPrintSection: (showPrintSection: boolean) => void;
  setRecalculationPeriods: (recalculationPeriods: any[]) => void;
  setRowsDhjTable: (rowsDhjTable: dhjRow[]) => void;
  setImages: (images: ImgType[]) => void;
  setAbonentData: (abonentData: AbonentDetails) => void;
  setAbonentData2: (abonentData: AbonentDetails) => void;
  setMahalla: (mahalla: IMahalla) => void;
  setMahallaDublicat: (mahalla: IMahalla) => void;
  setAriza: (ariza: any) => void;
  setYashovchiSoniInput: (yashovchiSoniInput: string | number) => void;
  setPasteImageDialogOpen: (pasteImageDialogOpen: boolean) => void;
  setMuzlatiladi: (muzlatiladi: boolean) => void;
  setGpsLocation: (gpsLocation: LatLngPoint | null) => void;
  setGpsLocationRequired: (required: boolean) => void;
  setInitialState: () => void;
  createAriza: () => void;
  updateAbonentDataByAccNum: (accountNumber: string, abonentData: 'main' | 'dublicate') => Promise<boolean>;
  searchAllAccountsAbonent: (accountNumber: string, targetType: 'main' | 'dublicate') => Promise<boolean>;
  cancelAbonentLookup: (target: AbonentLookupTarget) => void;
  getAutoMobile: (mahallaId: number) => void;
  setAbonentCardOpenState: (abonentCardOpenState: boolean) => void;
  setGlobalAbonentAccountNumber: (globalAbonentAccountNumber: string) => void;
  setShouldBeMoneyTransfer: (shouldBeMoneyTransfer: boolean) => void;
  setDublicateRelation: (dublicateRelation: string) => void;
  setMoneyTransferAmount: (moneyTransferAmount: number | string) => void;
  setIsGlobalAbonent: (isGlobal: boolean) => void;
  setIsGlobalAbonent2: (isGlobal: boolean) => void;
  setTransferReason: (reason: 'ortiqcha_tulov' | 'yanglish_tulov') => void;
  setTransferCreditors: (creditors: ITransferCreditor[]) => void;
  addTransferCreditor: (creditor: ITransferCreditor) => void;
  removeTransferCreditor: (id: number) => void;
  setSelectedApplicantId: (id: number | '') => void;
  setTransferDebitorAmount: (amount: string) => void;
  setRecalcMode: (mode: RecalcMode) => void;
  setStages: (stages: IStageInput[]) => void;
  setKuchirish: (patch: Partial<IKuchirishInput>) => void;
}

interface UIState {
  abonentCardOpenState: boolean;
  globalAbonentAccountNumber: string;
}

interface StoreDataState {
  ui: UIState;
  shouldBeMoneyTransfer: boolean;
  dublicateRelation: string;
  moneyTransferAmount: number | string;
  transferReason: 'ortiqcha_tulov' | 'yanglish_tulov';
  transferCreditors: ITransferCreditor[];
  selectedApplicantId: number | '';
  transferDebitorAmount: string;
  aktType: aktType;
  showPrintSection: boolean;
  rowsDhjTable: dhjRow[];
  abonentData: AbonentDetails;
  abonentData2: AbonentDetails;
  isGlobalAbonent: boolean;
  isGlobalAbonent2: boolean;
  globalCardDetails: AbonentCard | null;
  globalCardDetails2: AbonentCard | null;
  notFoundInCompanyMain: boolean;
  notFoundInCompanyDublicate: boolean;
  isSearchingGlobalMain: boolean;
  isSearchingGlobalDublicate: boolean;
  abonentLookup: Record<AbonentLookupTarget, AbonentLookupState>;
  ariza: any;
  mahalla: IMahalla;
  mahallaDublicat: any;
  recalculationPeriods: IRecalculationPeriod[];
  yashovchiSoniInput: string;
  pasteImageDialogOpen: boolean;
  images: ImgType[];
  muzlatiladi: boolean;
  /** GPS dalolatnomasi: abonent uyi joylashuvi va tashkilot sozlamasiga ko'ra majburiyligi */
  gpsLocation: LatLngPoint | null;
  gpsLocationRequired: boolean;
  hisoblandiJadval: IHisoblandiItem[];
  aktSumma: IAktSumma;
  autoMobile: AutoMobile | null;
  isCreatingAriza: boolean;
  recalcMode: RecalcMode;
  stages: IStageInput[];
  kuchirish: IKuchirishInput;
  /** Shartnomani bekor qilish formasi */
  bekorQilish: { sabab: CancelContractReason; asos: string };
}

const initialStoreDataState: StoreDataState = {
  shouldBeMoneyTransfer: false,
  dublicateRelation: '',
  moneyTransferAmount: 0,
  transferReason: 'ortiqcha_tulov',
  transferCreditors: [],
  selectedApplicantId: '',
  transferDebitorAmount: '',
  aktType: null,
  abonentData: defaultAbonentData,
  abonentData2: defaultAbonentData,
  isGlobalAbonent: false,
  isGlobalAbonent2: false,
  globalCardDetails: null,
  globalCardDetails2: null,
  notFoundInCompanyMain: false,
  notFoundInCompanyDublicate: false,
  isSearchingGlobalMain: false,
  isSearchingGlobalDublicate: false,
  abonentLookup: { main: idleLookup, dublicate: idleLookup },
  aktSumma: { total: 0, totalWithQQS: 0, withoutQQSTotal: 0 },
  ariza: {},
  hisoblandiJadval: [],
  images: [],
  gpsLocation: null,
  gpsLocationRequired: false,
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
  muzlatiladi: false,
  showPrintSection: false,
  rowsDhjTable: [],
  autoMobile: null,
  isCreatingAriza: false,
  recalcMode: 'oddiy',
  stages: [emptyStage()],
  kuchirish: emptyKuchirish(),
  bekorQilish: emptyBekorQilish(),
  ui: { abonentCardOpenState: false, globalAbonentAccountNumber: '' }
};

type StoreState = StoreDataState & StoreActionsState;

export const useStore = create<StoreState>((set, get) => ({
  ...initialStoreDataState,
  ui: { abonentCardOpenState: false, globalAbonentAccountNumber: '' },
  setTransferReason: (reason) => set({ transferReason: reason }),
  setTransferCreditors: (creditors) => set({ transferCreditors: creditors }),
  addTransferCreditor: (creditor) => set((state) => ({ transferCreditors: [...state.transferCreditors, creditor] })),
  removeTransferCreditor: (id) => set((state) => ({ transferCreditors: state.transferCreditors.filter((c) => c.id !== id) })),
  setSelectedApplicantId: (id) => set({ selectedApplicantId: id }),
  setTransferDebitorAmount: (amount) => set({ transferDebitorAmount: amount }),
  setDublicateRelation: (dublicateRelation: string) => set({ dublicateRelation }),
  setMoneyTransferAmount: (moneyTransferAmount: number | string) => set({ moneyTransferAmount }),
  setGlobalAbonentAccountNumber: (globalAbonentAccountNumber: string) =>
    set({ ui: { ...get().ui, globalAbonentAccountNumber: globalAbonentAccountNumber } }),
  setAbonentCardOpenState: (abonentCardOpenState: boolean) => {
    const ui = get().ui;
    set({ ui: { ...ui, abonentCardOpenState: abonentCardOpenState } });
  },
  setIsGlobalAbonent: (isGlobal: boolean) => set({ isGlobalAbonent: isGlobal }),
  setIsGlobalAbonent2: (isGlobal: boolean) => set({ isGlobalAbonent2: isGlobal }),
  // Ikki bosqichli rejim faqat odam soni uchun: boshqa turga o'tilsa oddiyga qaytadi
  setAktType: (aktType) =>
    set({
      aktType,
      kuchirish: emptyKuchirish(),
      bekorQilish: emptyBekorQilish(),
      ...(aktType === 'odam_soni' ? {} : { recalcMode: 'oddiy' as RecalcMode, stages: [emptyStage()] })
    }),
  setBekorQilish: (patch) => set((state) => ({ bekorQilish: { ...state.bekorQilish, ...patch } })),
  setKuchirish: (patch) => set((state) => ({ kuchirish: { ...state.kuchirish, ...patch } })),
  // Rejim almashganda avvalgi rejimda qo'shilgan davrlar arizaga aralashib ketmasin
  setRecalcMode: (mode) =>
    set({
      recalcMode: mode,
      stages: [emptyStage()],
      recalculationPeriods: [],
      aktSumma: { total: 0, totalWithQQS: 0, withoutQQSTotal: 0 }
    }),
  setStages: (stages) => set({ stages }),
  setShowPrintSection: (showPrintSection: boolean) => set({ showPrintSection: showPrintSection }),
  setRowsDhjTable: (rowsDhjTable: dhjRow[]) => set({ rowsDhjTable }),
  setAbonentData: (data) => set({ abonentData: data }),
  setAbonentData2: (data) => set({ abonentData2: data }),
  setAriza: (data) => set({ ariza: data }),
  setMahalla: (mfy) => set({ mahalla: mfy }),
  setMahallaDublicat: (mfy) => set({ mahallaDublicat: mfy }),
  setRecalculationPeriods: (data: IRecalculationPeriod[]) => set({ recalculationPeriods: data }),
  setYashovchiSoniInput: (data) => set({ yashovchiSoniInput: String(data) }),
  setPasteImageDialogOpen: (pasteImageDialogOpen) => set({ pasteImageDialogOpen }),
  setImages: (images) => set({ images }),
  setMuzlatiladi: (muzlatiladi) => set({ muzlatiladi }),
  setGpsLocation: (gpsLocation) => set({ gpsLocation }),
  setGpsLocationRequired: (gpsLocationRequired) => set({ gpsLocationRequired }),
  setInitialState: () => set({ ...initialStoreDataState, kuchirish: emptyKuchirish(), bekorQilish: emptyBekorQilish() }),
  setHisoblandiJadval: (hisoblandiJadval: IHisoblandiItem[]) => set({ hisoblandiJadval }),
  setAktSumma: (aktSumma: IAktSumma) => set({ aktSumma }),
  createAriza: async () => {
    // Ikki marta bosishdan himoya: zustand set() sinxron, ikkinchi bosish shu yerda to'xtaydi
    if (get().isCreatingAriza) return;
    set({ isCreatingAriza: true });
    try {
      const {
        aktType,
        abonentData,
        abonentData2,
        aktSumma,
        yashovchiSoniInput,
        recalculationPeriods,
        images,
        muzlatiladi,
        gpsLocation,
        gpsLocationRequired,
        shouldBeMoneyTransfer,
        dublicateRelation,
        moneyTransferAmount,
        setAriza,
        setMahalla,
        setMahallaDublicat,
        setShowPrintSection
      } = get();
      const { setIsLoading } = useLoaderStore.getState();

      if (aktType === 'pul_kuchirish') {
        const {
          abonentData,
          transferDebitorAmount,
          transferCreditors,
          transferReason,
          selectedApplicantId,
          setAriza,
          setMahalla,
          setShowPrintSection
        } = get();

        const debitorAmount = Number(transferDebitorAmount) || 0;
        const totalCreditorsAmount = transferCreditors.reduce((acc, c) => acc + c.amount, 0);

        if (!abonentData?.id || !abonentData.accountNumber) {
          toast.error('Asosiy abonent (debitor) kiritilmagan');
          return;
        }
        if (debitorAmount <= 0) {
          toast.error("O'tkaziladigan summa 0 dan katta bo'lishi kerak");
          return;
        }
        if (transferCreditors.length === 0) {
          toast.error("Kamida bitta qabul qiluvchi (kreditor) hisob raqamini qo'shing");
          return;
        }
        if (debitorAmount !== totalCreditorsAmount) {
          toast.error("Debitor summasi va kreditorlar summasi bir-biriga teng bo'lishi shart");
          return;
        }

        setIsLoading(true);
        try {
          let applicantRow: any = {
            residentId: abonentData.id,
            accountNumber: abonentData.accountNumber,
            fullName: abonentData.fullName,
            phone: abonentData.phone,
            mahallaName: abonentData.mahallaName
          };

          if (transferReason === 'yanglish_tulov') {
            const found = transferCreditors.find((r) => r.residentId === selectedApplicantId);
            if (found) applicantRow = found;
            else if (transferCreditors.length > 0) applicantRow = transferCreditors[0];
          }

          const debitorAct = {
            accountNumber: abonentData.accountNumber,
            amount: debitorAmount,
            fullName: abonentData.fullName,
            residentId: abonentData.id,
            kSaldo: abonentData.balance?.kSaldo || 0,
            phone: abonentData.phone,
            mahallaName: abonentData.mahallaName
          };

          const result = (
            await api.post('/arizalar/money-transfer', {
              debitorAct,
              creditorActs: transferCreditors,
              transferReason,
              applicant: {
                residentId: applicantRow?.residentId || applicantRow?.id,
                accountNumber: applicantRow?.accountNumber,
                fullName: applicantRow?.fullName,
                phone: applicantRow?.phone || '',
                mahallaName: applicantRow?.mahallaName || ''
              }
            })
          ).data.ariza;

          setAriza(result);
          if (abonentData.mahallaId) {
            const mahallaData = (await api.get('/billing/get-mfy-by-id/' + abonentData.mahallaId)).data;
            setMahalla(mahallaData);
          }
          setShowPrintSection(true);
        } catch (error: any) {
          console.error(error.message);
          toast.error(error?.response?.data?.message || error.message || 'Xatolik kuzatildi');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (aktType === 'yashovchi_kuchirish') {
        const { kuchirish } = get();
        const error = validateKuchirish(abonentData, abonentData2, kuchirish, get().isGlobalAbonent2);
        if (error) {
          toast.error(error);
          return;
        }
        const soni = Number(kuchirish.soni);
        const fromCurrent = Number(abonentData.house?.inhabitantCnt) || 0;
        const toCurrent = Number(abonentData2.house?.inhabitantCnt) || 0;
        const payload: IKuchirish = {
          soni,
          sabab: kuchirish.sabab.trim(),
          shaxslar: kuchirish.shaxslar.trim() || undefined,
          oy: kuchirish.oy!.format('MM.YYYY'),
          fromCurrentCnt: fromCurrent,
          fromNextCnt: fromCurrent - soni,
          toAbonentId: abonentData2.id,
          toLicshet: abonentData2.accountNumber,
          toFio: abonentData2.fullName,
          toCurrentCnt: toCurrent,
          toNextCnt: toCurrent + soni,
          toAktSumma: {
            total: kuchirish.toAktSumma.total,
            withQQSTotal: kuchirish.toAktSumma.totalWithQQS,
            withoutQQSTotal: kuchirish.toAktSumma.withoutQQSTotal
          }
        };
        setIsLoading(true);
        try {
          const { data } = await api.post('/arizalar/create', {
            account_number: abonentData.accountNumber,
            abonentId: abonentData.id,
            fullName: abonentData.fullName,
            dublicat_account_number: abonentData2.accountNumber,
            document_type: aktType,
            akt_summasi: { total: aktSumma.total, withQQSTotal: aktSumma.totalWithQQS, withoutQQSTotal: aktSumma.withoutQQSTotal },
            current_prescribed_cnt: fromCurrent,
            next_prescribed_cnt: payload.fromNextCnt,
            photos: images.map((img) => img.document_id),
            recalculationPeriods,
            kuchirish: payload
          });
          if (!data.ok) return toast.error(data.message);
          setAriza(data.ariza);
          const [mfy1, mfy2] = await Promise.all([
            api.get('/billing/get-mfy-by-id/' + abonentData.mahallaId),
            api.get('/billing/get-mfy-by-id/' + abonentData2.mahallaId)
          ]);
          setMahalla(mfy1.data);
          setMahallaDublicat(mfy2.data);
          setShowPrintSection(true);
        } catch (error: any) {
          console.error(error);
          toast.error(error?.response?.data?.message || error.message || 'Xatolik kuzatildi');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (aktType === 'cancelContract') {
        const { bekorQilish } = get();
        const kSaldo = Number(abonentData.balance?.kSaldo) || 0;
        const inhabitantCnt = Number(abonentData.house?.inhabitantCnt) || 0;
        if (
          !(await confirmDialog({
            title: 'Shartnomani bekor qilish',
            message: `${abonentData.accountNumber} hisob raqami bo'yicha shartnomani bekor qilish dalolatnomasi tuziladi. Akt kiritilganda yashovchi soni (${inhabitantCnt} kishi) va saldo (${(kSaldo * -1).toLocaleString()} so'm) 0 qilinadi. Davom etasizmi?`,
            confirmText: 'Ha, yaratish',
            color: 'warning'
          }))
        )
          return;
        setIsLoading(true);
        try {
          const { data } = await api.post('/arizalar/create', {
            account_number: abonentData.accountNumber,
            abonentId: abonentData.id,
            fullName: abonentData.fullName,
            document_type: aktType,
            // Summani server TozaMakonda saldo oxiri 0 bo'ladigan qilib hisoblaydi; akt kiritilganda yana yangilanadi
            akt_summasi: { total: 0, withQQSTotal: 0, withoutQQSTotal: 0 },
            current_prescribed_cnt: inhabitantCnt,
            next_prescribed_cnt: 0,
            comment: bekorQilish.asos.trim() || undefined,
            photos: images.map((img) => img.document_id),
            recalculationPeriods: [],
            bekorQilish: {
              sabab: bekorQilish.sabab,
              asos: bekorQilish.asos.trim() || undefined,
              kSaldo,
              inhabitantCnt
            }
          });
          if (!data.ok) return toast.error(data.message);
          setAriza(data.ariza);
          if (abonentData.mahallaId) setMahalla((await api.get('/billing/get-mfy-by-id/' + abonentData.mahallaId)).data);
          setShowPrintSection(true);
        } catch (error: any) {
          console.error(error);
          toast.error(error?.response?.data?.message || error.message || 'Xatolik kuzatildi');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (!validateCreateAct({ aktType, inhabitantCnt: yashovchiSoniInput })) return;

      const { recalcMode, stages, rowsDhjTable } = get();
      let bosqichlar: IBosqich[] | undefined;
      if (aktType === 'odam_soni' && recalcMode === 'kop_bosqichli') {
        const error = validateStages(stages, yashovchiSoniInput, getDhjFirstMonth(rowsDhjTable)).find(Boolean);
        if (error) {
          toast.error(error);
          return;
        }
        bosqichlar = [...stages]
          .sort((a, b) => a.from!.valueOf() - b.from!.valueOf())
          .map((stage) => ({
            from: stage.from!.format('MM.YYYY'),
            to: stage.to!.format('MM.YYYY'),
            count: Number(stageCount(stage, yashovchiSoniInput)),
            hozirgacha: isCurrentStage(stage)
          }));
      }
      if (
        aktType === 'odam_soni' &&
        !bosqichlar &&
        Number(yashovchiSoniInput) === Number(abonentData.house?.inhabitantCnt) &&
        !(await confirmDialog({
          title: "Yashovchi soni o'zgarmayapti",
          message: `Aniqlangan yashovchi soni (${yashovchiSoniInput} nafar) tizimdagi joriy yashovchi soni bilan bir xil. Haqiqatan ham shu holatda ariza yaratmoqchimisiz?`,
          confirmText: 'Ha, yaratish',
          color: 'warning'
        }))
      )
        return;
      if (aktType === 'gps' && gpsLocationRequired && !gpsLocation) {
        toast.error('GPS dalolatnomasi uchun abonent uyi joylashuvini xaritada belgilang');
        return;
      }
      setIsLoading(true);
      try {
        const newArizaData = (
          await api.post('/arizalar/create', {
            account_number: abonentData.accountNumber,
            abonentId: abonentData.id,
            fullName: abonentData.fullName,
            dublicat_account_number: aktType === 'dvaynik' ? abonentData2.accountNumber : undefined,
            document_type: aktType,
            akt_summasi: {
              total: aktSumma.total,
              withQQSTotal: aktSumma.totalWithQQS,
              withoutQQSTotal: aktSumma.withoutQQSTotal
            },
            current_prescribed_cnt: abonentData.house.inhabitantCnt,
            next_prescribed_cnt:
              aktType === 'viza'
                ? undefined
                : isNaN(Number(yashovchiSoniInput)) && aktType == 'gps'
                  ? abonentData.house.inhabitantCnt
                  : yashovchiSoniInput === '' || yashovchiSoniInput === null || yashovchiSoniInput === undefined
                    ? undefined
                    : Number(yashovchiSoniInput),
            photos: images.map((img) => img.document_id),
            recalculationPeriods,
            bosqichlar,
            muzlatiladi,
            location:
              aktType === 'gps' && gpsLocation
                ? {
                    lat: gpsLocation.lat,
                    lng: gpsLocation.lng,
                    source: gpsLocation.source,
                    accuracy: gpsLocation.accuracy,
                    mahallaId: abonentData.mahallaId || undefined,
                    mahallaName: abonentData.mahallaName || undefined,
                    streetName: abonentData.streetName || undefined,
                    homeNumber: abonentData.house?.homeNumber || undefined
                  }
                : undefined,
            shouldBeMoneyTransfer: aktType === 'dvaynik' ? shouldBeMoneyTransfer : false,
            dublicateRelation: aktType === 'dvaynik' ? dublicateRelation : undefined,
            moneyTransferAmount: aktType === 'dvaynik' && shouldBeMoneyTransfer ? Number(moneyTransferAmount) : 0
          })
        ).data;

        if (!newArizaData.ok) return toast.error(newArizaData.message);

        setAriza({
          ...newArizaData.ariza,
          dublicateRelation: aktType === 'dvaynik' ? dublicateRelation : undefined,
          moneyTransferAmount: aktType === 'dvaynik' && shouldBeMoneyTransfer ? Number(moneyTransferAmount) : 0,
          shouldBeMoneyTransfer: aktType === 'dvaynik' ? shouldBeMoneyTransfer : false
        });

        const mahallaData = (await api.get('/billing/get-mfy-by-id/' + abonentData.mahallaId)).data;
        setMahalla(mahallaData);

        // agarda ikkilamchi akt bo'lsa ikkilamchi kod joylashgan mahalla ma'lumotlari ham olinadi
        if (aktType === 'dvaynik') {
          const dublicatAccountMahalla = (await api.get('/billing/get-mfy-by-id/' + abonentData2.mahallaId)).data;
          setMahallaDublicat(dublicatAccountMahalla);
        }
        setShowPrintSection(true);
      } catch (error: any) {
        console.error(error.message);
      } finally {
        setIsLoading(false);
      }
    } finally {
      set({ isCreatingAriza: false });
    }
  },
  updateAbonentDataByAccNum: async (accountNumber: string, abonentData) => {
    const seq = ++abonentLookupSeq[abonentData];
    const isStale = () => seq !== abonentLookupSeq[abonentData];
    const setLookup = (lookup: AbonentLookupState) =>
      set((state) => ({ abonentLookup: { ...state.abonentLookup, [abonentData]: lookup } }));
    const notFoundKey = abonentData === 'main' ? 'notFoundInCompanyMain' : 'notFoundInCompanyDublicate';

    setLookup({ loading: true, error: null });
    set({ [notFoundKey]: false } as Partial<StoreState>);
    try {
      const { data } = await api.get('/billing/get-abonent-data-by-licshet/' + accountNumber);
      if (isStale()) return false;
      if (!data.ok) {
        if (abonentData === 'main') {
          set({ notFoundInCompanyMain: true, isGlobalAbonent: false });
        } else {
          set({ notFoundInCompanyDublicate: true, isGlobalAbonent2: false });
        }
        setLookup({ loading: false, error: data.message || 'Abonent ushbu tashkilot bazasida topilmadi' });
        return false;
      }

      let updateObj: any = {};
      if (abonentData === 'main') {
        updateObj = {
          abonentData: data.abonentData,
          notFoundInCompanyMain: false,
          isGlobalAbonent: false,
          globalCardDetails: null
        };
      } else if (abonentData === 'dublicate') {
        updateObj = {
          abonentData2: data.abonentData,
          notFoundInCompanyDublicate: false,
          isGlobalAbonent2: false,
          globalCardDetails2: null
        };

        // Ikkilamchi hisobga to'langan to'lovlarning umumiy yig'indisini hisoblash (Saldo oxiri emas!)
        if (data.abonentData?.id) {
          try {
            const dxjRes = await api.get('/billing/get-abonent-dxj-by-id', {
              params: { residentId: data.abonentData.id }
            });
            if (isStale()) return false;
            if (dxjRes.data?.ok && Array.isArray(dxjRes.data.rows)) {
              const totalPaymentsSum = dxjRes.data.rows.reduce((acc: number, r: any) => acc + (Number(r.allPaymentsSum) || 0), 0);
              set({
                moneyTransferAmount: totalPaymentsSum,
                shouldBeMoneyTransfer: totalPaymentsSum > 0
              });
            }
          } catch (e) {
            if (isStale()) return false;
            console.error('Error fetching dublicate payments sum:', e);
          }
        }
      }
      set(updateObj);
      setLookup(idleLookup);
      return true;
    } catch (err: any) {
      if (isStale()) return false;
      // Joriy bazada topilmasa (yoki xato bo'lsa) ham O'zbekiston bo'ylab izlash imkoni qolishi kerak
      set({ [notFoundKey]: true } as Partial<StoreState>);
      setLookup({
        loading: false,
        error: err?.response?.data?.message || err?.message || 'Abonentni yuklashda xatolik yuz berdi'
      });
      return false;
    }
  },

  cancelAbonentLookup: (target) => {
    abonentLookupSeq[target]++;
    set((state) => ({
      abonentLookup: { ...state.abonentLookup, [target]: idleLookup },
      ...(target === 'main' ? { notFoundInCompanyMain: false } : { notFoundInCompanyDublicate: false })
    }));
  },

  searchAllAccountsAbonent: async (accountNumber: string, targetType: 'main' | 'dublicate') => {
    const seq = abonentLookupSeq[targetType];
    const isStale = () => seq !== abonentLookupSeq[targetType];
    if (targetType === 'main') {
      set({ isSearchingGlobalMain: true });
    } else {
      set({ isSearchingGlobalDublicate: true });
    }

    try {
      // 1. Respublika barcha tashkilotlar bo'yicha residentId ni qidirish
      const res = await api.get('/abonents/abonent-id-from-all-accounts/' + accountNumber);
      const residentId = res.data?.id;
      if (isStale()) return false;

      if (!residentId) {
        toast.warning("O'zbekiston bo'ylab bunday hisob raqamli abonent topilmadi");
        return false;
      }

      // 2. To'liq kartani 2019-yil yanvardan hozirgacha tortish
      const today = dayjs();
      const periodFrom = '01.2019';
      const periodTo = today.endOf('month').format('MM.YYYY');

      const cardRes = await api.get(`/abonents/card/${residentId}`, {
        params: {
          lang: 'UZ',
          periodFrom,
          periodTo
        }
      });

      const cardData: AbonentCard = cardRes.data;
      if (isStale()) return false;
      if (!cardData) {
        toast.warning("Abonent kartasi ma'lumotlarini yuklab bo'lmadi");
        return false;
      }

      // 3. AbonentDetails formatiga moslashtirish (DHJ jadvali va mini-kartochka to'g'ri ko'rinishi uchun)
      const mappedAbonent: AbonentDetails = {
        ...defaultAbonentData,
        id: residentId,
        accountNumber: cardData.accountNumber,
        fullName: cardData.fullName || '—',
        companyName: cardData.companyName || 'Boshqa korxona',
        companyId: -1, // joriy kompaniyadan farqlash uchun
        mahallaName: cardData.mahallaName || '',
        streetName: cardData.streetName || '',
        phone: cardData.phone || '',
        contractDate: cardData.contractDate || '',
        contractNumber: cardData.contractNumber || '',
        balance: {
          period: cardData.currentPeriod || '',
          kSaldo: cardData.currentKSaldo || 0,
          frozenActAmount: 0,
          frozenDebtSettlement: 0,
          frozenKSaldo: 0,
          frozenNSaldo: 0,
          frozenRevenue: 0,
          rate: '',
          accrual: 0
        },
        house: {
          ...defaultAbonentData.house,
          homeNumber: cardData.flatNumber || '',
          inhabitantCnt: cardData.inhabitantCnt || 0
        }
      };

      // 4. DHJ jadvali qatorlarini to'liq 2019-hozirgacha balanceDtoList dan shakllantirish
      if (Array.isArray(cardData.balanceDtoList)) {
        const dhjMapped: dhjRow[] = cardData.balanceDtoList.map((row, i) => ({
          id: i + 1,
          davr: row.period,
          saldo_n: row.nSaldo,
          nachis: row.accrual,
          saldo_k: row.kSaldo,
          akt: row.actAmount,
          yashovchilar_soni: row.inhabitantCount,
          allPaymentsSum: (row.cashAmount || 0) + (row.eMoneyAmount || 0) + (row.munisAmount || 0) + (row.q1031Amount || 0)
        }));

        if (targetType === 'main') {
          set({
            abonentData: mappedAbonent,
            isGlobalAbonent: true,
            globalCardDetails: cardData,
            notFoundInCompanyMain: false,
            rowsDhjTable: dhjMapped
          });
        } else {
          const totalPaymentsSum = dhjMapped.reduce((acc, r) => acc + (Number(r.allPaymentsSum) || 0), 0);
          set({
            abonentData2: mappedAbonent,
            isGlobalAbonent2: true,
            globalCardDetails2: cardData,
            notFoundInCompanyDublicate: false,
            moneyTransferAmount: totalPaymentsSum,
            shouldBeMoneyTransfer: totalPaymentsSum > 0
          });
        }
      }

      set((state) => ({ abonentLookup: { ...state.abonentLookup, [targetType]: idleLookup } }));
      toast.success(`Abonent topildi: ${cardData.companyName || 'Boshqa hudud korxonasi'}`);
      return true;
    } catch (e: any) {
      if (isStale()) return false;
      toast.error(e?.response?.data?.message || e?.message || "O'zbekiston bo'ylab qidirishda xatolik yuz berdi");
      return false;
    } finally {
      if (targetType === 'main') {
        set({ isSearchingGlobalMain: false });
      } else {
        set({ isSearchingGlobalDublicate: false });
      }
    }
  },

  getAutoMobile: async (mahallaId) => {
    const { data } = await api.get('/automobiles', {
      params: {
        mahallaId
      }
    });
    set({ autoMobile: data[0] });
  },
  setShouldBeMoneyTransfer: (shouldBeMoneyTransfer: boolean) => set({ shouldBeMoneyTransfer })
}));

/** Yashovchi ko'chirish formasini tekshiradi: xato matni yoki null */
export function validateKuchirish(
  from: AbonentDetails,
  to: AbonentDetails,
  k: IKuchirishInput,
  isGlobalTo: boolean
): string | null {
  const soni = Number(k.soni);
  const fromCurrent = Number(from?.house?.inhabitantCnt) || 0;
  if (!from?.accountNumber) return 'Asosiy (kishi chiqib ketayotgan) hisob raqamini kiriting';
  if (!to?.accountNumber) return 'Qabul qiluvchi hisob raqamini kiriting';
  if (isGlobalTo) return "Qabul qiluvchi boshqa tashkilot abonenti: ko'chirish faqat bitta tashkilot ichida";
  if (from.accountNumber === to.accountNumber) return "Bir hisob raqamning o'ziga ko'chirib bo'lmaydi";
  if (!Number.isInteger(soni) || soni < 1) return "Ko'chiriladigan kishi soni kamida 1 bo'lishi kerak";
  if (soni > fromCurrent) return `Asosiy abonentda ${fromCurrent} kishi bor, ${soni} kishini ko'chirib bo'lmaydi`;
  if (!k.sabab.trim()) return "Ko'chirish sababini kiriting";
  if (!k.oy?.isValid()) return "Ko'chgan oyni kiriting";
  if (k.oy.isAfter(dayjs(), 'month')) return "Kelajakdagi oyni tanlab bo'lmaydi";
  return null;
}

/** Xato bo'lsa toast ko'rsatadi va false qaytaradi — so'rov yuborilmaydi */
function validateCreateAct({ aktType, inhabitantCnt }: { aktType: aktType; inhabitantCnt: string }): boolean {
  if (aktType === 'odam_soni' && (inhabitantCnt === '' || isNaN(parseInt(inhabitantCnt)))) {
    toast.error(t('createAbonentPetitionPage.notEnteredInhabitantCnt'));
    return false;
  }
  return true;
}

export function isActCalculationSummary(text?: string | null): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  return (
    trimmed.includes("Umumiy yig'indisi:") ||
    trimmed.includes('Umumiy:') ||
    /^Davr:\s*\d{2}\.\d{4}\s*-\s*\d{2}\.\d{4},\s*Summa:/m.test(trimmed) ||
    /^fuqaro arizasi\s+Davr:/i.test(trimmed)
  );
}

export function getCleanAsoslantiruvchi(comment?: string | null): string {
  if (!comment || isActCalculationSummary(comment)) return '';
  return comment;
}

/**
 * Ariza turi va abonent ma'lumotlaridan "Asoslantiruvchi ma'lumot" matnini tuzadi.
 * Matn isActCalculationSummary filtriga tushmasligi kerak (Davr:/Summa:/Umumiy: ishlatilmaydi).
 */
export function buildAutoAsoslantiruvchi({
  ariza,
  abonentData,
  abonentData2,
  aniqlanganYashovchiSoni,
  recalculationPeriods,
  muzlatiladi,
  vakil
}: {
  ariza: any;
  abonentData?: any;
  abonentData2?: any;
  aniqlanganYashovchiSoni?: number | string;
  recalculationPeriods?: IRecalculationPeriod[] | null;
  muzlatiladi?: boolean;
  vakil?: { relation?: string; fullName?: string };
}): string {
  if (!ariza) return '';

  const fmt = (d: any) => {
    const date = d ? new Date(d) : null;
    return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('ru-RU') : '';
  };

  const currentCnt = Number(abonentData?.house?.inhabitantCnt ?? ariza.current_prescribed_cnt);
  const nextCnt = Number(aniqlanganYashovchiSoni ?? ariza.next_prescribed_cnt);
  const hasCnt = Number.isFinite(currentCnt) && Number.isFinite(nextCnt);

  const periods = (recalculationPeriods || ariza.recalculationPeriods || []).filter((p: any) => p?.startDate || p?.endDate);
  const sortedStarts = periods.map((p: any) => new Date(p.startDate).getTime()).filter((n: number) => !Number.isNaN(n));
  const sortedEnds = periods.map((p: any) => new Date(p.endDate).getTime()).filter((n: number) => !Number.isNaN(n));
  const periodFrom = sortedStarts.length ? fmt(Math.min(...sortedStarts)) : '';
  const periodTo = sortedEnds.length ? fmt(Math.max(...sortedEnds)) : '';
  const periodText = periodFrom && periodTo ? `${periodFrom} yildan ${periodTo} yilgacha bo'lgan davr` : '';

  const sentences: string[] = [];

  if (vakil?.relation && vakil?.fullName) {
    sentences.push(`Ariza abonentning vakili — ${vakil.relation} ${vakil.fullName} tomonidan taqdim etildi.`);
  }

  switch (ariza.document_type) {
    case 'odam_soni':
      if (ariza.bosqichlar?.length) {
        const parts = (ariza.bosqichlar as IBosqich[]).map((b) => `${bosqichDavri(b)} ${b.count} nafar`);
        sentences.push(
          `Xonadonda joyida o'rganish o'tkazildi, MFY va qo'shnilar ma'lumotlariga ko'ra ${parts.join(', ')} shaxs istiqomat qilishi tasdiqlandi.`
        );
      } else if (hasCnt) {
        sentences.push(
          `Xonadonda joyida o'rganish o'tkazildi, MFY va qo'shnilar ma'lumotlariga ko'ra yagona elektron tizimda ${currentCnt} nafar ko'rsatilgan bo'lsa-da, amalda ${nextCnt} nafar shaxs istiqomat qilishi tasdiqlandi.`
        );
      } else {
        sentences.push(`Xonadonda joyida o'rganish o'tkazildi va amalda istiqomat qiluvchi shaxslar soni MFY ma'lumotlari bilan tasdiqlandi.`);
      }
      break;
    case 'death':
      sentences.push(
        `Xonadonda ro'yxatda turgan shaxsning vafot etganligi FHDYO organi tomonidan berilgan o'lim haqidagi guvohnoma nusxasi bilan tasdiqlanadi${
          hasCnt ? `, natijada yashovchilar soni ${currentCnt} nafardan ${nextCnt} nafarga kamayadi` : ''
        }.`
      );
      break;
    case 'viza':
      sentences.push(
        `Xonadonda ro'yxatda turgan shaxslarning O'zbekiston hududidan tashqarida bo'lganligi xorijga chiqish pasporti nusxalari va chegaradan o'tish muhrlari bilan tasdiqlanadi.`
      );
      break;
    case 'gps':
      sentences.push(
        `GPS monitoring tizimi ma'lumotlariga ko'ra${periodText ? ` ${periodText}da` : ''} maxsus transport abonent manziliga kirmagan va chiqindi olib ketilmagan.`
      );
      if (muzlatiladi) sentences.push(`Hozirgi kunda ham ushbu manzilga xizmat ko'rsatish imkoniyati mavjud emas, shu sababli hisob raqam muzlatiladi.`);
      break;
    case 'cancelContract': {
      const b = ariza.bekorQilish as ICancelContract | undefined;
      sentences.push(
        `O'rganish natijasida ${ariza.licshet} hisob raqamli abonent amalda mavjud emasligi (${(
          cancelContractReasons[b?.sabab as CancelContractReason] || cancelContractReasons.mahallada_mavjud_emas
        ).toLowerCase()}) aniqlandi. Shu sababli shartnomani bekor qilish, yashovchilar soni va saldoni 0 ga keltirish maqsadga muvofiq.`
      );
      break;
    }
    case 'yashovchi_kuchirish': {
      const k = ariza.kuchirish as IKuchirish | undefined;
      if (k) {
        sentences.push(
          `Xonadonda joyida o'rganish o'tkazildi, MFY ma'lumotlariga ko'ra ${k.shaxslar ? `${k.shaxslar} ` : ''}(${k.soni} nafar) ${k.oy} oyidan boshlab ${
            ariza.licshet
          } hisob raqamli xonadondan ${k.toLicshet} hisob raqamli xonadonga ko'chib o'tganligi (${k.sabab.toLowerCase()}) tasdiqlandi.`
        );
      }
      break;
    }
    case 'dvaynik': {
      const first = abonentData?.accountNumber || ariza.licshet;
      const second = abonentData2?.accountNumber || ariza.ikkilamchi_licshet;
      sentences.push(
        `${first && second ? `${first} va ${second} raqamli shaxsiy hisob raqamlari` : 'Shaxsiy hisob raqamlari'} bitta xonadonga ochilganligi (takroriy hisob raqam) aniqlandi${
          ariza.dublicateRelation ? `, abonentlar o'zaro "${ariza.dublicateRelation}" hisoblanadi` : ''
        }.`
      );
      break;
    }
    default:
      break;
  }

  if (periodText && ariza.document_type !== 'gps') {
    sentences.push(`Qayta hisob-kitob ${periodText} uchun amalga oshiriladi.`);
  }

  return sentences.join(' ');
}

/** Bosqich davrining matni: "05.2025 oyidan 05.2026 oyigacha" yoki "06.2026 oyidan boshlab" */
export function bosqichDavri(b: IBosqich): string {
  return b.hozirgacha ? `${b.from} oyidan boshlab` : `${b.from} oyidan ${b.to} oyigacha`;
}

export function buildActDescriptionFromPeriods(data?: IRecalculationPeriod[] | null): string {
  if (!data || !data.length) return '';

  function formatDateToMMYYYY(dateInput: any) {
    if (!dateInput) return '—';
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '—';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}.${year}`;
  }

  const details = data
    .map((item) => `Davr: ${formatDateToMMYYYY(item.startDate)} - ${formatDateToMMYYYY(item.endDate)}, Summa: ${item.total}`)
    .join('\n');

  const totalSum = data.reduce((total, item) => total + (Number(item.total) || 0), 0);

  return `${details}\n\nUmumiy yig'indisi: ${totalSum}`;
}

export const familyRelations = [
  'Xotini',
  'Eri',
  "O'g'li",
  'Qizi',
  'Otasi',
  'Onasi',
  'Akasi',
  'Ukasi',
  'Opasi',
  'Singlisi',
  'Bobosi',
  'Buvisi',
  'Kelini',
  'Kuyovi',
  'Nevarasi',
  'Ijarachi',
  'Yordamchi',
  'Qarindoshi',
  'Mehmon'
] as const;

export const dublicateRelations = [
  'Er-xotin',
  'Ota-bola',
  'Ona-bola',
  'Aka-uka',
  'Opa-singil',
  'Kelin-qaynona',
  'Kuyov-qaynota',
  'Bobo-nabira',
  'Buvi-nabira',
  "Bir oila a'zosi",
  'Bir xonadon egasi',
  'Ijarachi va uy egasi',
  'Boshqa qarindosh'
] as const;
