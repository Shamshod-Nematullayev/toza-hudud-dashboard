// ─── Tiplar ───────────────────────────────────────────────────────

// export type DebitorStatus = 'active' | 'blocked' | 'pendingBlock' | 'no_het' | 'no_longer_debitor';
// export type PhoneStatus = 'identified' | 'pending_check' | 'no_phone' | 'needs_het_update' | 'het_updated';
export type DebitorStatus = 'debt_identified' | 'sms_sent' | 'blocked' | 'ready_to_block' | 'no_het_account' | 'resolved';
export type PhoneStatus =
  | 'new'
  | 'confirmed_previously'
  | 'confirmed_this_cycle'
  | 'checking'
  | 'het_synced'
  | 'needs_het_sync'
  | 'not_found';

export const STATUS_CFG: Record<DebitorStatus, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  debt_identified: { label: '💰 Qarzdor aniqlangan', color: 'warning' },
  sms_sent: { label: '✉️ SMS yuborilgan', color: 'success' },
  blocked: { label: '🚫 Bloklangan', color: 'error' },
  ready_to_block: { label: '⏳ Blokga tayyor', color: 'warning' },
  no_het_account: { label: "⚠️ HET hisobi yo'q", color: 'default' },
  resolved: { label: '✅ Yechilgan', color: 'success' }
};

export const PHONE_CFG: Record<PhoneStatus, { label: string; color: 'primary' | 'error' | 'warning' | 'success' | 'secondary' }> = {
  new: { label: '📱 Yangi', color: 'primary' },
  confirmed_previously: { label: '📞 Oldingi tasdiqlangan', color: 'success' },
  confirmed_this_cycle: { label: '📞 Shu davrda tasdiqlangan', color: 'success' },
  checking: { label: '🔍 Tekshirilmoqda', color: 'warning' },
  het_synced: { label: '🔄 HET sinxronizatsiya qilingan', color: 'success' },
  needs_het_sync: { label: '🔄 HET sinxronizatsiya kerak', color: 'secondary' },
  not_found: { label: '❌ Topilmagan', color: 'error' }
};
