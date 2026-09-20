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
  Avatar
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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
  IconUser,
  IconUsers,
  IconMapPin,
  IconArrowsExchange,
  IconPlus,
  IconPrinter,
  IconUpload,
  IconFileText
} from '@tabler/icons-react';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { INewAbonentItem, IStats, IApprovePayload } from './types';
import { NewAbonentModal } from './NewAbonentModal';
import { RejectReasonDialog } from './RejectReasonDialog';
import { RokirovkaModal } from './RokirovkaModal';
import { CreateManualAbonentModal } from './CreateManualAbonentModal';
import { PrintNewAbonentDialog } from './PrintNewAbonentDialog';
import { ImportScannedAbonentModal } from './ImportScannedAbonentModal';

export const PendingNewAbonents: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [items, setItems] = useState<INewAbonentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<IStats>({ total: 0, pending: 0, document_created: 0, approved: 0, rejected: 0 });

  // Filter & Pagination States
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'document_created' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modal & Queue States
  const [selectedItem, setSelectedItem] = useState<INewAbonentItem | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [createManualOpen, setCreateManualOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [rowActionLoading, setRowActionLoading] = useState<string | null>(null);

  // Hujjat chiqarish va Skaner yuklash
  const [printItem, setPrintItem] = useState<INewAbonentItem | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState<boolean>(false);
  const [importScannedModalOpen, setImportScannedModalOpen] = useState<boolean>(false);

  const handleOpenPrint = (item: INewAbonentItem) => {
    setPrintItem(item);
    setPrintDialogOpen(true);
  };

  // Jadvaldan to'g'ridan-to'g'ri rad etish dialogi
  const [rowRejectItem, setRowRejectItem] = useState<INewAbonentItem | null>(null);
  const [rowRejectDialogOpen, setRowRejectDialogOpen] = useState<boolean>(false);

  // Rokirovka modali
  const [rokirovkaItem, setRokirovkaItem] = useState<INewAbonentItem | null>(null);
  const [rokirovkaModalOpen, setRokirovkaModalOpen] = useState<boolean>(false);

  // Tezkor navbat (Queue)
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  // Kutilayotgan so'rovlar navbati (pending yoki document_created)
  const pendingQueue = useMemo(() => {
    return items.filter((item) => item.status === 'pending' || item.status === 'document_created');
  }, [items]);

  // Ma'lumotlarni yuklash
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/pendingNewAbonents', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          status: statusTab,
          search: search.trim()
        }
      });
      const data = res.data;
      if (data.ok || data.success) {
        setItems(data.items || data.pendingNewAbonents || []);
        setTotalCount(data.total || data.count || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Yangi abonentlar ro'yxatini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusTab, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Bitta elementni ko'rish (Batafsil / Modal)
  const handleOpenReview = async (item: INewAbonentItem) => {
    const pIndex = pendingQueue.findIndex((q) => q._id === item._id);
    setQueueIndex(pIndex >= 0 ? pIndex : 0);
    setSelectedItem(item);
    setModalOpen(true);

    try {
      const res = await api.get(`/pendingNewAbonents/get-by-id/${item._id}`);
      if (res.data?.ok && res.data?.data) {
        setSelectedItem(res.data.data);
      }
    } catch (e) {}
  };

  // Tezkor ko'rib chiqish (Navbatni boshidan boshlash)
  const handleStartFastQueue = async () => {
    if (pendingQueue.length === 0) {
      toast.info('Hozirda kutilayotgan so‘rovlar mavjud emas');
      return;
    }
    setQueueIndex(0);
    setSelectedItem(pendingQueue[0]);
    setModalOpen(true);
    try {
      const res = await api.get(`/pendingNewAbonents/get-by-id/${pendingQueue[0]._id}`);
      if (res.data?.ok && res.data?.data) {
        setSelectedItem(res.data.data);
      }
    } catch (e) {}
  };

  const handleNextInQueue = () => {
    if (queueIndex < pendingQueue.length - 1) {
      const nextIdx = queueIndex + 1;
      setQueueIndex(nextIdx);
      setSelectedItem(pendingQueue[nextIdx]);
    } else {
      toast.success('Barcha kutilayotgan so‘rovlar ko‘rib chiqildi!');
      setModalOpen(false);
    }
  };

  const handlePrevInQueue = () => {
    if (queueIndex > 0) {
      const prevIdx = queueIndex - 1;
      setQueueIndex(prevIdx);
      setSelectedItem(pendingQueue[prevIdx]);
    }
  };

  // Tasdiqlash funksiyasi
  const handleApprove = async (id: string, payload?: IApprovePayload): Promise<boolean> => {
    setRowActionLoading(id);
    setActionLoading(true);
    try {
      const res = await api.post(`/pendingNewAbonents/accept/${id}`, payload || {});
      if (res.data?.ok) {
        toast.success(res.data.message || `Abonent muvaffaqiyatli ochildi! Hisob raqami: ${res.data.accountNumber || ''}`);

        // Modal ochiq bo'lsa va avto-o'tish yoqilgan bo'lsa, keyingi elementga o'tish
        if (modalOpen && autoAdvance) {
          if (queueIndex < pendingQueue.length - 1) {
            handleNextInQueue();
          } else {
            setModalOpen(false);
          }
        } else if (modalOpen) {
          setModalOpen(false);
        }

        fetchData();
        return true;
      } else {
        toast.error(res.data?.message || 'Tasdiqlashda xatolik yuz berdi');
        return false;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Tasdiqlashda xatolik yuz berdi');
      return false;
    } finally {
      setActionLoading(false);
      setRowActionLoading(null);
    }
  };

  // Rad etish modalini ochish
  const handleOpenRowReject = (item: INewAbonentItem) => {
    setRowRejectItem(item);
    setRowRejectDialogOpen(true);
  };

  const handleRejectFromModal = (item: INewAbonentItem) => {
    setRowRejectItem(item);
    setRowRejectDialogOpen(true);
  };

  // Rad etishni tasdiqlash
  const handleConfirmReject = async (reason: string) => {
    if (!rowRejectItem) return;
    setRowActionLoading(rowRejectItem._id);
    setActionLoading(true);
    try {
      const res = await api.post(`/pendingNewAbonents/cancel/${rowRejectItem._id}`, { reason });
      if (res.data?.ok) {
        toast.success(res.data.message || 'So‘rov muvaffaqiyatli rad etildi');
        setRowRejectDialogOpen(false);
        setRowRejectItem(null);

        // Agar modal ochiq bo'lsa va auto-advance bo'lsa
        if (modalOpen && autoAdvance) {
          if (queueIndex < pendingQueue.length - 1) {
            handleNextInQueue();
          } else {
            setModalOpen(false);
          }
        } else if (modalOpen) {
          setModalOpen(false);
        }

        fetchData();
      } else {
        toast.error(res.data?.message || 'Rad etishda xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Rad etishda xatolik yuz berdi');
    } finally {
      setActionLoading(false);
      setRowActionLoading(null);
    }
  };

  // Rokirovka modali
  const handleOpenRokirovka = (item: INewAbonentItem) => {
    setRokirovkaItem(item);
    setRokirovkaModalOpen(true);
  };

  // Qidiruvni amalga oshirish
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const copyToClipboard = (text?: string, label?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.info(`${label || 'Matn'} nusxalandi: ${text}`);
  };

  const getFullName = (item: INewAbonentItem) => {
    return (
      item.abonent_name ||
      `${item.citizen?.lastName || ''} ${item.citizen?.firstName || ''} ${item.citizen?.patronymic || ''}`.trim() ||
      'Noma’lum fuqaro'
    );
  };

  return (
    <Box sx={{ width: '100%', pb: 4 }}>
      {/* 1. Header & Title */}
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Yangi Abonentlarni Tasdiqlash
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Nazoratchilar bot orqali kiritgan yangi abonent ochish arizalarini ko'rib chiqish va TozaMakon billingiga kiritish
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<IconRefresh size={18} />}
            onClick={() => fetchData()}
            disabled={loading}
            sx={{
              fontWeight: 600,
              bgcolor: 'background.paper',
              borderColor: theme.palette.divider,
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: theme.palette.divider
              }
            }}
          >
            Yangilash
          </Button>

          <Button
            variant="contained"
            color="info"
            startIcon={<IconUpload size={18} />}
            onClick={() => setImportScannedModalOpen(true)}
            sx={{
              fontWeight: 700,
              px: 2.5,
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)'
            }}
          >
            Skaner yuklash
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={<IconPlus size={18} />}
            onClick={() => setCreateManualOpen(true)}
            sx={{
              fontWeight: 700,
              px: 2.5,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
            }}
          >
            Yangi abonent ochish
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<IconFast size={18} />}
            onClick={handleStartFastQueue}
            disabled={loading || pendingQueue.length === 0}
            sx={{
              fontWeight: 700,
              px: 2.5,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
            }}
          >
            Tezkor ko'rib chiqish ({stats.pending})
          </Button>
        </Stack>
      </Stack>

      {/* 2. KPI Statistik Kartalar */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Jami so'rovlar */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: theme.palette.divider,
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                JAMI SO'ROVLAR
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, color: 'text.primary' }}>
                {loading ? <Skeleton width={60} /> : stats.total}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                Barcha arizalar
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: isDark ? alpha(theme.palette.primary.main, 0.2) : '#eff6ff',
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconUser size={26} />
            </Box>
          </Card>
        </Grid>

        {/* Kutilayotgan */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: isDark ? alpha(theme.palette.warning.main, 0.3) : '#fed7aa',
              bgcolor: isDark ? alpha(theme.palette.warning.main, 0.12) : '#fffaf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
                KUTILAYOTGAN
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.warning.main }}>
                {loading ? <Skeleton width={60} /> : stats.pending}
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? theme.palette.warning.light : '#c2410c', mt: 0.5, display: 'block' }}>
                Tasdiqlash navbatida
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: isDark ? alpha(theme.palette.warning.main, 0.25) : '#ffedd5',
                color: theme.palette.warning.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconClock size={26} />
            </Box>
          </Card>
        </Grid>

        {/* Hujjat chiqarilgan */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: isDark ? alpha(theme.palette.info.main, 0.3) : '#bae6fd',
              bgcolor: isDark ? alpha(theme.palette.info.main, 0.12) : '#f0f9ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.info.main, fontWeight: 700 }}>
                HUJJAT CHIQARILGAN
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.info.main }}>
                {loading ? <Skeleton width={60} /> : (stats.document_created || 0)}
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? theme.palette.info.light : '#0284c7', mt: 0.5, display: 'block' }}>
                Skaner kutilmoqda
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: isDark ? alpha(theme.palette.info.main, 0.25) : '#e0f2fe',
                color: theme.palette.info.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconFileText size={26} />
            </Box>
          </Card>
        </Grid>

        {/* Tasdiqlangan */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: isDark ? alpha(theme.palette.success.main, 0.3) : '#bbf7d0',
              bgcolor: isDark ? alpha(theme.palette.success.main, 0.12) : '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                TASDIQLANGAN
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.success.main }}>
                {loading ? <Skeleton width={60} /> : stats.approved}
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? theme.palette.success.light : '#166534', mt: 0.5, display: 'block' }}>
                Abonent ochilgan
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: isDark ? alpha(theme.palette.success.main, 0.25) : '#dcfce7',
                color: theme.palette.success.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconCheck size={26} />
            </Box>
          </Card>
        </Grid>

        {/* Bekor qilingan */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: isDark ? alpha(theme.palette.error.main, 0.3) : '#fecaca',
              bgcolor: isDark ? alpha(theme.palette.error.main, 0.12) : '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.error.main, fontWeight: 700 }}>
                BEKOR QILINGAN
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.error.main }}>
                {loading ? <Skeleton width={60} /> : stats.rejected}
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? theme.palette.error.light : '#991b1b', mt: 0.5, display: 'block' }}>
                Rad etilgan so'rovlar
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: isDark ? alpha(theme.palette.error.main, 0.25) : '#fee2e2',
                color: theme.palette.error.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconX size={26} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Filter Bar & Tabs */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid',
          borderColor: theme.palette.divider,
          bgcolor: 'background.paper',
          overflow: 'hidden',
          mb: 3
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            p: 2,
            gap: 2,
            borderBottom: '1px solid',
            borderBottomColor: theme.palette.divider
          }}
        >
          {/* Tabs */}
          <Tabs
            value={statusTab}
            onChange={(_, val) => {
              setStatusTab(val);
              setPage(0);
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.875rem'
              }
            }}
          >
            <Tab
              value="pending"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <span>Kutilayotgan</span>
                  <Chip
                    label={stats.pending}
                    size="small"
                    color="warning"
                    variant="filled"
                    sx={{ height: 20, fontSize: '0.75rem', fontWeight: 800 }}
                  />
                </Stack>
              }
            />
            <Tab
              value="document_created"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <span>Hujjat chiqarilgan</span>
                  <Chip
                    label={stats.document_created || 0}
                    size="small"
                    color="info"
                    variant={statusTab === 'document_created' ? 'filled' : 'outlined'}
                    sx={{ height: 20, fontSize: '0.75rem', fontWeight: 800 }}
                  />
                </Stack>
              }
            />
            <Tab
              value="all"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <span>Hammasi</span>
                  <Chip
                    label={stats.total}
                    size="small"
                    color="default"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }}
                  />
                </Stack>
              }
            />
            <Tab
              value="approved"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <span>Tasdiqlangan</span>
                  <Chip
                    label={stats.approved}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }}
                  />
                </Stack>
              }
            />
            <Tab
              value="rejected"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <span>Bekor qilingan</span>
                  <Chip
                    label={stats.rejected}
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }}
                  />
                </Stack>
              }
            />
          </Tabs>

          {/* Search Box */}
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ width: { xs: '100%', md: 360 } }}>
            <TextField
              size="small"
              fullWidth
              placeholder="F.I.O, PINFL, kadastr, ko'cha..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} color="#94a3b8" />
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
                        <IconX size={14} />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }
              }}
            />
          </Box>
        </Stack>

        {/* 4. Asosiy Jadval */}
        <TableContainer>
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: isDark ? alpha(theme.palette.background.default, 0.6) : '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 60 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Fuqaro (F.I.O / PINFL)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Manzil (Mahalla, Ko'cha)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Kadastr raqami</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'center' }}>Odam soni</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Nazoratchi / Sana</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'center' }}>Holati</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'right', pr: 3 }}>Amallar</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                Array.from(new Array(rowsPerPage)).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton width={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={180} />
                      <Skeleton width={120} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={140} />
                      <Skeleton width={100} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={120} />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width={40} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={120} />
                      <Skeleton width={80} />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width={80} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={100} />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 8 }}>
                    <Box sx={{ color: 'text.secondary', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <IconUser size={48} stroke={1.5} />
                      <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: 'text.secondary' }}>
                        So'rovlar topilmadi
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5 }}>
                        Tanlangan filtr yoki qidiruv bo'yicha hech qanday ariza mavjud emas
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row, index) => {
                  const isRowPending = row.status === 'pending';
                  const isRowDocCreated = row.status === 'document_created';
                  const isRowApproved = row.status === 'approved' || row.status === 'compaleted';
                  const isRowRejected = row.status === 'rejected';
                  const isCurrentRowLoading = rowActionLoading === row._id;
                  const rowFullName = getFullName(row);

                  return (
                    <TableRow
                      key={row._id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor: isDark
                          ? isRowPending || isRowDocCreated
                            ? alpha(theme.palette.background.paper, 0.9)
                            : alpha(theme.palette.background.default, 0.4)
                          : isRowPending || isRowDocCreated
                          ? 'background.paper'
                          : alpha(theme.palette.background.default, 0.5)
                      }}
                    >
                      {/* ID */}
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>{page * rowsPerPage + index + 1}</TableCell>

                      {/* Fuqaro (F.I.O / PINFL / Pasport) */}
                      <TableCell>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <Avatar
                            src={row.citizen?.photo || undefined}
                            sx={{
                              width: 38,
                              height: 38,
                              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.2) : '#e0f2fe',
                              color: theme.palette.primary.main,
                              fontWeight: 700,
                              fontSize: '0.875rem'
                            }}
                          >
                            {rowFullName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              {rowFullName}
                            </Typography>
                            <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mt: 0.2 }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                PINFL: {row.citizen?.pnfl || '—'}
                              </Typography>
                              {row.citizen?.pnfl && (
                                <Tooltip title="PINFL nusxalash">
                                  <IconButton size="small" onClick={() => copyToClipboard(row.citizen?.pnfl, 'PINFL')} sx={{ p: 0.2 }}>
                                    <IconCopy size={13} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Manzil */}
                      <TableCell>
                        <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                          <IconMapPin size={16} color={theme.palette.primary.main} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {row.mahallaName}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', pl: 2.8 }}>
                          {row.streetName}
                        </Typography>
                      </TableCell>

                      {/* Kadastr raqami */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {row.cadastr || 'Mavjud emas'}
                        </Typography>
                        {row.kadastr_baza_not_worked && (
                          <Chip
                            label="Baza ishlamagan"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, mt: 0.3 }}
                          />
                        )}
                      </TableCell>

                      {/* Yashovchilar soni */}
                      <TableCell align="center">
                        <Chip
                          icon={<IconUsers size={14} />}
                          label={`${row.inhabitant_cnt} ta`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: isDark ? alpha(theme.palette.secondary.main, 0.2) : '#f3e8ff',
                            color: theme.palette.secondary.main,
                            border: '1px solid',
                            borderColor: isDark ? alpha(theme.palette.secondary.main, 0.35) : '#e9d5ff'
                          }}
                        />
                      </TableCell>

                      {/* Nazoratchi & Sana */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {row.inspector_name || row.nazoratchi_id || 'Noma’lum'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('uz-UZ') : '-'}
                        </Typography>
                      </TableCell>

                      {/* Holati */}
                      <TableCell align="center">
                        {isRowPending && (
                          <Chip label="Kutilmoqda" size="small" color="warning" variant="filled" sx={{ fontWeight: 700, minWidth: 85 }} />
                        )}
                        {isRowDocCreated && (
                          <Chip label={`Hujjat № ${row.document_number || ''}`} size="small" color="info" variant="filled" sx={{ fontWeight: 700, minWidth: 85 }} />
                        )}
                        {isRowApproved && (
                          <Chip label="Tasdiqlangan" size="small" color="success" variant="filled" sx={{ fontWeight: 700, minWidth: 85 }} />
                        )}
                        {isRowRejected && (
                          <Chip label="Rad etilgan" size="small" color="error" variant="filled" sx={{ fontWeight: 700, minWidth: 85 }} />
                        )}
                      </TableCell>

                      {/* Amallar */}
                      <TableCell align="right" sx={{ pr: 3 }}>
                        <Stack direction="row" spacing={0.8} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                          {/* Ko'rish / Modal */}
                          <Tooltip title="Batafsil ko'rish">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenReview(row)}
                              sx={{
                                color: 'primary.main',
                                bgcolor: isDark ? alpha(theme.palette.primary.main, 0.15) : '#f0f9ff',
                                '&:hover': { bgcolor: isDark ? alpha(theme.palette.primary.main, 0.25) : '#e0f2fe' }
                              }}
                            >
                              <IconEye size={18} />
                            </IconButton>
                          </Tooltip>

                          {/* Hujjat chiqarish (Ham pending, ham document_created uchun) */}
                          {(isRowPending || isRowDocCreated) && (
                            <Tooltip title={isRowDocCreated ? 'Hujjatni qayta chop etish' : 'Asoslantiruvchi hujjat chiqarish'}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenPrint(row)}
                                  disabled={isCurrentRowLoading}
                                  sx={{
                                    color: 'info.main',
                                    bgcolor: isDark ? alpha(theme.palette.info.main, 0.15) : '#f0f9ff',
                                    '&:hover': { bgcolor: isDark ? alpha(theme.palette.info.main, 0.25) : '#e0f2fe' }
                                  }}
                                >
                                  <IconPrinter size={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

                          {/* Tezkor tasdiqlash (Mavjud bo'lib qolishi shart!) */}
                          {(isRowPending || isRowDocCreated) && (
                            <Tooltip title="Tezkor tasdiqlash va Abonent Ochish">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleApprove(row._id)}
                                  disabled={isCurrentRowLoading}
                                  sx={{
                                    color: 'success.main',
                                    bgcolor: isDark ? alpha(theme.palette.success.main, 0.15) : '#f0fdf4',
                                    '&:hover': { bgcolor: isDark ? alpha(theme.palette.success.main, 0.25) : '#dcfce7' }
                                  }}
                                >
                                  <IconCheck size={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

                          {/* Tezkor rad etish */}
                          {(isRowPending || isRowDocCreated) && (
                            <Tooltip title="Rad etish">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenRowReject(row)}
                                  disabled={isCurrentRowLoading}
                                  sx={{
                                    color: 'error.main',
                                    bgcolor: isDark ? alpha(theme.palette.error.main, 0.15) : '#fef2f2',
                                    '&:hover': { bgcolor: isDark ? alpha(theme.palette.error.main, 0.25) : '#fee2e2' }
                                  }}
                                >
                                  <IconX size={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 5. Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Sahifada qatorlar:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count !== -1 ? count : `ko'proq`}`}
        />
      </Paper>

      {/* Taqqoslovchi & Navbat Modali */}
      <NewAbonentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedItem}
        onApprove={handleApprove}
        onRejectClick={handleRejectFromModal}
        onRokirovkaClick={handleOpenRokirovka}
        onPrintClick={handleOpenPrint}
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

      {/* Rokirovka Modali */}
      {rokirovkaModalOpen && rokirovkaItem && (
        <RokirovkaModal
          abonent={rokirovkaItem}
          handleClose={() => {
            setRokirovkaModalOpen(false);
            setRokirovkaItem(null);
          }}
          refresh={fetchData}
        />
      )}

      {/* Qo'lda yangi abonent ochish modali */}
      <CreateManualAbonentModal
        open={createManualOpen}
        onClose={() => setCreateManualOpen(false)}
        onSuccess={fetchData}
      />

      {/* Asoslantiruvchi hujjat chiqarish va chop etish dialogi */}
      <PrintNewAbonentDialog
        open={printDialogOpen}
        onClose={() => {
          setPrintDialogOpen(false);
          setPrintItem(null);
        }}
        item={printItem}
        onDocumentCreated={() => {
          fetchData();
        }}
      />

      {/* Skanerlangan hujjat orqali abonent ochish modali */}
      <ImportScannedAbonentModal
        open={importScannedModalOpen}
        onClose={() => setImportScannedModalOpen(false)}
        onSuccess={fetchData}
      />
    </Box>
  );
};

export default PendingNewAbonents;
