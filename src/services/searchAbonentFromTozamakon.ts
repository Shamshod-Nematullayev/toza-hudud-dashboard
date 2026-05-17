import { AbonentSearchQuery } from 'types/billing';
import api from 'utils/api';

export interface IAbonent {
  id: number;
  fullName: string;
  accountNumber: string;
  replacedAccountNumber: string | null;
  mahallaId: number;
  mahallaName: string;
  streetId: number;
  streetName: string;
  homeNumber: string;
  homeIndex: string | null;
  flatNumber: string | null;
  inhabitantCnt: number;
  miaInhabitantCnt: number;
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
  regionName: string | null;
  districtName: string | null;
  deletedAt: string | null;
  deletedBy: string | number | null;
  nsaldoDt: number;
  nsaldoKt: number;
  ksaldoDt: number;
  ksaldoKt: number;
  nsaldo: number;
  ksaldo: number;
}

export interface SearchAbonentResponse {
  content: IAbonent[];
  totalPages: number;
  totalElements: number;
}

export async function searchAbonentFromTozamakon(filters: AbonentSearchQuery): Promise<SearchAbonentResponse> {
  return await api.get('/abonents/tozamakon', { params: filters });
}
