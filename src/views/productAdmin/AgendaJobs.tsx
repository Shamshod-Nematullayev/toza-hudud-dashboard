import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  alpha,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as RunNowIcon,
  Stop as StopIcon,
  LockOpen as UnlockIcon,
  DeleteOutlined as DeleteIcon,
  InfoOutlined as InfoIcon,
  Search as SearchIcon,
  CheckCircleOutlined as CompletedIcon,
  ErrorOutlined as FailedIcon,
  HourglassTop as QueuedIcon,
  Schedule as ScheduledIcon,
  WarningAmber as StaleIcon,
  Speed as SlotsIcon,
  Layers as BatchIcon,
  ContentCopy as CopyIcon,
  TuneOutlined as ActionMenuIcon
} from '@mui/icons-material';
import api from 'utils/api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface AgendaJobItem {
  _id: string;
  name: string;
  title: string;
  rawName: string;
  companyId?: number;
  companyName?: string;
  status: 'running' | 'queued' | 'stale' | 'failed' | 'scheduled' | 'completed';
  isSlot1: boolean;
  slotLabel: string;
  priority: number;
  repeatInterval?: string | null;
  repeatTimezone?: string | null;
  lastRunAt?: string | null;
  lastFinishedAt?: string | null;
  nextRunAt?: string | null;
  failedAt?: string | null;
  failReason?: string | null;
  failCount: number;
  lockedAt?: string | null;
  durationMs?: number;
  progress: number;
  progressMessage?: string | null;
  current?: number;
  total?: number;
  data: Record<string, any>;
}

interface AgendaDashboardData {
  stats: {
    total: number;
    running: number;
    queued: number;
    stale: number;
    failed: number;
    scheduled: number;
    completed: number;
    maxConcurrency: number;
    activeSlotsCount: number;
  };
  slots: {
    slot1: {
      name: string;
      concurrency: number;
      isBusy: boolean;
      activeJob: AgendaJobItem | null;
      queuedCount: number;
      queuedJobs: AgendaJobItem[];
    };
    slot2: {
      name: string;
      concurrency: number;
      isBusy: boolean;
      activeJobs: AgendaJobItem[];
      queuedCount: number;
      queuedJobs: AgendaJobItem[];
    };
  };
  jobs: AgendaJobItem[];
}

const formatDuration = (ms?: number) => {
  if (ms === undefined || ms === null || isNaN(ms)) return '-';
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds} soniya`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}s ${remainingMinutes}m`;
};

const AgendaJobs: React.FC = () => {
  const theme = useTheme();

  // State
  const [data, setData] = useState<AgendaDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(10); // in seconds, 0 = off
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');

  // Details Modal
  const [selectedJob, setSelectedJob] = useState<AgendaJobItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  // Action Loading states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Fetch Agenda overview
  const fetchOverview = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setRefreshing(true);
      const res = await api.get('/jobs/admin/overview');
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        toast.error(res.data?.message || "Ma'lumotlarni yuklab bo'lmadi");
      }
    } catch (err: any) {
      console.error('Agenda overview error:', err);
      toast.error(err?.response?.data?.message || "Agenda holatini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchOverview(true);
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, fetchOverview]);

  // Unlock all stale jobs
  const handleUnlockAllStale = async () => {
    try {
      setActionLoadingId('unlock-all');
      const res = await api.post('/jobs/admin/unlock-all-stale');
      if (res.data?.success) {
        toast.success(res.data.message || "Qotib qolgan barcha joblar unlock qilindi!");
        fetchOverview();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Unlock single job
  const handleUnlockSingle = async (jobId: string) => {
    try {
      setActionLoadingId(jobId);
      const res = await api.post(`/jobs/admin/unlock/${jobId}`);
      if (res.data?.success) {
        toast.success(res.data.message || "Job muvaffaqiyatli unlock qilindi!");
        fetchOverview();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Run Now
  const handleRunNow = async (jobId: string) => {
    try {
      setActionLoadingId(jobId);
      const res = await api.post(`/jobs/admin/run-now/${jobId}`);
      if (res.data?.success) {
        toast.success(res.data.message || "Job navbatga qo'yildi va ishga tushadi!");
        fetchOverview();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Stop job
  const handleStopJob = async (jobId: string) => {
    try {
      setActionLoadingId(jobId);
      const res = await api.post(`/jobs/admin/stop/${jobId}`);
      if (res.data?.success) {
        toast.info(res.data.message || "Job to'xtatildi");
        fetchOverview();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Haqiqatan ham bu jobni bazadan butunlay o'chirmoqchimisiz?")) return;
    try {
      setActionLoadingId(jobId);
      const res = await api.delete(`/jobs/admin/${jobId}`);
      if (res.data?.success) {
        toast.success(res.data.message || "Job o'chirildi");
        fetchOverview();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cleanup old jobs
  const handleCleanup = async () => {
    try {
      setActionLoadingId('cleanup');
      const res = await api.post('/jobs/admin/cleanup');
      if (res.data?.success) {
        toast.success(res.data.message || "Tozalash muvaffaqiyatli yakunlandi");
        fetchOverview();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tozalashda xatolik");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Distinct companies for filter dropdown
  const companiesList = useMemo(() => {
    if (!data?.jobs) return [];
    const map = new Map<number, string>();
    for (const j of data.jobs) {
      if (j.companyId && j.companyName) {
        map.set(j.companyId, j.companyName);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    if (!data?.jobs) return [];
    return data.jobs.filter((j) => {
      // Status filter
      if (statusFilter === 'running' && j.status !== 'running') return false;
      if (statusFilter === 'queued' && j.status !== 'queued') return false;
      if (statusFilter === 'stale' && j.status !== 'stale') return false;
      if (statusFilter === 'failed' && j.status !== 'failed') return false;
      if (statusFilter === 'scheduled' && j.status !== 'scheduled') return false;
      if (statusFilter === 'completed' && j.status !== 'completed') return false;
      if (statusFilter === 'slots' && j.status !== 'running' && j.status !== 'queued') return false;

      // Company filter
      if (selectedCompanyId !== 'all') {
        if (String(j.companyId) !== selectedCompanyId) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = j.name.toLowerCase().includes(query) || j.title.toLowerCase().includes(query);
        const matchesId = j._id.toLowerCase().includes(query);
        const matchesCompany = (j.companyName || '').toLowerCase().includes(query) || String(j.companyId || '').includes(query);
        const matchesReason = (j.failReason || '').toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesCompany && !matchesReason) return false;
      }

      return true;
    });
  }, [data, statusFilter, selectedCompanyId, searchQuery]);

  // Status Chip Renderer
  const renderStatusChip = (status: AgendaJobItem['status']) => {
    switch (status) {
      case 'running':
        return (
          <Chip
            size="small"
            icon={<RunNowIcon sx={{ fontSize: 16 }} />}
            label="Ishlamoqda"
            sx={{
              bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.25 : 0.12),
              color: theme.palette.success.main,
              fontWeight: 600,
              border: '1px solid',
              borderColor: alpha(theme.palette.success.main, 0.3)
            }}
          />
        );
      case 'queued':
        return (
          <Chip
            size="small"
            icon={<QueuedIcon sx={{ fontSize: 16 }} />}
            label="Navbatda"
            sx={{
              bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.25 : 0.12),
              color: theme.palette.info.main,
              fontWeight: 600,
              border: '1px solid',
              borderColor: alpha(theme.palette.info.main, 0.3)
            }}
          />
        );
      case 'stale':
        return (
          <Chip
            size="small"
            icon={<StaleIcon sx={{ fontSize: 16 }} />}
            label="Qotib qolgan (Stale)"
            sx={{
              bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.3 : 0.15),
              color: theme.palette.warning.main,
              fontWeight: 700,
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.4)
            }}
          />
        );
      case 'failed':
        return (
          <Chip
            size="small"
            icon={<FailedIcon sx={{ fontSize: 16 }} />}
            label="Xatolik"
            sx={{
              bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.25 : 0.12),
              color: theme.palette.error.main,
              fontWeight: 600,
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.3)
            }}
          />
        );
      case 'scheduled':
        return (
          <Chip
            size="small"
            icon={<ScheduledIcon sx={{ fontSize: 16 }} />}
            label="Rejalashtirilgan"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
              color: theme.palette.primary.main,
              fontWeight: 500,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.25)
            }}
          />
        );
      case 'completed':
      default:
        return (
          <Chip
            size="small"
            icon={<CompletedIcon sx={{ fontSize: 16 }} />}
            label="Tugallangan"
            sx={{
              bgcolor: alpha(theme.palette.text.secondary, 0.1),
              color: theme.palette.text.secondary,
              fontWeight: 500
            }}
          />
        );
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.text.primary }}>
            Agenda Vazifalar va Slot Boshqaruvi
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Fon jarayonlari (Agenda), bajarilish slotlari va yuzaga kelgan nosozliklar nazorati
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Auto Refresh selector */}
          <Select
            size="small"
            value={autoRefreshInterval}
            onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
            sx={{
              fontSize: '0.85rem',
              height: 38,
              bgcolor: theme.palette.background.paper
            }}
          >
            <MenuItem value={0}>Avto-yangilanish: O'chiq</MenuItem>
            <MenuItem value={5}>Avto-yangilanish: 5 sek</MenuItem>
            <MenuItem value={10}>Avto-yangilanish: 10 sek</MenuItem>
            <MenuItem value={30}>Avto-yangilanish: 30 sek</MenuItem>
          </Select>

          {/* Refresh button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon className={refreshing ? 'spin-icon' : ''} />}
            onClick={() => fetchOverview()}
            disabled={refreshing}
            sx={{ height: 38, px: 2, textTransform: 'none' }}
          >
            Yangilash
          </Button>

          {/* Cleanup button */}
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={handleCleanup}
            disabled={actionLoadingId === 'cleanup'}
            sx={{ height: 38, px: 2, textTransform: 'none' }}
          >
            Eskilarni tozalash
          </Button>
        </Stack>
      </Stack>

      {/* Critical Alert if Stale Jobs exist */}
      {data && data.stats.stale > 0 && (
        <Alert
          severity="warning"
          variant="filled"
          action={
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              startIcon={<UnlockIcon />}
              onClick={handleUnlockAllStale}
              disabled={actionLoadingId === 'unlock-all'}
              sx={{ fontWeight: 700, borderColor: '#ffffff', color: '#ffffff' }}
            >
              Qotganlarni bo'shatish ({data.stats.stale})
            </Button>
          }
          sx={{ mb: 3, alignItems: 'center', borderRadius: 2 }}
        >
          <strong>Diqqat:</strong> Tizimda {data.stats.stale} ta vazifa 10 daqiqadan ko'p vaqt oldin qotib qolgan! Bu slotlarni to'sib qo'yishi va boshqa joblar ishlamay qolishiga sabab bo'ladi.
        </Alert>
      )}

      {/* Signature Element: Slot Concurrency Monitor */}
      <Card
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: 2,
          mb: 3,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            p: 2,
            px: 2.5,
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.04),
            borderBottom: '1px solid',
            borderColor: theme.palette.divider
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <SlotsIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  Slot Concurrency Monitor (Maksimal Concurrency: {data?.stats.maxConcurrency || 2})
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Agenda bir vaqtda faqat 2 ta slotda vazifalarni parallel bajara oladi
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={`Yuklama: ${data?.stats.activeSlotsCount || 0} / ${data?.stats.maxConcurrency || 2} slot band`}
              color={
                (data?.stats.activeSlotsCount || 0) >= (data?.stats.maxConcurrency || 2)
                  ? 'error'
                  : (data?.stats.activeSlotsCount || 0) > 0
                  ? 'warning'
                  : 'success'
              }
              sx={{ fontWeight: 600, fontSize: '0.82rem' }}
            />
          </Stack>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2.5}>
            {/* Slot 1: Debitor Batch Runner */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.default, 0.7),
                  border: '1px solid',
                  borderColor: data?.slots.slot1.isBusy
                    ? alpha(theme.palette.success.main, 0.4)
                    : theme.palette.divider
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <BatchIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                      Slot 1: Debitor Batch Engine
                    </Typography>
                  </Stack>
                  <Chip
                    size="small"
                    label={data?.slots.slot1.isBusy ? 'ISHLAMOQDA' : "BO'SH (TAYYOR)"}
                    color={data?.slots.slot1.isBusy ? 'success' : 'default'}
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                  />
                </Stack>

                {data?.slots.slot1.activeJob ? (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      {data.slots.slot1.activeJob.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1 }}>
                      Tashkilot: {data.slots.slot1.activeJob.companyName || 'Noma\'lum'} ({data.slots.slot1.activeJob.companyId || '-'})
                    </Typography>

                    {/* Progress bar */}
                    <Box sx={{ mb: 1.5 }}>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {data.slots.slot1.activeJob.progressMessage || 'Bajarilmoqda...'}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {data.slots.slot1.activeJob.progress}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={data.slots.slot1.activeJob.progress || 0}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Davomiyligi: {formatDuration(data.slots.slot1.activeJob.durationMs)}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          color="warning"
                          variant="outlined"
                          startIcon={<UnlockIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleUnlockSingle(data.slots.slot1.activeJob!._id)}
                          sx={{ textTransform: 'none', py: 0.2, fontSize: '0.75rem' }}
                        >
                          Slotni bo'shatish
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<StopIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleStopJob(data.slots.slot1.activeJob!._id)}
                          sx={{ textTransform: 'none', py: 0.2, fontSize: '0.75rem' }}
                        >
                          To'xtatish
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', my: 2 }}>
                    Hozirda hech qanday og'ir debitor ishi bajarilmayapti. Slot erkin.
                  </Typography>
                )}

                <Divider sx={{ my: 1.5 }} />

                {/* Queue for slot 1 */}
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                    Slot 1 navbatida:
                  </Typography>
                  <Chip
                    size="small"
                    label={`${data?.slots.slot1.queuedCount || 0} ta kutmoqda`}
                    sx={{
                      fontSize: '0.72rem',
                      height: 20,
                      bgcolor: (data?.slots.slot1.queuedCount || 0) > 0 ? alpha(theme.palette.warning.main, 0.15) : undefined
                    }}
                  />
                </Stack>
                {data?.slots.slot1.queuedJobs && data.slots.slot1.queuedJobs.length > 0 && (
                  <Box sx={{ mt: 1, maxHeight: 90, overflowY: 'auto' }}>
                    {data.slots.slot1.queuedJobs.slice(0, 3).map((qj, idx) => (
                      <Typography key={qj._id} variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary }}>
                        #{idx + 1}. {qj.title} ({qj.companyName || qj.companyId || 'Tizim'})
                      </Typography>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Slot 2: General / System Tasks */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.default, 0.7),
                  border: '1px solid',
                  borderColor: data?.slots.slot2.isBusy
                    ? alpha(theme.palette.info.main, 0.4)
                    : theme.palette.divider
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <ScheduledIcon sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                      Slot 2: Umumiy va Tizim Vazifalari
                    </Typography>
                  </Stack>
                  <Chip
                    size="small"
                    label={data?.slots.slot2.isBusy ? 'BAND' : "BO'SH (TAYYOR)"}
                    color={data?.slots.slot2.isBusy ? 'info' : 'default'}
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                  />
                </Stack>

                {data?.slots.slot2.activeJobs && data.slots.slot2.activeJobs.length > 0 ? (
                  <Box sx={{ mt: 1 }}>
                    {data.slots.slot2.activeJobs.slice(0, 1).map((aj) => (
                      <Box key={aj._id}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {aj.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1 }}>
                          Tashkilot: {aj.companyName || 'Tizim / Global'} ({aj.companyId || '-'})
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Davomiyligi: {formatDuration(aj.durationMs)}
                          </Typography>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<StopIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleStopJob(aj._id)}
                            sx={{ textTransform: 'none', py: 0.2, fontSize: '0.75rem' }}
                          >
                            To'xtatish
                          </Button>
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', my: 2 }}>
                    Umumiy vazifalar sloti bo'sh. Tizim yangi topshiriqlarga tayyor.
                  </Typography>
                )}

                <Divider sx={{ my: 1.5 }} />

                {/* Queue for slot 2 */}
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                    Umumiy navbatda:
                  </Typography>
                  <Chip
                    size="small"
                    label={`${data?.slots.slot2.queuedCount || 0} ta kutmoqda`}
                    sx={{
                      fontSize: '0.72rem',
                      height: 20,
                      bgcolor: (data?.slots.slot2.queuedCount || 0) > 0 ? alpha(theme.palette.info.main, 0.15) : undefined
                    }}
                  />
                </Stack>
                {data?.slots.slot2.queuedJobs && data.slots.slot2.queuedJobs.length > 0 && (
                  <Box sx={{ mt: 1, maxHeight: 90, overflowY: 'auto' }}>
                    {data.slots.slot2.queuedJobs.slice(0, 3).map((qj, idx) => (
                      <Typography key={qj._id} variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary }}>
                        #{idx + 1}. {qj.title} ({qj.companyName || qj.companyId || 'Tizim'})
                      </Typography>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Counter Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: 'Jami Vazifalar',
            value: data?.stats.total ?? 0,
            color: theme.palette.text.primary,
            filter: 'all'
          },
          {
            label: 'Slotda Ishlamoqda',
            value: data?.stats.running ?? 0,
            color: theme.palette.success.main,
            filter: 'running'
          },
          {
            label: 'Navbatda',
            value: data?.stats.queued ?? 0,
            color: theme.palette.info.main,
            filter: 'queued'
          },
          {
            label: 'Qotib qolgan (Stale)',
            value: data?.stats.stale ?? 0,
            color: theme.palette.warning.main,
            filter: 'stale'
          },
          {
            label: 'Xatoliklar',
            value: data?.stats.failed ?? 0,
            color: theme.palette.error.main,
            filter: 'failed'
          },
          {
            label: 'Rejali (Cron)',
            value: data?.stats.scheduled ?? 0,
            color: theme.palette.primary.main,
            filter: 'scheduled'
          }
        ].map((stat, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
            <Card
              elevation={0}
              onClick={() => setStatusFilter(stat.filter)}
              sx={{
                p: 2,
                cursor: 'pointer',
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: statusFilter === stat.filter ? stat.color : theme.palette.divider,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: stat.color,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', mb: 0.5 }}>
                {stat.label}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color }}>
                {stat.value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Table Card */}
      <Card
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Table Filters & Toolbar */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: theme.palette.divider }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}
          >
            {/* Tabs for quick filtering */}
            <Tabs
              value={statusFilter}
              onChange={(_, val) => setStatusFilter(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 38,
                '& .MuiTab-root': {
                  minHeight: 38,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  py: 0.5,
                  px: 1.5
                }
              }}
            >
              <Tab label="Barchasi" value="all" />
              <Tab label="Slotda faol" value="running" />
              <Tab label="Navbatda" value="queued" />
              <Tab label="Qotib qolganlar" value="stale" />
              <Tab label="Xatoliklar" value="failed" />
              <Tab label="Rejalashtirilgan" value="scheduled" />
              <Tab label="Tugallangan" value="completed" />
            </Tabs>

            {/* Search & Company Select */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Job nomi yoki xatolik qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    )
                  }
                }}
                sx={{ width: { xs: '100%', sm: 240 } }}
              />

              <Select
                size="small"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: 200 },
                  fontSize: '0.85rem'
                }}
              >
                <MenuItem value="all">Barcha tashkilotlar</MenuItem>
                {companiesList.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name} ({c.id})
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Stack>
        </Box>

        {/* Table Content */}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.background.paper }}>Holati</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.background.paper }}>Vazifa Nomi</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.background.paper }}>Tashkilot</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.background.paper }}>Slot</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.background.paper }}>Reja / Interval</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.background.paper }}>Keyingi Ijro</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.background.paper }}>Oxirgi Ijro & Vaqt</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: theme.palette.background.paper }}>Muammo / Sabab</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: theme.palette.background.paper }}>Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" sx={{ mt: 1.5, color: theme.palette.text.secondary }}>
                      Agenda ma'lumotlari yuklanmoqda...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                      Mos keluvchi vazifalar topilmadi
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow
                    key={job._id}
                    hover
                    sx={{
                      bgcolor:
                        job.status === 'stale'
                          ? alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.1 : 0.04)
                          : job.status === 'failed'
                          ? alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.08 : 0.02)
                          : undefined
                    }}
                  >
                    {/* Status */}
                    <TableCell>{renderStatusChip(job.status)}</TableCell>

                    {/* Job Name */}
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        {job.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: 'monospace' }}>
                        {job.name}
                      </Typography>
                      {/* Progress bar if present */}
                      {job.status === 'running' && job.progress > 0 && (
                        <Box sx={{ mt: 0.5, maxWidth: 160 }}>
                          <LinearProgress variant="determinate" value={job.progress} sx={{ height: 4, borderRadius: 2 }} />
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: theme.palette.text.secondary }}>
                            {job.progress}% {job.current !== undefined && job.total ? `(${job.current}/${job.total})` : ''}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>

                    {/* Company */}
                    <TableCell>
                      {job.companyId ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                            {job.companyName || 'Noma\'lum'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            ID: {job.companyId}
                          </Typography>
                        </Box>
                      ) : (
                        <Chip size="small" label="Tizim (Barcha)" sx={{ fontSize: '0.72rem' }} />
                      )}
                    </TableCell>

                    {/* Slot */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={job.isSlot1 ? 'Slot 1' : 'Slot 2'}
                        sx={{
                          fontSize: '0.72rem',
                          bgcolor: job.isSlot1
                            ? alpha(theme.palette.primary.main, 0.1)
                            : alpha(theme.palette.info.main, 0.1),
                          color: job.isSlot1 ? theme.palette.primary.main : theme.palette.info.main,
                          fontWeight: 600
                        }}
                      />
                    </TableCell>

                    {/* Interval / Schedule */}
                    <TableCell>
                      {job.repeatInterval ? (
                        <Tooltip title={`Timezone: ${job.repeatTimezone || 'Asia/Tashkent'}`}>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={job.repeatInterval}
                            sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Bir martalik
                        </Typography>
                      )}
                    </TableCell>

                    {/* Next Run */}
                    <TableCell>
                      {job.nextRunAt ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>
                            {dayjs(job.nextRunAt).format('DD.MM.YYYY HH:mm')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {dayjs(job.nextRunAt).fromNow()}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          -
                        </Typography>
                      )}
                    </TableCell>

                    {/* Last Run & Duration */}
                    <TableCell>
                      {job.lastRunAt ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>
                            {dayjs(job.lastRunAt).format('DD.MM.YYYY HH:mm')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Davomiyligi: {formatDuration(job.durationMs)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Hali ishlamagan
                        </Typography>
                      )}
                    </TableCell>

                    {/* Problem / Reason */}
                    <TableCell sx={{ maxWidth: 220 }}>
                      {job.failReason ? (
                        <Tooltip title={job.failReason}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.error.main,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              setSelectedJob(job);
                              setDetailsOpen(true);
                            }}
                          >
                            {job.failReason}
                          </Typography>
                        </Tooltip>
                      ) : job.status === 'stale' ? (
                        <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontWeight: 600 }}>
                          Lock 10+ daqiqadan beri qotgan
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          -
                        </Typography>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                        {/* Details */}
                        <Tooltip title="Tafsilotlar va Payload">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedJob(job);
                              setDetailsOpen(true);
                            }}
                          >
                            <InfoIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        {/* Unlock button if stale or running */}
                        {(job.status === 'stale' || job.status === 'running') && (
                          <Tooltip title="Qulfni yechish (Unlock)">
                            <IconButton
                              size="small"
                              color="warning"
                              disabled={actionLoadingId === job._id}
                              onClick={() => handleUnlockSingle(job._id)}
                            >
                              <UnlockIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Run Now */}
                        <Tooltip title="Darhol ishga tushirish (Run Now)">
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={actionLoadingId === job._id}
                            onClick={() => handleRunNow(job._id)}
                          >
                            <RunNowIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        {/* Stop button if running or queued */}
                        {(job.status === 'running' || job.status === 'queued') && (
                          <Tooltip title="To'xtatish (Stop)">
                            <IconButton
                              size="small"
                              color="error"
                              disabled={actionLoadingId === job._id}
                              onClick={() => handleStopJob(job._id)}
                            >
                              <StopIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Delete button */}
                        <Tooltip title="Bazadan o'chirish">
                          <IconButton
                            size="small"
                            color="default"
                            disabled={actionLoadingId === job._id}
                            onClick={() => handleDeleteJob(job._id)}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Job Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: theme.palette.background.paper,
              borderRadius: 2
            }
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                {selectedJob?.title}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: 'monospace' }}>
                Job ID: {selectedJob?._id}
              </Typography>
            </Box>
            {selectedJob && renderStatusChip(selectedJob.status)}
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          {selectedJob && (
            <Stack spacing={2.5}>
              {/* Error Box if present */}
              {selectedJob.failReason && (
                <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Xatolik sababi (Fail Reason):
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {selectedJob.failReason}
                  </Typography>
                  {selectedJob.failedAt && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: theme.palette.error.dark }}>
                      Yuz bergan vaqti: {dayjs(selectedJob.failedAt).format('DD.MM.YYYY HH:mm:ss')} (Urinishlar soni: {selectedJob.failCount})
                    </Typography>
                  )}
                </Alert>
              )}

              {/* Basic metadata grid */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.7), borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Texnik nomi
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {selectedJob.name}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.7), borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Tashkilot
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedJob.companyName || 'Tizim / Global'} {selectedJob.companyId ? `(ID: ${selectedJob.companyId})` : ''}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.7), borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Reja / Cron
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedJob.repeatInterval || 'Bir martalik (One-off)'} {selectedJob.repeatTimezone ? `(${selectedJob.repeatTimezone})` : ''}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.7), borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Slot
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedJob.slotLabel}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.7), borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Oxirgi ishga tushgan vaqt
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedJob.lastRunAt ? dayjs(selectedJob.lastRunAt).format('DD.MM.YYYY HH:mm:ss') : '-'}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.7), borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Tugallangan vaqt
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedJob.lastFinishedAt ? dayjs(selectedJob.lastFinishedAt).format('DD.MM.YYYY HH:mm:ss') : '-'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Raw Data JSON */}
              <Box>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    Job Data / Payload (JSON):
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<CopyIcon sx={{ fontSize: 14 }} />}
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedJob.data, null, 2));
                      toast.success("Payload nusxalandi!");
                    }}
                    sx={{ textTransform: 'none', py: 0.2 }}
                  >
                    Nusxalash
                  </Button>
                </Stack>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    maxHeight: 260,
                    overflowY: 'auto',
                    bgcolor: alpha(theme.palette.background.default, 0.9),
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    borderRadius: 1.5
                  }}
                >
                  <Typography
                    component="pre"
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      color: theme.palette.text.primary
                    }}
                  >
                    {JSON.stringify(selectedJob.data, null, 2)}
                  </Typography>
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          {selectedJob && (
            <Stack direction="row" spacing={1} sx={{ mr: 'auto' }}>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<UnlockIcon />}
                onClick={() => {
                  handleUnlockSingle(selectedJob._id);
                  setDetailsOpen(false);
                }}
              >
                Qulfni yechish
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<RunNowIcon />}
                onClick={() => {
                  handleRunNow(selectedJob._id);
                  setDetailsOpen(false);
                }}
              >
                Hozir ishga tushirish
              </Button>
            </Stack>
          )}
          <Button variant="contained" onClick={() => setDetailsOpen(false)}>
            Yopish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgendaJobs;
