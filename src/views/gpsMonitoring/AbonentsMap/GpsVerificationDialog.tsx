import { useEffect, useState } from 'react';
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
  Cancel,
  CheckCircle,
  Close,
  ContentCopy,
  DirectionsCar,
  ErrorOutline,
  Help,
  QueryStats,
  Speed,
  Timer
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { formatLatLng } from 'services/abonentLocation';

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

interface SmartGpsCarOption {
  id: number;
  name: string;
  isOnline?: boolean;
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

  const copyExplanation = () => {
    if (!result) return;
    const text = `SmartGPS xizmat tekshiruvi xulosasi:\nHolat: ${result.status === 'VISITED' ? 'XIZMAT KO‘RSATILGAN' : result.status === 'NOT_VISITED' ? 'XIZMAT KO‘RSATILMAGAN' : 'NOANIQ'}\nAvtomobil: ${selectedCar?.name}\nSana: ${selectedDate} (${startTime} - ${endTime})\nMasofa: ${result.evidence.closestDistanceMeters} metr\nIzoh: ${result.explanation}`;
    navigator.clipboard?.writeText(text);
    toast.success('Xulosa nusxalandi');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6, pb: 1, position: 'relative' }}>
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
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <Close />
        </IconButton>
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
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <DirectionsCar fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      )
                    }}
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
