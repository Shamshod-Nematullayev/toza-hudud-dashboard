import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  CameraAlt,
  Cancel,
  CheckCircle,
  Close,
  ContentCopy,
  DirectionsCar,
  ErrorOutlined,
  Fullscreen,
  FullscreenExit,
  Help,
  QueryStats,
  RestartAlt,
  Route,
  Speed,
  Straighten,
  Timer,
  Undo
} from '@mui/icons-material';
import { Circle, CircleMarker, Marker, Polyline, Popup, Tooltip as LeafletTooltip, useMap, useMapEvents } from 'react-leaflet';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { toPng } from 'html-to-image';
import api from 'utils/api';
import { formatLatLng } from 'services/abonentLocation';
import BaseMap, { pinIcon } from 'ui-component/map/BaseMap';

export interface GpsVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  target?: {
    lat: number;
    lng: number;
    fullName?: string;
    accountNumber?: string;
    address?: string;
  } | null;
}

export interface GpsTrackPoint {
  lat: number;
  lng: number;
  time: number;
  speed: number;
  course?: number;
  distanceMeters: number;
}

interface SmartGpsCarOption {
  id: number;
  name: string;
  isOnline?: boolean;
}

/** Ikki koordinata orasidagi masofani hisoblash (metrlarda) */
function computeDistanceMeters(p1: [number, number], p2: [number, number]): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(p2[0] - p1[0]);
  const dLng = toRad(p2[1] - p1[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1[0])) * Math.cos(toRad(p2[0])) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/** Xaritaga bosilganda o'lchash nuqtasini qo'shuvchi hook */
function MeasureClickHandler({
  active,
  onAddPoint
}: {
  active: boolean;
  onAddPoint: (point: [number, number]) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (active) {
        onAddPoint([e.latlng.lat, e.latlng.lng]);
      }
    }
  });
  return null;
}

function TrackBoundsFitter({
  subscriber,
  track
}: {
  subscriber: { lat: number; lng: number };
  track: GpsTrackPoint[];
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const allCoords: [number, number][] = [[subscriber.lat, subscriber.lng]];
    for (const p of track) {
      allCoords.push([p.lat, p.lng]);
    }
    if (allCoords.length === 1) {
      map.setView(allCoords[0], 17);
    } else {
      map.fitBounds(allCoords, { padding: [40, 40], maxZoom: 18 });
    }
  }, [map, subscriber.lat, subscriber.lng, track]);
  return null;
}

interface VerificationResultData {
  status: 'VISITED' | 'NOT_VISITED' | 'UNCERTAIN';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  subscriberCoordinates: {
    latitude: number;
    longitude: number;
  };
  evidence: {
    closestDistanceMeters: number;
    radiusMeters: number;
    directGpsMatches: number;
    interpolatedMatches: number;
    totalGpsPoints: number;
    validGpsPoints: number;
    estimatedDwellTimeSeconds?: number;
    vehicleStopped?: boolean;
    minSpeedKmh?: number;
    averageSpeedKmh?: number;
    coverageGapDetected?: boolean;
    gapNearSubscriberDetected?: boolean;
  };
  visitTime?: {
    from: string;
    to: string;
  };
  visits?: Array<{
    from: string;
    to: string;
    dwellTimeSeconds: number;
    closestDistanceMeters: number;
    directMatches: number;
    interpolatedMatches: number;
    stopped: boolean;
    minSpeedKmh: number;
    avgSpeedKmh: number;
  }>;
  explanation: string;
  nearbyTrack?: GpsTrackPoint[];
  closestPoint?: GpsTrackPoint;
  trackRadiusMeters?: number;
}

export default function GpsVerificationDialog({ open, onClose, target }: GpsVerificationDialogProps) {
  const [cars, setCars] = useState<SmartGpsCarOption[]>([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [selectedCar, setSelectedCar] = useState<SmartGpsCarOption | null>(null);

  // Koordinatalar
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');

  // Vaqt sozlamalari
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState<string>('06:00');
  const [endTime, setEndTime] = useState<string>('21:00');
  const [radius, setRadius] = useState<number>(30);

  // Tekshiruv holati
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResultData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Target o'zgarganda koordinata to'ldiriladi
  useEffect(() => {
    if (target) {
      setLat(String(target.lat));
      setLng(String(target.lng));
    }
    setResult(null);
    setErrorMsg('');
  }, [target, open]);

  // Avtomobillarni bir marta yuklab olamiz
  useEffect(() => {
    if (!open) return;
    if (cars.length === 0) {
      setLoadingCars(true);
      api
        .get('/gps/smartgps-cars')
        .then(({ data }) => {
          const list = (data.data || []).map((c: any) => ({
            id: c.id,
            name: c.name || `Avtomobil #${c.id}`,
            isOnline: !!c.isOnline
          }));
          setCars(list);
          if (list.length > 0 && !selectedCar) {
            setSelectedCar(list[0]);
          }
        })
        .catch(() => {
          // Agar smartgps-cars bo'lmasa standart /gps/cars ga murojaat qilamiz
          api.get('/gps/cars').then(({ data }) => {
            const list = (data.data || []).map((c: any) => ({
              id: c.wialonId || c.id,
              name: c.automobileNumberAndModel || c.automobileNumber,
              isOnline: c.active
            }));
            setCars(list);
            if (list.length > 0 && !selectedCar) setSelectedCar(list[0]);
          });
        })
        .finally(() => setLoadingCars(false));
    }
  }, [open]);

  // Bugun / Kecha tezkor tugmalari
  const setQuickDate = (type: 'today' | 'yesterday') => {
    const d = type === 'today' ? dayjs() : dayjs().subtract(1, 'day');
    setSelectedDate(d.format('YYYY-MM-DD'));
    setResult(null);
  };

  const handleVerify = async () => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setErrorMsg("Abonent koordinatasi noto'g'ri kiritilgan");
      return;
    }
    if (!selectedCar) {
      setErrorMsg('Iltimos, tekshiriladigan avtomobilni tanlang');
      return;
    }

    setErrorMsg('');
    setVerifying(true);
    setResult(null);

    try {
      const startIso = dayjs(`${selectedDate}T${startTime}:00`).toISOString();
      const endIso = dayjs(`${selectedDate}T${endTime}:59`).toISOString();

      const { data } = await api.post('/gps/verify-service', {
        subscriberCoordinates: {
          latitude: parsedLat,
          longitude: parsedLng
        },
        vehicleId: selectedCar.id,
        startDate: startIso,
        endDate: endIso,
        radius: Number(radius) || 30
      });

      if (data.ok && data.data) {
        setResult(data.data);
      } else {
        setErrorMsg(data.message || 'Xulosa olib bo‘lmadi');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Server xatoligi yuz berdi');
    } finally {
      setVerifying(false);
    }
  };

  // Katta ekran (Fullscreen)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Lineyka (masofa o'lchash) uskunasi
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  // Dalolatnoma skrinshoti olish uchun ref
  const captureAreaRef = useRef<HTMLDivElement | null>(null);
  const [capturing, setCapturing] = useState(false);

  const handleAddMeasurePoint = (point: [number, number]) => {
    setMeasurePoints((prev) => [...prev, point]);
  };

  const handleUndoMeasurePoint = () => {
    setMeasurePoints((prev) => prev.slice(0, -1));
  };

  const handleClearMeasure = () => {
    setMeasurePoints([]);
  };

  const totalMeasureDistance = useMemo(() => {
    if (measurePoints.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < measurePoints.length - 1; i++) {
      total += computeDistanceMeters(measurePoints[i], measurePoints[i + 1]);
    }
    return total;
  }, [measurePoints]);

  const handleCaptureScreenshot = async () => {
    if (!captureAreaRef.current) return;
    setCapturing(true);
    try {
      const dataUrl = await toPng(captureAreaRef.current, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio: 2
      });
      const link = document.createElement('a');
      const safeAccount = (target?.accountNumber || 'abonent').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `dalolatnoma_smartgps_${safeAccount}_${selectedDate}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Dalolatnoma uchun rasm yuklab olindi!');
    } catch (err: any) {
      console.error('Screenshot olishda xatolik:', err);
      toast.error('Skrinshot olib bo‘lmadi: ' + (err?.message || 'Xatolik yuz berdi'));
    } finally {
      setCapturing(false);
    }
  };

  const copyExplanation = () => {
    if (!result?.explanation) return;
    navigator.clipboard.writeText(result.explanation);
    toast.success('GPS xulosasi nusxalandi');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={isFullscreen}
      maxWidth={isFullscreen ? false : (result?.nearbyTrack && result.nearbyTrack.length > 0 ? 'lg' : 'sm')}
    >
      <DialogTitle sx={{ pr: 12, pb: 1, position: 'relative' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <QueryStats sx={{ color: '#2e7d32', fontSize: 28 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              SmartGPS xizmat xulosasi
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avtomobil GPS treki asosida xonadonga borilganini avtomatik aniqlash
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', right: 12, top: 12, alignItems: 'center' }}>
          <Tooltip title={isFullscreen ? "Kichraytirish" : "To'liq ekranga ochish"}>
            <IconButton onClick={() => setIsFullscreen(!isFullscreen)} size="small">
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          {/* Abonent ma'lumotlari kartochkasi */}
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {target?.fullName || 'Xaritada tanlangan xonadon'}
            </Typography>
            {target?.accountNumber && (
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: 'primary.main', mb: 0.5 }}>
                Hisob raqam: {target.accountNumber}
              </Typography>
            )}
            {target?.address && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Manzil: {target.address}
              </Typography>
            )}
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontWeight: 600 }}>
              📍 Koordinata: {formatLatLng(parseFloat(lat) || 0, parseFloat(lng) || 0)}
            </Typography>
          </Box>

          {/* Forma: Avtomobil, Sana, Vaqt, Radius */}
          <Grid container spacing={1.5}>
            {/* Avtomobil tanlash */}
            <Grid size={12}>
              <Autocomplete
                size="small"
                options={cars}
                value={selectedCar}
                loading={loadingCars}
                onChange={(_, v) => {
                  setSelectedCar(v);
                  setResult(null);
                }}
                getOptionLabel={(o) => o.name}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Transport vositasi (SmartGPS)"
                    placeholder="Avtomobilni tanlang"
                  />
                )}
                renderOption={(props, o) => (
                  <li {...props} key={o.id}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography variant="body2">{o.name}</Typography>
                      {o.isOnline && <Chip size="small" color="success" variant="outlined" label="Onlayn" sx={{ height: 20 }} />}
                    </Stack>
                  </li>
                )}
              />
            </Grid>

            {/* Sana tanlash va tezkor tugmalar */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Tekshiruv sanasi"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setResult(null);
                }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                <Chip
                  size="small"
                  label="Bugun"
                  variant={selectedDate === dayjs().format('YYYY-MM-DD') ? 'filled' : 'outlined'}
                  color="primary"
                  onClick={() => setQuickDate('today')}
                  sx={{ cursor: 'pointer', height: 22 }}
                />
                <Chip
                  size="small"
                  label="Kecha"
                  variant={selectedDate === dayjs().subtract(1, 'day').format('YYYY-MM-DD') ? 'filled' : 'outlined'}
                  onClick={() => setQuickDate('yesterday')}
                  sx={{ cursor: 'pointer', height: 22 }}
                />
              </Stack>
            </Grid>

            {/* Radius (metrda) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Qamrov radiusi"
                value={radius}
                onChange={(e) => {
                  setRadius(Number(e.target.value) || 30);
                  setResult(null);
                }}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">metr</InputAdornment>
                  }
                }}
                helperText="Standart: 30 m (hovli va yo'l oralig'i)"
              />
            </Grid>

            {/* Vaqt oralig'i */}
            <Grid size={{ xs: 6, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="time"
                label="Boshlanish vaqti"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="time"
                label="Tugash vaqti"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </Grid>

          {/* Tekshirish tugmasi */}
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={handleVerify}
            disabled={verifying || !selectedCar || !lat || !lng}
            startIcon={verifying ? <CircularProgress size={20} color="inherit" /> : <QueryStats />}
            sx={{
              py: 1.2,
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            {verifying ? 'SmartGPS tahlil qilinmoqda...' : 'Xulosani tekshirish'}
          </Button>

          {errorMsg && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {/* TEKSHIRUV NATIJASI (XULOSA PANELI) */}
          {result && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: '1.5px solid',
                borderColor:
                  result.status === 'VISITED' ? '#2e7d32' : result.status === 'NOT_VISITED' ? '#d32f2f' : '#ed6c02',
                bgcolor:
                  result.status === 'VISITED'
                    ? 'rgba(46, 125, 50, 0.06)'
                    : result.status === 'NOT_VISITED'
                      ? 'rgba(211, 47, 47, 0.06)'
                      : 'rgba(237, 108, 2, 0.06)'
              }}
            >
              {/* Asosiy status sarlavhasi */}
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                {result.status === 'VISITED' && <CheckCircle sx={{ color: '#2e7d32', fontSize: 36 }} />}
                {result.status === 'NOT_VISITED' && <Cancel sx={{ color: '#d32f2f', fontSize: 36 }} />}
                {result.status === 'UNCERTAIN' && <Help sx={{ color: '#ed6c02', fontSize: 36 }} />}

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color:
                        result.status === 'VISITED' ? '#1b5e20' : result.status === 'NOT_VISITED' ? '#c62828' : '#e65100'
                    }}
                  >
                    {result.status === 'VISITED'
                      ? 'XIZMAT KO‘RSATILGAN'
                      : result.status === 'NOT_VISITED'
                        ? 'XIZMAT KO‘RSATILMAGAN'
                        : 'NOANIQ (QAMROV YETARLI EMAS)'}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Ishonchlilik darajasi:{' '}
                    <span style={{ color: result.confidence === 'HIGH' ? '#2e7d32' : '#ed6c02' }}>
                      {result.confidence === 'HIGH' ? 'YUQORI (100% ishonchli)' : result.confidence === 'MEDIUM' ? 'O‘RTA (Trek interpolatsiyasi)' : 'PAST'}
                    </span>
                  </Typography>
                </Box>

                <Tooltip title="Xulosadan nusxa olish">
                  <IconButton size="small" onClick={copyExplanation} sx={{ bgcolor: 'background.paper' }}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* Tushuntirish matni */}
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: 'text.primary', lineHeight: 1.5 }}>
                {result.explanation}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              {/* Dalillar ko'rsatkichlari (Metrikalar) */}
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Eng yaqin masofa
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {result.evidence.closestDistanceMeters >= 0 ? `${result.evidence.closestDistanceMeters} m` : '—'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    GPS mosliklari
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {result.evidence.directGpsMatches} ta to‘g‘ri
                    {result.evidence.interpolatedMatches > 0 ? ` (+${result.evidence.interpolatedMatches} trek)` : ''}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Harakat holati
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Speed fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {result.evidence.vehicleStopped ? 'To‘xtagan' : result.evidence.averageSpeedKmh ? `${result.evidence.averageSpeedKmh} km/s` : 'Harakatda'}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Radius ichida vaqt
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Timer fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {result.evidence.estimatedDwellTimeSeconds ? `${result.evidence.estimatedDwellTimeSeconds} soniya` : '—'}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              {/* Tashrif vaqtlari (agar bo'lsa) */}
              {result.visitTime && (
                <Box sx={{ mt: 1.5, p: 1, borderRadius: 1.5, bgcolor: 'background.paper' }}>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    🕒 Tashrif qayd etilgan vaqt oralig‘i:{' '}
                    <b>
                      {dayjs(result.visitTime.from).format('HH:mm:ss')} — {dayjs(result.visitTime.to).format('HH:mm:ss')}
                    </b>{' '}
                    ({dayjs(result.visitTime.from).format('DD.MM.YYYY')})
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* HARAKAT TREKI («ILON IZI») VA DALOLATNOMA SKRINSHOT HUDUDI */}
          {result && result.nearbyTrack && result.nearbyTrack.length > 0 && (
            <Box
              ref={captureAreaRef}
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                border: '1.5px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.06)')
              }}
            >
              {/* DALOLATNOMA RASMIY SARLAVHASI (Screenshot olinganda aktga ilova sifatida tayyor chiqadi) */}
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc'),
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: 0.5 }}>
                    SMARTGPS SUN’IY YO‘LDOSH MONITORINGI XULOSASI
                  </Typography>
                  <Chip
                    label={
                      result.status === 'VISITED'
                        ? 'XIZMAT KO‘RSATILGAN'
                        : result.status === 'NOT_VISITED'
                          ? 'XIZMAT KO‘RSATILMAGAN'
                          : 'NOANIQ'
                    }
                    color={result.status === 'VISITED' ? 'success' : result.status === 'NOT_VISITED' ? 'error' : 'warning'}
                    sx={{ fontWeight: 800, fontSize: '0.85rem' }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1.5 }}>
                  Dalolatnomaga ilova: avtomobil GPS treki asosida xonadonga xizmat ko‘rsatilganligini tekshirish hisoboti
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Abonent (Xonadon):</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{target?.fullName || '—'}</Typography>
                    {target?.accountNumber && (
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'primary.main', display: 'block' }}>
                        Hisob raqam: {target.accountNumber}
                      </Typography>
                    )}
                    {target?.address && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Manzil: {target.address}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', display: 'block' }}>
                      📍 Koordinata: {formatLatLng(parseFloat(lat) || 0, parseFloat(lng) || 0)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Transport vositasi & Davr:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>🚚 {selectedCar?.name || '—'}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.primary' }}>
                      📅 Sana: <b>{dayjs(selectedDate).format('DD.MM.YYYY')}</b> ({startTime} — {endTime})
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.primary' }}>
                      🎯 Eng yaqin o‘tish masofasi: <b>{result.evidence.closestDistanceMeters >= 0 ? `${result.evidence.closestDistanceMeters} metr` : '—'}</b> (Radius: {result.evidence.radiusMeters} m)
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic', color: 'text.secondary' }}>
                      📝 {result.explanation}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* USKUNALAR PANELI: Lineyka & Skrinshot olish */}
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Route sx={{ color: 'primary.main', fontSize: 26 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Mashina harakat treki («Ilon izi»)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Abonent atrofidagi katta radiusdagi avtomobil harakati
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    variant="outlined"
                    color="primary"
                    label={`${result.nearbyTrack.length} ta GPS nuqta`}
                    sx={{ height: 24, fontWeight: 600 }}
                  />
                  {result.trackRadiusMeters && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`~${Math.round(result.trackRadiusMeters)} m qamrov`}
                      sx={{ height: 24 }}
                    />
                  )}
                </Stack>

                {/* Lineyka va Skrinshot boshqaruvi */}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  {measureMode && (
                    <Chip
                      color="warning"
                      variant="filled"
                      label={measurePoints.length > 1 ? `Masofa: ${totalMeasureDistance} m` : "Xaritada nuqtalarni bosing"}
                      sx={{ fontWeight: 700, height: 30 }}
                    />
                  )}
                  <Button
                    size="small"
                    variant={measureMode ? 'contained' : 'outlined'}
                    color={measureMode ? 'warning' : 'primary'}
                    startIcon={<Straighten />}
                    onClick={() => {
                      setMeasureMode(!measureMode);
                      if (measureMode) handleClearMeasure();
                    }}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    {measureMode ? 'Lineykani yopish' : 'Lineyka (O‘lchash)'}
                  </Button>
                  {measureMode && measurePoints.length > 0 && (
                    <>
                      <Tooltip title="Oxirgi nuqtani bekor qilish">
                        <IconButton size="small" onClick={handleUndoMeasurePoint} color="inherit">
                          <Undo fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Lineykani tozalash">
                        <IconButton size="small" onClick={handleClearMeasure} color="error">
                          <RestartAlt fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}

                  {/* Skrinshot olish tugmasi */}
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={capturing ? <CircularProgress size={16} color="inherit" /> : <CameraAlt />}
                    onClick={handleCaptureScreenshot}
                    disabled={capturing}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      bgcolor: '#2e7d32',
                      '&:hover': { bgcolor: '#1b5e20' }
                    }}
                  >
                    {capturing ? 'Rasm olinmoqda...' : 'Akt uchun skrinshot olish'}
                  </Button>
                </Stack>
              </Stack>

              {/* Xarita konteyneri */}
              <Box
                sx={{
                  height: isFullscreen ? 'calc(100vh - 430px)' : 440,
                  minHeight: 400,
                  width: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  cursor: measureMode ? 'crosshair' : 'default'
                }}
              >
                <BaseMap
                  center={[parseFloat(lat) || 0, parseFloat(lng) || 0]}
                  zoom={16}
                  height="100%"
                  defaultLayer="googleHybrid"
                >
                  <MeasureClickHandler active={measureMode} onAddPoint={handleAddMeasurePoint} />
                  <TrackBoundsFitter
                    subscriber={{ lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0 }}
                    track={result.nearbyTrack}
                  />

                  {/* Katta kontekst qamrov doirasi */}
                  {result.trackRadiusMeters && (
                    <Circle
                      center={[parseFloat(lat) || 0, parseFloat(lng) || 0]}
                      radius={result.trackRadiusMeters}
                      pathOptions={{
                        color: '#0288d1',
                        fillColor: '#0288d1',
                        fillOpacity: 0.04,
                        weight: 1.2,
                        dashArray: '6, 8'
                      }}
                    />
                  )}

                  {/* Xizmat ko'rsatish radiusi doirasi */}
                  <Circle
                    center={[parseFloat(lat) || 0, parseFloat(lng) || 0]}
                    radius={result.evidence.radiusMeters || 30}
                    pathOptions={{
                      color: result.status === 'VISITED' ? '#2e7d32' : '#ed6c02',
                      fillColor: result.status === 'VISITED' ? '#2e7d32' : '#ed6c02',
                      fillOpacity: 0.18,
                      weight: 2,
                      dashArray: '4, 4'
                    }}
                  />

                  {/* Abonent xonadoni (Nishon) */}
                  <Marker
                    position={[parseFloat(lat) || 0, parseFloat(lng) || 0]}
                    icon={pinIcon('#d32f2f', 32)}
                  >
                    <Popup>
                      <Box sx={{ p: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                          🏠 {target?.fullName || 'Xonadon'}
                        </Typography>
                        {target?.accountNumber && (
                          <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', color: 'primary.main' }}>
                            Hisob: {target.accountNumber}
                          </Typography>
                        )}
                        {target?.address && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {target.address}
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
                          Xizmat radiusi: {result.evidence.radiusMeters || 30} metr
                        </Typography>
                      </Box>
                    </Popup>
                  </Marker>

                  {/* «Ilon izi» polyline — tashqi oq kontur va ichki yorqin ko'k chiziq */}
                  <Polyline
                    positions={result.nearbyTrack.map((p) => [p.lat, p.lng])}
                    pathOptions={{
                      color: '#ffffff',
                      weight: 7,
                      opacity: 0.7,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }}
                  />
                  <Polyline
                    positions={result.nearbyTrack.map((p) => [p.lat, p.lng])}
                    pathOptions={{
                      color: '#0288d1',
                      weight: 4.5,
                      opacity: 0.95,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }}
                  />

                  {/* Trek bo'ylab nuqtalar */}
                  {result.nearbyTrack.map((p, idx) => {
                    const isStart = idx === 0;
                    const isEnd = idx === result.nearbyTrack!.length - 1;
                    return (
                      <CircleMarker
                        key={`pt-${idx}-${p.time}`}
                        center={[p.lat, p.lng]}
                        radius={isStart || isEnd ? 6.5 : 3.5}
                        pathOptions={{
                          color: isStart ? '#1b5e20' : isEnd ? '#b71c1c' : '#01579b',
                          fillColor: isStart ? '#4caf50' : isEnd ? '#f44336' : '#ffffff',
                          fillOpacity: 1,
                          weight: isStart || isEnd ? 2.5 : 1.5
                        }}
                      >
                        <Popup>
                          <Box sx={{ p: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {isStart
                                ? '🟢 Marshrut boshlanishi'
                                : isEnd
                                  ? '🏁 Marshrut tugashi'
                                  : `📍 GPS nuqta #${idx + 1}`}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              🕒 Vaqt: <b>{dayjs.unix(p.time).format('HH:mm:ss')}</b>
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              ⚡ Tezlik: <b>{p.speed} km/soat</b>
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: 'primary.main', fontWeight: 600 }}>
                              📏 Abonentgacha: <b>{p.distanceMeters} metr</b>
                            </Typography>
                          </Box>
                        </Popup>
                      </CircleMarker>
                    );
                  })}

                  {/* Eng yaqin o'tgan nuqta */}
                  {result.closestPoint && (
                    <CircleMarker
                      center={[result.closestPoint.lat, result.closestPoint.lng]}
                      radius={8.5}
                      pathOptions={{
                        color: '#b71c1c',
                        fillColor: '#ff9800',
                        fillOpacity: 1,
                        weight: 2.5
                      }}
                    >
                      <Popup>
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b71c1c', mb: 0.5 }}>
                            🎯 Eng yaqin kelgan nuqta!
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            📏 Masofa: <b>{result.closestPoint.distanceMeters} metr</b>
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            🕒 Vaqt: <b>{dayjs.unix(result.closestPoint.time).format('HH:mm:ss')}</b>
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            ⚡ Tezlik: <b>{result.closestPoint.speed} km/soat</b>
                          </Typography>
                        </Box>
                      </Popup>
                    </CircleMarker>
                  )}

                  {/* Lineyka bilan o'lchanayotgan chiziq va nuqtalar */}
                  {measurePoints.length > 0 && (
                    <>
                      <Polyline
                        positions={measurePoints}
                        pathOptions={{
                          color: '#ff6d00',
                          weight: 3.5,
                          dashArray: '6, 6',
                          opacity: 0.95
                        }}
                      />
                      {measurePoints.map((pt, idx) => (
                        <CircleMarker
                          key={`measure-pt-${idx}`}
                          center={pt}
                          radius={5.5}
                          pathOptions={{
                            color: '#b71c1c',
                            fillColor: '#ffeb3b',
                            fillOpacity: 1,
                            weight: 2.5
                          }}
                        >
                          <LeafletTooltip permanent direction="top" offset={[0, -6]}>
                            {idx === 0 ? 'Boshlanish' : `#${idx + 1}`}
                          </LeafletTooltip>
                        </CircleMarker>
                      ))}
                    </>
                  )}
                </BaseMap>
              </Box>

              {/* Legenda va vaqt tamg'asi */}
              <Stack direction="row" spacing={1.5} sx={{ mt: 1.5, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#d32f2f' }} />
                    <Typography variant="caption" color="text.secondary">
                      Abonent
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2e7d32' }} />
                    <Typography variant="caption" color="text.secondary">
                      Xizmat radiusi ({result.evidence.radiusMeters} m)
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 16, height: 3.5, bgcolor: '#0288d1', borderRadius: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Harakat treki («Ilon izi»)
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff9800', border: '1.5px solid #b71c1c' }} />
                    <Typography variant="caption" color="text.secondary">
                      Eng yaqin nuqta ({result.closestPoint?.distanceMeters ?? result.evidence.closestDistanceMeters} m)
                    </Typography>
                  </Stack>
                  {measureMode && (
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Box sx={{ width: 16, height: 3, bgcolor: '#ff6d00', borderRadius: 1 }} />
                      <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>
                        Lineyka ({totalMeasureDistance} m)
                      </Typography>
                    </Stack>
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {dayjs().format('DD.MM.YYYY HH:mm:ss')} | Toza Makon / SmartGPS
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Agar trek nuqtalari bo'lmasa */}
          {result && (!result.nearbyTrack || result.nearbyTrack.length === 0) && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Belgilangan vaqt oralig‘ida transport vositasi abonent koordinatasi yaqiniga (katta qamrov radiusiga) kelmagan.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} color="inherit">
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
}
