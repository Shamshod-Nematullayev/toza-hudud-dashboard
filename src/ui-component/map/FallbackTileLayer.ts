import L from 'leaflet';
import { createElementObject, createTileLayerComponent, updateGridLayer, withPane } from '@react-leaflet/core';
import type { TileLayerProps } from 'react-leaflet';

/** Esri "Map data not yet available" tile'i ~2.5 KB; haqiqiy sun'iy yo'ldosh rasmi bundan ancha katta */
const BLANK_TILE_MAX_BYTES = 2600;
/** Necha daraja yuqoriga qarab rasm qidiriladi */
const MAX_FALLBACK_LEVELS = 5;

/**
 * Sun'iy yo'ldosh rasmi joyga qarab har xil darajagacha bor (Toshkentda 19, Nukusda 17).
 * Tile bo'sh ("no data") kelsa, yuqori darajadagi tile olinib, uning kerakli qismi kattalashtirib chiziladi —
 * foydalanuvchi uchun rasm shunchaki yaqinlashganday bo'ladi.
 */
interface FallbackTileLayerOptions extends L.TileLayerOptions {
  /** Shu hajmdan kichik tile "rasm yo'q" deb hisoblanadi (Esri); 0 — faqat HTTP xato bo'lsa (Google) */
  blankMaxBytes?: number;
}

class FallbackTileLayerClass extends L.TileLayer {
  private template: string;
  private blankMaxBytes: number;

  constructor(url: string, options?: FallbackTileLayerOptions) {
    super(url, options);
    this.template = url;
    this.blankMaxBytes = options?.blankMaxBytes ?? BLANK_TILE_MAX_BYTES;
  }

  createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    const size = this.getTileSize();
    const canvas = document.createElement('canvas');
    canvas.width = size.x;
    canvas.height = size.y;
    this.drawWithFallback(canvas, coords, 0)
      .then(() => done(undefined, canvas))
      .catch((err) => done(err instanceof Error ? err : new Error(String(err)), canvas));
    return canvas;
  }

  private urlFor(x: number, y: number, z: number) {
    const sub = this.options.subdomains;
    let s = '0';
    if (Array.isArray(sub) && sub.length) {
      s = String(sub[Math.abs(x + y) % sub.length]);
    } else if (typeof sub === 'string' && sub.length) {
      s = sub[Math.abs(x + y) % sub.length];
    }
    return L.Util.template(this.template, { ...this.options, x, y, z, s });
  }

  private async drawWithFallback(canvas: HTMLCanvasElement, coords: L.Coords, level: number): Promise<void> {
    const scale = 2 ** level;
    const x = Math.floor(coords.x / scale);
    const y = Math.floor(coords.y / scale);
    const z = coords.z - level;
    const res = await fetch(this.urlFor(x, y, z));
    // Kalit/sessiya xatosi: yuqori darajalarda ham shu bo'ladi, qayta so'rash befoyda
    if (res.status === 401 || res.status === 403) throw new Error(`Tile ruxsat xatosi: ${res.status}`);
    const blob = res.ok ? await res.blob() : null;
    const blank = !blob || blob.size <= this.blankMaxBytes;
    if (blank && level < MAX_FALLBACK_LEVELS && z > 0) return this.drawWithFallback(canvas, coords, level + 1);
    if (!blob) throw new Error(`Tile yuklanmadi: ${res.status}`);

    const bitmap = await createImageBitmap(blob);
    const part = bitmap.width / scale;
    const sx = (coords.x - x * scale) * part;
    const sy = (coords.y - y * scale) * part;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, sx, sy, part, part, 0, 0, canvas.width, canvas.height);
    bitmap.close();
  }
}

export const FallbackTileLayer = createTileLayerComponent<L.TileLayer, TileLayerProps & { blankMaxBytes?: number }>(
  function createFallbackTileLayer({ url, ...options }, context) {
    return createElementObject(new FallbackTileLayerClass(url, withPane(options, context)), context);
  },
  function updateFallbackTileLayer(layer, props, prevProps) {
    updateGridLayer(layer, props, prevProps);
  }
);
