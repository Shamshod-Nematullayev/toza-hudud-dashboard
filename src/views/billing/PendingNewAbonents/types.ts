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
  status: 'pending' | 'approved' | 'rejected' | 'compaleted';
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
  createdAt: string;
  updatedAt: string;
}

export interface IStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
