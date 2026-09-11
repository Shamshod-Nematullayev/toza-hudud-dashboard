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
  CheckCircleOutlined,
  Send as SendIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import dayjs from 'dayjs';

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
  const [times, setTimes] = useState<string[]>(['09:00', '12:00', '15:00', '17:00', '20:00']);
  const [newTime, setNewTime] = useState('10:00');
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
      const res = await api.get('/reports/mahalla-tushumlar-nazoratchi/schedule');
      if (res.data?.ok && res.data.schedule) {
        const sched = res.data.schedule;
        setEnabled(!!sched.enabled);
        setTimes(Array.isArray(sched.times) && sched.times.length > 0 ? sched.times : ['09:00', '12:00', '15:00', '17:00', '20:00']);
        setReportMode(sched.reportMode || 'plan');
        setChatId(sched.chatId || '');
        setDefaultChatId(res.data.defaultChatId || '');
        setLastRunAt(sched.lastRunAt || null);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
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
      const res = await api.post('/reports/mahalla-tushumlar-nazoratchi/schedule', {
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
      console.error('Error saving schedule:', err);
      toast.error(err?.response?.data?.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ScheduleIcon color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Telegram Guruhga Avtomatik Yuborish (Agenda)
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={36} color="secondary" />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {/* Status Switch */}
            <Box
              sx={{
                p: 2,
                borderRadius: '8px',
                bgcolor: enabled ? 'success.light' : 'action.hover',
                border: '1px solid',
                borderColor: enabled ? 'success.main' : 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: enabled ? 'success.dark' : 'text.primary' }}>
                  {enabled ? 'Avtomatik yuborish FAOL' : 'Avtomatik yuborish O‘CHIRILGAN'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {enabled
                    ? 'Hisobot har kuni quyida belgilangan vaqtlarda avtomatik Telegramga jo‘natiladi'
                    : 'Belgilangan vaqtlarda avtomatik hisobot yuborilmaydi'}
                </Typography>
              </Box>
              <FormControlLabel
                control={<Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} color="success" />}
                label=""
                sx={{ m: 0 }}
              />
            </Box>

            {/* Hisobot formati */}
            <FormControl>
              <FormLabel sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>Hisobot formati:</FormLabel>
              <RadioGroup row value={reportMode} onChange={(e) => setReportMode(e.target.value as 'plan' | 'classic')}>
                <FormControlLabel value="plan" control={<Radio size="small" color="secondary" />} label="Reja va bajarilish (Yangi)" />
                <FormControlLabel value="classic" control={<Radio size="small" color="secondary" />} label="Klassik tushum" />
              </RadioGroup>
            </FormControl>

            {/* Vaqt qo'shish */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Kunlik yuborish vaqtlari (Soat va daqiqa):
              </Typography>

              {/* Tezkor shablonlar */}
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                Tezkor tanlovlar:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => applyPreset(['09:00', '14:00', '19:00'])}
                  sx={{ textTransform: 'none', py: 0.25 }}
                >
                  3 mahal (09:00, 14:00, 19:00)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => applyPreset(['09:00', '12:00', '15:00', '17:00', '20:00'])}
                  sx={{ textTransform: 'none', py: 0.25 }}
                >
                  5 mahal (09:00, 12:00, 15:00, 17:00, 20:00)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => applyPreset(['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'])}
                  sx={{ textTransform: 'none', py: 0.25 }}
                >
                  Har 2 soatda
                </Button>
              </Stack>

              {/* Yangi vaqt qo'shish inputi */}
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
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
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddTime}
                  sx={{ textTransform: 'none' }}
                >
                  Vaqt qo‘shish
                </Button>
              </Stack>

              {/* Tanlangan vaqtlar chiplari */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  minHeight: 56,
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1
                }}
              >
                {times.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    Hozircha hech qanday vaqt tanlanmagan
                  </Typography>
                ) : (
                  times.map((t) => (
                    <Chip
                      key={t}
                      icon={<AccessTimeIcon fontSize="small" />}
                      label={t}
                      onDelete={() => handleDeleteTime(t)}
                      color="secondary"
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                  ))
                )}
              </Box>
            </Box>

            {/* Telegram guruh ID */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Telegram Guruh ID (ixtiyoriy):
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder={defaultChatId || 'Masalan: -100123456789'}
                helperText={
                  defaultChatId
                    ? `Bo‘sh qoldirilsa, tashkilotning asosiy nazoratchilar guruhi (${defaultChatId}) ishlatiladi.`
                    : 'Telegram guruh ID raqami'
                }
              />
            </Box>

            {/* Info Alerts */}
            {lastRunAt && (
              <Alert severity="info" icon={<CheckCircleOutlined />} sx={{ py: 0.5 }}>
                Oxirgi marta yuborilgan: {dayjs(lastRunAt).format('DD.MM.YYYY HH:mm')}
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Bekor qilish
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="secondary"
          disabled={saving || loading}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
        >
          {saving ? 'Saqlanmoqda...' : 'Jadvalni saqlash'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
