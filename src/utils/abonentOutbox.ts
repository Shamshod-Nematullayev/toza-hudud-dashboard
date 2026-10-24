import api from 'utils/api';

// Serverga umuman yetib bormagan (internet yo'q) abonent o'zgarishlari brauzerda saqlanadi
// va internet qaytishi bilan yuboriladi. Server qabul qilgach, u o'z navbatiga (MongoDB) oladi.

export interface OutboxItem {
  id: string;
  method: 'put' | 'patch';
  url: string;
  body: unknown;
  residentId: number;
  accountNumber?: string;
  fullName?: string;
  type: 'phone' | 'details';
  phone?: string;
  createdAt: string;
}

const KEY = 'gz.abonentOutbox';
export const OUTBOX_CHANGED_EVENT = 'abonent-outbox-changed';
// Server navbati o'zgarganini footer belgisiga bildirish uchun
export const PENDING_UPDATES_CHANGED_EVENT = 'abonent-pending-updates-changed';

export function readOutbox(): OutboxItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function writeOutbox(items: OutboxItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Xotira yopiq bo'lsa (private rejim) navbat faqat shu sahifada qoladi
  }
  window.dispatchEvent(new Event(OUTBOX_CHANGED_EVENT));
}

export function addToOutbox(item: Omit<OutboxItem, 'id' | 'createdAt'>) {
  // Bitta abonentning eski, hali yuborilmagan o'zgarishini yangisi almashtiradi
  const rest = readOutbox().filter((i) => !(i.residentId === item.residentId && (i.type === item.type || item.type === 'details')));
  writeOutbox([...rest, { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() }]);
}

let flushing = false;
/** Navbatdagilarni yuboradi. Server javob bersa (xato bo'lsa ham) yozuv brauzerdan olib tashlanadi. */
export async function flushOutbox() {
  if (flushing || !navigator.onLine) return;
  flushing = true;
  try {
    for (const item of readOutbox()) {
      try {
        await api.request({ method: item.method, url: item.url, data: item.body });
      } catch (error: any) {
        if (!error?.response) break; // hali ham internet yo'q, keyinroq
      }
      writeOutbox(readOutbox().filter((i) => i.id !== item.id));
      window.dispatchEvent(new Event(PENDING_UPDATES_CHANGED_EVENT));
    }
  } finally {
    flushing = false;
  }
}
