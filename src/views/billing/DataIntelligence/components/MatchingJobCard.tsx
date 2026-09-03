import React, { useEffect, useState } from 'react';
import {
  Card,
  Box,
  Typography,
  Stack,
  Button,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Collapse,
  Divider,
  Paper,
  Grid
} from '@mui/material';
import {
  PlayArrowRounded,
  PauseRounded,
  RefreshRounded,
  CheckCircleOutlineRounded,
  AutoModeRounded,
  DeleteOutlineRounded,
  FilterAltOutlined,
  TuneOutlined,
  ExpandMoreRounded,
  ExpandLessRounded
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';

interface JobStats {
  total: number;
  processed: number;
  matched: number;
  conflict: number;
  unmatched: number;
  pending: number;
  progressPercent: number;
  isRunning: boolean;
  isPaused: boolean;
}

interface MahallaOption {
  id: number;
  name: string;
  mfyPrimaryName?: string;
}

interface MatchingJobCardProps {
  onRefreshRecords?: () => void;
}

export const MatchingJobCard: React.FC<MatchingJobCardProps> = ({ onRefreshRecords }) => {
  const theme = useTheme();

  const [job, setJob] = useState<JobStats>({
    total: 0,
    processed: 0,
    matched: 0,
    conflict: 0,
    unmatched: 0,
    pending: 0,
    progressPercent: 0,
    isRunning: false,
    isPaused: false
  });
  const [loading, setLoading] = useState(false);

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [scope, setScope] = useState<string>('non_matched'); // 'non_matched' | 'pending' | 'unmatched' | 'conflict' | 'all'
  const [selectedMahallaId, setSelectedMahallaId] = useState<number | ''>('');
  const [hasCadastreOnly, setHasCadastreOnly] = useState(false);
  const [enrichMvd, setEnrichMvd] = useState(true);
  const [mahallas, setMahallas] = useState<MahallaOption[]>([]);

  // Fetch Mahallas
  useEffect(() => {
    api.get('/mahallas', { params: { limit: 1000 } }).then(({ data }) => {
      const list = Array.isArray(data) ? data : data?.data || data?.docs || [];
      setMahallas(list);
    }).catch(() => {});
  }, []);

  const fetchJobStatus = async () => {
    try {
      const res = await api.get('/data-intelligence/job/status');
      if (res.data?.ok && res.data.job) {
        setJob(res.data.job);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchJobStatus();
    const interval = setInterval(() => {
      fetchJobStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartJob = async () => {
    setLoading(true);
    try {
      const payload = {
        scope,
        mahallas_id: selectedMahallaId || undefined,
        hasCadastreOnly,
        enrichMvd
      };

      const res = await api.post('/data-intelligence/job/start', payload);
      if (res.data?.ok) {
        toast.success(res.data.message || 'AI Matching Job boshlandi!');
        fetchJobStatus();
        if (onRefreshRecords) onRefreshRecords();
      } else {
        toast.warning(res.data?.message || 'Xatolik yuz berdi');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Jobni ishga tushirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleStopJob = async () => {
    setLoading(true);
    try {
      const res = await api.post('/data-intelligence/job/stop');
      if (res.data?.ok) {
        toast.info("AI Matching Job to'xtatildi");
        fetchJobStatus();
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  const handleClearDb = async () => {
    if (!window.confirm("Barcha Soliq yozuvlarini bazadan o'chirmoqchimisiz?")) return;
    try {
      await api.delete('/data-intelligence/soliq-records');
      toast.info("Soliq bazasi tozalandi");
      fetchJobStatus();
      if (onRefreshRecords) onRefreshRecords();
    } catch (e) {}
  };

  const isCompleted = job.total > 0 && job.pending === 0 && !job.isRunning;

  const getScopeLabel = (s: string) => {
    switch (s) {
      case 'pending': return 'Faqat navbatdagilar (Kutilmoqda)';
      case 'unmatched': return 'Faqat topilmaganlar (Topilmadi)';
      case 'conflict': return 'Faqat ziddiyatlilar (Shubhali)';
      case 'all': return 'Barchasini noldan qayta tekshirish (100%)';
      case 'non_matched':
      default:
        return 'Barcha noaniqlar (Topilmagan + Navbatdagi + Ziddiyatli)';
    }
  };

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        border: `1px solid ${job.isRunning ? alpha(theme.palette.primary.main, 0.4) : theme.palette.divider}`,
        bgcolor: 'background.paper',
        boxShadow: job.isRunning ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}` : 'none',
        transition: 'all 0.3s'
      }}
    >
      <Stack
        sx={{
          direction: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          mb: 2
        }}
      >
        {/* Title & Status */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: job.isRunning ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.grey[500], 0.08),
              color: job.isRunning ? 'primary.main' : 'text.secondary'
            }}
          >
            {job.isRunning ? (
              <CircularProgress size={24} color="primary" />
            ) : isCompleted ? (
              <CheckCircleOutlineRounded sx={{ fontSize: 28, color: 'success.main' }} />
            ) : (
              <AutoModeRounded sx={{ fontSize: 28 }} />
            )}
          </Box>

          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                AI Matching Jarayoni (Avtomatlashtirilgan Job)
              </Typography>
              {job.isRunning ? (
                <Chip label="Jarayonda" color="primary" size="small" sx={{ fontWeight: 700, animation: 'pulse 2s infinite' }} />
              ) : isCompleted ? (
                <Chip label="Tugallandi" color="success" size="small" sx={{ fontWeight: 700 }} />
              ) : (
                <Chip label="Kutilmoqda" color="default" size="small" sx={{ fontWeight: 600 }} />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              MongoDB dagi Soliq yozuvlarini GreenZone abonentlari bilan solishtirib, avtomatik tahlil qiladi.
            </Typography>
          </Box>
        </Stack>

        {/* Action Controls */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<TuneOutlined />}
            endIcon={showFilters ? <ExpandLessRounded /> : <ExpandMoreRounded />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
          >
            Filtrlar {scope !== 'non_matched' || selectedMahallaId || hasCadastreOnly ? '●' : ''}
          </Button>

          <IconButton size="small" onClick={fetchJobStatus} title="Yangilash">
            <RefreshRounded fontSize="small" />
          </IconButton>

          {job.total > 0 && (
            <IconButton size="small" color="error" onClick={handleClearDb} title="Bazani tozalash">
              <DeleteOutlineRounded fontSize="small" />
            </IconButton>
          )}

          {job.isRunning ? (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<PauseRounded />}
              onClick={handleStopJob}
              disabled={loading}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              To'xtatish
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowRounded />}
              onClick={handleStartJob}
              disabled={loading || job.total === 0}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2.5 }}
            >
              {scope === 'pending'
                ? "Navbatdagilarni Boshlash"
                : scope === 'unmatched'
                ? "Topilmaganlarni Qayta Tahlil Qilish"
                : scope === 'conflict'
                ? "Ziddiyatlilarni Qayta Tahlil Qilish"
                : scope === 'all'
                ? "Barchasini Noldan Qayta Tahlil Qilish"
                : "AI Solishtirishni Boshlash"}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* FILTER COLLAPSE PANEL */}
      <Collapse in={showFilters}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.default, 0.6)
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
            <FilterAltOutlined color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              AI Matching Ishga Tushirish Filtrlari:
            </Typography>
          </Stack>

          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            {/* Scope Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Qaysi yozuvlar bo'yicha tahlil qilinsin?</InputLabel>
                <Select
                  value={scope}
                  label="Qaysi yozuvlar bo'yicha tahlil qilinsin?"
                  onChange={(e) => setScope(e.target.value)}
                >
                  <MenuItem value="non_matched">
                    ⚡ Barcha noaniqlar (Topilmagan + Navbatdagi + Ziddiyatli)
                  </MenuItem>
                  <MenuItem value="pending">
                    ⏳ Faqat navbatdagilar (Kutilmoqda)
                  </MenuItem>
                  <MenuItem value="unmatched">
                    🔴 Faqat topilmaganlar (Topilmadi)
                  </MenuItem>
                  <MenuItem value="conflict">
                    🟠 Faqat ziddiyatlilar (Shubhali)
                  </MenuItem>
                  <MenuItem value="all">
                    🔄 Barcha yozuvlar (Noldan to'liq qayta tahlil)
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Mahalla Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Mahallani tanlang (Ixtiyoriy)</InputLabel>
                <Select
                  value={selectedMahallaId}
                  label="Mahallani tanlang (Ixtiyoriy)"
                  onChange={(e) => setSelectedMahallaId(String(e.target.value) === '' ? '' : (Number(e.target.value) as any))}
                >
                  <MenuItem value="">
                    <em>Barcha mahallalar</em>
                  </MenuItem>
                  {mahallas.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name} {m.mfyPrimaryName ? `(${m.mfyPrimaryName})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Additional Checkboxes */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={hasCadastreOnly}
                      onChange={(e) => setHasCadastreOnly(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Faqat kadastri borlar
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={enrichMvd}
                      onChange={(e) => setEnrichMvd(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      MVD propiska bilan boyitish
                    </Typography>
                  }
                />
              </Stack>
            </Grid>
          </Grid>

          <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              📌 Tanlangan rejim: <strong>{getScopeLabel(scope)}</strong>
              {selectedMahallaId && (
                <> • Mahalla: <strong>{mahallas.find((m) => m.id === selectedMahallaId)?.name || selectedMahallaId}</strong></>
              )}
              {hasCadastreOnly && ' • Faqat kadastri mavjudlar'}
            </Typography>
          </Box>
        </Paper>
      </Collapse>

      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Jarayon holati: <strong>{job.processed} / {job.total} ta yozuv tahlil qilindi</strong>
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {job.progressPercent}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={job.progressPercent}
          sx={{
            height: 10,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              bgcolor: job.progressPercent === 100 ? theme.palette.success.main : theme.palette.primary.main
            }
          }}
        />
      </Box>

      {/* Live Counter Badges */}
      <Stack
        sx={{
          direction: 'row',
          flexWrap: 'wrap',
          gap: 1.5,
          pt: 1,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`
        }}
      >
        <Chip
          label={`Jami Soliq: ${job.total} ta`}
          variant="outlined"
          size="small"
          sx={{ fontWeight: 600, fontSize: '0.8rem' }}
        />
        <Chip
          label={`🟢 Mos kelgan: ${job.matched} ta`}
          color="success"
          size="small"
          sx={{ fontWeight: 700, fontSize: '0.8rem' }}
        />
        <Chip
          label={`🟠 Ziddiyatli: ${job.conflict} ta`}
          color="warning"
          size="small"
          sx={{ fontWeight: 700, fontSize: '0.8rem' }}
        />
        <Chip
          label={`🔴 Topilmagan: ${job.unmatched} ta`}
          color="error"
          size="small"
          sx={{ fontWeight: 700, fontSize: '0.8rem' }}
        />
        <Chip
          label={`⏳ Navbatda: ${job.pending} ta`}
          color="default"
          size="small"
          sx={{ fontWeight: 600, fontSize: '0.8rem' }}
        />
      </Stack>
    </Card>
  );
};
