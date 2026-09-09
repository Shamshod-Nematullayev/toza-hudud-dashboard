import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  useTheme,
  alpha,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  ArrowBackRounded,
  UploadFileOutlined,
  RefreshRounded,
  LayersOutlined,
  CheckCircleOutlineRounded,
  WarningAmberRounded,
  HighlightOffRounded,
  HourglassEmptyRounded,
  PlayArrowRounded,
  StopRounded,
  AutoModeRounded
} from '@mui/icons-material';
import dayjs from 'dayjs';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { ExternalRegistryItem, getGroupColor, getGroupLabel } from './RegistryManagerModal';
import { SoliqRecordsTable } from './SoliqRecordsTable';
import { ExcelImportBlock } from './ExcelImportBlock';

interface RegistryDetailViewProps {
  registry: ExternalRegistryItem;
  onBack: () => void;
}

interface JobStatusState {
  isRunning: boolean;
  total: number;
  processed: number;
  matched: number;
  conflict: number;
  unmatched: number;
  pending: number;
  progressPercent: number;
}

export const RegistryDetailView: React.FC<RegistryDetailViewProps> = ({ registry, onBack }) => {
  const theme = useTheme();

  const [currentRegistry, setCurrentRegistry] = useState<ExternalRegistryItem>(registry);
  const [showImport, setShowImport] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [matchingLoading, setMatchingLoading] = useState(false);

  const [jobStatus, setJobStatus] = useState<JobStatusState>({
    isRunning: false,
    total: 0,
    processed: 0,
    matched: 0,
    conflict: 0,
    unmatched: 0,
    pending: 0,
    progressPercent: 0
  });

  // Ro'yxat statistikasini qayta yuklash
  const reloadRegistryData = async () => {
    try {
      const res = await api.get(`/data-intelligence/registries/${currentRegistry._id}`);
      if (res.data?.ok && res.data.data) {
        setCurrentRegistry(res.data.data);
      }
    } catch (e) {}
  };

  // Ushbu ro'yxat bo'yicha AI job holatini tekshirish
  const fetchJobStatus = async () => {
    try {
      const res = await api.get('/data-intelligence/job/status', {
        params: { listId: currentRegistry._id }
      });
      if (res.data?.ok && res.data.job) {
        setJobStatus(res.data.job);
        // Agar job ishlab turgan bo'lsa, statistika ham parallel yangilanib borsin
        if (res.data.job.isRunning) {
          reloadRegistryData();
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    reloadRegistryData();
    fetchJobStatus();
  }, [refreshTrigger]);

  // Jonli polling: agar job ishlayotgan bo'lsa har 3 soniyada, aks holda har 15 soniyada
  useEffect(() => {
    const intervalTime = jobStatus.isRunning ? 3000 : 15000;
    const interval = setInterval(() => {
      fetchJobStatus();
    }, intervalTime);
    return () => clearInterval(interval);
  }, [jobStatus.isRunning, currentRegistry._id]);

  const handleImportSuccess = () => {
    setShowImport(false);
    reloadRegistryData();
    setRefreshTrigger((prev) => prev + 1);
  };

  // AI Matching Job'ni faqat ushbu ro'yxat bo'yicha ishga tushirish
  const handleStartMatching = async () => {
    setMatchingLoading(true);
    try {
      const res = await api.post('/data-intelligence/job/start', {
        listId: currentRegistry._id,
        scope: 'non_matched'
      });
      if (res.data?.ok) {
        toast.success("Ushbu ro'yxat uchun AI Solishtirish boshlandi!");
        fetchJobStatus();
        reloadRegistryData();
      } else {
        toast.warning(res.data?.message || 'Xatolik yuz berdi');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Jobni ishga tushirishda xatolik');
    } finally {
      setMatchingLoading(false);
    }
  };

  // AI Job'ni to'xtatish
  const handleStopMatching = async () => {
    setMatchingLoading(true);
    try {
      const res = await api.post('/data-intelligence/job/stop');
      if (res.data?.ok) {
        toast.info("AI Solishtirish to'xtatildi");
        fetchJobStatus();
        reloadRegistryData();
      }
    } catch (e) {} finally {
      setMatchingLoading(false);
    }
  };

  // KPI Foizlarni hisoblash
  const total = currentRegistry.totalRecords || 0;
  const matched = currentRegistry.matchedCount || 0;
  const conflict = currentRegistry.conflictCount || 0;
  const unmatched = currentRegistry.unmatchedCount || 0;
  const pending = currentRegistry.pendingCount || 0;

  const matchedPct = total > 0 ? Math.round((matched / total) * 100) : 0;
  const conflictPct = total > 0 ? Math.round((conflict / total) * 100) : 0;
  const unmatchedPct = total > 0 ? Math.round((unmatched / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;

  // Status kartasi komponenti
  const renderKpiCard = (
    key: string,
    title: string,
    count: number,
    percent: number | null,
    icon: React.ReactNode,
    colorMain: string,
    colorLight: string
  ) => {
    const isSelected = selectedStatusFilter === key;

    return (
      <Box
        onClick={() => setSelectedStatusFilter(key)}
        sx={{
          p: 2,
          borderRadius: 2.5,
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          bgcolor: isSelected ? colorLight : 'background.paper',
          border: `1.5px solid ${isSelected ? colorMain : alpha(theme.palette.divider, 0.8)}`,
          boxShadow: isSelected
            ? `0 4px 16px ${alpha(colorMain, 0.2)}`
            : `0 1px 3px ${alpha(theme.palette.common.black, 0.04)}`,
          transform: isSelected ? 'translateY(-2px)' : 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: colorMain,
            boxShadow: `0 4px 12px ${alpha(colorMain, 0.15)}`
          }
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(colorMain, 0.12),
                color: colorMain
              }}
            >
              {icon}
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.3px' }}>
              {title}
            </Typography>
          </Stack>
          {percent !== null && (
            <Chip
              label={`${percent}%`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: alpha(colorMain, 0.12),
                color: colorMain
              }}
            />
          )}
        </Stack>

        <Typography variant="h3" sx={{ fontWeight: 800, color: isSelected ? colorMain : 'text.primary', mt: 0.5 }}>
          {count.toLocaleString()}
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.8 }}>
          <Box
            sx={{
              height: 4,
              flex: 1,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.divider, 0.6),
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${percent !== null ? Math.min(Math.max(percent, 0), 100) : 100}%`,
                bgcolor: colorMain,
                borderRadius: 2,
                transition: 'width 0.5s ease'
              }}
            />
          </Box>
        </Stack>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Header & Navigation Breadcrumb & Actions */}
      <Card
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          mb: 2.5,
          bgcolor: 'background.paper',
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.03)}`
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', lg: 'center' }
          }}
        >
          {/* Chap qism: Orqaga qaytish + Ro'yxat ma'lumotlari */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackRounded />}
              onClick={onBack}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                px: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`
              }}
            >
              Ro'yxatlarga Qaytish
            </Button>

            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {currentRegistry.name}
                </Typography>
                <Chip
                  label={getGroupLabel(currentRegistry.group)}
                  color={getGroupColor(currentRegistry.group)}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
                {jobStatus.isRunning && (
                  <Chip
                    icon={<CircularProgress size={14} color="inherit" />}
                    label="AI Solishtirilmoqda..."
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Ro'yxat sanasi: <strong>{dayjs(currentRegistry.registryDate).format('DD.MM.YYYY')}</strong>
                {currentRegistry.fileName && ` • Fayl: ${currentRegistry.fileName}`}
                {currentRegistry.description && ` • ${currentRegistry.description}`}
              </Typography>
            </Box>
          </Stack>

          {/* O'ng qism: AI Solishtirish tugmasi + Excel yuklash + Refresh */}
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            {jobStatus.isRunning ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<StopRounded />}
                onClick={handleStopMatching}
                disabled={matchingLoading}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.2,
                  py: 1
                }}
              >
                AI Jobni To'xtatish
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowRounded />}
                onClick={handleStartMatching}
                disabled={matchingLoading || total === 0}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.2,
                  py: 1,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`
                }}
              >
                AI Solishtirishni Boshlash
              </Button>
            )}

            <Button
              variant={showImport ? 'contained' : 'outlined'}
              color="inherit"
              startIcon={<UploadFileOutlined />}
              onClick={() => setShowImport(!showImport)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                px: 2,
                py: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`
              }}
            >
              {showImport ? "Import Oynasini Yopish" : "+ Excel Yuklash"}
            </Button>

            <Tooltip title="Ma'lumotlarni yangilash">
              <IconButton
                onClick={() => {
                  reloadRegistryData();
                  fetchJobStatus();
                  setRefreshTrigger((prev) => prev + 1);
                }}
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  borderRadius: 2,
                  p: 1
                }}
              >
                <RefreshRounded />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* 2. KPI Ko'rsatkichlar Paneli (5 ta zamonaviy, interaktiv karta) */}
        <Box sx={{ mt: 3, pt: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              {renderKpiCard(
                'all',
                'Jami Yozuvlar',
                total,
                100,
                <LayersOutlined sx={{ fontSize: 20 }} />,
                theme.palette.primary.main,
                alpha(theme.palette.primary.main, 0.06)
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              {renderKpiCard(
                'matched',
                'Mos Kelgan',
                matched,
                matchedPct,
                <CheckCircleOutlineRounded sx={{ fontSize: 20 }} />,
                theme.palette.success.main,
                alpha(theme.palette.success.main, 0.08)
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              {renderKpiCard(
                'conflict',
                'Ziddiyatli',
                conflict,
                conflictPct,
                <WarningAmberRounded sx={{ fontSize: 20 }} />,
                theme.palette.warning.main,
                alpha(theme.palette.warning.main, 0.08)
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              {renderKpiCard(
                'unmatched',
                'Mos Kelmagan',
                unmatched,
                unmatchedPct,
                <HighlightOffRounded sx={{ fontSize: 20 }} />,
                theme.palette.error.main,
                alpha(theme.palette.error.main, 0.08)
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              {renderKpiCard(
                'pending',
                'Kutilmoqda',
                pending,
                pendingPct,
                <HourglassEmptyRounded sx={{ fontSize: 20 }} />,
                theme.palette.info.main,
                alpha(theme.palette.info.main, 0.08)
              )}
            </Grid>
          </Grid>

          {/* Jonli AI Job Bajarilish Ko'rsatkichi (faqat job ishlayotgan bo'lsa) */}
          {jobStatus.isRunning && (
            <Box
              sx={{
                mt: 2,
                p: 1.8,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <AutoModeRounded sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    AI Matching ushbu ro'yxatni tahlil qilmoqda...
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {jobStatus.processed} / {jobStatus.total} ta yozuv ({jobStatus.progressPercent}%)
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={jobStatus.progressPercent}
                sx={{
                  height: 7,
                  borderRadius: 3.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3.5
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </Card>

      {/* 3. Excel Import Formasi (ushbu ro'yxatga qo'shish) */}
      <Collapse in={showImport} sx={{ mb: showImport ? 2.5 : 0 }}>
        <ExcelImportBlock
          targetRegistry={currentRegistry}
          onSuccess={handleImportSuccess}
          onCancel={() => setShowImport(false)}
        />
      </Collapse>

      {/* 4. Tashqi Baza Yozuvlari Jadvali (Filtrlangan va boshqariladigan) */}
      <SoliqRecordsTable
        fixedRegistryId={currentRegistry._id}
        fixedRegistryName={currentRegistry.name}
        onRefreshParentStats={reloadRegistryData}
        activeStatusFilter={selectedStatusFilter}
        onStatusFilterChange={(st) => setSelectedStatusFilter(st)}
      />
    </Box>
  );
};
