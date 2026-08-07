// ─── Tiplar ───────────────────────────────────────────────────────

export type DebitorStatus = 'data_needs_attention' | 'ready_to_block' | 'blocked' | 'resolved';

// prettier-ignore
export type PhoneStatus =
  | 'new'                 // Hali hech narsa qilinmagan
  | 'changed'             // Telefon raqami o'zgargan
  | 'confirmed'           // primaryPhone tasdiqlangan ishonchli
  | 'checking'            // SMS orqali tekshirilmoqda
  | 'needs_het_sync'      // Chiqindi bazasida bor HET ga kiritish kerak
  | 'not_found' // Hech qayerda yo'q — xatlov kerak

// ─── Konfiguratsiyalar (Prettier buzmasligi uchun inline) ──────────

// prettier-ignore
export const STATUS_CFG: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'default' | 'info' | 'primary' }> = {
  data_needs_attention: { label: '⏳ Ma\'lumotlarni tekshirish kerak', color: 'error' },
  ready_to_block:    { label: '☑️ Bloklanishi kutilmoqda',         color: 'warning' },
  blocked:           { label: '⛔ Bloklangan',                     color: 'error' },
  resolved:          { label: '✅ Yechilgan debitorlar',           color: 'success' },
  active:            { label: '🟢 Faol',                           color: 'success' },
  pendingBlock:      { label: '⏳ Bloklash kutilmoqda',           color: 'warning' },
  no_het:            { label: '❌ HET bazasida yo\'q',             color: 'error' },
};

export const PHONE_CFG: Record<string, { label: string; color: 'primary' | 'error' | 'warning' | 'success' | 'secondary' | 'info' }> = {
  new:                  { label: '📱 Yangi',                         color: 'primary' },
  checking:             { label: '🔍 SMS tekshirilmoqda',            color: 'warning' },
  needs_het_sync:       { label: '🔄 HETga kiritish kerak',           color: 'secondary' },
  not_found:            { label: '❌ Topilmagan',                    color: 'error' },
  no_phone:             { label: '❌ Raqam topilmadi',               color: 'error' },
  changed:              { label: '📞 Telefon raqami o\'zgargan',       color: 'primary' },
  confirmed:            { label: '✅ Tasdiqlangan',                  color: 'success' },
  confirmed_previously: { label: '✅ Avval tasdiqlangan',             color: 'success' },
  confirmed_this_cycle: { label: '✅ Ushbu tsiklda tasdiqlangan',     color: 'success' },
  het_synced:           { label: '✅ HETga kiritildi',                color: 'success' },
  identified:           { label: '✅ Aniqlangan',                     color: 'success' },
  pending_check:        { label: '🔍 SMS tekshirilmoqda',            color: 'warning' }
};

export const HET_ACCOUNT_CFG: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'primary' | 'info' }> = {
  confirmed: { label: '⚡ Tasdiqlangan', color: 'success' },
  not_found: { label: '⚠️ Topilmadi', color: 'error' },
  new:       { label: '🆕 Yangi', color: 'primary' },
  changed:   { label: "🔄 O'zgargan", color: 'warning' },
  checking:  { label: '🔍 Tekshirilmoqda', color: 'info' }
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
