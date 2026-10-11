import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Button,
  Divider,
  useMediaQuery,
  alpha
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  IconSearch,
  IconRefresh,
  IconEye,
  IconCheck,
  IconX,
  IconClock,
  IconBolt as IconFast,
  IconCopy,
  IconBolt,
  IconMapPin,
  IconAlertTriangle,
  IconCalendar,
  IconUser
} from '@tabler/icons-react';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { ElectricCodeModal, IEtkRequestItem } from './ElectricCodeModal';
import { RejectReasonDialog } from './RejectReasonDialog';

interface IStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const ElectricCodeVerification: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  const [items, setItems] = useState<IEtkRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<IStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // Filter & Pagination States
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modal & Queue States
  const [selectedItem, setSelectedItem] = useState<IEtkRequestItem | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [rowActionLoading, setRowActionLoading] = useState<string | null>(null);

  // Jadvaldan to'g'ridan-to'g'ri rad etish dialogi
  const [rowRejectItem, setRowRejectItem] = useState<IEtkRequestItem | null>(null);
  const [rowRejectDialogOpen, setRowRejectDialogOpen] = useState<boolean>(false);

  // Tezkor navbat (Queue)
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  // Kutilayotgan so'rovlar navbati
  const pendingQueue = useMemo(() => {
    return items.filter((item) => item.status === 'yangi');
  }, [items]);

  // Ma'lumotlarni yuklash
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/etk-requests', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          status: statusTab,
          search: search.trim()
        }
      });
      const data = res.data;
      if (data.ok || data.success) {
        setItems(data.items || data.data || []);
        setTotalCount(data.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Elektr kodi so'rovlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusTab, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Bitta elementni ko'rish (Batafsil / Modal)
  const handleOpenReview = async (item: IEtkRequestItem) => {
    const pIndex = pendingQueue.findIndex((q) => q._id === item._id);
    setQueueIndex(pIndex >= 0 ? pIndex : 0);
    setSelectedItem(item);
    setModalOpen(true);

    try {
      const res = await api.get(`/etk-requests/${item._id}`);
      if (res.data?.ok && res.data?.data) {
        setSelectedItem(res.data.data);
      }
    } catch (e) {}
  };

  // Tezkor ko'rib chiqish (Navbatni boshidan boshlash)
  const handleStartFastQueue = async () => {
    if (pendingQueue.length === 0) {
      toast.info("Ko'rib chiqilmagan so'rovlar mavjud emas");
      return;
    }
    setQueueIndex(0);
    const firstItem = pendingQueue[0];
    setSelectedItem(firstItem);
    setModalOpen(true);

    try {
      const res = await api.get(`/etk-requests/${firstItem._id}`);
      if (res.data?.ok && res.data?.data) {
        setSelectedItem(res.data.data);
      }
    } catch (e) {}
  };

  // Navbatda keyingi so'rovga o'tish
  const handleNextInQueue = async () => {
    const nextIdx = queueIndex + 1;
    if (nextIdx < pendingQueue.length) {
      setQueueIndex(nextIdx);
      const nextItem = pendingQueue[nextIdx];
      setSelectedItem(nextItem);
      try {
        const res = await api.get(`/etk-requests/${nextItem._id}`);
        if (res.data?.ok && res.data?.data) {
          setSelectedItem(res.data.data);
        }
      } catch (e) {}
    } else {
      toast.success("Barcha kutilayotgan so'rovlar ko'rib chiqildi! 🎉");
      setModalOpen(false);
    }
  };

  // Navbatda oldingi so'rovga o'tish
  const handlePrevInQueue = async () => {
    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0 && prevIdx < pendingQueue.length) {
      setQueueIndex(prevIdx);
      const prevItem = pendingQueue[prevIdx];
      setSelectedItem(prevItem);
      try {
        const res = await api.get(`/etk-requests/${prevItem._id}`);
        if (res.data?.ok && res.data?.data) {
          setSelectedItem(res.data.data);
        }
      } catch (e) {}
    }
  };

  // Tasdiqlash (Modal ichidan)
  const handleApprove = async (id: string): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await api.post(`/etk-requests/approve/${id}`, {}, { headers: { 'hide-error': true } });
      if (res.data?.ok || res.data?.success) {
        toast.success(res.data?.message || 'Elektr kodi muvaffaqiyatli tasdiqlandi');
        fetchData();
        return true;
      } else {
        toast.error(res.data?.message || 'Xatolik yuz berdi');
        return false;
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Tasdiqlashda xatolik yuz berdi');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // To'g'ridan-to'g'ri jadvaldan tasdiqlash
  const handleQuickApprove = async (item: IEtkRequestItem) => {
    setRowActionLoading(item._id);
    try {
      const res = await api.post(`/etk-requests/approve/${item._id}`, {}, { headers: { 'hide-error': true } });
      if (res.data?.ok || res.data?.success) {
        toast.success(`${item.licshet} abonentining elektr kodi tasdiqlandi`);
        fetchData();
      } else {
        toast.error(res.data?.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Tasdiqlashda xatolik yuz berdi');
    } finally {
      setRowActionLoading(null);
    }
  };

  // Rad etish (Sabab dialogini ochish)
  const handleOpenRejectDialog = (item: IEtkRequestItem) => {
    setRowRejectItem(item);
    setRowRejectDialogOpen(true);
  };

  // Rad etishni yuborish
  const handleConfirmReject = async (reason: string) => {
    if (!rowRejectItem) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/etk-requests/reject/${rowRejectItem._id}`, { reason }, { headers: { 'hide-error': true } });
      if (res.data?.ok || res.data?.success) {
        toast.info("Elektr kodi so'rovi bekor qilindi");
        setRowRejectDialogOpen(false);
        setRowRejectItem(null);
        if (modalOpen && selectedItem?._id === rowRejectItem._id) {
          if (autoAdvance && pendingQueue.length > 1) {
            handleNextInQueue();
          } else {
            setModalOpen(false);
          }
        }
        fetchData();
      } else {
        toast.error(res.data?.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Bekor qilishda xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text?: string, label?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.info(`${label || 'Matn'} nusxalandi: ${text}`);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, width: '100%', pb: 10 }}>
      {/* 1. Yuqori Header */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: { xs: 1.5, sm: 2.5 }
        }}
      >
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              fontSize: { xs: '1.25rem', sm: '1.65rem' }
            }}
          >
            Elektr kodi (ETK) tasdiqlash
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' }, mt: 0.2 }}>
            Nazoratchilar kiritgan HET elektr hisob raqamlari ma'lumotlarini tekshirish, tasdiqlash va bekor qilish
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<IconRefresh size={16} />}
            onClick={() => fetchData()}
            disabled={loading}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, py: 0.6 }}
          >
            Yangilash
          </Button>

          {stats.pending > 0 && (
            <Button
              variant="contained"
              color="warning"
              size="small"
              startIcon={<IconFast size={16} />}
              onClick={handleStartFastQueue}
              sx={{
                fontWeight: 800,
                borderRadius: '10px',
                textTransform: 'none',
                py: 0.6,
                px: { xs: 1.2, sm: 2 },
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                bgcolor: '#d97706',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
                '&:hover': { bgcolor: '#b45309' },
                whiteSpace: 'nowrap'
              }}
            >
              Tezkor ko'rib chiqish ({stats.pending})
            </Button>
          )}
        </Stack>
      </Stack>

      {/* 2. Statistik Kartalar (KPIs - Mobilda 2x2 ixcham ko'rinish) */}
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: { xs: 1.5, sm: 2.5 } }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            onClick={() => {
              setStatusTab('all');
              setPage(0);
            }}
            sx={{
              p: { xs: 1, sm: 1.5 },
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: statusTab === 'all' ? 'primary.main' : 'divider',
              boxShadow: statusTab === 'all' ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.15)}` : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Jami so'rovlar
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.3, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
                  {stats.total.toLocaleString()} ta
                </Typography>
              </Box>
              <Box
                sx={{
                  p: { xs: 0.5, sm: 0.8 },
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex'
                }}
              >
                <IconBolt size={20} />
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            onClick={() => {
              setStatusTab('pending');
              setPage(0);
            }}
            sx={{
              p: { xs: 1, sm: 1.5 },
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: statusTab === 'pending' ? 'warning.main' : 'divider',
              boxShadow: statusTab === 'pending' ? `0 6px 20px ${alpha(theme.palette.warning.main, 0.2)}` : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Kutilmoqda
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'warning.main', mt: 0.3, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
                  {stats.pending.toLocaleString()} ta
                </Typography>
              </Box>
              <Box
                sx={{
                  p: { xs: 0.5, sm: 0.8 },
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.warning.main, 0.12),
                  color: 'warning.main',
                  display: 'flex'
                }}
              >
                <IconClock size={20} />
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            onClick={() => {
              setStatusTab('approved');
              setPage(0);
            }}
            sx={{
              p: { xs: 1, sm: 1.5 },
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: statusTab === 'approved' ? 'success.main' : 'divider',
              boxShadow: statusTab === 'approved' ? `0 6px 20px ${alpha(theme.palette.success.main, 0.15)}` : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Tasdiqlangan
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main', mt: 0.3, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
                  {stats.approved.toLocaleString()} ta
                </Typography>
              </Box>
              <Box
                sx={{
                  p: { xs: 0.5, sm: 0.8 },
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  color: 'success.main',
                  display: 'flex'
                }}
              >
                <IconCheck size={20} />
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            onClick={() => {
              setStatusTab('rejected');
              setPage(0);
            }}
            sx={{
              p: { xs: 1, sm: 1.5 },
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: statusTab === 'rejected' ? 'error.main' : 'divider',
              boxShadow: statusTab === 'rejected' ? `0 6px 20px ${alpha(theme.palette.error.main, 0.15)}` : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Bekor qilingan
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'error.main', mt: 0.3, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
                  {stats.rejected.toLocaleString()} ta
                </Typography>
              </Box>
              <Box
                sx={{
                  p: { xs: 0.5, sm: 0.8 },
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.error.main, 0.12),
                  color: 'error.main',
                  display: 'flex'
                }}
              >
                <IconX size={20} />
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Asosiy Blok: Filtrlash va Ro'yxat */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        {/* Qidiruv va Tablar */}
        <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
          >
            {/* Status Tablar */}
            <Tabs
              value={statusTab}
              onChange={(_, val) => {
                setStatusTab(val);
                setPage(0);
              }}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 'auto',
                '& .MuiTabs-scrollButtons': { width: { xs: 24, sm: 36 } },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: { xs: '0.8rem', sm: '0.88rem' },
                  minHeight: 38,
                  minWidth: 'auto',
                  px: { xs: 1.2, sm: 1.8 },
                  py: 0.5,
                  whiteSpace: 'nowrap'
                }
              }}
            >
              <Tab label={`Barchasi (${stats.total})`} value="all" />
              <Tab
                label={
                  <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                    <span>Kutilmoqda</span>
                    {stats.pending > 0 && (
                      <Chip
                        label={stats.pending}
                        size="small"
                        color="warning"
                        sx={{ height: 18, fontSize: '0.7rem', fontWeight: 800 }}
                      />
                    )}
                  </Stack>
                }
                value="pending"
              />
              <Tab label={`Tasdiqlangan (${stats.approved})`} value="approved" />
              <Tab label={`Bekor qilingan (${stats.rejected})`} value="rejected" />
            </Tabs>

            {/* Qidiruv */}
            <Box sx={{ width: { xs: '100%', md: 360 } }}>
              <TextField
                placeholder="Licshet, ETK, FIO yoki nazoratchi..."
                size="small"
                fullWidth
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearch(searchInput);
                    setPage(0);
                  }
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={18} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                    endAdornment: searchInput ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSearchInput('');
                            setSearch('');
                            setPage(0);
                          }}
                        >
                          <IconX size={16} />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }
                }}
              />
            </Box>
          </Stack>
        </Box>

        {/* 📱 4. MOBIL KARTALAR KO'RINISHI (Kichik ekranlar uchun) */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, p: 1.5 }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} variant="rectangular" height={140} sx={{ borderRadius: '14px', mb: 1.5 }} />
            ))
          ) : items.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              <IconBolt size={48} color={theme.palette.text.secondary} />
              <Typography variant="body1" sx={{ fontWeight: 700, mt: 1 }}>
                Elektr kodi so'rovlari topilmadi
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {items.map((row) => {
                const isPending = row.status === 'yangi';
                const isApproved = row.status === 'tasdiqlandi';
                const isRejected = row.status === 'bekor_qilindi';
                const billingFio = row.billingdaFIO || row.abonent?.fio || '-';
                const hetFio = row.fio || '-';
                const isFioDiff =
                  billingFio !== '-' &&
                  hetFio !== '-' &&
                  billingFio.toLowerCase().replace(/\s+/g, '') !== hetFio.toLowerCase().replace(/\s+/g, '');

                return (
                  <Card
                    key={row._id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none'
                    }}
                  >
                    {/* Top Row: Licshet + Status */}
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                      <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                          {row.licshet}
                        </Typography>
                        <Tooltip title="Hisob raqamni nusxalash">
                          <IconButton size="small" onClick={() => copyToClipboard(row.licshet, 'Hisob raqami')} sx={{ p: 0.3 }}>
                            <IconCopy size={14} />
                          </IconButton>
                        </Tooltip>
                      </Stack>

                      {isApproved ? (
                        <Chip label="Tasdiqlangan" color="success" size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                      ) : isRejected ? (
                        <Chip label="Bekor qilingan" color="error" size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                      ) : (
                        <Chip
                          label="Kutilmoqda"
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Stack>

                    <Divider sx={{ my: 0.8 }} />

                    {/* ETK & HET Holati */}
                    <Box sx={{ mb: 1, p: 1, borderRadius: '10px', bgcolor: alpha(theme.palette.warning.main, 0.08), border: '1px solid', borderColor: alpha(theme.palette.warning.main, 0.25) }}>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', display: 'block' }}>
                            Elektr kodi (ETK):
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'warning.main', fontSize: '1rem', letterSpacing: 0.5 }}>
                              {row.etk_kod}
                            </Typography>
                            <IconButton size="small" onClick={() => copyToClipboard(row.etk_kod, 'Elektr kodi')} sx={{ p: 0.3 }}>
                              <IconCopy size={14} />
                            </IconButton>
                          </Stack>
                        </Box>

                        <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
                          <Chip
                            label={`SaOTo: ${row.etk_saoto}`}
                            size="small"
                            sx={{ fontWeight: 700, height: 20, fontSize: '0.68rem', bgcolor: alpha(theme.palette.text.primary, 0.06) }}
                          />
                          {row.hetBlockingStatus && (
                            <Chip
                              label={row.hetBlockingStatus === 'BLOCK' ? '🚫 Cheklangan' : '✅ Cheklov yo‘q'}
                              size="small"
                              color={row.hetBlockingStatus === 'BLOCK' ? 'error' : 'success'}
                              sx={{ fontWeight: 800, height: 18, fontSize: '0.65rem' }}
                            />
                          )}
                        </Stack>
                      </Stack>
                    </Box>

                    {/* FIO Taqqoslash */}
                    <Box sx={{ mb: 0.8 }}>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem' }}>
                          Abonent F.I.SH:
                        </Typography>
                        {isFioDiff && (
                          <Chip
                            label="F.I.SH farqli"
                            color="warning"
                            size="small"
                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.88rem' }}>
                        Billing: <b>{billingFio}</b>
                      </Typography>
                      {row.fio && (
                        <Typography variant="body2" sx={{ fontWeight: 700, color: isFioDiff ? 'warning.main' : 'text.secondary', fontSize: '0.82rem', mt: 0.2 }}>
                          HET: {row.fio}
                        </Typography>
                      )}
                    </Box>

                    {/* Manzil & Nazoratchi */}
                    <Box sx={{ mb: 1, p: 0.8, borderRadius: '8px', bgcolor: alpha(theme.palette.text.primary, 0.03) }}>
                      {row.address && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.3 }}>
                          📍 {row.address}
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block' }}>
                        Nazoratchi: <b>{row.inspector_name || `ID: ${row.inspector_id}`}</b> •{' '}
                        {row.createdAt || row.update_at ? new Date(row.createdAt || row.update_at!).toLocaleDateString('uz-UZ') : ''}
                      </Typography>
                    </Box>

                    {/* Takroriy biriktirilganlik ogohlantirishi */}
                    {row.existingAbonents && row.existingAbonents.length > 0 && (
                      <Box sx={{ mb: 1, p: 0.8, borderRadius: '8px', bgcolor: alpha(theme.palette.error.main, 0.08), border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.2) }}>
                        <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700, fontSize: '0.7rem' }}>
                          ⚠️ Boshqa abonentga ham biriktirilgan: {row.existingAbonents.join(', ')}
                        </Typography>
                      </Box>
                    )}

                    {/* Tugmalar */}
                    {isPending ? (
                      <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<IconCheck size={16} />}
                          onClick={() => handleQuickApprove(row)}
                          disabled={rowActionLoading === row._id}
                          sx={{
                            borderRadius: '10px',
                            fontWeight: 800,
                            textTransform: 'none',
                            bgcolor: '#16a34a',
                            py: 0.7,
                            fontSize: '0.82rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Tasdiqlash
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleOpenRejectDialog(row)}
                          disabled={rowActionLoading === row._id}
                          sx={{ borderRadius: '10px', minWidth: 40, p: 0.7 }}
                        >
                          <IconX size={17} />
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleOpenReview(row)}
                          sx={{ borderRadius: '10px', minWidth: 40, p: 0.7 }}
                        >
                          <IconEye size={17} />
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        color="inherit"
                        startIcon={<IconEye size={16} />}
                        onClick={() => handleOpenReview(row)}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, py: 0.6 }}
                      >
                        Batafsil ko'rish
                      </Button>
                    )}
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* 💻 5. DESKTOP JADVAL KO'RINISHI */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ display: { xs: 'none', md: 'block' }, bgcolor: 'transparent' }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.5) : '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 1.8 }}>Chiqindi L/H</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 1.8 }}>Abonent (Billing vs HET)</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 1.8 }}>Elektr kodi (ETK) & Hudud</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 1.8 }}>HET Holati</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 1.8 }}>Nazoratchi</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 1.8 }}>Sana</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 1.8 }}>Holat</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', py: 1.8 }}>
                  Amallar
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from(new Array(5)).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton variant="text" width={80} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={160} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={120} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={100} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={110} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={90} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="rounded" width={80} height={24} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="rounded" width={100} height={32} sx={{ ml: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                      }}
                    >
                      <IconBolt size={48} color={theme.palette.text.secondary} />
                      <Typography variant="h4" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        So'rovlar topilmadi
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Filtrlarni o'zgartirib ko'ring yoki keyinroq qayta tekshiring
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => {
                  const isPending = row.status === 'yangi';
                  const isApproved = row.status === 'tasdiqlandi';
                  const isRejected = row.status === 'bekor_qilindi';

                  return (
                    <TableRow
                      key={row._id}
                      hover
                      sx={{
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                        transition: 'background-color 0.15s'
                      }}
                    >
                      {/* Chiqindi L/H */}
                      <TableCell>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {row.licshet}
                          </Typography>
                          <Tooltip title="Nusxalash">
                            <IconButton size="small" onClick={() => copyToClipboard(row.licshet, 'Hisob raqami')} sx={{ p: 0.3 }}>
                              <IconCopy size={14} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>

                      {/* Abonent FIO */}
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {row.billingdaFIO || "Billing FIO yo'q"}
                          </Typography>
                          {row.fio && row.fio !== row.billingdaFIO && (
                            <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 600, display: 'block' }}>
                              HET: {row.fio}
                            </Typography>
                          )}
                          {row.address && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                display: 'block',
                                maxWidth: 220,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {row.address}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* Elektr kodi (ETK) */}
                      <TableCell>
                        <Box>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'warning.main' }}>
                              {row.etk_kod}
                            </Typography>
                            <Tooltip title="ETK nusxalash">
                              <IconButton size="small" onClick={() => copyToClipboard(row.etk_kod, 'Elektr kodi')} sx={{ p: 0.3 }}>
                                <IconCopy size={14} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            SaOTo: {row.etk_saoto}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* HET Blok Holati */}
                      <TableCell>
                        {row.hetBlockingStatus ? (
                          <Chip
                            label={row.hetBlockingStatus === 'BLOCK' ? 'Cheklangan' : 'Cheklov yo‘q'}
                            size="small"
                            color={row.hetBlockingStatus === 'BLOCK' ? 'error' : 'success'}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            -
                          </Typography>
                        )}
                      </TableCell>

                      {/* Nazoratchi */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {row.inspector_name || `ID: ${row.inspector_id}`}
                        </Typography>
                      </TableCell>

                      {/* Sana */}
                      <TableCell>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {row.createdAt || row.update_at ? new Date(row.createdAt || row.update_at!).toLocaleDateString('uz-UZ') : '-'}
                        </Typography>
                      </TableCell>

                      {/* Holati */}
                      <TableCell>
                        {isPending && (
                          <Chip label="Kutilmoqda" color="warning" size="small" icon={<IconClock size={14} />} sx={{ fontWeight: 700 }} />
                        )}
                        {isApproved && (
                          <Chip label="Tasdiqlangan" color="success" size="small" icon={<IconCheck size={14} />} sx={{ fontWeight: 700 }} />
                        )}
                        {isRejected && (
                          <Chip label="Bekor qilingan" color="error" size="small" icon={<IconX size={14} />} sx={{ fontWeight: 700 }} />
                        )}
                      </TableCell>

                      {/* Amallar */}
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                          {isPending && (
                            <>
                              <Tooltip title="Tasdiqlash">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleQuickApprove(row)}
                                  disabled={rowActionLoading === row._id}
                                  sx={{
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                                  }}
                                >
                                  <IconCheck size={18} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Rad etish">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenRejectDialog(row)}
                                  disabled={rowActionLoading === row._id}
                                  sx={{
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                                  }}
                                >
                                  <IconX size={18} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          <Tooltip title="Ko'rib chiqish / Tafsilotlar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenReview(row)}
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                              }}
                            >
                              <IconEye size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 6. Paginatsiya (Mobil va Desktop uchun umumiy) */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Qatorlar soni:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count !== -1 ? count : `${to} dan ko'p`}`}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>

      {/* Tafsilot & Taqqoslash Modali */}
      <ElectricCodeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedItem}
        onApprove={handleApprove}
        onRejectClick={handleOpenRejectDialog}
        loading={actionLoading}
        queueIndex={queueIndex}
        queueLength={pendingQueue.length}
        onNext={handleNextInQueue}
        onPrev={handlePrevInQueue}
        autoAdvance={autoAdvance}
        onToggleAutoAdvance={setAutoAdvance}
      />

      {/* Bekor qilish sababi dialogi */}
      <RejectReasonDialog
        open={rowRejectDialogOpen}
        onClose={() => {
          setRowRejectDialogOpen(false);
          setRowRejectItem(null);
        }}
        onConfirm={handleConfirmReject}
        loading={actionLoading}
      />
    </Box>
  );
};

export default ElectricCodeVerification;
