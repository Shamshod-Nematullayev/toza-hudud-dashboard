import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { toast } from 'react-toastify';
import api from 'utils/api';
import useOdamSoniXatlovStore from '../odamSoniXatlovStore';

interface AddSingleXatlovModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddSingleXatlovModal({ open, onClose }: AddSingleXatlovModalProps) {
  const { toggleRefresh } = useOdamSoniXatlovStore();
  const [accountNumber, setAccountNumber] = useState('');
  const [yashovchilar, setYashovchilar] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [abonentInfo, setAbonentInfo] = useState<any>(null);

  const handleReset = () => {
    setAccountNumber('');
    setYashovchilar('');
    setAbonentInfo(null);
    setSearching(false);
    setSubmitting(false);
  };

  const handleCloseModal = () => {
    handleReset();
    onClose();
  };

  const handleSearchAbonent = async () => {
    if (!accountNumber || accountNumber.trim().length < 5) {
      return toast.error("Hisob raqamini to'g'ri kiriting");
    }
    setSearching(true);
    setAbonentInfo(null);
    try {
      const { data } = await api.get(`/billing/get-abonent-data-by-licshet/${accountNumber.trim()}`);
      if (data && data.rows && data.rows.length > 0) {
        const found = data.rows[0];
        setAbonentInfo({
          fio: found.fullName || found.fio,
          mahallaName: found.mahallaName || found.mahalla_name,
          currentInhabitantCnt: found.house?.inhabitantCnt ?? found.inhabitantCnt ?? 0,
          abonentId: found.id
        });
        toast.success("Abonent ma'lumotlari topildi");
      } else {
        toast.warning("Ushbu hisob raqami bo'yicha abonent topilmadi");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Abonentni qidirishda xatolik yuz berdi");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber) {
      return toast.error('Hisob raqamini kiriting');
    }
    if (!yashovchilar || Number(yashovchilar) <= 0) {
      return toast.error("Aniqlangan yashovchilar sonini to'g'ri kiriting");
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/yashovchi-soni-xatlov/create-single', {
        accountNumber: accountNumber.trim(),
        abonentId: abonentInfo?.abonentId,
        YASHOVCHILAR: Number(yashovchilar)
      });

      if (data.ok) {
        toast.success(data.message || "Abonent xatlovga muvaffaqiyatli qo'shildi");
        toggleRefresh();
        handleCloseModal();
      } else {
        toast.error(data.message || "Xatolik yuz berdi");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatlovga qo'shishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonAddOutlinedIcon color="primary" />
        Xatlovga bittalab qo'shish (MultiplyRequest)
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Abonent hisob raqami (KOD / Licshet):
              </Typography>
              <TextField
                fullWidth
                placeholder="Masalan: 100100123456"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                disabled={submitting}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleSearchAbonent} disabled={searching || !accountNumber} color="primary">
                          {searching ? <CircularProgress size={20} /> : <SearchIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Box>

            {abonentInfo && (
              <Alert severity="success" icon={false} sx={{ borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  F.I.SH: {abonentInfo.fio}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Mahalla: {abonentInfo.mahallaName || 'Kiritilmagan'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Joriy yashovchilar soni: {abonentInfo.currentInhabitantCnt} ta
                </Typography>
              </Alert>
            )}

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Aniqlangan yashovchilar soni (yangi odam soni):
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="Masalan: 5"
                value={yashovchilar}
                onChange={(e) => setYashovchilar(e.target.value)}
                disabled={submitting}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" color="secondary" onClick={handleCloseModal} disabled={submitting}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting || !accountNumber || !yashovchilar}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <PersonAddOutlinedIcon />}
          >
            {submitting ? 'Saqlanmoqda...' : "Xatlovga qo'shish"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
