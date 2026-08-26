// ─── Tiplar ───────────────────────────────────────────────────────

export type DebitorStatus = 'data_needs_attention' | 'ready_to_block' | 'blocked' | 'resolved';

// prettier-ignore
export type PhoneStatus =
  | 'new'                 // Yangi yoki o'zgargan (hali tekshirilmagan)
  | 'confirmed'           // primaryPhone tasdiqlangan ishonchli
  | 'checking'            // SMS orqali tekshirilmoqda
  | 'needs_het_sync'      // Chiqindi bazasida bor HET ga kiritish kerak
  | 'not_found' // Hech qayerda yo'q — xatlov kerak

// ─── Konfiguratsiyalar (Prettier buzmasligi uchun inline) ──────────

// prettier-ignore
export const STATUS_CFG: Record<DebitorStatus, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  data_needs_attention: { label: '⏳ Ma\'lumotlarni tekshirish kerak', color: 'error' },
  ready_to_block:    { label: '☑️ Bloklanishi Kutilmoqda',         color: 'success' },
  blocked:           { label: '✅ Bloklangan',                     color: 'success' },
  resolved:          { label: '✅ Yechilgan debitorlar',           color: 'success' },
};

// prettier-ignore
export const PHONE_CFG: Record<PhoneStatus, { label: string; color: 'primary' | 'error' | 'warning' | 'success' | 'secondary' }> = {
  new:                   { label: '📱 Yangi / Tekshirilmagan',        color: 'primary' },
  checking:              { label: '🔍 Tekshirilmoqda',                color: 'warning' },
  needs_het_sync:        { label: '🔄 HET sinxronizatsiya kerak',     color: 'secondary' },
  not_found:             { label: '❌ Topilmagan',                    color: 'error' },
  confirmed:             { label: '✅ Tasdiqlangan',                    color: 'success' }
};

export type HetAccountStatus = 'new' | 'changed' | 'confirmed' | 'not_found';

export const HET_ACCOUNT_CFG: Record<HetAccountStatus, { label: string; color: 'success' | 'error' | 'warning' | 'primary' }> = {
  confirmed: { label: '⚡ Tasdiqlangan', color: 'success' },
  not_found: { label: '⚠️ Topilmadi', color: 'error' },
  new: { label: '🆕 Yangi', color: 'primary' },
  changed: { label: "🔄 O'zgargan", color: 'warning' }
};

export interface Stat {
  count: number;
  summ: number;
}

export interface DebitorStats {
  totalDebtors: Stat;
  debt_identified: Stat;
  no_het_account: Stat;
  sms_sent: Stat;
  awaiting_het_sync: Stat;
  ready_to_block: Stat;
  blocked: Stat;
  resolved: Stat;
  phoneStatus: {
    new: Stat;
    confirmed_previously: Stat;
    confirmed_this_cycle: Stat;
    checking: Stat;
    het_synced: Stat;
    needs_het_sync: Stat;
    not_found: Stat;
  };
}

export interface Debitor {
  _id: string;
  accountNumberEtk: string;
  accountNumber: string;
  residentId: number;
  fullName: string;
  debtAmount: number;
  debtMonths: number;
  status: DebitorStatus;
  hetAccountStatus: HetAccountStatus;
  primaryPhone: string | null;
  phoneStatus: PhoneStatus;
  primaryPhoneSource: string | null;
  companyId: number;
  __v: 0;
  createdAt: string;
  updatedAt: string;
}
