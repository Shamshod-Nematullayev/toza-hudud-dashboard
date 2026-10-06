import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  Switch,
  Stack,
  IconButton,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  FlashOn as FlashOnIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import TelegramGroupSelect from './TelegramGroupSelect';

interface SpecialTasksTelegramDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SpecialTasksTelegramDialog({
  open,
  onClose,
  onSuccess
}: SpecialTasksTelegramDialogProps) {
  const theme = useTheme();

  const [reportBy, setReportBy] = useState<'byInspector' | 'byMahalla'>('byInspector');
  const [taskType, setTaskType] = useState<'both' | 'phone' | 'electricity'>('both');
  const [chatId, setChatId] = useState('');
  const [deleteLastReport, setDeleteLastReport] = useState(true);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await api.post('/reports/special-tasks/send-telegram', {
        reportBy,
        taskType,
        chatId: chatId || undefined,
        deleteLastReport
      });

      if (res.data?.ok) {
        toast.success(res.data.message || 'Hisobot Telegram guruhga muvaffaqiyatli yuborildi');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.data?.error || res.data?.message || 'Yuborishda xatolik');
      }
    } catch (err: any) {
      console.error('Send telegram error:', err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Hisobotni Telegramga yuborishda xatolik yuz berdi');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={sending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Maxsus topshiriqlar hisobotini Telegramga yuborish
        </Typography>
        <IconButton onClick={onClose} disabled={sending} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: 1.5 }}>
        <Stack spacing={3}>
          {/* 1. Andozani tanlash */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
              1. Hisobot andozasi (shablon):
            </Typography>
            <RadioGroup
              value={reportBy}
              onChange={(e) => setReportBy(e.target.value as 'byInspector' | 'byMahalla')}
            >
              <Box
                onClick={() => setReportBy('byInspector')}
                sx={{
                  p: 1.75,
                  mb: 1.25,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: reportBy === 'byInspector' ? theme.palette.secondary.main : theme.palette.divider,
                  bgcolor: reportBy === 'byInspector'
                    ? alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.15 : 0.05)
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <FormControlLabel
                  value="byInspector"
                  control={<Radio size="small" color="secondary" />}
                  label={
                    <Box sx={{ ml: 0.5 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <FlashOnIcon fontSize="small" sx={{ color: theme.palette.secondary.main }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                          Tezkor ma&apos;lumot (Kunlik hisobot)
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3, fontSize: '0.85rem' }}>
                        Nazoratchilar kesimida topshiriqlarning kunlik bajarilishi, foizlar va bugun bajarilgan sonlar bo&apos;yicha chiroyli foto-hisobot.
                      </Typography>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Box>

              <Box
                onClick={() => setReportBy('byMahalla')}
                sx={{
                  p: 1.75,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: reportBy === 'byMahalla' ? theme.palette.primary.main : theme.palette.divider,
                  bgcolor: reportBy === 'byMahalla'
                    ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.05)
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <FormControlLabel
                  value="byMahalla"
                  control={<Radio size="small" color="primary" />}
                  label={
                    <Box sx={{ ml: 0.5 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <AssessmentIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                          Umumiy ma&apos;lumot (Jami hisobot)
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3, fontSize: '0.85rem' }}>
                        Mahallalar (MFY) kesimida maxsus topshiriqlarning umumiy holati va xatlov natijalari bo&apos;yicha foto-hisobot.
                      </Typography>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Box>
            </RadioGroup>
          </Box>

          {/* 2. Topshiriq turi */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              2. Topshiriq yo&apos;nalishi:
            </Typography>
            <RadioGroup
              row
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as 'both' | 'phone' | 'electricity')}
            >
              <FormControlLabel
                value="both"
                control={<Radio size="small" color="secondary" />}
                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Barchasi (Telefon + Elektr)</Typography>}
              />
              <FormControlLabel
                value="phone"
                control={<Radio size="small" color="secondary" />}
                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Faqat Telefon</Typography>}
              />
              <FormControlLabel
                value="electricity"
                control={<Radio size="small" color="secondary" />}
                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Faqat Elektr (ETK)</Typography>}
              />
            </RadioGroup>
          </Box>

          {/* 3. Telegram guruh tanlash */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              3. Yuboriladigan Telegram guruh:
            </Typography>
            <TelegramGroupSelect
              value={chatId}
              onChange={setChatId}
              helperText="Agar tanlanmasa, kompaniya standart nazoratchilar guruhiga yuboriladi"
            />
          </Box>

          {/* 4. Avvalgi hisobotni o'chirish */}
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.divider, 0.2) }}>
            <FormControlLabel
              control={
                <Switch
                  checked={deleteLastReport}
                  onChange={(e) => setDeleteLastReport(e.target.checked)}
                  color="secondary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Guruhdagi avvalgi hisobot rasmini o&apos;chirish
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Guruhda eski hisobotlar to&apos;planib qolmasligi uchun oxirgi yuborilgan hisobot rasmini avtomatik o&apos;chirib yangilaydi
                  </Typography>
                </Box>
              }
              sx={{ m: 0 }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button onClick={onClose} disabled={sending} color="inherit" sx={{ fontWeight: 600 }}>
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
          onClick={handleSend}
          disabled={sending}
          sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
        >
          {sending ? 'Yuborilmoqda...' : 'Telegramga yuborish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
