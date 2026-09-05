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
  Button
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  IconSearch,
  IconRefresh,
  IconEye,
  IconShieldCheck,
  IconCheck,
  IconX,
  IconClock,
  IconBolt as IconFast,
  IconFileCertificate,
  IconAlertCircle
} from '@tabler/icons-react';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { VerificationModal } from './VerificationModal';
import { RejectReasonDialog } from './RejectReasonDialog';

interface ICustomRequestItem {
  _id: string;
  licshet: string;
  inspector_name?: string;
  inspector_id?: string;
  status?: 'pending' | 'approved' | 'rejected';
  confirm?: boolean;
  isCancel?: boolean;
  reUpdating?: boolean;
  createdAt: string;
  confirmDate?: string;
  cancelDate?: string;
  cancelReason?: string;
  photo?: string;
  data: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    pinfl?: string;
    passport_serial?: string;
    passport_number?: string;
    birth_date?: string;
    details?: any;
  };
  billingData?: {
    fio?: string;
    pinfl?: number | string;
    passport_number?: string;
    electricityAccountNumber?: string;
    mahalla?: string;
    address?: string;
    inhabitant_cnt?: number;
  };
  currentAbonent?: any;
  confirmedBy?: any;
  canceledBy?: any;
}

interface IStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const IdentityVerification: React.FC = () => {
  const theme = useTheme();

  const [items, setItems] = useState<ICustomRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<IStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // Filter & Pagination States
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modal & Queue States
  const [selectedItem, setSelectedItem] = useState<ICustomRequestItem | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [rowActionLoading, setRowActionLoading] = useState<string | null>(null);

  // Jadvaldan to'g'ridan-to'g'ri rad etish dialogi
  const [rowRejectItem, setRowRejectItem] = useState<ICustomRequestItem | null>(null);
  const [rowRejectDialogOpen, setRowRejectDialogOpen] = useState<boolean>(false);

  // Tezkor navbat (Queue)
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  // Kutilayotgan so'rovlar navbati
  const pendingQueue = useMemo(() => {
    return items.filter(
      (item) => !item.confirm && !item.isCancel && item.status !== 'approved' && item.status !== 'rejected'
    );
  }, [items]);

  // Ma'lumotlarni yuklash
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/custom-data-requests', {
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
      toast.error(err?.response?.data?.message || "So'rovlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusTab, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Bitta elementni ko'rish (Batafsil / Modal)
  const handleOpenReview = async (item: ICustomRequestItem) => {
    // Navbatdagi o'rnini topish
    const pIndex = pendingQueue.findIndex((q) => q._id === item._id);
    setQueueIndex(pIndex >= 0 ? pIndex : 0);
    setSelectedItem(item);
    setModalOpen(true);

    try {
      const res = await api.get(`/custom-data-requests/${item._id}`);
      if (res.data?.ok && res.data?.data) {
        setSelectedItem(res.data.data);
      }
    } catch (e) {
      // mavjud ma'lumot bilan davom etadi
    }
  };

  // ⚡ Tezkor tasdiqlash rejimini boshlash
  const handleStartFastQueue = async () => {
    if (pendingQueue.length === 0) {
      toast.info("Hozirda kutilayotgan so'rovlar mavjud emas");
      return;
    }
    setQueueIndex(0);
    setAutoAdvance(true);
    const firstItem = pendingQueue[0];
    setSelectedItem(firstItem);
    setModalOpen(true);

    try {
      const res = await api.get(`/custom-data-requests/${firstItem._id}`);
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
        const res = await api.get(`/custom-data-requests/${nextItem._id}`);
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
        const res = await api.get(`/custom-data-requests/${prevItem._id}`);
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
      const res = await api.post(
        `/custom-data-requests/approve/${id}`,
        {},
        { headers: { 'hide-error': true } }
      );
      if (res.data?.ok || res.data?.success) {
        toast.success(res.data?.message || "Shaxsni tasdiqlash so'rovi muvaffaqiyatli qabul qilindi");
        fetchData();
        return true;
      } else {
        toast.error(res.data?.message || 'Xatolik yuz berdi');
        return false;
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tasdiqlashda xatolik yuz berdi");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Jadvalning o'zidan bitta bosishda tezkor tasdiqlash
  const handleQuickApproveRow = async (id: string) => {
    setRowActionLoading(id);
    try {
      const res = await api.post(
        `/custom-data-requests/approve/${id}`,
        {},
        { headers: { 'hide-error': true } }
      );
      if (res.data?.ok || res.data?.success) {
        toast.success(res.data?.message || "Abonent muvaffaqiyatli tasdiqlandi");
        fetchData();
      } else {
        toast.error(res.data?.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tasdiqlashda xatolik yuz berdi");
    } finally {
      setRowActionLoading(null);
    }
  };

  // Rad etish (Modal ichidan)
  const handleReject = async (id: string, reason: string): Promise<boolean> => {
    setActionLoading(true);
    try {
      const res = await api.post(
        `/custom-data-requests/reject/${id}`,
        { reason },
        { headers: { 'hide-error': true } }
      );
      if (res.data?.ok || res.data?.success) {
        toast.info(res.data?.message || "So'rov bekor qilindi");
        fetchData();
        return true;
      } else {
        toast.error(res.data?.message || 'Xatolik yuz berdi');
        return false;
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Bekor qilishda xatolik yuz berdi");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Jadvaldan rad etish oynasini ochish
  const handleOpenRejectRowDialog = (item: ICustomRequestItem) => {
    setRowRejectItem(item);
    setRowRejectDialogOpen(true);
  };

  // Jadvaldan rad etishni tasdiqlash
  const handleConfirmRowReject = async (reason: string) => {
    if (!rowRejectItem) return;
    setRowActionLoading(rowRejectItem._id);
    try {
      const res = await api.post(
        `/custom-data-requests/reject/${rowRejectItem._id}`,
        { reason },
        { headers: { 'hide-error': true } }
      );
      if (res.data?.ok || res.data?.success) {
        toast.info(res.data?.message || "So'rov bekor qilindi");
        setRowRejectDialogOpen(false);
        setRowRejectItem(null);
        fetchData();
      } else {
        toast.error(res.data?.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Bekor qilishda xatolik yuz berdi");
    } finally {
      setRowActionLoading(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'all' | 'pending' | 'approved' | 'rejected') => {
    setStatusTab(newValue);
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%', pb: 5 }}>
      {/* Sarlavha va Asosiy Tugmalar */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#1a237e' }}>
            Shaxsni tasdiqlash so'rovlari
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Nazoratchilar kiritgan pasport va JSHSHIR ma'lumotlarini tekshirish, tezkor solishtirish va tasdiqlash
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {/* ⚡ Tezkor tasdiqlash navbati tugmasi */}
          {stats.pending > 0 && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<IconFast size={18} />}
              onClick={handleStartFastQueue}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                bgcolor: '#d97706',
                '&:hover': { bgcolor: '#b45309' }
              }}
            >
              ⚡ Tezkor tasdiqlash ({stats.pending} ta)
            </Button>
          )}

          <Button
            variant="outlined"
            color="primary"
            startIcon={<IconRefresh size={18} />}
            onClick={fetchData}
            disabled={loading}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            Yangilash
          </Button>
        </Stack>
      </Stack>

      {/* 4 Asosiy KPI Kartalari */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* 1. Jami so'rovlar */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            onClick={() => {
              setStatusTab('all');
              setPage(0);
            }}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: 'background.paper',
              border: statusTab === 'all' ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.06)',
              boxShadow: statusTab === 'all' ? '0 8px 24px rgba(25, 118, 210, 0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-3px)' }
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  Jami so'rovlar
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1976d2', mt: 0.5 }}>
                  {stats.total.toLocaleString()} ta
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                  color: '#1976d2',
                  display: 'flex'
                }}
              >
                <IconFileCertificate size={26} />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* 2. Kutilmoqda */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            onClick={() => {
              setStatusTab('pending');
              setPage(0);
            }}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: 'background.paper',
              border: statusTab === 'pending' ? '2px solid #d97706' : '1px solid rgba(0,0,0,0.06)',
              boxShadow: statusTab === 'pending' ? '0 8px 24px rgba(217, 119, 6, 0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-3px)' }
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  Faol (Kutilmoqda)
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#d97706', mt: 0.5 }}>
                  {stats.pending.toLocaleString()} ta
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(245, 158, 11, 0.12)',
                  color: '#d97706',
                  display: 'flex'
                }}
              >
                <IconClock size={26} />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* 3. Tasdiqlangan */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            onClick={() => {
              setStatusTab('approved');
              setPage(0);
            }}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: 'background.paper',
              border: statusTab === 'approved' ? '2px solid #15803d' : '1px solid rgba(0,0,0,0.06)',
              boxShadow: statusTab === 'approved' ? '0 8px 24px rgba(21, 128, 61, 0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-3px)' }
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  Tasdiqlangan
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>
                  {stats.approved.toLocaleString()} ta
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(34, 197, 94, 0.12)',
                  color: '#15803d',
                  display: 'flex'
                }}
              >
                <IconCheck size={26} />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* 4. Bekor qilingan */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            onClick={() => {
              setStatusTab('rejected');
              setPage(0);
            }}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: 'background.paper',
              border: statusTab === 'rejected' ? '2px solid #dc2626' : '1px solid rgba(0,0,0,0.06)',
              boxShadow: statusTab === 'rejected' ? '0 8px 24px rgba(220, 38, 38, 0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-3px)' }
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  Bekor qilingan
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#dc2626', mt: 0.5 }}>
                  {stats.rejected.toLocaleString()} ta
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(239, 68, 68, 0.12)',
                  color: '#dc2626',
                  display: 'flex'
                }}
              >
                <IconX size={26} />
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Asosiy Kart: Filtrlash va Jadval */}
      <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {/* Qidiruv va Tablar satri */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
          >
            {/* Status Tablari */}
            <Tabs
              value={statusTab}
              onChange={handleTabChange}
              sx={{
                minHeight: 'auto',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  minHeight: 40,
                  py: 0.5
                }
              }}
            >
              <Tab label={`Barchasi (${stats.total})`} value="all" />
              <Tab
                label={
                  <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                    <span>Kutilmoqda</span>
                    {stats.pending > 0 && (
                      <Chip
                        label={stats.pending}
                        size="small"
                        color="warning"
                        sx={{ height: 20, fontSize: '0.75rem', fontWeight: 800 }}
                      />
                    )}
                  </Stack>
                }
                value="pending"
              />
              <Tab label={`Tasdiqlangan (${stats.approved})`} value="approved" />
              <Tab label={`Bekor qilingan (${stats.rejected})`} value="rejected" />
            </Tabs>

            {/* Qidiruv formasi */}
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ width: { xs: '100%', md: 380 } }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Licshet, F.I.SH, PINFL, Pasport, Nazoratchi..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={18} color="#9ca3af" />
                      </InputAdornment>
                    ),
                    endAdornment: searchInput && (
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
                    )
                  }
                }}
              />
            </Box>
          </Stack>
        </Box>

        {/* Jadval */}
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, py: 1.5, width: 35 }}>№</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5, width: 120 }}>Abonent (Licshet)</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5, minWidth: 200 }}>Pasportdagi F.I.SH va JSHSHIR</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5, minWidth: 200 }}>Billingdagi F.I.SH va Manzil</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Nazoratchi</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Sana</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5, textAlign: 'center', width: 110 }}>Holati</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5, textAlign: 'center', minWidth: 180 }}>Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={8} sx={{ py: 1.5 }}>
                      <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '6px' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>
                    <Stack spacing={1} sx={{ alignItems: 'center' }}>
                      <IconShieldCheck size={40} color="#9ca3af" />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        So'rovlar topilmadi
                      </Typography>
                      <Typography variant="caption">
                        Tanlangan filtr yoki qidiruv so'rovi bo'yicha hech qanday ma'lumot mavjud emas
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row, idx) => {
                  const passportFullName =
                    `${row.data?.last_name || ''} ${row.data?.first_name || ''} ${row.data?.middle_name || ''}`.trim() ||
                    "Ma'lumot yo'q";
                  const billingFullName = row.billingData?.fio || row.currentAbonent?.fio || '-';

                  const isPending =
                    !row.confirm && !row.isCancel && row.status !== 'approved' && row.status !== 'rejected';
                  const isApproved = row.confirm || row.status === 'approved';
                  const isRejected = row.isCancel || row.status === 'rejected';

                  const isFioDiff =
                    billingFullName &&
                    passportFullName &&
                    billingFullName !== '-' &&
                    billingFullName.toLowerCase().replace(/\s+/g, '') !== passportFullName.toLowerCase().replace(/\s+/g, '');

                  return (
                    <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 1.5 }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>

                      {/* Licshet */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a237e' }}>
                          {row.licshet}
                        </Typography>
                        {row.reUpdating && (
                          <Chip label="2-marta" color="warning" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, mt: 0.3 }} />
                        )}
                      </TableCell>

                      {/* Pasportdagi F.I.SH va PINFL */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          {passportFullName}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.3 }}>
                          <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, fontFamily: 'monospace' }}>
                            PINFL: {row.data?.pinfl || '-'}
                          </Typography>
                          {row.data?.passport_serial && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              ({row.data.passport_serial} {row.data.passport_number})
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      {/* Billingdagi F.I.SH va Manzil */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {billingFullName}
                          </Typography>
                          {isFioDiff && (
                            <Tooltip title="Billingdagi F.I.SH pasportdagidan farq qiladi">
                              <Chip
                                label="Farq bor"
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                        {row.billingData?.mahalla && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                            {row.billingData.mahalla}
                            {row.billingData.address ? `, ${row.billingData.address}` : ''}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Nazoratchi */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {row.inspector_name || "Noma'lum"}
                        </Typography>
                      </TableCell>

                      {/* Yuborilgan sana */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('uz-UZ') : '-'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          {row.createdAt
                            ? new Date(row.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </Typography>
                      </TableCell>

                      {/* Holati */}
                      <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
                        {isApproved ? (
                          <Chip label="Tasdiqlangan" color="success" size="small" sx={{ fontWeight: 700 }} />
                        ) : isRejected ? (
                          <Chip label="Bekor qilingan" color="error" size="small" sx={{ fontWeight: 700 }} />
                        ) : (
                          <Chip
                            label="Kutilmoqda"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(245, 158, 11, 0.16)',
                              color: '#b45309',
                              fontWeight: 700,
                              border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}
                          />
                        )}
                      </TableCell>

                      {/* Amallar: Jadvalning o'zida Tezkor Tasdiqlash / Rad etish / Solishtirish */}
                      <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
                        {isPending ? (
                          <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                            {/* To'g'ridan-to'g'ri tasdiqlash tugmasi */}
                            <Tooltip title="Modal ochmasdan to'g'ridan-to'g'ri tasdiqlash">
                              <span>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<IconCheck size={16} />}
                                  onClick={() => handleQuickApproveRow(row._id)}
                                  disabled={rowActionLoading === row._id}
                                  sx={{
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    py: 0.5,
                                    px: 1.2,
                                    bgcolor: '#16a34a',
                                    '&:hover': { bgcolor: '#15803d' }
                                  }}
                                >
                                  {rowActionLoading === row._id ? '...' : 'Tasdiqlash'}
                                </Button>
                              </span>
                            </Tooltip>

                            {/* Rad etish */}
                            <Tooltip title="Rad etish">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenRejectRowDialog(row)}
                                  disabled={rowActionLoading === row._id}
                                  sx={{
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    borderRadius: '8px',
                                    p: 0.5
                                  }}
                                >
                                  <IconX size={16} />
                                </IconButton>
                              </span>
                            </Tooltip>

                            {/* Solishtirish modali */}
                            <Tooltip title="Batafsil solishtirish (surat va to'liq ma'lumotlar)">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenReview(row)}
                                sx={{
                                  border: '1px solid rgba(25, 118, 210, 0.25)',
                                  borderRadius: '8px',
                                  p: 0.5
                                }}
                              >
                                <IconEye size={16} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        ) : (
                          <Tooltip title="Tafsilotlarni ko'rish">
                            <Button
                              variant="outlined"
                              color="inherit"
                              size="small"
                              startIcon={<IconEye size={16} />}
                              onClick={() => handleOpenReview(row)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                px: 1.5
                              }}
                            >
                              Ko'rish
                            </Button>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginatsiya */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Qatorlar soni:"
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>

      {/* Solishtirish va Tasdiqlash Modali (Tezkor navbat imkoniyati bilan) */}
      <VerificationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={selectedItem}
        onApprove={handleApprove}
        onReject={handleReject}
        actionLoading={actionLoading}
        queueIndex={queueIndex}
        queueTotal={pendingQueue.length}
        onNext={handleNextInQueue}
        onPrev={handlePrevInQueue}
        hasNext={queueIndex < pendingQueue.length - 1}
        hasPrev={queueIndex > 0}
        autoAdvance={autoAdvance}
        onToggleAutoAdvance={setAutoAdvance}
      />

      {/* Jadvaldan to'g'ridan-to'g'ri rad etish sababi dialogi */}
      <RejectReasonDialog
        open={rowRejectDialogOpen}
        onClose={() => {
          setRowRejectDialogOpen(false);
          setRowRejectItem(null);
        }}
        onConfirm={handleConfirmRowReject}
        loading={Boolean(rowActionLoading)}
      />
    </Box>
  );
};

export default IdentityVerification;
