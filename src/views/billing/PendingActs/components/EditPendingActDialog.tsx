import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import api from 'utils/api';
import { toast } from 'react-toastify';

interface EditPendingActDialogProps {
  open: boolean;
  act: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditPendingActDialog: React.FC<EditPendingActDialogProps> = ({
  open,
  act,
  onClose,
  onSuccess
}) => {
  const [actAmount, setActAmount] = useState<number | string>('');
  const [nextInhabitantCount, setNextInhabitantCount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<string>('pending');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (act) {
      setActAmount(act.actAmount ?? 0);
      setNextInhabitantCount(act.next_inhabitant_count !== null && act.next_inhabitant_count !== undefined ? String(act.next_inhabitant_count) : '');
      setDescription(act.description || '');
      setStatus(act.status || 'pending');
    }
  }, [act]);

  const handleSave = async () => {
    if (!act?._id) return;

    setSaving(true);
    try {
      await api.put(`/pending-acts/${act._id}`, {
        actAmount: Number(actAmount),
        next_inhabitant_count: nextInhabitantCount === '' ? null : Number(nextInhabitantCount),
        description,
        status
      });

      toast.success('Muvaffaqiyatli yangilandi');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Kutilayotgan aktni tahrirlash
        </Typography>
        {act && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Hisob raqam: {act.accountNumber} ({act.document_type})
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Akt summasi (so‘m)"
            type="number"
            fullWidth
            size="small"
            value={actAmount}
            onChange={(e) => setActAmount(e.target.value)}
          />

          <TextField
            label="Odam soni (agar o‘zgarsa)"
            type="number"
            fullWidth
            size="small"
            placeholder="Bo‘sh qoldirilsa o‘zgarmaydi"
            value={nextInhabitantCount}
            onChange={(e) => setNextInhabitantCount(e.target.value)}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Akt holati</InputLabel>
            <Select
              value={status}
              label="Akt holati"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="pending">Kutilmoqda (pending)</MenuItem>
              <MenuItem value="processing">Jarayonda (processing)</MenuItem>
              <MenuItem value="completed">Kiritilgan (completed)</MenuItem>
              <MenuItem value="failed">Xatolik (failed)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Izoh"
            multiline
            rows={3}
            fullWidth
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none' }}>
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPendingActDialog;
