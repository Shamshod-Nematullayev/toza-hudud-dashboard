import api from 'utils/api';

export type AbonentLocationSource = 'map' | 'coords' | 'google_link' | 'device' | 'ariza';

export interface AbonentLocation {
  _id?: string;
  residentId: number;
  accountNumber?: string;
  fullName?: string;
  mahallaId?: number;
  mahallaName?: string;
  streetName?: string;
  homeNumber?: string;
  lat: number;
  lng: number;
  accuracy?: number;
  source?: AbonentLocationSource;
  setByName?: string;
  updatedAt?: string;
}

export interface LatLngPoint {
  lat: number;
  lng: number;
  source?: AbonentLocationSource;
  accuracy?: number;
}

/** Saqlashda abonent ma'lumotlari ham yuboriladi: xarita sahifasida mahalla bo'yicha filtr va ko'rsatish uchun */
export interface AbonentLocationInfo {
  accountNumber?: string;
  fullName?: string;
  mahallaId?: number;
  mahallaName?: string;
  streetName?: string;
  homeNumber?: string;
}

export async function fetchAbonentLocation(residentId: number) {
  const { data } = await api.get(`/abonent-locations/${residentId}`);
  return { location: (data.location || null) as AbonentLocation | null, requiredForGpsActs: !!data.requiredForGpsActs };
}

export async function saveAbonentLocation(residentId: number, point: LatLngPoint, info: AbonentLocationInfo) {
  const { data } = await api.put(`/abonent-locations/${residentId}`, { ...info, ...point });
  return data.location as AbonentLocation;
}

export async function deleteAbonentLocation(residentId: number) {
  await api.delete(`/abonent-locations/${residentId}`);
}

export async function fetchAbonentLocations(mahallaId?: number | string) {
  const { data } = await api.get('/abonent-locations', { params: mahallaId ? { mahallaId } : {} });
  return data.data as AbonentLocation[];
}

export async function fetchAbonentLocationStats() {
  const { data } = await api.get('/abonent-locations/stats');
  return data.data as { mahallaId: number | null; count: number }[];
}

export async function resolveLocationLink(link: string): Promise<{ lat: number; lng: number }> {
  const { data } = await api.post('/abonent-locations/resolve-link', { link });
  return { lat: data.lat, lng: data.lng };
}

// ---------- Matndan koordinata ajratish (backenddagi bilan bir xil qoidalar) ----------

const NUM = '(-?\\d{1,3}(?:\\.\\d+)?)';

export function isValidLatLng(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);
}

function pick(re: RegExp, text: string) {
  const m = text.match(re);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return isValidLatLng(lat, lng) ? { lat, lng } : null;
}

/** "41.31, 69.24", to'liq Google Maps havolasi, geo:... — qisqa havola (maps.app.goo.gl) uchun null */
export function parseLocationText(input: string): { lat: number; lng: number } | null {
  if (!input) return null;
  let text = input.trim();
  try {
    text = decodeURIComponent(text);
  } catch {
    /* noto'g'ri kodlangan */
  }
  return (
    pick(new RegExp(`!3d${NUM}!4d${NUM}`), text) ||
    pick(new RegExp(`@${NUM},\\s*${NUM}`), text) ||
    pick(new RegExp(`[?&](?:q|query|ll|sll|destination|center|daddr)=(?:loc:)?${NUM},\\s*${NUM}`), text) ||
    pick(new RegExp(`geo:${NUM},\\s*${NUM}`), text) ||
    pick(new RegExp(`^${NUM}\\s*[,;\\s]\\s*${NUM}$`), text)
  );
}

export const isUrl = (text: string) => /^https?:\/\//i.test(text.trim());

export const googleMapsUrl = (lat: number, lng: number) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
export const googleDirectionsUrl = (lat: number, lng: number) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
export const formatLatLng = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

export const locationSourceLabels: Record<AbonentLocationSource, string> = {
  map: 'Xaritadan',
  coords: 'Koordinata',
  google_link: 'Google Maps havolasi',
  device: 'Qurilma GPS',
  ariza: 'Arizadan'
};
