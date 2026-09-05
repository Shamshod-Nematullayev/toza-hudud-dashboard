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
  yashovchilar_soni?: number;
  periodType?: 'debitor' | 'kreditor';
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

export type aktType = 'odam_soni' | 'dvaynik' | 'gps' | 'death' | 'viza' | 'cancelContract' | null;

export interface ImgType {
  file: File;
  document_id: string;
}

interface StoreActionsState {
  setAktSumma: (aktSumma: IAktSumma) => void;
  setHisoblandiJadval: (hisoblandiJadval: IHisoblandiItem[]) => void;
  setAktType: (aktType: aktType | 'cancelContract') => void;
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
  setInitialState: () => void;
  createAriza: () => void;
  updateAbonentDataByAccNum: (accountNumber: string, abonentData: 'main' | 'dublicate') => Promise<boolean>;
  searchAllAccountsAbonent: (accountNumber: string, targetType: 'main' | 'dublicate') => Promise<boolean>;
  getAutoMobile: (mahallaId: number) => void;
  setAbonentCardOpenState: (abonentCardOpenState: boolean) => void;
  setGlobalAbonentAccountNumber: (globalAbonentAccountNumber: string) => void;
  setShouldBeMoneyTransfer: (shouldBeMoneyTransfer: boolean) => void;
  setDublicateRelation: (dublicateRelation: string) => void;
  setMoneyTransferAmount: (moneyTransferAmount: number | string) => void;
  setIsGlobalAbonent: (isGlobal: boolean) => void;
  setIsGlobalAbonent2: (isGlobal: boolean) => void;
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
  ariza: any;
  mahalla: IMahalla;
  mahallaDublicat: any;
  recalculationPeriods: IRecalculationPeriod[];
  yashovchiSoniInput: string;
  pasteImageDialogOpen: boolean;
  images: ImgType[];
  muzlatiladi: boolean;
  hisoblandiJadval: IHisoblandiItem[];
  aktSumma: IAktSumma;
  autoMobile: AutoMobile | null;
}

const initialStoreDataState: StoreDataState = {
  shouldBeMoneyTransfer: true,
  dublicateRelation: '',
  moneyTransferAmount: 0,
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
  aktSumma: { total: 0, totalWithQQS: 0, withoutQQSTotal: 0 },
  ariza: {},
  hisoblandiJadval: [],
  images: [],
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
  ui: { abonentCardOpenState: false, globalAbonentAccountNumber: '' }
};

type StoreState = StoreDataState & StoreActionsState;

export const useStore = create<StoreState>((set, get) => ({
  ...initialStoreDataState,
  ui: { abonentCardOpenState: false, globalAbonentAccountNumber: '' },
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
  setAktType: (aktType) => set({ aktType }),
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
  setInitialState: () => set(initialStoreDataState),
  setHisoblandiJadval: (hisoblandiJadval: IHisoblandiItem[]) => set({ hisoblandiJadval }),
  setAktSumma: (aktSumma: IAktSumma) => set({ aktSumma }),
  createAriza: async () => {
    const {
      aktType,
      abonentData,
      abonentData2,
      aktSumma,
      yashovchiSoniInput,
      recalculationPeriods,
      images,
      muzlatiladi,
      shouldBeMoneyTransfer,
      dublicateRelation,
      moneyTransferAmount,
      setAriza,
      setMahalla,
      setMahallaDublicat,
      setShowPrintSection
    } = get();
    const { setIsLoading } = useLoaderStore.getState();
    validateCreateAct({ aktType, inhabitantCnt: yashovchiSoniInput });
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
          next_prescribed_cnt: isNaN(Number(yashovchiSoniInput)) && aktType == 'gps' ? abonentData.house.inhabitantCnt : yashovchiSoniInput,
          comment: generateSummary(recalculationPeriods as IPeriod[]),
          photos: images.map((img) => img.document_id),
          recalculationPeriods,
          muzlatiladi,
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
  },
  updateAbonentDataByAccNum: async (accountNumber: string, abonentData) => {
    try {
      const { data } = await api.get('/billing/get-abonent-data-by-licshet/' + accountNumber);
      if (!data.ok) {
        if (abonentData === 'main') {
          set({ notFoundInCompanyMain: true, isGlobalAbonent: false });
        } else {
          set({ notFoundInCompanyDublicate: true, isGlobalAbonent2: false });
        }
        toast.error(data.message || 'Abonent ushbu tashkilot bazasida topilmadi');
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
            if (dxjRes.data?.ok && Array.isArray(dxjRes.data.rows)) {
              const totalPaymentsSum = dxjRes.data.rows.reduce(
                (acc: number, r: any) => acc + (Number(r.allPaymentsSum) || 0),
                0
              );
              set({ moneyTransferAmount: totalPaymentsSum });
            }
          } catch (e) {
            console.error('Error fetching dublicate payments sum:', e);
          }
        }
      }
      set(updateObj);
      return true;
    } catch (err: any) {
      if (abonentData === 'main') {
        set({ notFoundInCompanyMain: true });
      } else {
        set({ notFoundInCompanyDublicate: true });
      }
      toast.error(err?.response?.data?.message || err?.message || 'Abonentni yuklashda xatolik yuz berdi');
      return false;
    }
  },

  searchAllAccountsAbonent: async (accountNumber: string, targetType: 'main' | 'dublicate') => {
    if (targetType === 'main') {
      set({ isSearchingGlobalMain: true });
    } else {
      set({ isSearchingGlobalDublicate: true });
    }

    try {
      // 1. Respublika barcha tashkilotlar bo'yicha residentId ni qidirish
      const res = await api.get('/abonents/abonent-id-from-all-accounts/' + accountNumber);
      const residentId = res.data?.id;

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
        companyName: cardData.companyName || "Boshqa korxona",
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
          set({
            abonentData2: mappedAbonent,
            isGlobalAbonent2: true,
            globalCardDetails2: cardData,
            notFoundInCompanyDublicate: false
          });
        }
      }

      toast.success(`Abonent topildi: ${cardData.companyName || "Boshqa hudud korxonasi"}`);
      return true;
    } catch (e: any) {
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

function validateCreateAct({ aktType, inhabitantCnt }: { aktType: aktType; inhabitantCnt: string }) {
  if (aktType === 'odam_soni' && (inhabitantCnt === '' || isNaN(parseInt(inhabitantCnt)))) {
    return toast.error(t('createAbonentPetitionPage.notEnteredInhabitantCnt'));
  }
}

function generateSummary(data: IPeriod[]) {
  function formatDateToMMYYYY(dateString: string) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}.${year}`;
  }
  // Har bir elementni matn shaklida formatlash
  const details = data
    .map(
      (item) =>
        `Davr: ${formatDateToMMYYYY(item.startDate.toString())} - ${formatDateToMMYYYY(item.endDate.toString())}, Summa: ${item.total}`
    )
    .join('\n'); // Har bir elementni yangi qatorga joylash

  // Umumiy yig'indini hisoblash

  const totalSum = data.reduce((total, item) => total + item.total, 0);

  // Yakuniy matnni yaratish
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
