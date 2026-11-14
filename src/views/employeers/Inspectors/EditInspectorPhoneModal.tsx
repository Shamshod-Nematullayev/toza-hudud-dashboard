import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import { toast } from 'react-toastify';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import api from 'utils/api';

interface EditInspectorPhoneModalProps {
  open: boolean;
  onClose: () => void;
  inspector: {
    id: number | string;
    _id?: string;
    name: string;
    phone?: string | null;
  } | null;
  onSuccess?: (updatedPhone: string) => void;
}

const EditInspectorPhoneModal: React.FC<EditInspectorPhoneModalProps> = ({
  open,
  onClose,
  inspector,
  onSuccess
}) => {
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  React.useEffect(() => {
    if (inspector) {
      // Raqamni 9 xonali formatga keltiramiz
      const raw = String(inspector.phone || '').replace(/\D/g, '');
      const clean = raw.startsWith('998') && raw.length > 9 ? raw.slice(3) : raw;
      setPhone(clean);
      setErrorText('');
    }
  }, [inspector]);

  if (!inspector) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Faqat raqamlarni qoldiramiz va 9 tagacha cheklaymiz
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('998') && val.length > 9) {
      val = val.slice(3);
    }
    if (val.length <= 9) {
      setPhone(val);
      setErrorText('');
    }
  };

  const handleSave = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setErrorText("Telefon raqami kiritilishi shart");
      return;
    }
    if (cleanPhone.length !== 9) {
      setErrorText("Telefon raqami 9 xonali bo'lishi kerak (masalan: 901234567)");
      return;
    }

    try {
      setLoading(true);
      setErrorText('');

      const targetId = inspector.id || inspector._id;
      const res = await api.put<{ ok: boolean; message: string; inspector?: any }>(
        `/inspectors/${targetId}/phone`,
        { phone: cleanPhone }
      );

      if (res.data.ok) {
        toast.success(res.data.message || "Telefon raqami muvaffaqiyatli saqlandi");
        if (onSuccess) {
          onSuccess(cleanPhone);
        }
        onClose();
      } else {
        toast.error(res.data.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Error updating inspector phone:', err);
      const msg = err.response?.data?.message || err.message || "Telefon raqamini saqlashda xatolik yuz berdi";
      setErrorText(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DraggableDialog
      open={open}
      title="Nazoratchi telefon raqamini tahrirlash"
      onClose={() => {
        if (!loading) onClose();
      }}
      maxWidth="sm"
    >
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2.5}>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Nazoratchi:
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 0.5 }}>
              {inspector.name} (ID: {inspector.id})
            </Typography>
          </Box>

          <TextField
            autoFocus
            fullWidth
            label="Telefon raqami"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="901234567"
            disabled={loading}
            error={Boolean(errorText)}
            helperText={errorText || "9 ta raqam kiriting (masalan: 901234567)"}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      +998
                    </Typography>
                  </InputAdornment>
                )
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
          />

          <Alert severity="info" sx={{ fontSize: '0.825rem' }}>
            Kiritilgan telefon raqami <strong>GreenZone</strong> bazasida hamda <strong>TozaMakon</strong> (xodimlar bo'limi) tizimida avtomatik yangilanadi.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Bekor qilish
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading || phone.trim().length !== 9}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {loading ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
};

export default EditInspectorPhoneModal;
