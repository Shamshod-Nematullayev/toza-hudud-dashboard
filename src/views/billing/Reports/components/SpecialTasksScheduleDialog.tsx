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
  CircularProgress,
  RadioGroup,
  Radio,
  Tabs,
  Tab,
  useTheme,
  alpha
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  SaveOutlined as SaveIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import TelegramGroupSelect, { ICompanyTelegramGroup } from './TelegramGroupSelect';

interface SpecialTasksScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface IScheduleState {
  enabled: boolean;
  times: string[];
  taskType: 'both' | 'phone' | 'electricity';
  chatId: string;
}

export default function SpecialTasksScheduleDialog({
  open,
  onClose,
  onSuccess
}: SpecialTasksScheduleDialogProps) {
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState<'daily' | 'total'>('daily');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [companyGroups, setCompanyGroups] = useState<ICompanyTelegramGroup[]>([]);
  const [newTime, setNewTime] = useState('12:00');

  // Daily schedule
  const [daily, setDaily] = useState<IScheduleState>({
    enabled: false,
    times: ['09:00', '13:00', '17:00', '20:00'],
    taskType: 'both',
    chatId: ''
  });

  // Total schedule
  const [total, setTotal] = useState<IScheduleState>({
    enabled: false,
    times: ['09:00', '18:00'],
    taskType: 'both',
    chatId: ''
  });

  useEffect(() => {
    if (open) {
      fetchAllSchedules();
    }
  }, [open]);

  const fetchAllSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/schedules');
      if (res.data?.ok && Array.isArray(res.data.data)) {
        const dailyItem = res.data.data.find((s: any) => s.reportType === 'specialTaskDailyReport');
        if (dailyItem) {
          setDaily({
            enabled: !!dailyItem.enabled,
            times: Array.isArray(dailyItem.times) && dailyItem.times.length > 0 ? dailyItem.times : ['09:00', '13:00', '17:00', '20:00'],
            taskType: dailyItem.taskType || 'both',
            chatId: dailyItem.chatId || ''
          });
        }

        const totalItem = res.data.data.find((s: any) => s.reportType === 'specialTaskTotalReport');
        if (totalItem) {
          setTotal({
            enabled: !!totalItem.enabled,
            times: Array.isArray(totalItem.times) && totalItem.times.length > 0 ? totalItem.times : ['09:00', '18:00'],
            taskType: totalItem.taskType || 'both',
            chatId: totalItem.chatId || ''
          });
        }
      }
      if (res.data?.companyGroups && Array.isArray(res.data.companyGroups)) {
        setCompanyGroups(res.data.companyGroups);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      toast.error('Rejalashtirish ma’lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const currentReportType = activeTab === 'daily' ? 'specialTaskDailyReport' : 'specialTaskTotalReport';
  const currentState = activeTab === 'daily' ? daily : total;
  const setCurrentState = activeTab === 'daily' ? setDaily : setTotal;

  const handleAddTime = () => {
    if (!newTime) return;
    if (currentState.times.includes(newTime)) {
      toast.warning('Bu vaqt allaqachon ro‘yxatda mavjud');
      return;
    }
    const updated = [...currentState.times, newTime].sort();
    setCurrentState((prev) => ({ ...prev, times: updated }));
  };

  const handleDeleteTime = (timeToDelete: string) => {
    const updated = currentState.times.filter((t) => t !== timeToDelete);
    setCurrentState((prev) => ({ ...prev, times: updated }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post(`/reports/schedules/${currentReportType}`, {
        enabled: currentState.enabled,
        times: currentState.times,
        taskType: currentState.taskType,
        chatId: currentState.chatId || undefined
      });

      if (res.data?.ok) {
        toast.success(res.data.message || 'Jadval muvaffaqiyatli saqlandi');
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.data?.error || 'Saqlashda xatolik');
      }
    } catch (err: any) {
      console.error('Save schedule error:', err);
      toast.error(err.response?.data?.error || 'Jadvalni saqlashda xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    setTesting(true);
    try {
      const res = await api.post(`/reports/schedules/${currentReportType}/test-send`, {
        taskType: currentState.taskType,
        chatId: currentState.chatId || undefined
      });

      if (res.data?.ok) {
        toast.success(res.data.message || 'Test hisoboti Telegramga muvaffaqiyatli yuborildi');
      } else {
        toast.error(res.data?.error || 'Test yuborishda xatolik');
      }
    } catch (err: any) {
      console.error('Test send error:', err);
      toast.error(err.response?.data?.error || 'Telegramga test yuborishda xatolik yuz berdi');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving || testing ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2.5, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.secondary.main, 0.12),
              color: theme.palette.secondary.main,
              display: 'flex'
            }}
          >
            <ScheduleIcon fontSize="small" />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Telegram Avtomatik Hisobot Jadvali
          </Typography>
        </Stack>
        <IconButton onClick={onClose} disabled={saving || testing} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab
            value="daily"
            label="⚡ Tezkor hisobot (Kunlik)"
            sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.9rem' }}
          />
          <Tab
            value="total"
            label="📊 Jami hisobot (Umumiy)"
            sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.9rem' }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 2.5, pt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {/* Status switch card */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: currentState.enabled
                  ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.08)
                  : theme.palette.action.hover,
                border: '1px solid',
                borderColor: currentState.enabled ? alpha(theme.palette.success.main, 0.3) : theme.palette.divider,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>
                  {activeTab === 'daily'
                    ? 'Kunlik tezkor hisobotni avtomatik yuborish'
                    : 'Umumiy jami hisobotni avtomatik yuborish'}
                </Typography>
                <Typography variant="caption" sx={{ color: currentState.enabled ? 'success.main' : 'text.secondary', fontWeight: 600 }}>
                  {currentState.enabled ? '● Faol (Belgilangan soatlarda Telegramga yuboriladi)' : '○ O‘chirilgan'}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentState.enabled}
                    onChange={(e) => setCurrentState((prev) => ({ ...prev, enabled: e.target.checked }))}
                    color="success"
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>

            {/* Rejalashtirilgan vaqtlar */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                Yuborish soatlari:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                {currentState.times.map((time) => (
                  <Chip
                    key={time}
                    label={time}
                    onDelete={() => handleDeleteTime(time)}
                    color={currentState.enabled ? 'secondary' : 'default'}
                    variant="outlined"
                    icon={<AccessTimeIcon fontSize="small" />}
                    sx={{ fontWeight: 700, px: 0.5 }}
                  />
                ))}
              </Box>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <TextField
                  type="time"
                  size="small"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ width: 140 }}
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddTime}
                  sx={{ fontWeight: 600, textTransform: 'none' }}
                >
                  Vaqt qo‘shish
                </Button>
              </Stack>
            </Box>

            {/* Topshiriq turi */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                Topshiriq yo‘nalishi:
              </Typography>
              <RadioGroup
                row
                value={currentState.taskType}
                onChange={(e) => setCurrentState((prev) => ({ ...prev, taskType: e.target.value as any }))}
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

            {/* Telegram guruh tanlash */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                Yuboriladigan Telegram guruh:
              </Typography>
              <TelegramGroupSelect
                value={currentState.chatId}
                onChange={(cId) => setCurrentState((prev) => ({ ...prev, chatId: cId }))}
                companyGroups={companyGroups}
                helperText="Agar tanlanmasa, standart nazoratchilar guruhiga yuboriladi"
              />
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="info"
          startIcon={testing ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
          onClick={handleTestSend}
          disabled={loading || saving || testing}
          sx={{ fontWeight: 600, textTransform: 'none' }}
        >
          {testing ? 'Yuborilmoqda...' : 'Telegramga test yuborish'}
        </Button>

        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} disabled={saving || testing} color="inherit" sx={{ fontWeight: 600 }}>
            Yopish
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={loading || saving || testing}
            sx={{ fontWeight: 700, px: 2.5, borderRadius: 2 }}
          >
            {saving ? 'Saqlanmoqda...' : 'Jadvalni saqlash'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
