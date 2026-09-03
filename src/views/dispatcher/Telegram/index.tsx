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
  Chip
} from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import { useTranslation } from 'react-i18next';
import api from 'utils/api';
import { toast } from 'react-toastify';

export default function TelegramSettingsPage() {
  const { t } = useTranslation();
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
      toast.error(t('dispatcherPages.telegram.enterGroupId'));
      return;
    }
    setVerifying(true);
    setVerifyError(null);
    setVerifiedChatTitle(null);
    try {
      const { data } = await api.post('/auth/company/verify-telegram-chat', { chatId: groupId.trim() });
      if (data.ok && data.chat) {
        setVerifiedChatTitle(data.chat.title);
        toast.success(t('dispatcherPages.telegram.groupFound', { title: data.chat.title }));
      } else {
        setVerifyError(data.message || t('dispatcherPages.telegram.groupNotFound'));
        toast.error(data.message || t('dispatcherPages.telegram.groupNotFound'));
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || t('dispatcherPages.telegram.botNotAdminError');
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
      toast.success(t('dispatcherPages.telegram.savedSuccess'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('dispatcherPages.common.errorOccurred'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 650 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          {t('dispatcherPages.telegram.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('dispatcherPages.telegram.subtitle')}
        </Typography>
      </Box>

      {/* Group Settings */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
          <TelegramIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {t('dispatcherPages.telegram.groupCardTitle')}
          </Typography>
        </Stack>

        <Alert severity="info" sx={{ mb: 2 }}>
          {botUsername ? (
            <>
              <strong>@{botUsername}</strong> {t('dispatcherPages.telegram.botAdminNoticeWithBot')}
            </>
          ) : (
            t('dispatcherPages.telegram.botAdminNoticeSimple')
          )}{' '}
          {t('dispatcherPages.telegram.groupNoticeTail')}
        </Alert>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            label={t('dispatcherPages.telegram.groupIdLabel')}
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
            {verifying ? <CircularProgress size={20} /> : t('dispatcherPages.telegram.check')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !groupId.trim()}
            sx={{ minWidth: 100 }}
          >
            {saving ? <CircularProgress size={20} /> : t('dispatcherPages.common.save')}
          </Button>
        </Stack>

        {verifiedChatTitle && (
          <Chip
            icon={<CheckCircleOutlinedIcon />}
            label={t('dispatcherPages.telegram.linkedGroup', { title: verifiedChatTitle })}
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
          {t('dispatcherPages.telegram.driverConnectTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t('dispatcherPages.telegram.driverConnectStep1')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('dispatcherPages.telegram.driverConnectStep2')}
        </Typography>
      </Paper>
    </Box>
  );
}
