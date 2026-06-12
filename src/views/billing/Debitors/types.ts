// ─── Tiplar ───────────────────────────────────────────────────────

export type DebitorStatus =
  | 'debt_identified'
  | 'no_het_account'
  | 'sms_sent'
  | 'awaiting_het_sync'
  | 'ready_to_block'
  | 'blocked'
  | 'resolved'
  | 'no_phone';

export type PhoneStatus =
  | 'new'
  | 'confirmed_previously'
  | 'confirmed_this_cycle'
  | 'checking'
  | 'het_synced'
  | 'needs_het_sync'
  | 'not_found';

// ─── Konfiguratsiyalar (Prettier buzmasligi uchun inline) ──────────

// prettier-ignore
export const STATUS_CFG: Record<DebitorStatus, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  debt_identified:   { label: '⏳ Yangi aniqlangan debitorlar',    color: 'warning' },
  no_het_account:    { label: "⚠️ Elektr kodi yo'q",               color: 'error' },
  sms_sent:          { label: '🔍 Tekshirilmoqda (SMS)',           color: 'warning' },
  awaiting_het_sync: { label: '🔄 HET sinxronizatsiya kerak',      color: 'warning' },
  ready_to_block:    { label: '☑️ Bloklanishi Kutilmoqda',         color: 'success' },
  blocked:           { label: '✔️ Bloklangan',                     color: 'success' },
  resolved:          { label: '✅ Yechilgan debitorlar',           color: 'success' },
  no_phone:          { label: '❌ Telefon raqami yo\'q',            color: 'error' }
};

// prettier-ignore
export const PHONE_CFG: Record<PhoneStatus, { label: string; color: 'primary' | 'error' | 'warning' | 'success' | 'secondary' }> = {
  new:                   { label: '📱 Yangi',                         color: 'primary' },
  confirmed_previously:  { label: '📞 Oldingi tasdiqlangan',          color: 'success' },
  confirmed_this_cycle:  { label: '📞 Shu davrda tasdiqlangan',       color: 'success' },
  checking:              { label: '🔍 Tekshirilmoqda',                color: 'warning' },
  het_synced:            { label: '🔄 HET sinxronizatsiya qilingan',  color: 'success' },
  needs_het_sync:        { label: '🔄 HET sinxronizatsiya kerak',     color: 'secondary' },
  not_found:             { label: '❌ Topilmagan',                    color: 'error' }
};

// ─── Interfeyslar ─────────────────────────────────────────────────

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
  primaryPhone: string | null;
  phoneStatus: PhoneStatus;
  primaryPhoneSource: string | null;
  companyId: number;
  __v: 0;
  createdAt: string;
  updatedAt: string;
}
