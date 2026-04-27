import { DialogContent, DialogActions, TextField, MenuItem, Button, Stack, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useCallerStore } from '../useCallerStore';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createCallWarningsService, Priority } from 'services/caller.service';
import api from 'utils/api';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { AbonentDetails } from 'types/billing';

// Abonent ma'lumotlari uchun interfeys
interface IFoundAbonent {
  residentId: number;
  fullName: string;
  mahallaName: string;
  balance: number;
}

export const CreateCallModal = () => {
  const { modals, setModal, applyFilters } = useCallerStore();

  const [accountNumber, setAccountNumber] = useState('');
  const [priority, setPriority] = useState<Priority>('low');
  const [foundAbonent, setFoundAbonent] = useState<IFoundAbonent | null>(null);
  const [loading, setLoading] = useState(false);

  const callerService = createCallWarningsService(api);

  // Hisob raqami 12 taga yetganda abonentni qidirish
  useEffect(() => {
    const fetchAbonent = async () => {
      if (accountNumber.length === 12) {
        try {
          setLoading(true);
          // Bu yerda o'zingizning abonent qidirish API endpointingizni yozasiz
          const response = await api.get('/billing/get-abonent-data-by-licshet/' + accountNumber);

          if (response.data.abonentData) {
            const data: AbonentDetails = response.data.abonentData;
            setFoundAbonent({
              residentId: data.id,
              fullName: data.fullName,
              mahallaName: data.mahallaName,
              balance: data.balance.kSaldo
            });
          } else {
            toast.warning('Abonent topilmadi');
            setFoundAbonent(null);
          }
        } catch (e) {
          console.error(e);
          setFoundAbonent(null);
        } finally {
          setLoading(false);
        }
      } else {
        setFoundAbonent(null);
      }
    };

    fetchAbonent();
  }, [accountNumber]);

  const handleSave = async () => {
    if (!foundAbonent) return;

    try {
      await callerService.create({
        accountNumber: accountNumber,
        priority: priority,
        residentId: foundAbonent.residentId
      });

      toast.success("Muvaffaqiyatli yaratildi, To'ram!");
      handleClose();
      applyFilters();
    } catch (e) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleClose = () => {
    setModal('create', false);
    setAccountNumber('');
    setFoundAbonent(null);
    setPriority('low');
  };

  return (
    <DraggableDialog open={modals.create} onClose={handleClose} fullWidth maxWidth="xs" title={"Yangi monitoring qo'shish"}>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Hisob raqami (12 xonali)"
            fullWidth
            autoFocus
            value={accountNumber}
            inputProps={{ maxLength: 12 }}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} // Faqat raqamlar
            InputProps={{
              endAdornment: loading && <CircularProgress size={20} />
            }}
          />

          {foundAbonent && (
            <Alert severity="info" icon={false} sx={{ bgcolor: 'background.default', border: '1px solid #90caf9' }}>
              <Box>
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                  {foundAbonent.fullName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Mahalla: {foundAbonent.mahallaName}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                  Balans: {foundAbonent.balance} so'm {foundAbonent.balance < 0 ? 'Haqdor' : 'Qarzdor'}
                </Typography>
              </Box>
            </Alert>
          )}

          <TextField select label="Prioritet" value={priority} fullWidth onChange={(e) => setPriority(e.target.value as Priority)}>
            <MenuItem value="low">Past</MenuItem>
            <MenuItem value="medium">O'rta</MenuItem>
            <MenuItem value="high">Yuqori</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Bekor qilish
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!foundAbonent || loading}>
          Saqlash
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
};
