import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import api from 'utils/api';
import { toast } from 'react-toastify';

export default function TelegramSettingsPage() {
  const [groupId, setGroupId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/auth/company')
      .then(({ data }) => {
        setGroupId(data.GROUP_ID_DISPETCHER || '');
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/auth/company', { GROUP_ID_DISPETCHER: groupId });
      toast.success('Dispetcher guruhi saqlandi');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maxWidth={600}>
      <Box mb={3}>
        <Typography variant="h3" fontWeight={700}>
          Telegram sozlamalari
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dispetcher guruhini ulang va shofyorlarni ro'yxatdan o'tkazing
        </Typography>
      </Box>

      {/* Group Settings */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <TelegramIcon color="primary" />
          <Typography variant="h5" fontWeight={600}>
            Dispetcher Telegram guruhi
          </Typography>
        </Stack>

        <Alert severity="info" sx={{ mb: 2 }}>
          Botni guruhga qo'shing, u guruhning admin bo'lishi kerak. Keyin guruh ID'sini kiriting.
          Guruh ID'sini olish uchun @userinfobot ga guruhdan xabarni forward qiling.
        </Alert>

        <Stack direction="row" spacing={1}>
          <TextField
            label="Guruh ID (masalan: -1001234567890)"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            fullWidth
            size="small"
            placeholder="-1001234567890"
          />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !groupId}
            sx={{ minWidth: 100 }}
          >
            {saving ? <CircularProgress size={20} /> : 'Saqlash'}
          </Button>
        </Stack>
      </Paper>

      {/* Bot Info */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={600} mb={2}>
          Shofyorlarni ulash
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Shofyorlarni ro'yxatdan o'tkazish uchun <strong>"Texniklar"</strong> sahifasiga o'ting,
          har bir texnik kartasida <strong>"Telegram ulash"</strong> tugmasini bosing — ulash havolasi nusxalanadi.
          Shu havolani shofyorga yuboring.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Shofyor havolani bosib botni ochsa va <strong>Start</strong> tugmasini bossa — uning Telegram hisobi tizimga avtomatik bog'lanadi.
        </Typography>
      </Paper>
    </Box>
  );
}
