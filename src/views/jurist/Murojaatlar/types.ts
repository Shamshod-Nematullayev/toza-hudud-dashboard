export type MurojaatStatus = 'open' | 'closed';

export type InspectorOption = {
  _id: string;
  id?: number;
  name: string;
  phone?: string;
  nowUser?: string;
};

export type MurojaatRow = {
  _id: string;
  mahallaId: number;
  residentId?: number;
  fileName?: string;
  murojaatFileId?: string;
  yopishXujjatiFileId?: string;
  dueDate: string | Date;
  status: MurojaatStatus;
  companyId: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  assignedTo?:
    | string
    | {
        _id?: string;
        id?: number;
        name?: string;
        phone?: string;
        nowUser?: string;
      };
      
  hujjatKodi?: string;
  hujjatRaqami?: string;
  ijroMuddati?: string;
  murojaatRaqami?: string;
  operator?: string;
  murojaatVaqti?: string;
  muallif?: string;
  manzil?: string;
  demografiya?: string;
  telefon?: string;
  qoshimchaTelefon?: string;
  mazmuni?: string;
};

export type MurojaatFormValues = {
  mahallaId: string;
  residentId: string;
  dueDate: string;
  assignedTo: string;
  status: MurojaatStatus;
  
  hujjatKodi?: string | null;
  hujjatRaqami?: string | null;
  ijroMuddati?: string | null;
  murojaatRaqami?: string | null;
  operator?: string | null;
  murojaatVaqti?: string | null;
  muallif?: string | null;
  manzil?: string | null;
  demografiya?: string | null;
  telefon?: string | null;
  qoshimchaTelefon?: string | null;
  mazmuni?: string | null;
};
