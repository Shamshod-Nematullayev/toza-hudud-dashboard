import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
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
import {
  CheckCircle,
  Close,
  ContentCopy,
  ContentPaste,
  Fullscreen,
  FullscreenExit,
  LocationCity,
  MyLocation,
  OpenInNew,
  TravelExplore,
  ZoomIn
} from '@mui/icons-material';
import { Marker, Tooltip as LeafletTooltip, useMap, useMapEvents } from 'react-leaflet';
import type { Marker as LeafletMarker } from 'leaflet';
import { toast } from 'react-toastify';
import BaseMap, { pinIcon } from './BaseMap';
import {
  AbonentLocation,
  fetchAbonentLocations,
  formatLatLng,
  googleMapsUrl,
  isUrl,
  LatLngPoint,
  parseLocationText,
  resolveLocationLink
} from 'services/abonentLocation';

/** Xarita ustiga bosilganda koordinatani olish. Agar uzoqdan (zoom < 17) bosilsa, darhol o'sha xonadonga yaqinlashtiradi */
function ClickToPick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  const map = useMap();
  useMapEvents({
    click: (e) => {
      onPick(e.latlng.lat, e.latlng.lng);
      if (map.getZoom() < 17) {
        map.flyTo([e.latlng.lat, e.latlng.lng], 18, { duration: 0.4 });
      }
    }
  });
  return null;
}

/** Nuqta tashqaridan (havola, GPS, qidiruv) o'zgarganda xaritani o'sha joyga aniq yaqinlashtiradi */
function FlyTo({ target }: { target: { lat: number; lng: number; key: number; zoom?: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom || 18, { duration: 0.5 });
    }
  }, [target?.key]);
  return null;
}

/**
 * Dialog ochilganda xaritani darhol xonadon koordinatasiga yaqinlashtiradi (zoom: 18 - tom va darvoza ko'rinadi).
 * Agar hali koordinata yo'q bo'lsa, mahalladagi qo'shniga yaqinlashtiradi (zoom: 17).
 * Butun viloyatga uzoqlashib ketishiga yo'l qo'ymaydi.
 */
function InitialMapCenter({
  initialPoint,
  open,
  neighbors
}: {
  initialPoint: LatLngPoint | null;
  open: boolean;
  neighbors: AbonentLocation[];
}) {
  const map = useMap();
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (!open) {
      hasCenteredRef.current = false;
      return;
    }

    const centerMap = () => {
      map.invalidateSize();
      if (initialPoint?.lat && initialPoint?.lng) {
        map.setView([initialPoint.lat, initialPoint.lng], 18, { animate: false });
        hasCenteredRef.current = true;
      } else if (!hasCenteredRef.current && neighbors.length > 0) {
        map.setView([neighbors[0].lat, neighbors[0].lng], 17, { animate: false });
        hasCenteredRef.current = true;
      }
    };

    centerMap();
    const t1 = setTimeout(centerMap, 80);
    const t2 = setTimeout(centerMap, 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [open, initialPoint?.lat, initialPoint?.lng, neighbors.length]);

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

export default function LocationPickerDialog({
  open,
  onClose,
  initial,
  title,
  subtitle,
  mahallaId,
  residentId,
  onSave
}: LocationPickerDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isMaximized, setIsMaximized] = useState(false);

  const [point, setPoint] = useState<LatLngPoint | null>(initial ? { ...initial } : null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; key: number; zoom?: number } | null>(null);
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [neighbors, setNeighbors] = useState<AbonentLocation[]>([]);
  const [showNeighbors, setShowNeighbors] = useState(true);

  useEffect(() => {
    if (!open) return;
    setPoint(initial ? { ...initial } : null);
    setFlyTarget(null);
    setInput('');
    setInputError('');
    setShowNeighbors(true);
    if (mahallaId) {
      fetchAbonentLocations(mahallaId)
        .then((rows) => setNeighbors(rows.filter((r) => r.residentId !== residentId)))
        .catch(() => setNeighbors([]));
    } else setNeighbors([]);
  }, [open]);

  const moveTo = (p: LatLngPoint) => {
    setPoint(p);
    setFlyTarget({ lat: p.lat, lng: p.lng, key: Date.now(), zoom: 18 });
  };

  const applyInput = async (raw = input) => {
    const text = raw.trim();
    if (!text) return;
    setInputError('');
    const local = parseLocationText(text);
    if (local) return moveTo({ ...local, source: isUrl(text) ? 'google_link' : 'coords' });
    if (!isUrl(text)) return setInputError('Koordinata tushunilmadi. Masalan: 41.311081, 69.240562');
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

  const copyCoordinates = () => {
    if (!point) return;
    const text = formatLatLng(point.lat, point.lng);
    navigator.clipboard?.writeText(text);
    toast.success('Koordinata nusxalandi');
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

  const center = useMemo<[number, number] | undefined>(() => (initial ? [initial.lat, initial.lng] : undefined), [open, initial?.lat, initial?.lng]);

  const isFullScreen = isMobile || isMaximized;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={isMaximized ? false : 'xl'}
      fullScreen={isFullScreen}
      sx={{
        '& .MuiDialog-paper': {
          width: isMaximized ? '100vw' : { xs: '98vw', sm: '95vw', md: '92vw' },
          maxWidth: isMaximized ? '100vw !important' : '1400px !important',
          height: isMaximized ? '100vh' : { xs: '96vh', sm: '90vh' },
          maxHeight: isMaximized ? '100vh' : '92vh',
          display: 'flex',
          flexDirection: 'column',
          m: isMaximized ? 0 : 'auto',
          ...(isMaximized
            ? { borderRadius: 0 }
            : { borderRadius: 3, transition: 'all 0.2s ease-in-out' })
        }
      }}
    >
      <DialogTitle sx={{ pr: 12, py: 1.5, flexShrink: 0, position: 'relative' }}>
        <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
          {title || 'Uy joylashuvini belgilash'}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
            {subtitle}
          </Typography>
        )}

        {/* Yuqori o'ng burchakdagi boshqaruv tugmalari (Fullscreen va Yopish) */}
        <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <Tooltip title={isMaximized ? 'Oynani kichraytirish' : "To'liq ekran (Fullscreen)"}>
            <IconButton onClick={() => setIsMaximized((v) => !v)} size="medium" sx={{ color: 'text.secondary' }}>
              {isMaximized ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Yopish">
            <IconButton onClick={onClose} size="medium" sx={{ color: 'text.secondary' }}>
              <Close />
            </IconButton>
          </Tooltip>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
          gap: 1.5
        }}
      >
        {/* Qidiruv va harakatlar paneli */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Google Maps havolasi yoki koordinata (41.311081, 69.240562)"
            value={input}
            error={!!inputError}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 42,
                borderRadius: 2
              }
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Buferdan joylashtirish">
                      <IconButton size="small" onClick={pasteFromClipboard} edge="end">
                        <ContentPaste fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }
            }}
          />
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant={input.trim() ? 'contained' : 'outlined'}
              onClick={() => applyInput()}
              disabled={!input.trim() || resolving}
              startIcon={resolving ? <CircularProgress size={16} /> : <TravelExplore />}
              sx={{
                height: 42,
                px: 2,
                whiteSpace: 'nowrap',
                borderRadius: 2,
                flex: { xs: 1, sm: 'none' }
              }}
            >
              Aniqlash
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={useDeviceLocation}
              disabled={locating}
              startIcon={locating ? <CircularProgress size={16} /> : <MyLocation />}
              sx={{
                height: 42,
                px: 2,
                whiteSpace: 'nowrap',
                borderRadius: 2,
                flex: { xs: 1, sm: 'none' }
              }}
            >
              Mening joylashuvim
            </Button>
          </Stack>
        </Stack>

        {inputError && (
          <Alert severity="error" onClose={() => setInputError('')} sx={{ py: 0.5, borderRadius: 2, flexShrink: 0 }}>
            {inputError}
          </Alert>
        )}

        {/* Qo'shnilar haqida info va toggle (agar bo'lsa) */}
        {neighbors.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-start', flexShrink: 0 }}>
            <Chip
              icon={<LocationCity fontSize="small" />}
              size="small"
              variant={showNeighbors ? 'filled' : 'outlined'}
              color="default"
              label={showNeighbors ? `Mahalladagi qo‘shnilar: ${neighbors.length} ta (ko‘rsatilmoqda)` : `Qo‘shnilarni ko‘rsatish (${neighbors.length} ta)`}
              onClick={() => setShowNeighbors((v) => !v)}
              sx={{ cursor: 'pointer', fontWeight: 500 }}
            />
          </Stack>
        )}

        {/* Xarita qismi: butun mavjud balandlikni to'ldiradi (flex: 1), hech qanday bo'sh oq joy qolmaydi */}
        <Box
          sx={{
            flex: 1,
            minHeight: { xs: 350, sm: 460 },
            width: '100%',
            position: 'relative',
            borderRadius: isMaximized ? 1 : 2.5,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <BaseMap center={center} zoom={18} height="100%">
            <ClickToPick onPick={(lat, lng) => setPoint({ lat, lng, source: 'map' })} />
            <FlyTo target={flyTarget} />
            <InitialMapCenter initialPoint={point} open={open} neighbors={neighbors} />

            {/* Qo'shni xonadonlar (kichik kulrang markerlar) */}
            {showNeighbors &&
              neighbors.map((n) => (
                <Marker key={n.residentId} position={[n.lat, n.lng]} icon={pinIcon('#757575', 18)}>
                  <LeafletTooltip direction="top">
                    <div style={{ fontSize: 12 }}>
                      <b>{n.fullName}</b>
                      <br />
                      {[n.streetName, n.homeNumber].filter(Boolean).join(', ') || 'Manzil ko‘rsatilmagan'}
                    </div>
                  </LeafletTooltip>
                </Marker>
              ))}

            {/* Tanlangan uy joylashuvi: ixcham va aniq qizil marker (o'lchami 26px) */}
            {point && (
              <Marker
                position={[point.lat, point.lng]}
                icon={pinIcon('#d32f2f', 26)}
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

        {/* Pastki tanlangan koordinata holati paneli */}
        {point ? (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(46, 125, 50, 0.08)',
              border: '1px solid rgba(46, 125, 50, 0.25)',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1,
              flexShrink: 0
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <CheckCircle sx={{ color: '#2e7d32', fontSize: 22 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1b5e20' }}>
                  Tanlangan nuqta: <span style={{ fontFamily: 'monospace', fontSize: '1.05em' }}>{formatLatLng(point.lat, point.lng)}</span>
                  {point.accuracy ? ` (aniqlik ±${point.accuracy} m)` : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Nuqtani surib yoki xaritani bosib aniqlashtirishingiz mumkin
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
              <Tooltip title="Uyni yaqinlashtirish (Zoom 18)">
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  startIcon={<ZoomIn fontSize="small" />}
                  onClick={() => point && setFlyTarget({ lat: point.lat, lng: point.lng, key: Date.now(), zoom: 18 })}
                >
                  Yaqinlashtirish
                </Button>
              </Tooltip>
              <Tooltip title="Koordinatani nusxalash">
                <Button size="small" variant="text" color="inherit" startIcon={<ContentCopy fontSize="small" />} onClick={copyCoordinates}>
                  Nusxalash
                </Button>
              </Tooltip>
              <Tooltip title="Google Maps'da ko'rish">
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  startIcon={<OpenInNew fontSize="small" />}
                  href={googleMapsUrl(point.lat, point.lng)}
                  target="_blank"
                  rel="noopener"
                >
                  Xaritada
                </Button>
              </Tooltip>
            </Stack>
          </Box>
        ) : (
          <Alert severity="info" sx={{ py: 0.5, borderRadius: 2, flexShrink: 0 }}>
            Xaritada uy ustiga bosing, koordinatani kiriting yoki «Mening joylashuvim» tugmasidan foydalaning.
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5, flexShrink: 0 }}>
        <Button onClick={onClose} color="inherit" sx={{ borderRadius: 2 }}>
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!point || saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            borderRadius: 2,
            px: 3,
            bgcolor: '#2e7d32',
            '&:hover': { bgcolor: '#1b5e20' },
            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
          }}
        >
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  );
}
