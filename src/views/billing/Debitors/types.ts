// ─── Tiplar ───────────────────────────────────────────────────────

export type DebitorStatus = 'active' | 'blocked' | 'pendingBlock' | 'no_het' | 'no_longer_debitor';
export type PhoneStatus = 'identified' | 'pending_check' | 'no_phone' | 'needs_het_update' | 'het_updated';

export const STATUS_CFG: Record<DebitorStatus, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  active: { label: '❓ Aktiv', color: 'success' },
  blocked: { label: '🚫 Bloklangan', color: 'error' },
  pendingBlock: { label: '⏳ Kutilmoqda', color: 'warning' },
  no_het: { label: "⚠️ HET yo'q", color: 'default' },
  no_longer_debitor: { label: '✅ Qarz qoplandi', color: 'success' }
};

export const PHONE_CFG: Record<PhoneStatus, { label: string; color: 'primary' | 'error' | 'warning' | 'success' | 'secondary' }> = {
  identified: { label: '📞 Aniqlangan', color: 'primary' },
  pending_check: { label: '🔍 Tekshirilmoqda', color: 'warning' },
  no_phone: { label: "❌ Yo'q", color: 'error' },
  needs_het_update: { label: '🔄 HET kerak', color: 'secondary' },
  het_updated: { label: '✔️ HET yangilangan', color: 'success' }
};
