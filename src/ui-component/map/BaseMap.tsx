import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ReactNode, useEffect } from 'react';
import { LayersControl, MapContainer, TileLayer, useMap } from 'react-leaflet';

/** O'zbekiston markazi: nuqta bo'lmaganda boshlang'ich ko'rinish */
export const DEFAULT_CENTER: [number, number] = [41.3, 64.6];
export const DEFAULT_ZOOM = 6;

const pinSvg = (color: string, size: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.4}" viewBox="0 0 24 34"><path d="M12 0C5.4 0 0 5.3 0 11.9 0 20.8 12 34 12 34s12-13.2 12-22.1C24 5.3 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`;

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
        iconSize: [size, size * 1.4],
        iconAnchor: [size / 2, size * 1.4],
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

export default function BaseMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  height = 400,
  children,
  defaultLayer = 'map'
}: {
  center?: [number, number];
  zoom?: number;
  height?: number | string;
  children?: ReactNode;
  defaultLayer?: 'map' | 'satellite';
}) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: '100%', borderRadius: 12, zIndex: 0 }} scrollWheelZoom>
      <InvalidateOnResize />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked={defaultLayer === 'map'} name="Xarita">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked={defaultLayer === 'satellite'} name="Sun'iy yo'ldosh">
          <TileLayer
            attribution="Tiles &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      {children}
    </MapContainer>
  );
}
