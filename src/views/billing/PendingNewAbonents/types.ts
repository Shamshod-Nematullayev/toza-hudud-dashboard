export interface ICitizen {
  pnfl: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  passport?: string;
  photo?: string | null;
  birthDate?: string;
  passportGivenDate?: string;
  passportIssuer?: string;
  passportExpireDate?: string;
  foreignCitizen?: boolean;
}

export interface INewAbonentItem {
  _id: string;
  citizen: ICitizen;
  mahallaId: string;
  mahallaName: string;
  streetName: string;
  streetId: string;
  inhabitant_cnt: number;
  senderId: number;
  companyId: number;
  status: 'pending' | 'document_created' | 'approved' | 'rejected' | 'compaleted';
  nazoratchi_id?: string;
  inspector_name?: string;
  abonent_name?: string;
  accountNumber?: string;
  residentId?: number;
  cadastr?: string;
  etkCustomerCode?: string;
  etkCaoto?: string;
  kadastr_baza_not_worked?: boolean;
  telegramMessageId?: string;
  cancelReason?: string;
  canceledBy?: string;
  cancelDate?: string;
  confirmedBy?: string;
  confirmDate?: string;
  description?: string;
  document_type?: 'bildirishnoma' | 'dalolatnoma';
  document_number?: number;
  document_date?: string;
  debtMonths?: number;
  nSaldo?: number;
  calculatedDebtWords?: string;
  comment?: string;
  scannedDocumentUrl?: string;
  documentCreatedBy?: string;
  documentCreatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStats {
  total: number;
  pending: number;
  document_created?: number;
  approved: number;
  rejected: number;
}

export interface IEtkAccount {
  personalAccount: string;
  coatoCode?: string;
  fullName?: string;
  address?: string;
  mahallaName?: string;
  cadastralNumber?: string;
}

export interface IApprovePayload {
  ignoreCadastr?: boolean;
  cadastr?: string | null;
  nSaldo?: number;
  debtMonths?: number;
  etkCustomerCode?: string | null;
  etkCaoto?: string | null;
  inhabitant_cnt?: number;
}

export interface IManualCreatePayload {
  citizen: ICitizen;
  mahallaId: number | string;
  mahallaName: string;
  streetId: number | string;
  streetName: string;
  inhabitant_cnt: number;
  cadastr?: string | null;
  etkCustomerCode?: string | null;
  etkCaoto?: string | null;
  debtMonths?: number;
  nSaldo?: number;
}
