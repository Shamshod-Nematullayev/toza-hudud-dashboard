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
};

export type MurojaatFormValues = {
  mahallaId: string;
  residentId: string;
  dueDate: string;
  assignedTo: string;
  status: MurojaatStatus;
};
