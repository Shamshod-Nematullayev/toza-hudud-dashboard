import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ReactNode, useEffect } from 'react';
import { LayersControl, MapContainer, TileLayer, useMap } from 'react-leaflet';
import { FallbackTileLayer } from './FallbackTileLayer';
import { useGoogleTileUrl } from './googleTiles';

/** O'zbekiston markazi: nuqta bo'lmaganda boshlang'ich ko'rinish */
export const DEFAULT_CENTER: [number, number] = [41.3, 64.6];
export const DEFAULT_ZOOM = 6;
/** Foydalanuvchi shu darajagacha yaqinlashtira oladi */
export const MAX_ZOOM = 22;
/**
 * Tile serverlarida rasm bor eng katta daraja: undan keyin Leaflet oxirgi tile'ni kattalashtiradi.
 * Sun'iy yo'ldosh rasmi joyga qarab 17-19 gacha bor — 19 dan pastda bo'sh tile'lar FallbackTileLayer'da
 * yuqori darajadagi rasmni kattalashtirish bilan almashtiriladi.
 */
const OSM_NATIVE_MAX = 19;
const SATELLITE_NATIVE_MAX = 19;
/** Google sun'iy yo'ldosh rasmi ko'p shaharlarda 20-21 gacha */
const GOOGLE_NATIVE_MAX = 20;

const pinSvg = (color: string, size: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.35}" viewBox="0 0 24 34" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));"><path d="M12 0C5.4 0 0 5.3 0 11.9 0 20.8 12 34 12 34s12-13.2 12-22.1C24 5.3 18.6 0 12 0z" fill="${color}" stroke="#ffffff" stroke-width="1.8"/><circle cx="12" cy="11.5" r="4.2" fill="#ffffff"/></svg>`;

const iconCache = new Map<string, L.DivIcon>();

/** Rasm faylsiz marker (Vite bilan leaflet default ikonkalari yo'qolib qoladi) */
export function pinIcon(color = '#2e7d32', size = 30): L.DivIcon {
  const key = `${color}-${size}`;
  if (!iconCache.has(key)) {
    iconCache.set(
      key,
      L.divIcon({
        className: 'gz-map-pin',
        html: pinSvg(color, size),
        iconSize: [size, size * 1.35],
        iconAnchor: [size / 2, size * 1.35],
        popupAnchor: [0, -size * 1.2]
      })
    );
  }
  return iconCache.get(key)!;
}

/** Konteyner o'lchami o'zgarganda (dialog ochilishi, tab almashishi) xaritani qayta chizadi */
function InvalidateOnResize() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(el);
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [map]);
  return null;
}

export type BaseMapLayer = 'map' | 'satellite' | 'googleHybrid' | 'googleSatellite' | 'googleRoadmap';

export default function BaseMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  height = 400,
  children,
  defaultLayer = 'googleHybrid'
}: {
  center?: [number, number];
  zoom?: number;
  height?: number | string;
  children?: ReactNode;
  defaultLayer?: BaseMapLayer;
}) {
  // Agar maxsus rasmiy Google Map Tiles API sessiyasi bo'lsa uni olamiz
  const officialGoogleHybridUrl = useGoogleTileUrl('hybrid');
  const officialGoogleSatelliteUrl = useGoogleTileUrl('satellite');

  // SmartGPS / Wialon kabi platformalarda ishlatiladigan to'g'ridan-to'g'ri Google xarita URL lari
  const googleHybridUrl = officialGoogleHybridUrl || 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=uz';
  const googleSatelliteUrl = officialGoogleSatelliteUrl || 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&hl=uz';
  const googleRoadmapUrl = 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=uz';

  const googleSubdomains = ['0', '1', '2', '3'];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      maxZoom={MAX_ZOOM}
      style={{ height, width: '100%', minHeight: typeof height === 'number' ? height : undefined, flex: 1, borderRadius: 12, zIndex: 0 }}
      scrollWheelZoom
    >
      <InvalidateOnResize />
      <LayersControl position="topright">
        {/* SmartGPS dagi kabi asosiy tanlangan qatlam: Google Hybrid (Sun'iy yo'ldosh + yo'llar va nomlar) */}
        <LayersControl.BaseLayer checked={defaultLayer === 'googleHybrid'} name="Google Hybrid">
          <TileLayer
            key="google-hybrid"
            attribution="Map data &copy; Google"
            url={googleHybridUrl}
            subdomains={googleSubdomains}
            maxZoom={MAX_ZOOM}
            maxNativeZoom={GOOGLE_NATIVE_MAX}
          />
        </LayersControl.BaseLayer>

        {/* Google Satellite (Sof sun'iy yo'ldosh fotosurati) */}
        <LayersControl.BaseLayer checked={defaultLayer === 'googleSatellite'} name="Google Satellite">
          <TileLayer
            key="google-satellite"
            attribution="Map data &copy; Google"
            url={googleSatelliteUrl}
            subdomains={googleSubdomains}
            maxZoom={MAX_ZOOM}
            maxNativeZoom={GOOGLE_NATIVE_MAX}
          />
        </LayersControl.BaseLayer>

        {/* Google Xarita (Vektor/yo'llar xaritasi) */}
        <LayersControl.BaseLayer checked={defaultLayer === 'googleRoadmap'} name="Google Xarita">
          <TileLayer
            key="google-roadmap"
            attribution="Map data &copy; Google"
            url={googleRoadmapUrl}
            subdomains={googleSubdomains}
            maxZoom={MAX_ZOOM}
            maxNativeZoom={GOOGLE_NATIVE_MAX}
          />
        </LayersControl.BaseLayer>

        {/* OpenStreetMap */}
        <LayersControl.BaseLayer checked={defaultLayer === 'map'} name="OpenStreetMap">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={MAX_ZOOM}
            maxNativeZoom={OSM_NATIVE_MAX}
          />
        </LayersControl.BaseLayer>

        {/* Esri Sun'iy yo'ldosh */}
        <LayersControl.BaseLayer checked={defaultLayer === 'satellite'} name="Esri Sun'iy yo'ldosh">
          <FallbackTileLayer
            attribution="Tiles &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={MAX_ZOOM}
            maxNativeZoom={SATELLITE_NATIVE_MAX}
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      {children}
    </MapContainer>
  );
}
