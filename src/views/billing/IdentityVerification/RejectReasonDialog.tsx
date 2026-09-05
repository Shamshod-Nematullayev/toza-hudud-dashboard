import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Chip,
  Box,
  Stack
} from '@mui/material';
import { IconAlertTriangle } from '@tabler/icons-react';

interface RejectReasonDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

const COMMON_REASONS = [
  'PINFL va pasport mos kelmadi',
  'Boshqa shaxsga tegishli',
  "Pasport muddati o'tgan yoki noaniq",
  'Hisob raqam (likschet) noto‘g‘ri',
  'Surat sifatsiz yoki tanib bo‘lmaydi'
];

export const RejectReasonDialog: React.FC<RejectReasonDialogProps> = ({
  open,
  onClose,
  onConfirm,
  loading = false
}) => {
  const [reason, setReason] = useState('');

  const handleSelectChip = (chipText: string) => {
    setReason(chipText);
  };

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
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
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              color: 'error.main'
            }}
          >
            <IconAlertTriangle size={24} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              So'rovni bekor qilish
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Nazoratchiga yuboriladigan bekor qilish sababini ko'rsating
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Tezkor sabablar:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
          {COMMON_REASONS.map((text) => (
            <Chip
              key={text}
              label={text}
              onClick={() => handleSelectChip(text)}
              color={reason === text ? 'error' : 'default'}
              variant={reason === text ? 'filled' : 'outlined'}
              size="small"
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>

        <TextField
          label="Bekor qilish sababi"
          multiline
          rows={3}
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Sababni batafsil yozing yoki yuqoridagi variantlardan tanlang..."
          disabled={loading}
          slotProps={{
            input: {}
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Bekor qilish
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading || !reason.trim()}
          sx={{ fontWeight: 600, px: 3 }}
        >
          {loading ? 'Yuborilmoqda...' : 'Rad etishni tasdiqlash'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
