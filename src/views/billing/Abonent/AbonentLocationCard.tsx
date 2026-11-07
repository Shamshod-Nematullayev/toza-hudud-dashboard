import { useEffect, useState } from 'react';
import { Box, Button, Card, Chip, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { AddLocationAlt, DeleteOutlined, Directions, EditLocationAlt, OpenInNew, Place } from '@mui/icons-material';
import { Marker } from 'react-leaflet';
import { toast } from 'react-toastify';
import BaseMap, { pinIcon } from 'ui-component/map/BaseMap';
import LocationPickerDialog from 'ui-component/map/LocationPickerDialog';
import {
  AbonentLocation,
  deleteAbonentLocation,
  fetchAbonentLocation,
  formatLatLng,
  googleDirectionsUrl,
  googleMapsUrl,
  locationSourceLabels,
  saveAbonentLocation
} from 'services/abonentLocation';
import { confirmDialog } from 'ui-component/ConfirmDialog';
import type { AbonentDetails } from 'types/billing';

/** Abonent 360: uy joylashuvi (ko'rish, belgilash, o'zgartirish) */
export default function AbonentLocationCard({ abonent }: { abonent: AbonentDetails | null }) {
  const residentId = abonent?.id;
  const [location, setLocation] = useState<AbonentLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!residentId) return;
    let cancelled = false;
    setLoading(true);
    fetchAbonentLocation(residentId)
      .then((res) => !cancelled && setLocation(res.location))
      .catch(() => !cancelled && setLocation(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [residentId]);

  const handleSave = async (point: { lat: number; lng: number; source?: any; accuracy?: number }) => {
    if (!abonent) return;
    try {
      const saved = await saveAbonentLocation(abonent.id, point, {
        accountNumber: abonent.accountNumber,
        fullName: abonent.fullName,
        mahallaId: abonent.mahallaId,
        mahallaName: abonent.mahallaName,
        streetName: abonent.streetName,
        homeNumber: abonent.house?.homeNumber || undefined
      });
      setLocation(saved);
      toast.success('Joylashuv saqlandi');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Joylashuvni saqlab bo‘lmadi');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!residentId) return;
    const ok = await confirmDialog({
      title: 'Joylashuvni o‘chirish',
      message: 'Abonent uyi joylashuvi o‘chiriladi. Davom etasizmi?',
      confirmText: 'O‘chirish',
      color: 'error'
    });
    if (!ok) return;
    try {
      await deleteAbonentLocation(residentId);
      setLocation(null);
      toast.success('Joylashuv o‘chirildi');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'O‘chirib bo‘lmadi');
    }
  };

  // TozaMakon'da uy koordinatasi bo'lsa, belgilanmagan holatda taklif sifatida ochiladi
  const tozaMakonPoint =
    abonent?.house?.latitude && abonent?.house?.longitude ? { lat: Number(abonent.house.latitude), lng: Number(abonent.house.longitude) } : null;

  return (
    <Card sx={{ p: 2, boxShadow: '2' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Place color="error" />
          <Typography variant="h6">Uy joylashuvi</Typography>
          {location?.source && <Chip size="small" variant="outlined" label={locationSourceLabels[location.source] || location.source} />}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {location && (
            <>
              <Button size="small" startIcon={<OpenInNew />} href={googleMapsUrl(location.lat, location.lng)} target="_blank" rel="noopener">
                Google Maps
              </Button>
              <Button size="small" startIcon={<Directions />} href={googleDirectionsUrl(location.lat, location.lng)} target="_blank" rel="noopener">
                Yo‘nalish
              </Button>
              <Tooltip title="O‘chirish">
                <Button size="small" color="error" onClick={handleDelete} sx={{ minWidth: 0 }}>
                  <DeleteOutlined fontSize="small" />
                </Button>
              </Tooltip>
            </>
          )}
          <Button
            size="small"
            variant="contained"
            disabled={!abonent}
            startIcon={location ? <EditLocationAlt /> : <AddLocationAlt />}
            onClick={() => setPickerOpen(true)}
          >
            {location ? 'O‘zgartirish' : 'Joylashuvni belgilash'}
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Skeleton variant="rounded" height={260} />
      ) : location ? (
        <>
          <BaseMap key={`${location.lat},${location.lng}`} center={[location.lat, location.lng]} zoom={17} height={260}>
            <Marker position={[location.lat, location.lng]} icon={pinIcon('#d32f2f', 32)} />
          </BaseMap>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {formatLatLng(location.lat, location.lng)}
            {location.setByName ? ` · ${location.setByName}` : ''}
            {location.updatedAt ? ` · ${new Date(location.updatedAt).toLocaleString('ru-RU')}` : ''}
          </Typography>
        </>
      ) : (
        <Box
          sx={{
            height: 120,
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Joylashuv belgilanmagan. Xaritadan tanlang, Google Maps havolasini yoki koordinatani kiriting.
          </Typography>
        </Box>
      )}

      <LocationPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initial={location ? { lat: location.lat, lng: location.lng } : tozaMakonPoint}
        subtitle={abonent ? `${abonent.accountNumber} · ${abonent.fullName} · ${[abonent.mahallaName, abonent.streetName].filter(Boolean).join(', ')}` : ''}
        mahallaId={abonent?.mahallaId}
        residentId={abonent?.id}
        onSave={handleSave}
      />
    </Card>
  );
}
