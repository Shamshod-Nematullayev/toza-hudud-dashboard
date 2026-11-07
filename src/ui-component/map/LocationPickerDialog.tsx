import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Close, ContentPaste, MyLocation, TravelExplore } from '@mui/icons-material';
import { Marker, Tooltip as LeafletTooltip, useMap, useMapEvents } from 'react-leaflet';
import type { Marker as LeafletMarker } from 'leaflet';
import BaseMap, { pinIcon } from './BaseMap';
import {
  AbonentLocation,
  fetchAbonentLocations,
  formatLatLng,
  isUrl,
  LatLngPoint,
  parseLocationText,
  resolveLocationLink
} from 'services/abonentLocation';

function ClickToPick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

/** Nuqta tashqaridan (havola, GPS) o'zgarganda xaritani o'sha joyga olib boradi */
function FlyTo({ target }: { target: { lat: number; lng: number; key: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 17), { duration: 0.6 });
  }, [target?.key]);
  return null;
}

/** Qo'shnilar bor bo'lsa birinchi ochilishda ularni ko'rsatadi */
function FitNeighbors({ points, enabled }: { points: AbonentLocation[]; enabled: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || points.length === 0) return;
    map.fitBounds(
      points.map((p) => [p.lat, p.lng] as [number, number]),
      { padding: [30, 30], maxZoom: 17 }
    );
  }, [enabled, points.length]);
  return null;
}

export interface LocationPickerDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: { lat: number; lng: number } | null;
  title?: string;
  subtitle?: string;
  /** Shu mahalladagi boshqa belgilangan xonadonlar kulrang nuqta bo'lib ko'rinadi */
  mahallaId?: number;
  residentId?: number;
  onSave: (point: LatLngPoint) => Promise<void> | void;
}

export default function LocationPickerDialog({ open, onClose, initial, title, subtitle, mahallaId, residentId, onSave }: LocationPickerDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [point, setPoint] = useState<LatLngPoint | null>(initial ? { ...initial } : null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; key: number } | null>(null);
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [neighbors, setNeighbors] = useState<AbonentLocation[]>([]);

  useEffect(() => {
    if (!open) return;
    setPoint(initial ? { ...initial } : null);
    setFlyTarget(null);
    setInput('');
    setInputError('');
    if (mahallaId) {
      fetchAbonentLocations(mahallaId)
        .then((rows) => setNeighbors(rows.filter((r) => r.residentId !== residentId)))
        .catch(() => setNeighbors([]));
    } else setNeighbors([]);
  }, [open]);

  const moveTo = (p: LatLngPoint) => {
    setPoint(p);
    setFlyTarget({ lat: p.lat, lng: p.lng, key: Date.now() });
  };

  const applyInput = async (raw = input) => {
    const text = raw.trim();
    if (!text) return;
    setInputError('');
    const local = parseLocationText(text);
    if (local) return moveTo({ ...local, source: isUrl(text) ? 'google_link' : 'coords' });
    if (!isUrl(text)) return setInputError("Koordinata tushunilmadi. Masalan: 41.311081, 69.240562");
    setResolving(true);
    try {
      moveTo({ ...(await resolveLocationLink(text)), source: 'google_link' });
    } catch (err: any) {
      setInputError(err?.response?.data?.message || 'Havoladan koordinata aniqlanmadi');
    } finally {
      setResolving(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      await applyInput(text);
    } catch {
      setInputError("Buferdan o'qib bo'lmadi, qo'lda joylashtiring (Ctrl+V)");
    }
  };

  const useDeviceLocation = () => {
    if (!navigator.geolocation) return setInputError('Brauzer joylashuvni aniqlay olmaydi');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        moveTo({ lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'device', accuracy: Math.round(pos.coords.accuracy) });
      },
      (err) => {
        setLocating(false);
        setInputError(err.code === err.PERMISSION_DENIED ? 'Joylashuvga ruxsat berilmadi' : 'Joylashuv aniqlanmadi');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSave = async () => {
    if (!point) return;
    setSaving(true);
    try {
      await onSave(point);
      onClose();
    } catch {
      /* xabar chaqiruvchida ko'rsatiladi */
    } finally {
      setSaving(false);
    }
  };

  const center = useMemo<[number, number] | undefined>(() => (initial ? [initial.lat, initial.lng] : undefined), [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" fullScreen={fullScreen}>
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="h4" component="span">
          {title || 'Uy joylashuvini belgilash'}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              fullWidth
              size="small"
              label="Google Maps havolasi yoki koordinata"
              placeholder="https://maps.app.goo.gl/...  yoki  41.311081, 69.240562"
              value={input}
              error={!!inputError}
              helperText={inputError || ' '}
              onChange={(e) => {
                setInput(e.target.value);
                setInputError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && applyInput()}
              onPaste={(e) => {
                const text = e.clipboardData.getData('text');
                if (text) {
                  e.preventDefault();
                  setInput(text);
                  applyInput(text);
                }
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Buferdan joylashtirish">
                        <IconButton size="small" onClick={pasteFromClipboard}>
                          <ContentPaste fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  )
                }
              }}
            />
            <Button
              variant="outlined"
              onClick={() => applyInput()}
              disabled={!input.trim() || resolving}
              startIcon={resolving ? <CircularProgress size={16} /> : <TravelExplore />}
              sx={{ whiteSpace: 'nowrap', alignSelf: 'flex-start', height: 40 }}
            >
              Aniqlash
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={useDeviceLocation}
              disabled={locating}
              startIcon={locating ? <CircularProgress size={16} /> : <MyLocation />}
              sx={{ whiteSpace: 'nowrap', alignSelf: 'flex-start', height: 40 }}
            >
              Mening joylashuvim
            </Button>
          </Stack>

          <Box sx={{ position: 'relative' }}>
            <BaseMap center={center} zoom={center ? 17 : undefined} height={fullScreen ? 'calc(100vh - 330px)' : 440}>
              <ClickToPick onPick={(lat, lng) => setPoint({ lat, lng, source: 'map' })} />
              <FlyTo target={flyTarget} />
              <FitNeighbors points={neighbors} enabled={!initial} />
              {neighbors.map((n) => (
                <Marker key={n.residentId} position={[n.lat, n.lng]} icon={pinIcon('#9e9e9e', 18)}>
                  <LeafletTooltip direction="top">
                    {n.fullName} · {[n.streetName, n.homeNumber].filter(Boolean).join(', ')}
                  </LeafletTooltip>
                </Marker>
              ))}
              {point && (
                <Marker
                  position={[point.lat, point.lng]}
                  icon={pinIcon('#d32f2f', 34)}
                  draggable
                  zIndexOffset={1000}
                  eventHandlers={{
                    dragend: (e) => {
                      const ll = (e.target as LeafletMarker).getLatLng();
                      setPoint({ lat: ll.lat, lng: ll.lng, source: 'map' });
                    }
                  }}
                />
              )}
            </BaseMap>
          </Box>

          {point ? (
            <Alert severity="success" sx={{ py: 0 }}>
              Tanlangan nuqta: <b>{formatLatLng(point.lat, point.lng)}</b>
              {point.accuracy ? ` (aniqlik ±${point.accuracy} m)` : ''}. Nuqtani surib yoki xaritani bosib aniqlashtirishingiz mumkin.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ py: 0 }}>
              Xaritada uy ustiga bosing, Google Maps havolasini/koordinatani kiriting yoki «Mening joylashuvim» tugmasini bosing.
              {neighbors.length > 0 && ` Kulrang nuqtalar — shu mahallada belgilangan ${neighbors.length} ta xonadon.`}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Bekor qilish
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!point || saving} startIcon={saving ? <CircularProgress size={16} /> : null}>
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  );
}
