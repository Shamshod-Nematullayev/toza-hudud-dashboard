export interface Citizen {
  firstName: string;
  lastName: string;
  foreignCitizen: boolean;
  patronymic: string | null;
  inn: string | null;
  pnfl: string;
  passport: string;
  birthDate: string;
  passportGivenDate: string;
  passportIssuer: string;
  passportExpireDate: string;
  email: string | null;
  photo: string | null;
}

export interface House {
  cadastralNumber: string;
  flatNumber?: number;
  homeIndex?: number;
  homeNumber?: string;
  id: number;
  inhabitantCnt: number;
  latitude?: number;
  longitude?: number;
  miaInhabitantCnt?: null;
  temporaryCadastralNumber?: string;
  type: 'HOUSE' | 'APARTMENT';
}

export interface Balance {
  period: string;
  kSaldo: number;
  frozenActAmount: number;
  frozenDebtSettlement: number;
  frozenKSaldo: number;
  frozenNSaldo: number;
  frozenRevenue: number;
  rate: string;
  accrual: number;
}

export interface AbonentDetails {
  id: number;
  accountNumber: string;
  residentType: 'INDIVIDUAL';
  electricityAccountNumber: string;
  electricityCoato: string;
  companyId: number;
  streetId: number;
  mahallaId: number;
  contractNumber: string | null;
  contractDate: string;
  homePhone: string | null;
  active: boolean;
  description: string | null;
  phone: string | null;
  citizen: Citizen;
  house: House;
  balance: Balance;
}

export interface AbonentSearchQuery {
  accountNumber?: string;
  balanceFrom?: number;
  balanceTo?: number;
  cadastralNumber?: string;
  companyId: number;
  contractNumber?: string;
  districtId?: number;
  electricityAccountNumber?: string;
  flatNumber?: number;
  foreignCitizen?: boolean;
  fullName?: string;
  homeIndex?: number;
  homeNumber?: string;
  identified?: boolean;
  inhabitantCnt?: number;
  mahallaId?: number;
  page?: number;
  passport?: string;
  phone?: string;
  pnfl?: string;
  size?: 1 | 2 | 3 | 4 | 5 | 10 | 20 | 25 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 150 | 200 | 250 | 300;
  sort?: string;
  streetId?: number;
}

export interface IAbonent {
  id: number;
  fullName: string;
  accountNumber: string;
  mahallaId: number;
  mahallaName: string;
  streetId: number;
  streetName: string;
  homeNumber: string | null;
  homeIndex: number | null;
  flatNumber: number | null;
  inhabitantCnt: number;
  miaInhabitantCnt: number | null;
  electricityCoato: string;
  electricityAccountNumber: string;
  inn: string | null;
  pinfl: string;
  passport: string;
  birthDate: string;
  passportGivenDate: string;
  cadastralNumber: string;
  phone: string;
  homePhone: string | null;
  period: string;
  tariffId: number;
  lastPayDate: string;
  lastPaymentType: string;
  lastPaymentAmount: number;
  accrual: number;
  actAmount: number;
  incomes: number;
  contractDate: string | null;
  description: string | null;
  identified: boolean;
  identifiedDate: string;
  isFrozen: boolean;
  courtWarningStatus: string | null;
  bindStatus: string | null;
  mahallaBindStatus: string | null;
  foreignCitizen: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  nsaldoDt: number;
  nsaldoKt: number;
  ksaldoDt: number;
  ksaldoKt: number;
  nsaldo: number;
  ksaldo: number;
}

export interface IAct {
  createdByFullName: string | null;
  updatedByFullName: string | null;
  warnedByFullName: string | null;
  confirmedByFullName: string | null;
  canceledByFullName: string | null;
  residentFullName: string;
  inhabitantCnt: number;
  mahallaName: string;
  streetName: string;
  houseNumber: string;
  flatNumber: number | null;
  accountNumber: string;
  id: number;
  actNumber: string;
  actPackId: number;
  actPackName: string;
  actStatus: 'NEW' | 'CONFIRMED' | 'WARNED' | 'REJECTED';
  actType: 'DEBIT' | 'CREDIT';
  amount: number;
  amountWithQQS: number | null;
  amountWithoutQQS: number | null;
  canceledAt: string | null;
  canceledBy: number | null;
  cancellationConclusion: string | null;
  companyId: number;
  confirmedAt: string | null;
  confirmedBy: number | null;
  createdAt: string;
  createdBy: number;
  currentInhabitantCount: number | null;
  description: string;
  districtId: number;
  endPeriod: string | null;
  fileId: string;
  oldInhabitantCount: number | null;
  packType: string | null;
  regionId: number;
  residentId: number;
  startPeriod: string | null;
  updatedAt: string | null;
  updatedBy: number;
  warnedAt: string | null;
  warnedBy: number | null;
  warningConclusion: string | null;
}

export interface DHJRow {
  accountNumber: string;
  accrual: number;
  accrualType: 'DEFAULT';
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
  mes: number;
  munisAmount: number;
  nSaldo: number;
  organizationId: null;
  penaltyFee: number;
  period: string;
  q1031Amount: number;
  residentId: number;
  tariffId: number;
  allPaymentsSum: number;
  nSaldoDt: number;
  nSaldoKt: number;
  kSaldoDt: number;
  kSaldoKt: number;
}

export interface IActPack {
  companyName: string;
  createdByName: string;
  id: number;
  companyId: number;
  createdBy: number;
  createdByNameMigration: null;
  createdDate: string;
  description: string;
  districtId: number;
  fileId: null;
  isActive: boolean;
  isSpecialPack: boolean;
  name: string;
  packType: string;
  regionId: number;
  actsCount: number;
  actAmountSum: number;
  actDebitCount: number;
  actDebitAmountSum: number;
  actCreditCount: number;
  actCreditAmountSum: number;
  inventoryCount: number;
  inventoryAmountSum: number;
  nameAndPackType: string;
}

export const packNames = {
  viza: 'PASSPORT VIZA',
  odam_soni: 'ODAM SONI',
  dvaynik: 'IKKILAMCHI KODLAR',
  pul_kuchirish: "PUL KO'CHIRISH",
  death: "O'LIM GUVOHNOMA",
  gps: 'GPS XULOSA'
};
export const packTypes = {
  viza: 'SERVICE_NOT_PROVIDED',
  odam_soni: 'INVENTORY',
  dvaynik: 'CANCEL_CONTRACT',
  pul_kuchirish: 'SIMPLE',
  death: 'INVENTORY',
  gps: 'INVENTORY'
};

export interface IXatlovDocument {
  _id: string;
  companyId: number;
  date: Date;
  documentNumber: number;
  mahallaId: number;
  request_ids: string[];
}

export interface IMultiplyRequest {
  _id: string;
  KOD: number;
  YASHOVCHILAR: number;
  currentInhabitantCount: number;
  date: Date;
  from: {
    id: number;
    first_name: string;
    user_name: string;
  };
  confirm: boolean;
  mahallaId: string;
  abonentId: string;
  mahallaName: string;
  fio: string;
  actId: string;
  document_id: string;
  isCancel: boolean;
  companyId: number;
}

export interface IMahalla {
  id: number;
  name: string;
  companyId: number;
  reja: number;
  biriktirilganNazoratchi?: {
    inspector_name: string;
    inspactor_id: number;
  };
  groups: any[];
  ommaviy_shartnoma?: any;
  sektor?: string;
  mfy_rais_name: string;
  mfy_rais_phone?: string;
  hokim_yordamchi_name?: string;
  hokim_yordamchi_phone?: string;
  yoshlar_yetakchi_name?: string;
  yoshlar_yetakchi_phone?: string;
  xotinqizlar_name?: string;
  xotinqizlar_phone?: string;
  uchastkavoy_name?: string;
  uchastkavoy_phone?: string;
  shaxsi_tasdiqlandi_reja?: number;
  abarotka_berildi?: boolean;
  publicOfferFileId?: string;
  publicOfferFileName?: string;
  publicOfferFileUrl?: string;
  publicOfferFileUpdatedAt?: Date;
  geoZoneBiriktirilganKochalar?: any[];
  created_at: Date;
}

export interface IRowDhj {
  accountNumber: string;
  accrual: number;
  actAmount: number;
  allPaymentsSum: number;
  cashAmount: number;
  eMoneyAmount: number;
  frozenActAmount: number;
  frozenDebtSettlement: any;
  frozenKSaldo: number;
  frozenNSaldo: number;
  frozenRevenue: number;
  god: number;
  id: number;
  inhabitantCount: number;
  kSaldo: number;
  kSaldoDt: number;
  kSaldoKt: number;
  mes: number;
  munisAmount: number;
  nSaldo: number;
  nSaldoDt: number;
  nSaldoKt: number;
  organizationId: any;
  penaltyFee: number;
  period: string;
  q1031Amount: number;
  residentId: number;
  tariffId: any;
}

export interface ITariff {
  month: number;
  year: number;
  hisoblandi: number;
  withQQS: number;
}

export interface IAutomobile {
  active: boolean;
  automobileNumber: string;
  automobileNumberAndModel: string;
  automobileTypeId: number;
  companyId: number;
  companyName: string;
  description: string;
  districtId: number;
  driverIds: { fullName: string; id: number }[];
  id: number;
  mkub: number;
  regionId: number;
  trackerModelId: number;
  trackerSerialNumber: string | null;
  trackerSimcardNumber: string | null;
  wialonId: number;
}
