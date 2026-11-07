import { useEffect, useState } from 'react';
import { Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { AddLocationAlt, EditLocationAlt, OpenInNew, Place } from '@mui/icons-material';
import LocationPickerDialog from 'ui-component/map/LocationPickerDialog';
import { fetchAbonentLocation, formatLatLng, googleMapsUrl } from 'services/abonentLocation';
import { useStore } from './useStore';

/**
 * GPS dalolatnomasi: abonent uyi joylashuvi. Saqlangan nuqta bo'lsa shu olinadi.
 * Tashkilot profilida "majburiy" yoqilgan bo'lsa nuqtasiz ariza yaratilmaydi.
 * Ariza yaratilganda nuqta abonentning doimiy joylashuvi sifatida ham saqlanadi (backend).
 */
export default function GpsLocationField() {
  const { abonentData, gpsLocation, setGpsLocation, gpsLocationRequired, setGpsLocationRequired } = useStore();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const residentId = abonentData?.id;

  useEffect(() => {
    setGpsLocation(null);
    if (!residentId) return;
    let cancelled = false;
    setLoading(true);
    fetchAbonentLocation(residentId)
      .then(({ location, requiredForGpsActs }) => {
        if (cancelled) return;
        setGpsLocationRequired(requiredForGpsActs);
        if (location) setGpsLocation({ lat: location.lat, lng: location.lng, source: location.source });
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [residentId]);

  const missing = !gpsLocation;
  const color = missing ? (gpsLocationRequired ? 'error.main' : 'divider') : 'success.main';
  const house = abonentData?.house;
  // TozaMakon'dagi uy koordinatasi — faqat taklif, foydalanuvchi tasdiqlab saqlaydi
  const suggestion = house?.latitude && house?.longitude ? { lat: Number(house.latitude), lng: Number(house.longitude) } : null;

  return (
    <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: '1px solid', borderColor: color }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
        <Place fontSize="small" color={missing ? (gpsLocationRequired ? 'error' : 'action') : 'success'} />
        <Typography variant="caption" sx={{ fontWeight: 700, flex: 1 }}>
          Uy joylashuvi
        </Typography>
        <Chip size="small" label={gpsLocationRequired ? 'Majburiy' : 'Ixtiyoriy'} color={gpsLocationRequired ? 'error' : 'default'} variant="outlined" />
      </Stack>

      {loading ? (
        <CircularProgress size={18} />
      ) : gpsLocation ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1 }}>
            {formatLatLng(gpsLocation.lat, gpsLocation.lng)}
          </Typography>
          <Button size="small" href={googleMapsUrl(gpsLocation.lat, gpsLocation.lng)} target="_blank" rel="noopener" sx={{ minWidth: 0 }}>
            <OpenInNew fontSize="small" />
          </Button>
          <Button size="small" startIcon={<EditLocationAlt />} onClick={() => setOpen(true)} disabled={!residentId}>
            O‘zgartirish
          </Button>
        </Stack>
      ) : (
        <Stack spacing={0.5}>
          {gpsLocationRequired && (
            <Typography variant="caption" color="error">
              Ariza yaratish uchun uy joylashuvini belgilang
            </Typography>
          )}
          <Button
            fullWidth
            size="small"
            variant="outlined"
            color={gpsLocationRequired ? 'error' : 'primary'}
            startIcon={<AddLocationAlt />}
            onClick={() => setOpen(true)}
            disabled={!residentId}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Xaritada belgilash
          </Button>
        </Stack>
      )}

      <LocationPickerDialog
        open={open}
        onClose={() => setOpen(false)}
        initial={gpsLocation || suggestion}
        subtitle={abonentData?.accountNumber ? `${abonentData.accountNumber} · ${abonentData.fullName}` : ''}
        mahallaId={abonentData?.mahallaId}
        residentId={residentId}
        onSave={(point) => setGpsLocation(point)}
      />
    </Paper>
  );
}
