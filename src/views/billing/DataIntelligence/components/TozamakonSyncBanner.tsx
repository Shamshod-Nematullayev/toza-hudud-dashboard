import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Box,
  Typography,
  Stack,
  Button,
  LinearProgress,
  Chip,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  SyncRounded,
  CheckCircleOutlineRounded,
  ScheduleRounded,
  ErrorOutlineRounded,
  CloudDownloadOutlined,
  LayersOutlined,
  LocationCityOutlined,
  CancelRounded
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import dayjs from 'dayjs';

interface SyncStatusResponse {
  companyId: number;
  status: 'idle' | 'running' | 'completed' | 'failed';
  isRunning: boolean;
  progress: number;
  stepMessage: string;
  totalAbonents: number;
  updatedAbonents: number;
  startedAt?: string;
  finishedAt?: string;
  lastSuccessAt?: string | null;
  error?: string | null;
  canRun: boolean;
  nextAvailableDate?: string | null;
  remainingDays: number;
}

export const TozamakonSyncBanner: React.FC = () => {
  const theme = useTheme();

  const [syncStatus, setSyncStatus] = useState<SyncStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Polling interval ref
  const intervalRef = useRef<any>(null);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/data-intelligence/tozamakon-sync/status');
      if (res.data?.ok && res.data.status) {
        setSyncStatus(res.data.status);
        return res.data.status;
      }
    } catch (e) {
      console.error('Tozamakon sync status error:', e);
    }
    return null;
  };

  // 1. Dastlabki yuklanishda statusni olish
  useEffect(() => {
    setLoading(true);
    fetchStatus().finally(() => setLoading(false));
  }, []);

  // 2. Har 1 soniyada progressni yangilash (FAQAT job isRunning bo'lganda!)
  useEffect(() => {
    if (syncStatus?.isRunning) {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(async () => {
          const latest = await fetchStatus();
          // Agar 100% bo'lib yakunlansa yoki xatolik bilan to'xtasa
          if (latest && !latest.isRunning) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            if (latest.status === 'completed') {
              toast.success("Abonentlar bazasi Tozamakondan muvaffaqiyatli yangilandi!");
            } else if (latest.status === 'failed') {
              toast.error(latest.error || "Yangilanish jarayonida xatolik yuz berdi");
            }
          }
        }, 1000);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [syncStatus?.isRunning]);

  // Jobni ishga tushirish
  const handleStartSync = async () => {
    setIsStarting(true);
    try {
      const res = await api.post('/data-intelligence/tozamakon-sync/start');
      if (res.data?.ok) {
        toast.info("Abonentlar bazasini yangilash boshlandi (Excel yuklab olinmoqda)...");
        await fetchStatus();
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Sinxronizatsiyani boshlashda xatolik yuz berdi");
    } finally {
      setIsStarting(false);
    }
  };

  const [isCanceling, setIsCanceling] = useState(false);

  // Jobni bekor qilish
  const handleCancelSync = async () => {
    if (!window.confirm("Haqiqatan ham sinxronizatsiya jarayonini bekor qilmoqchimisiz?")) {
      return;
    }
    setIsCanceling(true);
    try {
      const res = await api.post('/data-intelligence/tozamakon-sync/cancel');
      if (res.data?.ok) {
        toast.info("Sinxronizatsiya jarayoni bekor qilindi");
        await fetchStatus();
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Bekor qilishda xatolik yuz berdi");
    } finally {
      setIsCanceling(false);
    }
  };

  if (loading && !syncStatus) {
    return null;
  }

  const isRunning = syncStatus?.isRunning || false;
  const canRun = syncStatus?.canRun || false;
  const progress = syncStatus?.progress || 0;
  const lastSuccessFormatted = syncStatus?.lastSuccessAt
    ? dayjs(syncStatus.lastSuccessAt).format('DD.MM.YYYY HH:mm')
    : 'Mavjud emas (hali qilinmagan)';
  const nextAvailableFormatted = syncStatus?.nextAvailableDate
    ? dayjs(syncStatus.nextAvailableDate).format('DD.MM.YYYY')
    : '';

  return (
    <Card
      sx={{
        p: 2.2,
        borderRadius: 2.5,
        border: `1px solid ${isRunning ? alpha(theme.palette.info.main, 0.4) : theme.palette.divider}`,
        bgcolor: isRunning
          ? alpha(theme.palette.info.main, 0.03)
          : alpha(theme.palette.background.paper, 0.9),
        mb: 2.5
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' }
        }}
      >
        {/* Chap tomon: Ma'lumot */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
            <LocationCityOutlined sx={{ color: 'info.main', fontSize: 24 }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Tozamakon Abonentlar Bazasini Yangilash (Ko'cha va Uy Manzillari)
            </Typography>
            {isRunning ? (
              <Chip
                label="Jarayonda..."
                color="info"
                size="small"
                icon={<CircularProgress size={14} color="inherit" />}
                sx={{ fontWeight: 700 }}
              />
            ) : syncStatus?.status === 'completed' ? (
              <Chip
                label="Faol"
                color="success"
                size="small"
                icon={<CheckCircleOutlineRounded sx={{ fontSize: 16 }} />}
                sx={{ fontWeight: 600 }}
              />
            ) : null}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Tozamakondan butun tuman abonentlarining to'liq Excel bazasi yuklanib, GreenZone abonentlariga ko'cha/qishloq, uy raqami va manzillari kiritiladi.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              Oxirgi to'liq yangilangan: <strong>{lastSuccessFormatted}</strong>
            </Typography>

            {!canRun && !isRunning && syncStatus?.lastSuccessAt && (
              <Chip
                icon={<ScheduleRounded sx={{ fontSize: 14 }} />}
                label={`15 kunlik cheklov: Keyingi yangilash ${syncStatus.remainingDays} kundan so'ng (${nextAvailableFormatted})`}
                size="small"
                color="default"
                variant="outlined"
                sx={{ fontSize: '0.75rem', fontWeight: 600 }}
              />
            )}

            {syncStatus?.status === 'failed' && !isRunning && (
              <Chip
                icon={<ErrorOutlineRounded sx={{ fontSize: 14 }} />}
                label={syncStatus.error || syncStatus.stepMessage || "Oxirgi yangilanish bekor qilingan"}
                size="small"
                color="error"
                variant="outlined"
                sx={{ fontSize: '0.75rem', fontWeight: 600 }}
              />
            )}
          </Stack>
        </Box>

        {/* O'ng tomon: Action Buttons */}
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button
              variant="contained"
              color="info"
              disabled={!canRun || isRunning || isStarting}
              startIcon={
                isRunning || isStarting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SyncRounded />
                )
              }
              onClick={handleStartSync}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                py: 1.1,
                px: 2.2,
                boxShadow: 'none'
              }}
            >
              {isRunning
                ? "Yangilanmoqda..."
                : canRun
                ? "Tozamakondan Yangilash"
                : `15 kunda 1 marta (${syncStatus?.remainingDays} kun qoldi)`}
            </Button>

            {isRunning && (
              <Button
                variant="outlined"
                color="error"
                disabled={isCanceling}
                startIcon={
                  isCanceling ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <CancelRounded sx={{ fontSize: 18 }} />
                  )
                }
                onClick={handleCancelSync}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.1,
                  px: 1.8
                }}
              >
                {isCanceling ? "Bekor qilinmoqda..." : "Bekor qilish"}
              </Button>
            )}
          </Stack>
        </Box>
      </Stack>

      {/* Progress Bar (Faqat job ishlayotganda ko'rinadi) */}
      {isRunning && (
        <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px dashed ${alpha(theme.palette.info.main, 0.3)}` }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>
              {syncStatus?.stepMessage || "Ma'lumotlar qayta ishlanmoqda..."}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'info.main' }}>
              {progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            color="info"
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.info.main, 0.15)
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            ⚠️ Eslatma: Jarayon 100% yakunlanmaguncha jadvallar qayta yuklanmaydi va ortiqcha tarmoq trafigi tejaladi.
          </Typography>
        </Box>
      )}
    </Card>
  );
};
