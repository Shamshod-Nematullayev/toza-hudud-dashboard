import { Dayjs } from 'dayjs';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';
import { AbonentDetails, Balance, IAbonent } from 'types/billing';
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
  period: string;
  withQQSTotal: number;
  withoutQQSTotal: number;
  total: number;
  startDate: Dayjs;
  endDate: Dayjs;
}

export interface IMahalla {
  data: {
    id?: number;
    name?: string;
    mfy_rais_name?: string;
    biriktirilganNazoratchi?: any;
  };
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
// export interface IAbonentData {
//   id: number;
//   accountNumber: string;
//   fullName: string;
//   balance: Balance;
//   mahallaName: string;
//   mahallaId: number;
//   streetName: string;
//   house: {
//     cadastralNumber: string;
//     homeIndex: string;
//     homeNumber: string;
//     inhabitantCnt: number;
//   };
//   citizen: {
//     passport: string;
//     pnfl: string;
//     phone: string;
//   };
// }

export const defaultAbonentData: AbonentDetails = {
  id: 0,
  accountNumber: '',
  fullName: '',
  balance: {
    accrual: 0,
    frozenActAmount: 0,
    frozenDebtSettlement: 0,
    frozenKSaldo: 0,
    frozenNSaldo: 0,
    frozenRevenue: 0,
    kSaldo: 0,
    period: '',
    rate: ''
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

export type aktType = 'odam_soni' | 'dvaynik' | 'gps' | 'death' | 'viza' | null;

export interface ImgType {
  file: File;
  document_id: string;
}

interface StoreState {
  aktType: aktType;
  showPrintSection: boolean;
  rowsDhjTable: dhjRow[];
  abonentData: AbonentDetails;
  abonentData2: AbonentDetails;
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
  setAktSumma: (aktSumma: IAktSumma) => void;
  setHisoblandiJadval: (hisoblandiJadval: IHisoblandiItem[]) => void;
  setAktType: (aktType: aktType) => void;
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
  updateAbonentDataByAccNum: (accountNumber: string, abonentData: 'main' | 'dublicate') => void;
  autoMobile: AutoMobile | null;
  getAutoMobile: (mahallaId: number) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  aktType: null,
  setAktType: (aktType: aktType) => set({ aktType }),
  showPrintSection: false,
  setShowPrintSection: (showPrintSection: boolean) => set({ showPrintSection: showPrintSection }),
  rowsDhjTable: [],
  setRowsDhjTable: (rowsDhjTable: dhjRow[]) => set({ rowsDhjTable }),
  abonentData: defaultAbonentData,
  setAbonentData: (data) => set({ abonentData: data }),
  abonentData2: defaultAbonentData,
  setAbonentData2: (data) => set({ abonentData2: data }),
  ariza: {},
  setAriza: (data) => set({ ariza: data }),
  mahalla: {
    data: {},
    company: {
      id: 0,
      name: '',
      locationName: '',
      manager: { fullName: '' },
      billingAdminName: ''
    }
  },
  setMahalla: (mfy) => set({ mahalla: mfy }),
  mahallaDublicat: {},
  setMahallaDublicat: (mfy) => set({ mahallaDublicat: mfy }),
  recalculationPeriods: [],
  setRecalculationPeriods: (data: IRecalculationPeriod[]) => set({ recalculationPeriods: data }),
  yashovchiSoniInput: '',
  setYashovchiSoniInput: (data) => set({ yashovchiSoniInput: String(data) }),
  pasteImageDialogOpen: false,
  setPasteImageDialogOpen: (pasteImageDialogOpen) => set({ pasteImageDialogOpen }),
  images: [],
  setImages: (images) => set({ images }),
  muzlatiladi: false,
  setMuzlatiladi: (muzlatiladi) => set({ muzlatiladi }),
  setInitialState: () =>
    set({
      aktType: null,
      showPrintSection: false,
      rowsDhjTable: [],
      abonentData: defaultAbonentData,
      abonentData2: defaultAbonentData,
      ariza: {},
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
      images: [],
      muzlatiladi: false
    }),
  hisoblandiJadval: [],
  setHisoblandiJadval: (hisoblandiJadval: IHisoblandiItem[]) => set({ hisoblandiJadval }),
  aktSumma: { total: 0, totalWithQQS: 0, withoutQQSTotal: 0 },
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
          muzlatiladi
        })
      ).data;

      if (!newArizaData.ok) return toast.error(newArizaData.message);

      setAriza(newArizaData.ariza);

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
    const { data } = await api.get('/billing/get-abonent-data-by-licshet/' + accountNumber);
    if (!data.ok) {
      toast.error(data.message);
      return;
    }
    let updateObj: { abonentData: any } | { abonentData2: any } | {} = {};
    if (abonentData === 'main') {
      updateObj = {
        abonentData: data.abonentData
      };
    } else if (abonentData === 'dublicate') {
      updateObj = {
        abonentData2: data.abonentData
      };
    }
    set(updateObj);
  },
  autoMobile: null,
  getAutoMobile: async (mahallaId) => {
    const { data } = await api.get('/automobiles', {
      params: {
        mahallaId
      }
    });
    set({ autoMobile: data[0] });
  }
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
