import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ContentCopy, Directions, OpenInNew, Search } from '@mui/icons-material';
import { CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { toast } from 'react-toastify';
import { Link as RouterLink } from 'react-router-dom';
import BaseMap from 'ui-component/map/BaseMap';
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';
import { lotinga } from 'helpers/lotinKiril';
import {
  AbonentLocation,
  fetchAbonentLocations,
  fetchAbonentLocationStats,
  formatLatLng,
  googleDirectionsUrl,
  googleMapsUrl
} from 'services/abonentLocation';

type MahallaOption = { id: number; name: string; count: number };

function FitToPoints({ points, version }: { points: AbonentLocation[]; version: string }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) map.setView([points[0].lat, points[0].lng], 18);
    else map.fitBounds(points.map((p) => [p.lat, p.lng] as [number, number]), { padding: [40, 40], maxZoom: 18 });
  }, [version]);
  return null;
}

/** Bo'sh joyga bosilganda koordinatani ko'rsatadi: yangi xonadonni belgilashda nusxa olish uchun */
function ClickedPoint() {
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  useMapEvents({ click: (e) => setPoint({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  if (!point) return null;
  const text = formatLatLng(point.lat, point.lng);
  return (
    <Popup position={[point.lat, point.lng]} eventHandlers={{ remove: () => setPoint(null) }}>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
        {text}
      </Typography>
      <Button
        size="small"
        startIcon={<ContentCopy fontSize="small" />}
        onClick={() => navigator.clipboard?.writeText(text).then(() => toast.success('Koordinata nusxalandi'))}
      >
        Nusxalash
      </Button>
    </Popup>
  );
}

const sourceColor: Record<string, string> = {
  device: '#2e7d32',
  map: '#1565c0',
  google_link: '#6a1b9a',
  coords: '#ef6c00',
  ariza: '#00838f'
};

export default function AbonentsMap() {
  const { mahallalar, setMahallalar } = useCustomizationStore();
  const [mahallaList, setMahallaList] = useState<{ id: number; name: string }[]>(mahallalar);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [mahalla, setMahalla] = useState<MahallaOption | null>(null);
  const [points, setPoints] = useState<AbonentLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (mahallalar.length === 0) {
      api
        .get('/mahallas', { params: { page: 1, limit: 1000 } })
        .then(({ data }) => {
          const list = (data.data || []).map((m: any) => ({ id: m.id, name: m.name }));
          setMahallaList(list);
          setMahallalar(list);
        })
        .catch(() => {});
    }
    fetchAbonentLocationStats()
      .then((rows) => setStats(Object.fromEntries(rows.map((r) => [String(r.mahallaId), r.count]))))
      .catch(() => {});
  }, []);

  const options = useMemo<MahallaOption[]>(
    () =>
      mahallaList
        .map((m) => ({ ...m, name: lotinga(m.name || ''), count: stats[String(m.id)] || 0 }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'uz-Latn')),
    [mahallaList, stats]
  );

  useEffect(() => {
    if (!mahalla) {
      setPoints([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchAbonentLocations(mahalla.id)
      .then((rows) => !cancelled && setPoints(rows))
      .catch((err) => !cancelled && toast.error(err?.response?.data?.message || 'Joylashuvlarni yuklab bo‘lmadi'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [mahalla?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return points;
    return points.filter((p) =>
      [p.accountNumber, p.fullName, p.streetName, p.homeNumber].some((v) => lotinga(String(v || '')).toLowerCase().includes(q))
    );
  }, [points, search]);

  const totalLocated = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <Stack spacing={2}>
      <Card sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3">Abonentlar xaritasi</Typography>
            <Typography variant="body2" color="text.secondary">
              Uy joylashuvi belgilangan xonadonlar. Jami: {totalLocated} ta. GPS kuzatuv va texnikalar harakati keyinroq qo‘shiladi.
            </Typography>
          </Box>
          <Autocomplete
            sx={{ minWidth: { md: 340 } }}
            options={options}
            value={mahalla}
            onChange={(_, v) => {
              setMahalla(v);
              setSearch('');
            }}
            getOptionLabel={(o) => o.name}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderOption={(props, o) => (
              <li {...props} key={o.id}>
                <Stack direction="row" sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{o.name}</span>
                  <Chip size="small" label={o.count} color={o.count ? 'primary' : 'default'} variant={o.count ? 'filled' : 'outlined'} />
                </Stack>
              </li>
            )}
            renderInput={(params) => <TextField {...params} label="Mahalla" placeholder="Mahallani tanlang" size="small" />}
          />
          <TextField
            size="small"
            sx={{ minWidth: { md: 260 } }}
            placeholder="Hisob raqam, F.I.Sh, ko‘cha"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={!mahalla}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                )
              }
            }}
          />
        </Stack>
      </Card>

      {!mahalla && <Alert severity="info">Mahallani tanlang: shu mahalladagi joylashuvi biriktirilgan abonentlar xaritada ko‘rinadi.</Alert>}
      {mahalla && !loading && points.length === 0 && (
        <Alert severity="warning">Bu mahallada hali birorta xonadon joylashuvi belgilanmagan. Abonent 360 sahifasidan belgilash mumkin.</Alert>
      )}

      <Card sx={{ p: 1, position: 'relative' }}>
        {loading && (
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: (theme) => alpha(theme.palette.background.paper, 0.5) }}>
            <CircularProgress />
          </Box>
        )}
        {mahalla && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1, pb: 1 }}>
            {search ? `${filtered.length} / ${points.length}` : points.length} ta xonadon · bo‘sh joyga bosing — koordinatani nusxalash mumkin
          </Typography>
        )}
        <BaseMap height="calc(100vh - 300px)">
          <FitToPoints points={filtered} version={`${mahalla?.id}-${filtered.length}-${search}`} />
          <ClickedPoint />
          {filtered.map((p) => (
            <CircleMarker
              key={p.residentId}
              center={[p.lat, p.lng]}
              radius={7}
              bubblingMouseEvents={false}
              pathOptions={{ color: '#fff', weight: 1.5, fillColor: sourceColor[p.source || 'map'] || '#1565c0', fillOpacity: 0.9 }}
            >
              <Popup>
                <Box sx={{ minWidth: 220 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {p.fullName || '—'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {p.accountNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {[p.mahallaName && lotinga(p.mahallaName), p.streetName, p.homeNumber].filter(Boolean).join(', ')}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                    <Button size="small" component={RouterLink} to={`/abonent/${p.residentId}/details`} startIcon={<OpenInNew fontSize="small" />}>
                      Abonent 360
                    </Button>
                    <Button size="small" href={googleDirectionsUrl(p.lat, p.lng)} target="_blank" rel="noopener" startIcon={<Directions fontSize="small" />}>
                      Yo‘nalish
                    </Button>
                    <Button size="small" href={googleMapsUrl(p.lat, p.lng)} target="_blank" rel="noopener">
                      Google
                    </Button>
                  </Stack>
                </Box>
              </Popup>
            </CircleMarker>
          ))}
        </BaseMap>
      </Card>
    </Stack>
  );
}
