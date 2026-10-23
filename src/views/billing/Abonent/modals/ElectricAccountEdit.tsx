import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../hooks/abonentStore';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useAbonentLogic } from '../hooks/useAbonentLogic';
import { Alert, Box, Button, CircularProgress, DialogActions, LinearProgress, Stack, TextField, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { CompactKeyValue } from 'ui-component/cards/AbonentCardView';
import { HETSuccessResponse } from '../types';

function EditElectricAccountModal() {
  const {
    openEditElectricAccountState,
    setOpenEditElectricAccountState,
    getHetAbonent,
    abonentDetails,
    updateElectricity,
    setHetAbonent: setGlobalHetAbonent
  } = useAbonentStore();
  const { residentId } = useAbonentLogic();

  const [accountNumber, setAccountNumber] = useState('');
  const [coato, setCoato] = useState('');
  const [hetAbonent, setHetAbonent] = useState<HETSuccessResponse>();
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (abonentDetails?.id) {
      setAccountNumber(abonentDetails.electricityAccountNumber || '');
      setCoato(abonentDetails.electricityCoato || '');
    } else {
      setHetAbonent(undefined);
    }
  }, [residentId, abonentDetails]);

  // Raqam to'liq kiritilgach HET'dan egasini qidiramiz. Har bir harfda emas, yozib bo'lgach (400ms) so'raladi.
  useEffect(() => {
    setLookupError('');
    if (!(accountNumber.length > 6 && coato.length === 5)) {
      setHetAbonent(undefined);
      setLookupLoading(false);
      return;
    }
    let cancelled = false;
    setLookupLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await getHetAbonent({ coato, personalAccount: accountNumber });
        if (cancelled) return;
        if ('code' in res) {
          setHetAbonent(undefined);
          setLookupError(res.message || 'Elektr hisob raqami topilmadi');
        } else {
          setHetAbonent(res);
        }
      } catch (error: any) {
        if (!cancelled) setLookupError(error?.response?.data?.message || 'HET bilan bog‘lanib bo‘lmadi, keyinroq urinib ko‘ring');
      } finally {
        if (!cancelled) setLookupLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [accountNumber, coato]);

  const handleClose = () => {
    if (!saving) setOpenEditElectricAccountState(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateElectricity({ residentId, electricityAccountNumber: accountNumber, electricityCoato: coato });
      setGlobalHetAbonent(hetAbonent);
      toast.success('Elektr hisob raqami saqlandi');
      setOpenEditElectricAccountState(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Elektr hisob raqamini saqlab bo‘lmadi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DraggableDialog open={openEditElectricAccountState} onClose={handleClose} title={t('buttons.edit')}>
      <form onSubmit={handleSubmit}>
        <Stack direction={'row'} spacing={1}>
          <TextField
            label={t('tableHeaders.electricityCoato')}
            value={coato}
            onChange={(e) => setCoato(e.target.value.trim())}
            disabled={saving}
          />
          <TextField
            label={t('tableHeaders.electricityAccountNumber')}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.trim())}
            disabled={saving}
          />
        </Stack>

        <Box sx={{ minHeight: 8, mt: 1 }}>
          {lookupLoading && (
            <Box role="status" aria-live="polite">
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                HET'dan abonent qidirilmoqda…
              </Typography>
              <LinearProgress sx={{ mt: 0.5, borderRadius: 2 }} />
            </Box>
          )}
          {!lookupLoading && lookupError && (
            <Alert severity="warning" sx={{ py: 0 }}>
              {lookupError}
            </Alert>
          )}
        </Box>

        <CompactKeyValue
          data={[
            { key: t('tableHeaders.fullName'), value: hetAbonent?.fullName },
            { key: t('tableHeaders.phone'), value: hetAbonent?.phone },
            { key: t('tableHeaders.cadastralNumber'), value: hetAbonent?.cadastralNumber },
            { key: t('tableHeaders.address'), value: hetAbonent?.address }
          ]}
        />
        <DialogActions>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || lookupLoading}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? 'Saqlanmoqda…' : t('buttons.saveChanges')}
          </Button>
        </DialogActions>
      </form>
    </DraggableDialog>
  );
}

export default EditElectricAccountModal;
