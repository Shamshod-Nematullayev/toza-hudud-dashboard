import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
   alpha,
  useTheme
} from '@mui/material';
import {
  CampaignOutlined,
  CheckCircleOutlined,
  ContentCopyOutlined,
  DeleteOutlined,
  DoneAllOutlined,
  ErrorOutlined,
  ForumOutlined,
  PauseCircleOutlined,
  PhoneEnabledOutlined,
  PlayCircleOutlined,
  RefreshOutlined,
  RemoveCircleOutlined,
  SearchOutlined,
  SyncOutlined,
  Telegram,
  TouchAppOutlined,
  VerifiedUserOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';

interface IInspectorAckItem {
  _id: string;
  id: number;
  name: string;
  phone: string;
  biriktirilgan: string[];
  method?: 'button' | 'message' | 'manual';
  replyText?: string;
  acknowledgedAt?: string | null;
}

interface IGroupTaskItem {
  _id: string;
  chatId: number;
  messageId?: number;
  reportMessageId?: number;
  originalMessageId: number;
  originalSenderId: number;
  originalSenderName: string;
  originalSenderUsername?: string;
  taskText?: string;
  commandSenderId: number;
  companyId: number;
  timerMinutes: number;
  timerScheduledAt: string;
  status: 'pending' | 'completed' | 'closed';
  monitoringActive: boolean;
  reportSent: boolean;
  completedAt?: string;
  closedAt?: string;
  totalActiveInspectors: number;
  acknowledgedCount: number;
  unacknowledgedCount: number;
  completionPercent: number;
  acknowledgedList: IInspectorAckItem[];
  unacknowledgedList: IInspectorAckItem[];
}

interface IGroupTaskStats {
  totalTasks: number;
  activeMonitoringCount: number;
  averageAckRate: number;
  latestTaskUnacknowledgedCount: number;
  totalActiveInspectors: number;
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function GroupTasksPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [tasks, setTasks] = useState<IGroupTaskItem[]>([]);
  const [stats, setStats] = useState<IGroupTaskStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'unacknowledged' | 'acknowledged'>('unacknowledged');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchGroupTasks = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/group-tasks');
      if (res.data?.ok) {
        const list: IGroupTaskItem[] = res.data.data || [];
        setTasks(list);
        setStats(res.data.stats || null);
        setSelectedTaskId((prev) => {
          if (prev && list.some((item) => item._id === prev)) return prev;
          return list.length > 0 ? list[0]._id : null;
        });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Guruh topshiriqlarini yuklashda xatolik yuz berdi');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroupTasks();
    // Auto-refresh every 20 seconds while page is open
    const interval = setInterval(() => {
      fetchGroupTasks(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchGroupTasks]);

  const selectedTask = useMemo(
    () => tasks.find((t) => t._id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  const handleToggleMonitoring = async (task: IGroupTaskItem) => {
    setActionLoadingId(`mon_${task._id}`);
    try {
      const res = await api.patch(`/group-tasks/${task._id}/toggle-monitoring`, {
        monitoringActive: !task.monitoringActive
      });
      if (res.data?.ok) {
        toast.success(res.data.message);
        await fetchGroupTasks(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Kuzatuv holatini o‘zgartirishda xatolik');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSyncTelegram = async (task: IGroupTaskItem) => {
    setActionLoadingId(`sync_${task._id}`);
    try {
      const res = await api.post(`/group-tasks/${task._id}/sync-telegram`);
      if (res.data?.ok) {
        toast.success(res.data.message);
        await fetchGroupTasks(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Telegram bilan sinxronlashda xatolik');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleInspector = async (task: IGroupTaskItem, inspectorId: string) => {
    setActionLoadingId(`ins_${inspectorId}`);
    try {
      const res = await api.post(`/group-tasks/${task._id}/toggle-inspector`, {
        inspectorId
      });
      if (res.data?.ok) {
        toast.success(res.data.message);
        setTasks((prev) =>
          prev.map((item) => (item._id === task._id ? res.data.data : item))
        );
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Nazoratchi holatini o‘zgartirishda xatolik');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteTask = async (task: IGroupTaskItem) => {
    if (!window.confirm('Ushbu topshiriqni o‘chirishni tasdiqlaysizmi?')) return;
    setActionLoadingId(`del_${task._id}`);
    try {
      const res = await api.delete(`/group-tasks/${task._id}`);
      if (res.data?.ok) {
        toast.success('Topshiriq o‘chirildi');
        await fetchGroupTasks(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Topshiriqni o‘chirishda xatolik');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyPhone = (phone: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    toast.info(`Nusxa olindi: ${phone}`);
  };

  const filteredInspectors = useMemo(() => {
    if (!selectedTask) return [];
    const source =
      activeTab === 'unacknowledged'
        ? selectedTask.unacknowledgedList
        : selectedTask.acknowledgedList;

    if (!searchQuery.trim()) return source;
    const q = searchQuery.toLowerCase();
    return source.filter(
      (ins) =>
        ins.name.toLowerCase().includes(q) ||
        (ins.phone && ins.phone.toLowerCase().includes(q)) ||
        (ins.replyText && ins.replyText.toLowerCase().includes(q))
    );
  }, [selectedTask, activeTab, searchQuery]);

  const renderMethodBadge = (item: IInspectorAckItem) => {
    if (item.method === 'message') {
      return (
        <Chip
          size="small"
          icon={<ForumOutlined sx={{ fontSize: 15 }} />}
          label={item.replyText ? `Yozdi: "${item.replyText}"` : 'Guruhda yozdi'}
          sx={{
            bgcolor: alpha(theme.palette.info.main, isDark ? 0.2 : 0.1),
            color: theme.palette.info.main,
            fontWeight: 600,
            maxWidth: 260
          }}
        />
      );
    }
    if (item.method === 'manual') {
      return (
        <Chip
          size="small"
          icon={<VerifiedUserOutlined sx={{ fontSize: 15 }} />}
          label="Admin tasdiqladi"
          sx={{
            bgcolor: alpha(theme.palette.warning.main, isDark ? 0.2 : 0.1),
            color: theme.palette.warning.main,
            fontWeight: 600
          }}
        />
      );
    }
    return (
      <Chip
        size="small"
        icon={<TouchAppOutlined sx={{ fontSize: 15 }} />}
        label="«Tushundim» tugmasi"
        sx={{
          bgcolor: alpha(theme.palette.success.main, isDark ? 0.2 : 0.1),
          color: theme.palette.success.main,
          fontWeight: 600
        }}
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
          backgroundImage: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            isDark ? 0.14 : 0.06
          )} 0%, transparent 60%)`
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.25 : 0.12),
                color: theme.palette.primary.main
              }}
            >
              <Telegram sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                Telegram Guruh Topshiriqlari Nazorati (/task)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                Guruhda rahbariyat tomonidan berilgan topshiriqlarni qabul qilgan va javob bermagan nazoratchilarning real vaqtdagi monitoringi
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshOutlined />}
              onClick={() => fetchGroupTasks()}
              disabled={loading}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Yangilash
            </Button>
          </Stack>
        </Stack>

        {/* 4 KPI Strip */}
        <Grid container spacing={2} sx={{ mt: 1.5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.05),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2)
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                JAMI TOPSHIRIQLAR
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.primary.main }}>
                {stats?.totalTasks ?? 0} ta
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Aktiv nazoratchilar: {stats?.totalActiveInspectors ?? 0} nafar
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.info.main, isDark ? 0.12 : 0.05),
                border: '1px solid',
                borderColor: alpha(theme.palette.info.main, 0.2)
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                FAOL KUZATUVDA
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.info.main }}>
                {stats?.activeMonitoringCount ?? 0} ta
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Yozilgan javoblar avtomatik hisoblanmoqda
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.success.main, isDark ? 0.12 : 0.05),
                border: '1px solid',
                borderColor: alpha(theme.palette.success.main, 0.2)
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                O‘RTACHA TANISHISH KO‘RSATKICHI
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.success.main }}>
                {stats?.averageAckRate ?? 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tugma yoki xabar orqali tasdiqlaganlar
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.error.main, isDark ? 0.12 : 0.05),
                border: '1px solid',
                borderColor: alpha(theme.palette.error.main, 0.2)
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                SO‘NGGI TOPSHIRIQDA JAVOB BERMAGANLAR
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.error.main }}>
                {stats?.latestTaskUnacknowledgedCount ?? 0} nafar
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Qo‘ng‘iroq qilib ogohlantirish talab etiladi
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Split Content */}
      {loading && tasks.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            border: '1px solid',
            borderColor: theme.palette.divider,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <CircularProgress />
          <Typography color="text.secondary">Guruh topshiriqlari yuklanmoqda...</Typography>
        </Paper>
      ) : tasks.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            border: '1px solid',
            borderColor: theme.palette.divider,
            textAlign: 'center'
          }}
        >
          <CampaignOutlined sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.5 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1.5 }}>
            Hozircha Telegram guruh topshiriqlari mavjud emas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8, maxWidth: 520, mx: 'auto' }}>
            Telegram guruhda biror topshiriq xabariga reply qilib <b>/task</b> buyrug‘ini yuboring — barcha topshiriqlar va nazoratchilar reaksiyasi shu yerda ko‘rinadi.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {/* Left Column: Tasks List */}
          <Grid size={{ xs: 12, md: 4, lg: 4 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.divider,
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: theme.palette.divider }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Berilgan topshiriqlar ({tasks.length})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Batafsil nazoratchilar ro‘yxatini ko‘rish uchun topshiriqni tanlang
                </Typography>
              </Box>

              <Stack
                spacing={1.2}
                sx={{ p: 1.5, maxHeight: 'calc(100vh - 310px)', overflowY: 'auto' }}
              >
                {tasks.map((task) => {
                  const isSelected = task._id === selectedTask?._id;
                  return (
                    <Paper
                      key={task._id}
                      elevation={0}
                      onClick={() => setSelectedTaskId(task._id)}
                      sx={{
                        p: 1.8,
                        borderRadius: 2.5,
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        bgcolor: isSelected
                          ? alpha(theme.palette.primary.main, isDark ? 0.18 : 0.08)
                          : theme.palette.background.default,
                        border: '1.5px solid',
                        borderColor: isSelected
                          ? theme.palette.primary.main
                          : theme.palette.divider,
                        '&:hover': {
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
                      >
                        <Chip
                          size="small"
                          label={task.monitoringActive ? '🟢 Kuzatuv faol' : '⚪ Kuzatuv yakunlangan'}
                          sx={{
                            fontWeight: 700,
                            fontSize: 11,
                            bgcolor: task.monitoringActive
                              ? alpha(theme.palette.success.main, isDark ? 0.22 : 0.12)
                              : alpha(theme.palette.text.secondary, 0.12),
                            color: task.monitoringActive
                              ? theme.palette.success.main
                              : theme.palette.text.secondary
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {formatDateTime(task.timerScheduledAt)}
                        </Typography>
                      </Stack>

                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        👤 {task.originalSenderName}
                        {task.originalSenderUsername ? ` (@${task.originalSenderUsername})` : ''}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          mb: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontStyle: task.taskText ? 'normal' : 'italic'
                        }}
                      >
                        {task.taskText || '📎 Ovozli xabar / Media fayl orqali berilgan topshiriq'}
                      </Typography>

                      <Box sx={{ mb: 0.8 }}>
                        <Stack
                          direction="row"
                          sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            Tasdiqladi: {task.acknowledgedCount} / {task.totalActiveInspectors}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color:
                                task.unacknowledgedCount > 0
                                  ? theme.palette.error.main
                                  : theme.palette.success.main
                            }}
                          >
                            {task.unacknowledgedCount > 0
                              ? `${task.unacknowledgedCount} ta javob bermagan`
                              : '100% bajarildi'}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={task.completionPercent}
                          color={task.unacknowledgedCount === 0 ? 'success' : 'primary'}
                          sx={{ height: 7, borderRadius: 4 }}
                        />
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>

          {/* Right Column: Selected Task Details & Inspector Control */}
          <Grid size={{ xs: 12, md: 8, lg: 8 }}>
            {selectedTask && (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: theme.palette.background.paper,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  overflow: 'hidden'
                }}
              >
                {/* Selected Task Control Header */}
                <Box
                  sx={{
                    p: 2.5,
                    borderBottom: '1px solid',
                    borderColor: theme.palette.divider,
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.06 : 0.02)
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
                  >
                    <Box>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.8, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          color={selectedTask.monitoringActive ? 'success' : 'default'}
                          label={
                            selectedTask.monitoringActive
                              ? 'Kuzatuv davom etmoqda (yozilgan xabarlar hisobga olinadi)'
                              : 'Kuzatuv to‘xtatilgan (yakunlangan)'
                          }
                          sx={{ fontWeight: 700 }}
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={
                            selectedTask.reportSent
                              ? '📋 10 daqiqalik hisobot guruhga chiqqan'
                              : '⏳ 10 daqiqalik hisobot kutilmoqda'
                          }
                        />
                      </Stack>

                      <Typography variant="h3" sx={{ fontWeight: 800 }}>
                        {selectedTask.originalSenderName}
                        {selectedTask.originalSenderUsername
                          ? ` (@${selectedTask.originalSenderUsername})`
                          : ''}{' '}
                        tomonidan berilgan topshiriq
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                        Berilgan vaqti: <b>{formatDateTime(selectedTask.timerScheduledAt)}</b> • Xabar ID:{' '}
                        <code>#{selectedTask.originalMessageId}</code>
                      </Typography>

                      {selectedTask.taskText && (
                        <Paper
                          elevation={0}
                          sx={{
                            mt: 1.5,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: theme.palette.background.default,
                            border: '1px solid',
                            borderColor: theme.palette.divider
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {selectedTask.taskText}
                          </Typography>
                        </Paper>
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', flexShrink: 0 }}>
                      <Tooltip
                        title={
                          selectedTask.monitoringActive
                            ? 'Ushbu topshiriq bo‘yicha guruhda yozilgan xabarlarni kuzatishni to‘xtatish'
                            : 'Ushbu topshiriq bo‘yicha kuzatuvni qayta yoqish'
                        }
                      >
                        <Button
                          variant="contained"
                          color={selectedTask.monitoringActive ? 'warning' : 'success'}
                          size="small"
                          startIcon={
                            actionLoadingId === `mon_${selectedTask._id}` ? (
                              <CircularProgress size={15} color="inherit" />
                            ) : selectedTask.monitoringActive ? (
                              <PauseCircleOutlined />
                            ) : (
                              <PlayCircleOutlined />
                            )
                          }
                          onClick={() => handleToggleMonitoring(selectedTask)}
                          disabled={actionLoadingId === `mon_${selectedTask._id}`}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          {selectedTask.monitoringActive ? 'Kuzatuvni to‘xtatish' : 'Kuzatuvni yoqish'}
                        </Button>
                      </Tooltip>

                      <Tooltip title="Telegram guruhdagi tugma va ro‘yxat xabarini hoziroq qayta yangilash (yoki 10 daqiqa kutmasdan hisobotni chiqarish)">
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={
                            actionLoadingId === `sync_${selectedTask._id}` ? (
                              <CircularProgress size={15} color="inherit" />
                            ) : (
                              <SyncOutlined />
                            )
                          }
                          onClick={() => handleSyncTelegram(selectedTask)}
                          disabled={actionLoadingId === `sync_${selectedTask._id}`}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          {selectedTask.reportSent ? 'Telegramni yangilash' : 'Hisobotni hozir chiqarish'}
                        </Button>
                      </Tooltip>

                      <Tooltip title="Topshiriqni o‘chirish">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteTask(selectedTask)}
                          disabled={actionLoadingId === `del_${selectedTask._id}`}
                          sx={{
                            border: '1px solid',
                            borderColor: alpha(theme.palette.error.main, 0.3),
                            borderRadius: 2
                          }}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Box>

                {/* Tabs & Search Bar */}
                <Box sx={{ px: 2.5, pt: 1.5, borderBottom: '1px solid', borderColor: theme.palette.divider }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', pb: 1.5 }}
                  >
                    <Tabs
                      value={activeTab}
                      onChange={(_, val) => setActiveTab(val)}
                      sx={{ minHeight: 40 }}
                    >
                      <Tab
                        value="unacknowledged"
                        icon={<ErrorOutlined fontSize="small" />}
                        iconPosition="start"
                        label={`Javob bermaganlar (${selectedTask.unacknowledgedCount})`}
                        sx={{ minHeight: 40, fontWeight: 700, color: theme.palette.error.main }}
                      />
                      <Tab
                        value="acknowledged"
                        icon={<CheckCircleOutlined fontSize="small" />}
                        iconPosition="start"
                        label={`Tasdiqlaganlar (${selectedTask.acknowledgedCount})`}
                        sx={{ minHeight: 40, fontWeight: 700, color: theme.palette.success.main }}
                      />
                    </Tabs>

                    <TextField
                      size="small"
                      placeholder="Nazoratchi ismi yoki telefoni..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <SearchOutlined sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                          )
                        }
                      }}
                      sx={{ minWidth: { xs: '100%', sm: 260 } }}
                    />
                  </Stack>
                </Box>

                {/* Inspector List */}
                <Box sx={{ p: 2.5, maxHeight: 'calc(100vh - 420px)', overflowY: 'auto' }}>
                  {filteredInspectors.length === 0 ? (
                    <Box sx={{ py: 5, textAlign: 'center' }}>
                      <DoneAllOutlined sx={{ fontSize: 48, color: 'success.main', opacity: 0.7 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                        {activeTab === 'unacknowledged'
                          ? 'Barcha aktiv nazoratchilar topshiriqni tasdiqlagan! 👏'
                          : 'Hozircha tasdiqlagan nazoratchilar topilmadi'}
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.2}>
                      {filteredInspectors.map((ins, index) => (
                        <Paper
                          key={ins._id}
                          elevation={0}
                          sx={{
                            p: 1.8,
                            borderRadius: 2.5,
                            bgcolor: theme.palette.background.default,
                            border: '1px solid',
                            borderColor:
                              activeTab === 'unacknowledged'
                                ? alpha(theme.palette.error.main, 0.25)
                                : alpha(theme.palette.success.main, 0.25)
                          }}
                        >
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1.5}
                            sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
                          >
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: 13,
                                  bgcolor:
                                    activeTab === 'unacknowledged'
                                      ? alpha(theme.palette.error.main, isDark ? 0.2 : 0.1)
                                      : alpha(theme.palette.success.main, isDark ? 0.2 : 0.1),
                                  color:
                                    activeTab === 'unacknowledged'
                                      ? theme.palette.error.main
                                      : theme.palette.success.main
                                }}
                              >
                                {index + 1}
                              </Box>

                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                  {ins.name}
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={1.5}
                                  sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 0.3 }}
                                >
                                  {ins.phone ? (
                                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                      <Typography
                                        variant="caption"
                                        component="a"
                                        href={`tel:${ins.phone}`}
                                        sx={{
                                          color: theme.palette.primary.main,
                                          fontWeight: 700,
                                          textDecoration: 'none',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 0.4
                                        }}
                                      >
                                        <PhoneEnabledOutlined sx={{ fontSize: 14 }} />
                                        {ins.phone}
                                      </Typography>
                                      <Tooltip title="Raqamdan nusxa olish">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleCopyPhone(ins.phone)}
                                          sx={{ p: 0.3 }}
                                        >
                                          <ContentCopyOutlined sx={{ fontSize: 13 }} />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      Telefon kiritilmagan
                                    </Typography>
                                  )}

                                  {activeTab === 'acknowledged' && ins.acknowledgedAt && (
                                    <Typography variant="caption" color="text.secondary">
                                      • Vaqti: {formatDateTime(ins.acknowledgedAt)}
                                    </Typography>
                                  )}
                                </Stack>
                              </Box>
                            </Stack>

                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                              {activeTab === 'acknowledged' && renderMethodBadge(ins)}

                              {activeTab === 'unacknowledged' ? (
                                <Tooltip title="Telefon orqali ogohlantirilgach, qo‘lda tasdiqlanganlar qatoriga o‘tkazish (Telegram xabari ham avtomatik yangilanadi)">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={
                                      actionLoadingId === `ins_${ins._id}` ? (
                                        <CircularProgress size={14} color="inherit" />
                                      ) : (
                                        <CheckCircleOutlined />
                                      )
                                    }
                                    onClick={() => handleToggleInspector(selectedTask, ins._id)}
                                    disabled={actionLoadingId === `ins_${ins._id}`}
                                    sx={{ borderRadius: 2, fontWeight: 700 }}
                                  >
                                    Tasdiqladi deb belgilash
                                  </Button>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Tasdiqlaganlar ro‘yxatidan qaytarib chiqarish">
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={() => handleToggleInspector(selectedTask, ins._id)}
                                    disabled={actionLoadingId === `ins_${ins._id}`}
                                  >
                                    <RemoveCircleOutlined fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>

                <Divider />
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    bgcolor: theme.palette.background.default
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    💡 <b>Eslatma:</b> Kuzatuv faol bo‘lgan vaqtda nazoratchilar Telegram guruhda{' '}
                    <b>«✅ Tushundim»</b> tugmasini bossa yoki guruhga xabar yozsa, ro‘yxat avtomatik yangilanadi. Barcha aktiv nazoratchilar tasdiqlab bo‘lganda yoki 24 soatdan so‘ng kuzatuv avtomatik yakunlanadi.
                  </Typography>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default GroupTasksPage;
