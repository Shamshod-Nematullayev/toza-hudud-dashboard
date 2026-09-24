import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Paper,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  PersonAddAlt1Outlined,
  PlayArrowRounded,
  StopRounded,
  ApartmentOutlined,
  HomeWorkOutlined,
  InfoOutlined,
  CheckCircleOutlineRounded,
  SpeedRounded,
  HourglassEmptyRounded,
  SyncRounded
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';

interface MahallaOption {
  id: number;
  name: string;
  mfyPrimaryName?: string;
}

interface AutoCreateAbonentsJobModalProps {
  open: boolean;
  onClose: () => void;
  listId?: string;
  listName?: string;
  onJobStarted?: () => void;
}

export const AutoCreateAbonentsJobModal: React.FC<AutoCreateAbonentsJobModalProps> = ({
  open,
  onClose,
  listId,
  listName,
  onJobStarted
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState<boolean>(false);
  const [stopLoading, setStopLoading] = useState<boolean>(false);
  const [mahallas, setMahallas] = useState<MahallaOption[]>([]);
  const [registries, setRegistries] = useState<any[]>([]);

  // Form params
  const [selectedListId, setSelectedListId] = useState<string>(listId || 'all');
  const [selectedMahallaId, setSelectedMahallaId] = useState<number | ''>('');
  const [limit, setLimit] = useState<number>(5000);

  // Active status
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);

  useEffect(() => {
    if (listId) {
      setSelectedListId(listId);
    }
  }, [listId]);

  // Mahalla va Registries yuklash
  useEffect(() => {
    if (!open) return;

    api
      .get('/mahallas', { params: { limit: 1000 } })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.data || data?.docs || [];
        setMahallas(list);
      })
      .catch(() => {});

    if (!listId) {
      api
        .get('/data-intelligence/registries', { params: { limit: 100 } })
        .then(({ data }) => {
          if (data?.ok) setRegistries(data.data || []);
        })
        .catch(() => {});
    }

    checkStatus();
  }, [open, listId]);

  // Polling holatini tekshirish
  const checkStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await api.get('/data-intelligence/auto-create-abonents-job/status');
      if (res.data?.ok) {
        setJobStatus(res.data.job || null);
      }
    } catch {
      // ignore
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [open]);

  const isRunning = Boolean(jobStatus && jobStatus.status === 'running');
  const isQueued = Boolean(jobStatus && jobStatus.status === 'queued');
  const isBusy = isRunning || isQueued;

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await api.post('/data-intelligence/auto-create-abonents-job/start', {
        listId: selectedListId === 'all' ? undefined : selectedListId,
        mahallas_id: selectedMahallaId === '' ? undefined : selectedMahallaId,
        limit: Number(limit) || 5000
      });

      if (res.data?.ok) {
        toast.success(res.data.message || 'Vazifa og\'ir joblar navbatiga qo\'yildi va boshlandi!');
        if (onJobStarted) onJobStarted();
        checkStatus();
      } else {
        toast.warning(res.data?.message || 'Jobni boshlab bo\'lmadi');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Jobni ishga tushirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setStopLoading(true);
    try {
      const res = await api.post('/data-intelligence/auto-create-abonents-job/stop');
      if (res.data?.ok) {
        toast.info(res.data.message || 'Hisob ochish jarayoni to\'xtatildi');
        checkStatus();
      } else {
        toast.warning(res.data?.message || 'To\'xtatishda xatolik');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Jobni to\'xtatishda xatolik');
    } finally {
      setStopLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.success.main, isDark ? 0.2 : 0.12),
              color: theme.palette.success.main
            }}
          >
            <PersonAddAlt1Outlined sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Avtomatik Hisob Raqami Ochish (Og'ir Job)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
              Data Intelligence yozuvlaridan aqlli manzil va mulkdor parametrlari bilan TozaMakonda ommaviy abonent ochish
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Agar job faol bo'lsa jonli holat ko'rinishi */}
          {isBusy && jobStatus && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: isRunning
                  ? alpha(theme.palette.info.main, 0.4)
                  : alpha(theme.palette.warning.main, 0.4),
                bgcolor: isRunning
                  ? alpha(theme.palette.info.main, isDark ? 0.15 : 0.05)
                  : alpha(theme.palette.warning.main, isDark ? 0.15 : 0.05)
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip
                    icon={
                      isRunning ? (
                        <SyncRounded
                          sx={{
                            fontSize: '15px !important',
                            animation: 'spin 2s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' }
                            }
                          }}
                        />
                      ) : (
                        <HourglassEmptyRounded sx={{ fontSize: '15px !important' }} />
                      )
                    }
                    label={isRunning ? 'Job faol ishlamoqda' : `Navbatda (#${jobStatus.position || 1})`}
                    color={isRunning ? 'info' : 'warning'}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Og'ir debitor / batch navbatida
                  </Typography>
                </Stack>

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<StopRounded />}
                  onClick={handleStop}
                  disabled={stopLoading}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700 }}
                >
                  {stopLoading ? 'To\'xtatilmoqda...' : 'Vazifani To\'xtatish'}
                </Button>
              </Stack>

              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                {jobStatus.message || 'Yozuvlar qayta ishlanmoqda...'}
              </Typography>

              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, jobStatus.progress || 0))}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: theme.palette.success.main
                      }
                    }}
                  />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, minWidth: 45, textAlign: 'right' }}>
                  {jobStatus.progress || 0}%
                </Typography>
              </Stack>

              {jobStatus.current !== undefined && jobStatus.total !== undefined && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.8, color: 'text.secondary', fontWeight: 600 }}>
                  Jarayon: {jobStatus.current.toLocaleString()} / {jobStatus.total.toLocaleString()} ta yozuv
                </Typography>
              )}
            </Paper>
          )}

          {/* Konfiguratsiya parametrlari */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
              Vazifa Parametrlari
            </Typography>

            <Grid container spacing={2}>
              {/* 1. Ro'yxat tanlash */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small" disabled={Boolean(listId) || isBusy}>
                  <InputLabel id="registry-select-label">Tashqi Ro'yxat</InputLabel>
                  <Select
                    labelId="registry-select-label"
                    label="Tashqi Ro'yxat"
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                  >
                    <MenuItem value="all">Barcha Ro'yxatlar (Global)</MenuItem>
                    {listName && <MenuItem value={listId}>{listName}</MenuItem>}
                    {registries.map((r) => (
                      <MenuItem key={r._id} value={r._id}>
                        {r.name} ({r.totalRecords || 0} ta)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* 2. Mahalla bo'yicha filter */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small" disabled={isBusy}>
                  <InputLabel id="mahalla-select-label">Mahalla (Ixtiyoriy)</InputLabel>
                  <Select
                    labelId="mahalla-select-label"
                    label="Mahalla (Ixtiyoriy)"
                    value={selectedMahallaId}
                    onChange={(e) => setSelectedMahallaId(e.target.value as number | '')}
                  >
                    <MenuItem value="">Barcha Mahallalar</MenuItem>
                    {mahallas.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name || m.mfyPrimaryName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* 3. Cheklov (Limit) */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Maksimal Yozuvlar Soni (Limit)"
                  type="number"
                  fullWidth
                  size="small"
                  disabled={isBusy}
                  value={limit}
                  onChange={(e) => setLimit(Math.max(1, Number(e.target.value) || 100))}
                  helperText="Bir vaqtning o'zida ko'p server zo'riqmasligi uchun (Maks. 20,000)"
                  slotProps={{
                    input: {
                      endAdornment: <SpeedRounded sx={{ color: 'text.secondary', fontSize: 18 }} />
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Qoidalar va Ish Prinsiplari izohi */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              Aqlli Arxitektura va Qoidalar:
            </Typography>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    bgcolor: isDark ? alpha('#FFFFFF', 0.03) : alpha('#000000', 0.02)
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <ApartmentOutlined sx={{ color: theme.palette.primary.main, fontSize: 20, mt: 0.2 }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block' }}>
                        Ko'p Qavatli vs Yakka Uy
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                        8 qismli Kadastr raqami, manzil ichidagi harf, korpus va xonadon raqamlari aniq ajratib olinadi.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    bgcolor: isDark ? alpha('#FFFFFF', 0.03) : alpha('#000000', 0.02)
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, fontSize: 20, mt: 0.2 }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block' }}>
                        0 Kishi va Oila A'zolari
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                        Propiskada hech kim bo'lmasa, qat'iy 0 kishi (bo'sh turar joy) sifatida TozaMakonga saqlanadi.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Alert severity="info" icon={<InfoOutlined />} sx={{ borderRadius: 2 }}>
            Ushbu vazifa serverda <strong>Slot 1 (Og'ir debitor / batch jarayonlar)</strong> navbatida orqa fonda
            bajariladi. Jarayon holatini ekranning pastki burchagidagi ko'chma monitorda yoki shu oynada jonli kuzatishingiz mumkin.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
          Yopish
        </Button>

        {isBusy ? (
          <Button
            variant="contained"
            color="error"
            startIcon={<StopRounded />}
            onClick={handleStop}
            disabled={stopLoading}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            {stopLoading ? 'To\'xtatilmoqda...' : 'Jobni To\'xtatish'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowRounded />}
            onClick={handleStart}
            disabled={loading}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              boxShadow: `0 4px 14px ${alpha(theme.palette.success.main, 0.4)}`
            }}
          >
            {loading ? 'Ishga tushirilmoqda...' : 'Hisob Ochish Jobini Boshlash'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
