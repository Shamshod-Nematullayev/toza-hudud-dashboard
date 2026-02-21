import { IAct } from './billing';

export const arizaDocumentTypes = ['dvaynik', 'odam_soni', 'viza', 'death', 'gps', 'pul_kuchirish'] as const;

export interface INeedMoneyTransfer {
  accountNumber: string;
  amount: number;
  residentId: number;
  fullName: string;
}

export interface IAriza {
  _id: string;
  fio: string;
  abonentId: number;
  asosiy_licshet: string;
  ikkilamchi_licshet: string;
  needMonayTransferActs: INeedMoneyTransfer[];
  sana: Date;
  document_type: (typeof arizaDocumentTypes)[number];
  document_number: number;
  licshet: string;
  comment: string;
  aktSummasi: number;
  aktSummCounts: {
    total: number;
    withoutQQSTotal: number;
  };
  current_prescribed_cnt: number;
  next_prescribed_cnt: number;
  status: 'yangi' | 'qabul qilindi' | 'tasdiqlangan' | 'bekor qilindi' | 'akt_kiritilgan' | 'qayta_akt_kiritilgan';
  photos: string[];
  recalculationPeriods: any[];
  muzlatiladi: boolean;
  is_canceled: boolean;
  acceptedDate: Date;
  akt_date: Date;
  canceling_description: string;
  akt_pachka_id: number;
  akt_id: number;
  actStatus: 'NEW' | 'CONFIRMED' | 'WARNED' | 'REJECTED';
  aktInfo: IAct;
  tempPhotos: string[];
  actHistory: any[];
  companyId: number;
  version: number;
}
