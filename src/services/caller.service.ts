import { AxiosInstance } from 'axios';

// --- TYPES ---

export type CallStatus = 'new' | 'pending' | 'unanswered' | 'rejected' | 'completed';
export type CallResult = 'warned' | 'wrongNumber' | 'unanswered' | 'badNumber';
export type Priority = 'low' | 'medium' | 'high';

export interface ICallHistory {
  date: Date;
  result: CallResult;
  userId: {
    _id: string;
    fullName: string;
  };
  phoneNumber: string;
  comment: string;
}

export interface ICallWarning {
  _id: string;
  residentId: number;
  accountNumber: string;
  status: CallStatus;
  pendingUserId?: string | null;
  lastCalledAt?: string | Date;
  nextCallAt?: string | Date;
  attemptCount: number;
  priority: Priority;
  calls: ICallHistory[];
}

export interface ICallStats {
  timeline: {
    time: string;
    data: Record<CallResult, number>;
    total: number;
  }[];
  summary: {
    totalCalls: number;
    uniqueResidents: number;
    completed: number;
    rejected: number;
    unanswered: number;
  };
}

export interface IOperatorStats {
  operatorId: string;
  name: string;
  totalCalls: number;
  warned: number;
  unanswered: number;
  wrongNumbers: number;
  successRate: number;
}

export interface ImportStats {
  requested: number;
  imported: number;
  alreadyExisted: number;
  notFoundInAbonents: number;
}

// --- SERVICE ---

export const createCallWarningsService = (axios: AxiosInstance) => {
  const prefix = '/caller';

  return {
    /**
     * Reja asosida residentId'larni ommaviy import qilish
     */
    import: async (residentIds: number[]): Promise<{ ok: boolean; content: ICallWarning[]; stats: ImportStats }> => {
      const { data } = await axios.post<{ ok: boolean; content: ICallWarning[]; stats: any }>(`${prefix}/import`, residentIds);
      return data;
    },

    /**
     * Bitta dona call warning yaratish
     */
    create: async (callWarning: { residentId: number; accountNumber: string; priority: Priority }) => {
      const { data } = await axios.post<{ ok: boolean; content: ICallWarning }>(`${prefix}`, callWarning);
      return data;
    },

    /**
     * Barcha monitoring yozuvlarini filtrlar bilan olish
     */
    getAll: async (params?: {
      page?: number;
      limit?: number;
      sortDirection?: string;
      sortField?: string;
      status?: CallStatus | string;
      priority?: Priority | string;
      accountNumber?: string;
    }) => {
      const { data } = await axios.get<{ ok: boolean; content: ICallWarning[]; meta: { total: number; page: number; limit: number } }>(
        prefix,
        { params }
      );
      return data;
    },

    /**
     * Navbatdagi eng muhim qo'ng'iroqni olish (Auto-claim)
     */
    getNext: async () => {
      const { data } = await axios.get<{ ok: boolean; content?: ICallWarning; message?: string }>(`${prefix}/next`);
      return data;
    },

    /**
     * Abonentni qo'lda band qilish
     */
    claim: async (id: string) => {
      const { data } = await axios.patch<{ ok: boolean; content: ICallWarning }>(`${prefix}/${id}/claim`);
      return data;
    },

    /**
     * Qo'ng'iroq natijasini saqlash
     */
    setResult: async (id: string, payload: { result: CallResult; comment: string; phoneNumber?: string }) => {
      const { data } = await axios.patch<{ ok: boolean; content: ICallWarning }>(`${prefix}/${id}/result`, payload);
      return data;
    },

    /**
     * Treyding dashboardi uchun vaqt bo'yicha statistika
     */
    getDailyStats: async (fromDate: string, toDate: string, type: 'daily' | 'monthly') => {
      const { data } = await axios.get<{ ok: boolean; content: ICallStats }>(`${prefix}/stats/summary`, {
        params: { fromDate, toDate, type }
      });
      return data;
    },

    /**
     * Operatorlar (xodimlar) samaradorligi reytingi
     */
    getOperatorStats: async (fromDate: string, toDate: string) => {
      const { data } = await axios.get<{ ok: boolean; content: IOperatorStats[] }>(`${prefix}/stats/operators`, {
        params: { fromDate, toDate }
      });
      return data;
    },

    /**
     * Bitta abonent tarixini ID orqali ko'rish
     */
    getById: async (id: string) => {
      const { data } = await axios.get<{ ok: boolean; content: ICallWarning }>(`${prefix}/${id}`);
      return data;
    }
  };
};
