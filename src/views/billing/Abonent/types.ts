export interface IAbonentPetition {
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

export type AbonentCard = {
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

export interface PermamentPerson {
  DateBirth: string;
  Id: string;
  Person: string;
  Pinpp: string;
  RegistrationDate: string;
  Sex: string;
  Status: number;
}

export interface House {
  cadastralNumber: string;
  fullAddress: string;
  houseNumber: string;
  houseType: string;
  isLegal: boolean;
  numberOfOwners: number;
  objectType: string;
  streetName: string;
  owners: {
    name: string;
    passport: string;
    pinfl: string;
    type: string;
  }[];
}

export interface PermamentsResponse {
  Data: {
    PermanentPersons: PermamentPerson[] | null;
    TemproaryPersons: PermamentPerson[] | null;
  } | null;
  house: House | null;
}

export interface HETErrorResponse {
  code: 'ACCOUNT.NOT.FOUND';
  message: string;
  time: string;
}

export interface HETSuccessResponse {
  address: string;
  cadastralNumber: string;
  coatoCode: string;
  fullName: string;
  inn: string;
  mahallaName: string;
  pasportNumber: string;
  personalAccount: string;
  phone: string;
  pinfl: string;
}

export type HetAbonentResponse = HETErrorResponse | HETSuccessResponse;

export interface CadastrDetais {
  cadastralNumber: string | null;
  fullAddress: string | null;
  houseNumber: string | null;
  houseType: string | null;
  isLegal: boolean;
  numberOfOwners: number;
  objectType: string | null;
  owners: {
    inn: string;
    name: string;
    passport: string;
    percent: string;
    pinfl: string;
    type: string;
  }[];
  registeredDate: string | null;
  streetName: string | null;
}
export interface BlockReport {
  blockDate: string;
  blockStatus: 'BLOCK';
  warningCreatedAt: string | null;
  warningStatus: string | null;
  warningDebt: number | null;
  blockDebt: number;
}

interface Place {
  Id: number;
  Value: string;
  Guid?: string;
  IdValue?: string;
}

export interface MvdAddress {
  PermanentRegistration: {
    Address: string;
    Cadastre: string;
    Country: Place;
    District: Place;
    Maxalla: Place;
    Region: Place;
    Street: Place;
    RegistrationDate: string; // ISO string
    dateTime: string; // ISO string
  };
}
