import { useEffect, useState } from 'react';

/**
 * Google Map Tiles API (rasmiy, API kalit bilan). Kalit .env dagi VITE_GOOGLE_MAPS_API_KEY da;
 * Google Cloud'da "Map Tiles API" yoqilgan va kalit greenzone.uz domeniga cheklangan bo'lishi kerak.
 * Kalit bo'lmasa Google qatlamlari ko'rsatilmaydi.
 */
export const GOOGLE_MAPS_API_KEY: string | undefined = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export type GoogleTileKind = 'hybrid' | 'satellite';

const SESSION_BODY: Record<GoogleTileKind, object> = {
  // Hybrid: sun'iy yo'ldosh rasmi + ko'cha va nomlar
  hybrid: { mapType: 'satellite', language: 'uz-UZ', region: 'UZ', layerTypes: ['layerRoadmap'] },
  satellite: { mapType: 'satellite', language: 'uz-UZ', region: 'UZ' }
};

const STORAGE_PREFIX = 'gz-google-tile-session:';
const pending = new Map<GoogleTileKind, Promise<string | null>>();

function readCached(kind: GoogleTileKind): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + kind);
    if (!raw) return null;
    const { session, expiry } = JSON.parse(raw);
    // Muddati tugashidan bir kun oldin yangilaymiz
    return session && Number(expiry) * 1000 - Date.now() > 86_400_000 ? session : null;
  } catch {
    return null;
  }
}

async function createSession(kind: GoogleTileKind): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;
  const cached = readCached(kind);
  if (cached) return cached;
  const res = await fetch(`https://tile.googleapis.com/v1/createSession?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(SESSION_BODY[kind])
  });
  if (!res.ok) {
    console.warn('[googleTiles] sessiya ochilmadi:', res.status, await res.text().catch(() => ''));
    return null;
  }
  const data = await res.json();
  try {
    localStorage.setItem(STORAGE_PREFIX + kind, JSON.stringify({ session: data.session, expiry: data.expiry }));
  } catch {
    /* localStorage yo'q bo'lsa har safar yangi sessiya */
  }
  return data.session as string;
}

function getSession(kind: GoogleTileKind) {
  if (!pending.has(kind)) {
    const p = createSession(kind).catch(() => null);
    pending.set(kind, p);
    p.then((s) => !s && pending.delete(kind));
  }
  return pending.get(kind)!;
}

/** Leaflet uchun tile URL shabloni yoki null (kalit yo'q / sessiya ochilmadi) */
export function useGoogleTileUrl(kind: GoogleTileKind): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;
    let cancelled = false;
    getSession(kind).then((session) => {
      if (!cancelled && session) {
        setUrl(
          `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${encodeURIComponent(session)}&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY!)}`
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [kind]);
  return url;
}
