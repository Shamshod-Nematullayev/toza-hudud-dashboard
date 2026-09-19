import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Stack,
  Typography
} from '@mui/material';
import { IconArrowsExchange, IconAlertCircle } from '@tabler/icons-react';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { INewAbonentItem } from './types';

interface RokirovkaModalProps {
  handleClose: () => void;
  abonent: INewAbonentItem | null;
  refresh: () => void;
}

export const RokirovkaModal: React.FC<RokirovkaModalProps> = ({ handleClose, abonent, refresh }) => {
  const [freeAbonent, setFreeAbonent] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!abonent) return;

    let isMounted = true;
    setLoading(true);

    const init = async () => {
      try {
        const [freeRes, accRes] = await Promise.all([
          api.get('/pendingNewAbonents/get-free-abonentid'),
          api.get('/pendingNewAbonents/generateAccountNumber', {
            params: {
              mahallaId: abonent.mahallaId,
              companyId: abonent.companyId
            }
          })
        ]);

        if (isMounted) {
          if (freeRes.data?.data) {
            setFreeAbonent(freeRes.data.data);
          }
          if (accRes.data?.accountNumber) {
            setAccountNumber(accRes.data.accountNumber);
          }
        }
      } catch (err) {
        console.error('Rokirovka ma\'lumotlarini yuklashda xatolik:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [abonent]);

  const handleConfirm = async () => {
    if (!abonent || !freeAbonent || !accountNumber) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/pendingNewAbonents/castling', {
        id: freeAbonent.id,
        newAbonentId: abonent._id,
        accountNumber
      });

      if (data?.ok) {
        handleClose();
        toast.success(data.message || 'Muvaffaqiyatli rokirovka qilindi');
        refresh();
      } else {
        toast.error(data?.message || 'Xatolik yuz berdi');
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.message || 'Rokirovka qilishda xatolik yuz berdi';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!abonent) return null;

  return (
    <Dialog open onClose={submitting ? undefined : handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'rgba(14, 165, 233, 0.1)',
              color: 'info.main'
            }}
          >
            <IconArrowsExchange size={24} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Rokirovka qilish
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Bo'sh hisob raqamni yangi abonent bilan almashtirish
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={36} />
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Bo'sh hisob raqamlar va yangi raqam generatsiya qilinmoqda...
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                display: 'flex',
                gap: 1.5,
                alignItems: 'center'
              }}
            >
              <IconAlertCircle size={22} color="#1d4ed8" />
              <DialogContentText sx={{ color: '#1e40af', fontSize: '0.875rem', m: 0 }}>
                Rostdan ham ushbu fuqaroni bo'sh hisob raqam (
                <strong>{freeAbonent?.accountNumber || 'mavjud emas'}</strong>) ga almashtirmoqchisiz?
              </DialogContentText>
            </Box>

            <TextField
              label="Fuqaro F.I.O"
              type="text"
              fullWidth
              variant="outlined"
              size="small"
              value={abonent.abonent_name || `${abonent.citizen?.lastName || ''} ${abonent.citizen?.firstName || ''} ${abonent.citizen?.patronymic || ''}`.trim()}
              slotProps={{
                input: { readOnly: true }
              }}
            />

            <TextField
              label="Mahalla (MFY)"
              type="text"
              fullWidth
              variant="outlined"
              size="small"
              value={abonent.mahallaName}
              slotProps={{
                input: { readOnly: true }
              }}
            />

            <TextField
              label="Yangi hisob raqami"
              type="text"
              fullWidth
              variant="outlined"
              size="small"
              value={accountNumber}
              slotProps={{
                input: { readOnly: true }
              }}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={submitting} color="inherit">
          Yopish
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="info"
          disabled={submitting || loading || !accountNumber || !freeAbonent}
          sx={{ fontWeight: 600, px: 3 }}
        >
          {submitting ? 'Bajarilmoqda...' : 'Tasdiqlash'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RokirovkaModal;
