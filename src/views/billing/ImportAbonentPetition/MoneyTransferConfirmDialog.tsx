import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material';
import { useState, useEffect } from 'react';

interface MoneyTransferConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (shouldTransfer: boolean) => void;
  totalAmount: number;
  arizaChoice?: boolean;
}

export function MoneyTransferConfirmDialog({
  open,
  onClose,
  onConfirm,
  totalAmount,
  arizaChoice
}: MoneyTransferConfirmDialogProps) {
  const [transferChoice, setTransferChoice] = useState<string>('true');

  useEffect(() => {
    if (open) {
      setTransferChoice('true'); // Default holatda ha ko'chirilsin tanlangan bo'ladi
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(transferChoice === 'true');
  };

  const formattedAmount = Number(totalAmount || 0).toLocaleString('uz-UZ');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
        Ikkilamchi hisob raqam to'lovlarini ko'chirish
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Alert severity="info" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
            System: Abonentning ikkilamchi hisobraqamiga jami <strong>{formattedAmount}</strong> so'm to'lov qilingan. Uni haqiqiy hisob raqamiga o'tkazishni xohlaysizmi?
          </Alert>

          {arizaChoice !== undefined && (
            <Alert severity="warning" variant="outlined" sx={{ fontSize: '0.85rem' }}>
              <strong>Eslatma (Ariza yaratish bosqichidagi tanlov):</strong>{' '}
              {arizaChoice ? "Pul ko'chirilsin deb belgilangan" : "Pul ko'chirilmasin deb belgilangan"}
            </Alert>
          )}

          <FormControl component="fieldset">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              Pul ko'chirish bo'yicha yakuniy qaror:
            </Typography>
            <RadioGroup
              value={transferChoice}
              onChange={(e) => setTransferChoice(e.target.value)}
            >
              <FormControlLabel
                value="true"
                control={<Radio color="primary" />}
                label="Ha, ko'chirilsin"
              />
              <FormControlLabel
                value="false"
                control={<Radio color="error" />}
                label="Yo'q, ko'chirilmasin"
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Bekor qilish
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Tasdiqlash va Akt kiritish
        </Button>
      </DialogActions>
    </Dialog>
  );
}
