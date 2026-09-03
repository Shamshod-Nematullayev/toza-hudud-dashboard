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
  Chip,
} from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import api from 'utils/api';
import { toast } from 'react-toastify';

export default function TelegramSettingsPage() {
  const [groupId, setGroupId] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedChatTitle, setVerifiedChatTitle] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/auth/company')
      .then(({ data }) => {
        const currentGroup = data.company?.GROUP_ID_DISPETCHER || data.GROUP_ID_DISPETCHER || '';
        setGroupId(currentGroup);
        if (data.botUsername) {
          setBotUsername(data.botUsername);
        }
        if (currentGroup) {
          // Guruh allaqachon biriktirilgan bo'lsa, nomini tekshirib olish
          api
            .post('/auth/company/verify-telegram-chat', { chatId: currentGroup })
            .then((res) => {
              if (res.data?.ok && res.data.chat?.title) {
                setVerifiedChatTitle(res.data.chat.title);
              }
            })
            .catch(() => {});
        }
      })
      .catch(console.error);
  }, []);

  const handleVerify = async () => {
    if (!groupId.trim()) {
      toast.error("Guruh ID'sini kiriting");
      return;
    }
    setVerifying(true);
    setVerifyError(null);
    setVerifiedChatTitle(null);
    try {
      const { data } = await api.post('/auth/company/verify-telegram-chat', { chatId: groupId.trim() });
      if (data.ok && data.chat) {
        setVerifiedChatTitle(data.chat.title);
        toast.success(`Guruh topildi: ${data.chat.title}`);
      } else {
        setVerifyError(data.message || "Guruh topilmadi");
        toast.error(data.message || "Guruh topilmadi");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Bot guruhda admin emas yoki ID noto'g'ri";
      setVerifyError(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/auth/company', { GROUP_ID_DISPETCHER: groupId.trim() });
      toast.success('Dispetcher guruhi muvaffaqiyatli saqlandi');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 650 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Telegram sozlamalari
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dispetcher guruhini ulang va haydovchilarni ro'yxatdan o'tkazing
        </Typography>
      </Box>

      {/* Group Settings */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
          <TelegramIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Dispetcher Telegram guruhi
          </Typography>
        </Stack>

        <Alert severity="info" sx={{ mb: 2 }}>
          {botUsername ? (
            <>
              <strong>@{botUsername}</strong> botini dispetcherlar guruhiga qo'shing va unga <strong>admin</strong> huquqini bering.
            </>
          ) : (
            'Botni dispetcherlar guruhiga qo\'shing va unga admin huquqini bering.'
          )}{' '}
          So'ngra guruh ID'sini kiriting (masalan: <code>-1001234567890</code>). Guruh ID'sini olish uchun <code>@userinfobot</code> ga guruhdan biror xabarni forward qiling.
        </Alert>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            label="Guruh ID (masalan: -1001234567890)"
            value={groupId}
            onChange={(e) => {
              setGroupId(e.target.value);
              setVerifiedChatTitle(null);
              setVerifyError(null);
            }}
            fullWidth
            size="small"
            placeholder="-1001234567890"
          />
          <Button
            variant="outlined"
            onClick={handleVerify}
            disabled={verifying || !groupId.trim()}
            sx={{ minWidth: 110 }}
          >
            {verifying ? <CircularProgress size={20} /> : 'Tekshirish'}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !groupId.trim()}
            sx={{ minWidth: 100 }}
          >
            {saving ? <CircularProgress size={20} /> : 'Saqlash'}
          </Button>
        </Stack>

        {verifiedChatTitle && (
          <Chip
            icon={<CheckCircleOutlinedIcon />}
            label={`Ulangan guruh: ${verifiedChatTitle}`}
            color="success"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        )}
        {verifyError && (
          <Chip
            icon={<ErrorOutlinedIcon />}
            label={verifyError}
            color="error"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        )}
      </Paper>

      {/* Bot Info */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Haydovchilarni ulash
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Haydovchilarni ro'yxatdan o'tkazish uchun <strong>"Haydovchilar"</strong> sahifasiga o'ting,
          har bir haydovchi kartasida <strong>"Telegram ulash"</strong> tugmasini bosing — ulash havolasi nusxalanadi.
          Shu havolani haydovchiga yuboring.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Haydovchi havolani bosib {botUsername ? <strong>@{botUsername}</strong> : 'bot'}ni ochsa va <strong>Start</strong> tugmasini bossa — uning Telegram hisobi tizimga avtomatik bog'lanadi.
        </Typography>
      </Paper>
    </Box>
  );
}
