import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Chip,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  useTheme
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  CheckCircleOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';

interface ScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ScheduleDialog({ open, onClose, onSuccess }: ScheduleDialogProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [times, setTimes] = useState<string[]>(['09:00', '13:00', '18:00', '21:00']);
  const [newTime, setNewTime] = useState('12:00');
  const [reportMode, setReportMode] = useState<'plan' | 'classic'>('plan');
  const [chatId, setChatId] = useState('');
  const [defaultChatId, setDefaultChatId] = useState('');
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchSchedule();
    }
  }, [open]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/mfy-incomes/schedule');
      if (res.data?.ok && res.data.schedule) {
        const sched = res.data.schedule;
        setEnabled(!!sched.enabled);
        setTimes(
          Array.isArray(sched.times) && sched.times.length > 0
            ? sched.times
            : ['09:00', '13:00', '18:00', '21:00']
        );
        setReportMode(sched.reportMode || 'plan');
        setChatId(sched.chatId || '');
        setDefaultChatId(res.data.defaultChatId || '');
        setLastRunAt(sched.lastRunAt || null);
      }
    } catch (err) {
      console.error('Error fetching MFY schedule:', err);
      toast.error('Rejalashtirish ma’lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTime = () => {
    if (!newTime) return;
    if (times.includes(newTime)) {
      toast.warning('Bu vaqt allaqachon ro‘yxatda mavjud');
      return;
    }
    const updated = [...times, newTime].sort();
    setTimes(updated);
  };

  const handleDeleteTime = (timeToDelete: string) => {
    setTimes(times.filter((t) => t !== timeToDelete));
  };

  const applyPreset = (presetTimes: string[]) => {
    setTimes([...presetTimes]);
  };

  const handleSave = async () => {
    if (enabled && times.length === 0) {
      toast.warning('Kamida bitta vaqt kiritilishi shart!');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/reports/mfy-incomes/schedule', {
        enabled,
        times,
        reportMode,
        chatId: chatId.trim() || undefined
      });

      if (res.data?.ok) {
        toast.success(res.data.message || 'Jadval muvaffaqiyatli saqlandi!');
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.data?.message || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Error saving MFY schedule:', err);
      toast.error(err?.response?.data?.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ScheduleIcon color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            MFY Hisoboti: Rejalashtirilgan Yuborish (Agenda)
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={36} color="primary" />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {/* Yoqish / O'chirish */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: enabled ? 'success.lighter' : 'action.hover',
                border: '1px solid',
                borderColor: enabled ? 'success.light' : 'divider'
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {enabled ? 'Avtomatik yuborish faol' : 'Avtomatik yuborish o‘chirilgan'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {enabled
                        ? 'Hisobot har kuni quyida belgilangan vaqtlarda avtomatik Telegramga jo‘natiladi'
                        : 'Belgilangan vaqtlarda avtomatik hisobot yuborilmaydi'}
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {/* To'lov formati */}
            <FormControl component="fieldset">
              <FormLabel sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>
                Hisobot to‘lov turi:
              </FormLabel>
              <RadioGroup
                row
                value={reportMode}
                onChange={(e) => setReportMode(e.target.value as any)}
              >
                <FormControlLabel
                  value="plan"
                  control={<Radio size="small" />}
                  label="Barcha to‘lovlar (Jami tushum)"
                />
                <FormControlLabel
                  value="classic"
                  control={<Radio size="small" />}
                  label="Faqat EcoPay"
                />
              </RadioGroup>
            </FormControl>

            {/* Yuborish vaqtlari */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Yuborish vaqtlari (kun davomida):
              </Typography>

              {/* Tezkor presetlar */}
              <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
                  Shablonlar:
                </Typography>
                <Chip
                  label="Kuniga 4 marta (09, 13, 18, 21)"
                  size="small"
                  variant="outlined"
                  onClick={() => applyPreset(['09:00', '13:00', '18:00', '21:00'])}
                  sx={{ cursor: 'pointer' }}
                />
                <Chip
                  label="Kuniga 2 marta (09, 18)"
                  size="small"
                  variant="outlined"
                  onClick={() => applyPreset(['09:00', '18:00'])}
                  sx={{ cursor: 'pointer' }}
                />
                <Chip
                  label="Kechki (18, 21)"
                  size="small"
                  variant="outlined"
                  onClick={() => applyPreset(['18:00', '21:00'])}
                  sx={{ cursor: 'pointer' }}
                />
              </Stack>

              {/* Vaqtlar ro'yxati */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  minHeight: 52
                }}
              >
                {times.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic', m: 'auto' }}>
                    Vaqtlar belgilanmagan
                  </Typography>
                ) : (
                  times.map((t) => (
                    <Chip
                      key={t}
                      icon={<AccessTimeIcon fontSize="small" />}
                      label={t}
                      onDelete={() => handleDeleteTime(t)}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                    />
                  ))
                )}
              </Box>

              {/* Yangi vaqt qo'shish */}
              <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'center' }}>
                <TextField
                  type="time"
                  size="small"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  slotProps={{
                    input: {
                      sx: { width: 140 }
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddTime}
                  size="small"
                >
                  Vaqt qo‘shish
                </Button>
              </Stack>
            </Box>

            {/* Telegram Chat ID */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Telegram Guruh ID (Chat ID):
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder={defaultChatId || '-100xxxxxxxxx'}
                helperText={
                  defaultChatId
                    ? `Standart guruh: ${defaultChatId}. Agar boshqa guruhga yubormoqchi bo‘lsangiz, ID sini kiriting.`
                    : 'Kompaniya standart guruhi topilmadi. Guruh ID sini kiriting (masalan: -100xxxxxxxx).'
                }
              />
            </Box>

            {/* Status ma'lumoti */}
            {lastRunAt && (
              <Alert severity="info" icon={<CheckCircleOutlined fontSize="inherit" />}>
                Oxirgi avtomatik yuborilgan vaqt:{' '}
                <strong>{new Date(lastRunAt).toLocaleString('uz-UZ')}</strong>
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Bekor qilish
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading || saving}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <ScheduleIcon />}
        >
          {saving ? 'Saqlanmoqda...' : 'Jadvalni saqlash'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
