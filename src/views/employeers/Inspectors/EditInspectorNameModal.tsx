import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import api from 'utils/api';

interface EditInspectorNameModalProps {
  open: boolean;
  onClose: () => void;
  inspector: {
    id: number | string;
    _id?: string;
    name: string;
  } | null;
  onSuccess?: (updatedName: string) => void;
}

const EditInspectorNameModal: React.FC<EditInspectorNameModalProps> = ({
  open,
  onClose,
  inspector,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>(inspector?.name || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  React.useEffect(() => {
    if (inspector) {
      setName(inspector.name || '');
      setErrorText('');
    }
  }, [inspector]);

  if (!inspector) return null;

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorText("Nazoratchi ismi bo'sh bo'lishi mumkin emas");
      return;
    }
    if (trimmed.length < 2) {
      setErrorText("Nazoratchi ismi kamida 2 ta belgidan iborat bo'lishi kerak");
      return;
    }

    try {
      setLoading(true);
      setErrorText('');

      const targetId = inspector.id || inspector._id;
      const res = await api.put<{ ok: boolean; message: string; inspector?: any }>(
        `/inspectors/${targetId}/name`,
        { name: trimmed }
      );

      if (res.data.ok) {
        toast.success(res.data.message || "Nazoratchi ismi muvaffaqiyatli o'zgartirildi");
        if (onSuccess) {
          onSuccess(trimmed);
        }
        onClose();
      } else {
        toast.error(res.data.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Error updating inspector name:', err);
      const msg = err.response?.data?.message || err.message || "Ismni o'zgartirishda xatolik yuz berdi";
      setErrorText(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DraggableDialog
      open={open}
      title="Nazoratchi ismini tahrirlash"
      onClose={() => {
        if (!loading) onClose();
      }}
      maxWidth="sm"
    >
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Nazoratchi ID (Tizim kodi)
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={inspector.id}
              disabled
              slotProps={{
                input: {
                  readOnly: true
                }
              }}
              helperText="Nazoratchining ID raqami o'zgarmas bo'lib, uni o'zgartirib bo'lmaydi"
              sx={{ mt: 0.5 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Familiya, Ism va Sharif (F.I.O) *
            </Typography>
            <TextField
              fullWidth
              autoFocus
              size="small"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorText) setErrorText('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  e.preventDefault();
                  handleSave();
                }
              }}
              error={Boolean(errorText)}
              helperText={errorText || 'Rasmiy hujjatlar bo‘yicha to‘liq F.I.O'}
              placeholder="Masalan: Karimova Dilnoza Anvarovna"
              sx={{ mt: 0.5 }}
            />
          </Box>

          <Alert severity="info" sx={{ fontSize: '0.8125rem' }}>
            Nazoratchi ismi o'zgartirilganda unga biriktirilgan barcha mahallalardagi nazoratchi nomi ham bir vaqtda
            avtomatik ravishda yangilanadi.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          {t('common.cancel', 'Bekor qilish')}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading || !name.trim() || name.trim() === inspector.name}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? t('common.saving', 'Saqlanmoqda...') : t('common.save', 'Saqlash')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
};

export default EditInspectorNameModal;
