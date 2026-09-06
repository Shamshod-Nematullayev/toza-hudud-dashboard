import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface RejectPetitionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  documentNumber?: string | number;
}

const COMMON_REASONS = [
  "Noto'g'ri hisob raqam kiritilgan",
  "Hujjatlar to'liq taqdim etilmagan",
  "Ma'lumotlar mos kelmadi",
  "Abonent murojaatidan voz kechdi",
  'Boshqa sabab'
];

export default function RejectPetitionDialog({ open, onClose, onConfirm, documentNumber }: RejectPetitionDialogProps) {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleClose = () => {
    if (loading) return;
    setSelectedReason('');
    setCustomReason('');
    setError('');
    onClose();
  };

  const handleConfirm = async () => {
    const finalReason = selectedReason === 'Boshqa sabab' ? customReason.trim() : (selectedReason || customReason).trim();
    if (!finalReason) {
      setError(t('recalculationPage.reasonRequired', 'Bekor qilish sababini ko‘rsating'));
      return;
    }

    try {
      setLoading(true);
      await onConfirm(finalReason);
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {t('recalculationPage.cancelPetitionTitle', 'Arizani bekor qilish')} {documentNumber ? `(#${documentNumber})` : ''}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <DialogContentText>
            {t(
              'recalculationPage.cancelPetitionDesc',
              'Ushbu arizani bekor qilish uchun sababni tanlang yoki batafsil izoh kiriting:'
            )}
          </DialogContentText>

          <FormControl fullWidth size="small">
            <InputLabel id="reject-reason-label">{t('recalculationPage.selectReason', 'Sababni tanlang')}</InputLabel>
            <Select
              labelId="reject-reason-label"
              value={selectedReason}
              label={t('recalculationPage.selectReason', 'Sababni tanlang')}
              onChange={(e) => {
                setSelectedReason(e.target.value);
                setError('');
              }}
            >
              {COMMON_REASONS.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(selectedReason === 'Boshqa sabab' || selectedReason === '') && (
            <TextField
              label={t('recalculationPage.reasonDetails', 'Bekor qilish izohi / sababi')}
              multiline
              rows={3}
              value={customReason}
              onChange={(e) => {
                setCustomReason(e.target.value);
                if (error) setError('');
              }}
              error={Boolean(error)}
              helperText={error}
              fullWidth
              size="small"
              placeholder={t('recalculationPage.reasonPlaceholder', 'Sababni batafsil yozing...')}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          {t('tableActions.cancel', 'Bekor qilish')}
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? t('loading', 'Yuklanmoqda...') : t('tableActions.confirm', 'Tasdiqlash')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
