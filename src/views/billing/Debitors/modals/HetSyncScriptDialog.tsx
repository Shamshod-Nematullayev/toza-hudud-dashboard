import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  MenuItem,
  Stack,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from 'utils/api';

interface HetSyncScriptDialogProps {
  open: boolean;
  onClose: () => void;
}

const caotoNames = [
  { title: 'Qoradaryo TETK', caoto: 18214 },
  { title: 'Xatirchi TETK', caoto: 12251 },
  { title: "Kattaqo'rg'on TETK", caoto: 18215 },
  { title: 'Paxtachi TETK', caoto: 18230 },
  { title: 'Nurobod ETK', caoto: 18235 },
  { title: 'Payariq TETK', caoto: 18224 },
  { title: 'Chelak TETK', caoto: 18226 },
  { title: "Temiryo'l ETK", caoto: 18405 },
  { title: 'Siyob TETK', caoto: 18407 },
  { title: "Bog'ishamol TETK", caoto: 18408 },
  { title: 'Zarafshon TETK', caoto: 18234 },
  { title: "Do'stlik ETK", caoto: 18233 },
  { title: 'Nurobod EP', caoto: 18235 }
];

// Unique CAOTOs by removing duplicates if any (e.g. Zarafshon / Do'stlik duplicate entries)
const uniqueCaotos = Array.from(new Map(caotoNames.map(item => [item.caoto, item])).values());

export default function HetSyncScriptDialog({ open, onClose }: HetSyncScriptDialogProps) {
  const [caoto, setCaoto] = React.useState<number | string>('');
  const [token, setToken] = React.useState('');
  const [limit, setLimit] = React.useState<number | string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDownload = async () => {
    if (!caoto) {
      setError("Iltimos, CAOTO kodini tanlang.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await api.get('/product-admin/debitors/download-sync-script', {
        params: {
          caoto,
          token: token.trim(),
          limit: limit || undefined
        },
        responseType: 'blob'
      });

      // Trigger download in browser
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `het_sync_${caoto}_${dateStr}.js`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (err: any) {
      console.error("Script yuklashda xatolik:", err);
      setError("Skriptni yuklab olishda xatolik yuz berdi. Iltimos, server ishlayotganini va huquqingiz yetarli ekanligini tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          HET Sinxronizatsiya Skriptini Yuklash
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary">
            Mazkur bo'lim orqali HET bazasiga telefon raqamlarni import qilish uchun maxsus skript yaratiladi. Skriptni yuklab olgach, brauzer konsolida ishga tushirasiz.
          </Typography>

          {error && (
            <Typography variant="body2" color="error.main" sx={{ bgcolor: 'error.lighter', p: 1.5, borderRadius: 1.5 }}>
              {error}
            </Typography>
          )}

          <TextField
            select
            label="CAOTO bo'limi"
            value={caoto}
            onChange={(e) => setCaoto(e.target.value)}
            fullWidth
            required
          >
            <MenuItem value="" disabled>
              CAOTO bo'limini tanlang
            </MenuItem>
            {uniqueCaotos.map((option) => (
              <MenuItem key={option.caoto} value={option.caoto}>
                {option.title} ({option.caoto})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="HET Tizimi Tokeni (Optional)"
            placeholder="eyJhbGciOiJSUzI1Ni..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            fullWidth
            multiline
            rows={3}
            helperText="Skript ichiga avtomatik joylashtirish uchun HET Bearer tokenini kiriting"
          />

          <TextField
            label="Debitorlar soni cheklovi (Optional)"
            type="number"
            placeholder="Barchasi (bo'sh qoldiring)"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Bekor qilish
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          color="primary"
          loading={loading}
          disabled={loading}
        >
          Skriptni Yuklash (.js)
        </Button>
      </DialogActions>
    </Dialog>
  );
}
