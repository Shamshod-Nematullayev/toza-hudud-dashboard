import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  RadioGroup,
  Radio,
  Divider,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  CheckCircleOutlined,
  RefreshOutlined as RefreshIcon,
  Telegram as TelegramIcon,
  SaveOutlined as SaveIcon,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from 'utils/api';
import dayjs from 'dayjs';

export interface IScheduledReportItem {
  reportType: string;
  name: string;
  enabled: boolean;
  times: string[];
  reportMode: 'plan' | 'classic';
  paymentPartner: 'ekopay' | 'paynet' | 'both' | 'all';
  groupBy?: 'inspector' | 'mahalla';
  chatId: string;
  defaultChatId: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
}

interface ScheduledReportsPanelProps {
  onClose?: () => void;
}

export default function ScheduledReportsPanel({ onClose }: ScheduledReportsPanelProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savingType, setSavingType] = useState<string | null>(null);
  const [testingType, setTestingType] = useState<string | null>(null);
  const [reports, setReports] = useState<IScheduledReportItem[]>([]);
  const [newTimeMap, setNewTimeMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/schedules');
      if (res.data?.ok && Array.isArray(res.data.data)) {
        setReports(res.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching report schedules:', err);
      toast.error('Rejalashtirilgan hisobotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const updateReportField = (reportType: string, field: keyof IScheduledReportItem, value: any) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.reportType === reportType) {
          return { ...rep, [field]: value };
        }
        return rep;
      })
    );
  };

  const handleAddTime = (reportType: string) => {
    const timeToAdd = newTimeMap[reportType] || '10:00';
    const rep = reports.find((r) => r.reportType === reportType);
    if (!rep) return;

    if (rep.times.includes(timeToAdd)) {
      toast.warning('Bu vaqt allaqachon ro‘yxatda mavjud');
      return;
    }

    const updatedTimes = [...rep.times, timeToAdd].sort();
    updateReportField(reportType, 'times', updatedTimes);
  };

  const handleDeleteTime = (reportType: string, timeToDelete: string) => {
    const rep = reports.find((r) => r.reportType === reportType);
    if (!rep) return;
    const updatedTimes = rep.times.filter((t) => t !== timeToDelete);
    updateReportField(reportType, 'times', updatedTimes);
  };

  const applyPreset = (reportType: string, presetTimes: string[]) => {
    updateReportField(reportType, 'times', [...presetTimes]);
  };

  const handleSave = async (item: IScheduledReportItem) => {
    if (item.enabled && item.times.length === 0) {
      toast.warning('Kamida bitta yuborish vaqti kiritilishi shart!');
      return;
    }

    setSavingType(item.reportType);
    try {
      const res = await api.post('/reports/schedules/' + item.reportType, {
        enabled: item.enabled,
        times: item.times,
        reportMode: item.reportMode,
        paymentPartner: item.paymentPartner,
        groupBy: item.groupBy || 'inspector',
        chatId: item.chatId.trim() || undefined
      });

      if (res.data?.ok) {
        toast.success(res.data.message || (item.name + ' jadvali saqlandi'));
        fetchSchedules();
      } else {
        toast.error(res.data?.message || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Error saving schedule:', err);
      toast.error(err?.response?.data?.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setSavingType(null);
    }
  };

  const handleTestSend = async (item: IScheduledReportItem) => {
    setTestingType(item.reportType);
    try {
      const res = await api.post('/reports/schedules/' + item.reportType + '/test-send', {
        reportMode: item.reportMode,
        paymentPartner: item.paymentPartner,
        groupBy: item.groupBy || 'inspector',
        chatId: item.chatId.trim() || undefined
      });

      if (res.data?.ok) {
        toast.success(res.data.message || (item.name + ' sinov tariqasida guruhga yuborildi!'));
      } else {
        toast.error(res.data?.message || 'Yuborishda xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Error testing schedule:', err);
      toast.error(err?.response?.data?.message || 'Telegramga yuborishda xatolik yuz berdi');
    } finally {
      setTestingType(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Tooltip title="Orqaga">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<ArrowBack />}
              onClick={() => {
                if (onClose) onClose();
                else navigate('/billing/reports');
              }}
              sx={{ textTransform: 'none', fontWeight: 600, minWidth: 0, px: 1.5 }}
            >
              Orqaga
            </Button>
          </Tooltip>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.secondary.main, 0.12),
              color: theme.palette.secondary.main,
              display: 'flex'
            }}
          >
            <ScheduleIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Telegram Avtomatik Hisobotlar Paneli
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Barcha hisobotlarni Agenda tizimi orqali belgilangan soatlarda Telegram guruhga yuborishni markazlashgan boshqarish
            </Typography>
          </Box>
        </Stack>

        <Tooltip title="Yangilash">
          <Button
            variant="outlined"
            color="inherit"
            onClick={fetchSchedules}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Yangilash
          </Button>
        </Tooltip>
      </Stack>

      {loading && reports.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {reports.map((item) => {
            const isSaving = savingType === item.reportType;
            const isTesting = testingType === item.reportType;

            return (
              <Grid size={{ xs: 12, md: 6 }} key={item.reportType}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: item.enabled ? theme.palette.success.main : theme.palette.divider,
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: item.enabled ? ('0 4px 20px ' + alpha(theme.palette.success.main, 0.12)) : 'none',
                    transition: 'all 0.25s ease-in-out'
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Header: Title and Status switch */}
                    <Box
                      sx={{
                        p: 1.75,
                        borderRadius: 2,
                        backgroundColor: item.enabled
                          ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.08)
                          : theme.palette.action.hover,
                        border: '1px solid',
                        borderColor: item.enabled ? alpha(theme.palette.success.main, 0.3) : theme.palette.divider,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2.5
                      }}
                    >
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25 }}>
                          {item.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: item.enabled ? 'success.main' : 'text.secondary'
                          }}
                        >
                          {item.enabled ? '● Faol (Avtomatik yuboriladi)' : '○ O‘chirilgan'}
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={item.enabled}
                            onChange={(e) => updateReportField(item.reportType, 'enabled', e.target.checked)}
                            color="success"
                          />
                        }
                        label=""
                        sx={{ m: 0 }}
                      />
                    </Box>

                    {/* Report Mode & Partner */}
                    <Stack spacing={2} sx={{ mb: 2.5 }}>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                          Hisobot formati:
                        </Typography>
                        <RadioGroup
                          row
                          value={item.reportMode}
                          onChange={(e) => updateReportField(item.reportType, 'reportMode', e.target.value)}
                        >
                          <FormControlLabel
                            value="plan"
                            control={<Radio size="small" color="secondary" />}
                            label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Reja va bajarilish</Typography>}
                          />
                          <FormControlLabel
                            value="classic"
                            control={<Radio size="small" color="secondary" />}
                            label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Klassik tushum</Typography>}
                          />
                        </RadioGroup>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                          To‘lov hamkori:
                        </Typography>
                        <RadioGroup
                          row
                          value={item.paymentPartner || 'ekopay'}
                          onChange={(e) => updateReportField(item.reportType, 'paymentPartner', e.target.value)}
                        >
                          <FormControlLabel
                            value="ekopay"
                            control={<Radio size="small" color="primary" />}
                            label={<Typography variant="body2" sx={{ fontWeight: 500 }}>EcoPay</Typography>}
                          />
                          <FormControlLabel
                            value="paynet"
                            control={<Radio size="small" color="primary" />}
                            label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Paynet</Typography>}
                          />
                          <FormControlLabel
                            value="both"
                            control={<Radio size="small" color="primary" />}
                            label={<Typography variant="body2" sx={{ fontWeight: 500 }}>EcoPay + Paynet</Typography>}
                          />
                          <FormControlLabel
                            value="all"
                            control={<Radio size="small" color="primary" />}
                            label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Barchasi</Typography>}
                          />
                        </RadioGroup>
                      </Box>

                      {item.reportType === 'mahallaTushumlarNazoratchiKesimida' && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Guruhlash (Taqsimot):
                          </Typography>
                          <RadioGroup
                            row
                            value={item.groupBy || 'inspector'}
                            onChange={(e) => updateReportField(item.reportType, 'groupBy', e.target.value)}
                          >
                            <FormControlLabel
                              value="inspector"
                              control={<Radio size="small" color="secondary" />}
                              label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Faqat nazoratchi</Typography>}
                            />
                            <FormControlLabel
                              value="mahalla"
                              control={<Radio size="small" color="secondary" />}
                              label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Mahalla kesimida</Typography>}
                            />
                          </RadioGroup>
                        </Box>
                      )}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {/* Times Slot Configuration */}
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                        Kunlik yuborish vaqtlari ({item.times.length} ta):
                      </Typography>

                      {/* Quick Presets */}
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          onClick={() => applyPreset(item.reportType, ['09:00', '14:00', '19:00'])}
                          sx={{ textTransform: 'none', py: 0.2, fontSize: '0.75rem', borderColor: theme.palette.divider }}
                        >
                          3 mahal (9, 14, 19)
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          onClick={() => applyPreset(item.reportType, ['09:00', '12:00', '15:00', '17:00', '20:00'])}
                          sx={{ textTransform: 'none', py: 0.2, fontSize: '0.75rem', borderColor: theme.palette.divider }}
                        >
                          5 mahal (9, 12, 15, 17, 20)
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          onClick={() =>
                            applyPreset(item.reportType, ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'])
                          }
                          sx={{ textTransform: 'none', py: 0.2, fontSize: '0.75rem', borderColor: theme.palette.divider }}
                        >
                          Har 2 soatda
                        </Button>
                      </Stack>

                      {/* Add time input */}
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                        <TextField
                          type="time"
                          size="small"
                          value={newTimeMap[item.reportType] || '10:00'}
                          onChange={(e) =>
                            setNewTimeMap((prev) => ({ ...prev, [item.reportType]: e.target.value }))
                          }
                          slotProps={{
                            input: {
                              sx: { width: 130 }
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddTime(item.reportType)}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Qo‘shish
                        </Button>
                      </Stack>

                      {/* Time Chips */}
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: theme.palette.action.hover,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          minHeight: 52,
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 1
                        }}
                      >
                        {item.times.length === 0 ? (
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            Vaqt belgilanmagan
                          </Typography>
                        ) : (
                          item.times.map((t) => (
                            <Chip
                              key={t}
                              icon={<AccessTimeIcon fontSize="small" />}
                              label={t}
                              onDelete={() => handleDeleteTime(item.reportType, t)}
                              color="secondary"
                              variant="filled"
                              sx={{ fontWeight: 600 }}
                            />
                          ))
                        )}
                      </Box>
                    </Box>

                    {/* Telegram Chat ID */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        Telegram Guruh ID:
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={item.chatId}
                        onChange={(e) => updateReportField(item.reportType, 'chatId', e.target.value)}
                        placeholder={item.defaultChatId || 'Masalan: -100123456789'}
                        helperText={
                          item.defaultChatId
                            ? ('Bo‘sh qoldirilsa, tashkilotning guruhi (' + item.defaultChatId + ') ishlatiladi.')
                            : 'Telegram chat ID'
                        }
                      />
                    </Box>

                    {/* Last run status info */}
                    {item.lastRunAt && (
                      <Alert severity="info" icon={<CheckCircleOutlined />} sx={{ py: 0.5 }}>
                        Oxirgi marta muvaffaqiyatli yuborildi: {dayjs(item.lastRunAt).format('DD.MM.YYYY HH:mm')}
                      </Alert>
                    )}
                  </CardContent>

                  {/* Actions */}
                  <CardActions
                    sx={{
                      p: 2,
                      pt: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid',
                      borderColor: theme.palette.divider
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={isTesting ? <CircularProgress size={16} color="inherit" /> : <TelegramIcon />}
                      onClick={() => handleTestSend(item)}
                      disabled={isTesting || isSaving}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {isTesting ? 'Yuborilmoqda...' : 'Sinov tariqasida yuborish'}
                    </Button>

                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                      onClick={() => handleSave(item)}
                      disabled={isSaving || isTesting}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {isSaving ? 'Saqlanmoqda...' : 'Jadvalni saqlash'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
