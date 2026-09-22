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
  Checkbox,
  Divider,
  useMediaQuery,
  alpha
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
  IconAlertTriangle,
  IconChecklist,
  IconCalendar,
  IconPlayerPlay
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [items, setItems] = useState<ICustomRequestItem[]>([]);
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
  const [selectedItem, setSelectedItem] = useState<ICustomRequestItem | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [rowActionLoading, setRowActionLoading] = useState<string | null>(null);

  // Jadvaldan to'g'ridan-to'g'ri rad etish dialogi
  const [rowRejectItem, setRowRejectItem] = useState<ICustomRequestItem | null>(null);
  const [rowRejectDialogOpen, setRowRejectDialogOpen] = useState<boolean>(false);

  // Ommaviy tanlash (Bulk selection & checkmarks)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchRejectDialogOpen, setBatchRejectDialogOpen] = useState<boolean>(false);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);

  // Tezkor navbat (Queue)
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  // Kutilayotgan so'rovlar navbati
  const pendingQueue = useMemo(() => {
    return items.filter((item) => !item.confirm && !item.isCancel && item.status !== 'approved' && item.status !== 'rejected');
  }, [items]);

  // Ma'lumotlarni yuklash (so'rov photo siz juda yengil va tez yuklanadi)
  const fetchData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
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
      if (!quiet) {
        toast.error(err?.response?.data?.message || "So'rovlarni yuklashda xatolik yuz berdi");
      }
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [page, rowsPerPage, statusTab, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tab yoki sahifa o'zgarganda tanlovni tozalash
  useEffect(() => {
    setSelectedIds([]);
  }, [statusTab, page]);

  // Bitta elementni ko'rish (Batafsil / Modal) - 0ms kutish bilan ochish!
  const handleOpenReview = async (item: ICustomRequestItem) => {
    const pIndex = pendingQueue.findIndex((q) => q._id === item._id);
    setQueueIndex(pIndex >= 0 ? pIndex : 0);
    // Mavjud ma'lumotlar bilan zudlik bilan ochamiz
    setSelectedItem(item);
    setModalOpen(true);

    // Rasmi va to'liq ma'lumotlarini fonda yangilab olamiz
    try {
      const res = await api.get(`/custom-data-requests/${item._id}`);
      if (res.data?.ok && res.data?.data) {
        setSelectedItem(res.data.data);
      }
    } catch (e) {}
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

  // Optimistik yangilanishlar: Tasdiqlash
  const optimisticallyApprove = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              status: 'approved',
              confirm: true,
              confirmDate: new Date().toISOString()
            }
          : item
      )
    );
    setStats((prev) => ({
      ...prev,
      pending: Math.max(0, prev.pending - 1),
      approved: prev.approved + 1
    }));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  // Optimistik yangilanishlar: Bekor qilish
  const optimisticallyReject = (id: string, reason?: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              status: 'rejected',
              isCancel: true,
              cancelReason: reason,
              cancelDate: new Date().toISOString()
            }
          : item
      )
    );
    setStats((prev) => ({
      ...prev,
      pending: Math.max(0, prev.pending - 1),
      rejected: prev.rejected + 1
    }));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  // Tasdiqlash (Modal ichidan) - Optimistik UI!
  const handleApprove = (id: string) => {
    optimisticallyApprove(id);
    toast.success("Shaxs tasdiqlandi va billingga kiritilmoqda", { autoClose: 2000 });

    // Fonda yuboriladi
    api
      .post(`/custom-data-requests/approve/${id}`, {}, { headers: { 'hide-error': true } })
      .then((res) => {
        if (!res.data?.ok && !res.data?.success) {
          toast.error(res.data?.message || 'Tasdiqlashda xatolik yuz berdi');
          fetchData(true);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Tasdiqlashda xatolik yuz berdi');
        fetchData(true);
      });
  };

  // Jadvaldan bitta bosishda tezkor tasdiqlash - Optimistik UI!
  const handleQuickApproveRow = (id: string) => {
    optimisticallyApprove(id);
    toast.success("Abonent tasdiqlandi", { autoClose: 1500 });

    api
      .post(`/custom-data-requests/approve/${id}`, {}, { headers: { 'hide-error': true } })
      .then((res) => {
        if (!res.data?.ok && !res.data?.success) {
          toast.error(res.data?.message || 'Tasdiqlashda xatolik yuz berdi');
          fetchData(true);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Tasdiqlashda xatolik yuz berdi');
        fetchData(true);
      });
  };

  // Rad etish (Modal ichidan) - Optimistik UI!
  const handleReject = (id: string, reason: string) => {
    optimisticallyReject(id, reason);
    toast.info("So'rov bekor qilindi", { autoClose: 1500 });

    api
      .post(`/custom-data-requests/reject/${id}`, { reason }, { headers: { 'hide-error': true } })
      .then((res) => {
        if (!res.data?.ok && !res.data?.success) {
          toast.error(res.data?.message || 'Xatolik yuz berdi');
          fetchData(true);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Bekor qilishda xatolik yuz berdi');
        fetchData(true);
      });
  };

  // Jadvaldan rad etish oynasini ochish
  const handleOpenRejectRowDialog = (item: ICustomRequestItem) => {
    setRowRejectItem(item);
    setRowRejectDialogOpen(true);
  };

  // Jadvaldan rad etishni tasdiqlash
  const handleConfirmRowReject = (reason: string) => {
    if (!rowRejectItem) return;
    const targetId = rowRejectItem._id;
    setRowRejectDialogOpen(false);
    setRowRejectItem(null);

    optimisticallyReject(targetId, reason);
    toast.info("So'rov bekor qilindi", { autoClose: 1500 });

    api
      .post(`/custom-data-requests/reject/${targetId}`, { reason }, { headers: { 'hide-error': true } })
      .then((res) => {
        if (!res.data?.ok && !res.data?.success) {
          toast.error(res.data?.message || 'Xatolik yuz berdi');
          fetchData(true);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Bekor qilishda xatolik yuz berdi');
        fetchData(true);
      });
  };

  // Ommaviy tasdiqlash (Batch Approve)
  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const targetIds = [...selectedIds];
    setSelectedIds([]);

    // Optimistik yangilash
    setItems((prev) =>
      prev.map((it) => (targetIds.includes(it._id) ? { ...it, status: 'approved', confirm: true } : it))
    );
    setStats((prev) => ({
      ...prev,
      pending: Math.max(0, prev.pending - count),
      approved: prev.approved + count
    }));

    setBatchLoading(true);
    try {
      const res = await api.post('/custom-data-requests/batch-approve', { ids: targetIds });
      if (res.data?.ok || res.data?.success) {
        toast.success(res.data?.message || `${count} ta so'rov muvaffaqiyatli tasdiqlandi`);
      } else {
        toast.error(res.data?.message || 'Ommaviy tasdiqlashda xatolik yuz berdi');
        fetchData(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Ommaviy tasdiqlashda xatolik yuz berdi');
      fetchData(true);
    } finally {
      setBatchLoading(false);
    }
  };

  // Ommaviy rad etishni tasdiqlash (Batch Reject)
  const handleConfirmBatchReject = async (reason: string) => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const targetIds = [...selectedIds];
    setBatchRejectDialogOpen(false);
    setSelectedIds([]);

    // Optimistik yangilash
    setItems((prev) =>
      prev.map((it) =>
        targetIds.includes(it._id) ? { ...it, status: 'rejected', isCancel: true, cancelReason: reason } : it
      )
    );
    setStats((prev) => ({
      ...prev,
      pending: Math.max(0, prev.pending - count),
      rejected: prev.rejected + count
    }));

    setBatchLoading(true);
    try {
      const res = await api.post('/custom-data-requests/batch-reject', { ids: targetIds, reason });
      if (res.data?.ok || res.data?.success) {
        toast.info(res.data?.message || `${count} ta so'rov bekor qilindi`);
      } else {
        toast.error(res.data?.message || 'Ommaviy bekor qilishda xatolik yuz berdi');
        fetchData(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Ommaviy bekor qilishda xatolik yuz berdi');
      fetchData(true);
    } finally {
      setBatchLoading(false);
    }
  };

  // Qatordagi checkboxni o'zgartirish
  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Barchasini tanlash / bekor qilish
  const handleSelectAllPending = () => {
    if (pendingQueue.length === 0) return;
    if (selectedIds.length === pendingQueue.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingQueue.map((item) => item._id));
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
    <Box sx={{ width: '100%', pb: 10 }}>
      {/* Sarlavha va Asosiy Tugmalar */}
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1.5, sm: 2 } }}
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
            Shaxsni tasdiqlash
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' }, mt: 0.2 }}>
            Nazoratchilar kiritgan pasport va JSHSHIR ma'lumotlarini tekshirish va tasdiqlash
          </Typography>
        </Box>

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
      </Stack>

      {/* 🚀 ASOSIY HERO HARAKAT: Solishtirishni boshlash banneri */}
      {stats.pending > 0 && (
        <Card
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 2,
            borderRadius: '16px',
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.12) : '#fffbeb',
            border: '2px solid',
            borderColor: 'warning.main',
            boxShadow: `0 4px 20px ${alpha(theme.palette.warning.main, 0.25)}`
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: { xs: 40, sm: 46 },
                  height: { xs: 40, sm: 46 },
                  borderRadius: '12px',
                  bgcolor: 'warning.main',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
                }}
              >
                <IconFast size={24} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                  {stats.pending} ta so'rov kutilmoqda
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Ketma-ket solishtirish va tasdiqlash rejimini ishga tushirish
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              color="warning"
              size="large"
              startIcon={<IconPlayerPlay size={20} />}
              onClick={handleStartFastQueue}
              sx={{
                borderRadius: '12px',
                fontWeight: 900,
                textTransform: 'none',
                py: 1.2,
                px: 3,
                fontSize: { xs: '0.92rem', sm: '1rem' },
                bgcolor: '#d97706',
                boxShadow: '0 4px 16px rgba(217, 119, 6, 0.4)',
                '&:hover': { bgcolor: '#b45309' },
                whiteSpace: 'nowrap'
              }}
            >
              Solishtirishni boshlash ({stats.pending})
            </Button>
          </Stack>
        </Card>
      )}

      {/* 4 Asosiy KPI Kartalari (Faqat Desktopda ko'rinadi, mobilda joy tejash maqsadida yashiriladi) */}
      <Grid container spacing={2} sx={{ mb: 2.5, display: { xs: 'none', md: 'flex' } }}>
        {/* 1. Jami so'rovlar */}
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            onClick={() => {
              setStatusTab('all');
              setPage(0);
            }}
            sx={{
              p: 1.5,
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: statusTab === 'all' ? 'primary.main' : 'divider',
              boxShadow: statusTab === 'all' ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.15)}` : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  Jami so'rovlar
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.3 }}>
                  {stats.total.toLocaleString()} ta
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 0.8,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex'
                }}
              >
                <IconFileCertificate size={22} />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* 2. Kutilmoqda */}
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            onClick={() => {
              setStatusTab('pending');
              setPage(0);
            }}
            sx={{
              p: 1.5,
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: statusTab === 'pending' ? 'warning.main' : 'divider',
              boxShadow: statusTab === 'pending' ? `0 6px 20px ${alpha(theme.palette.warning.main, 0.2)}` : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  Kutilmoqda
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'warning.main', mt: 0.3 }}>
                  {stats.pending.toLocaleString()} ta
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 0.8,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.warning.main, 0.12),
                  color: 'warning.main',
                  display: 'flex'
                }}
              >
                <IconClock size={22} />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* 3. Tasdiqlangan */}
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            onClick={() => {
              setStatusTab('approved');
              setPage(0);
            }}
            sx={{
              p: 1.5,
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: statusTab === 'approved' ? 'success.main' : 'divider',
              boxShadow: statusTab === 'approved' ? `0 6px 20px ${alpha(theme.palette.success.main, 0.15)}` : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  Tasdiqlangan
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main', mt: 0.3 }}>
                  {stats.approved.toLocaleString()} ta
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 0.8,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  color: 'success.main',
                  display: 'flex'
                }}
              >
                <IconCheck size={22} />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* 4. Bekor qilingan */}
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            onClick={() => {
              setStatusTab('rejected');
              setPage(0);
            }}
            sx={{
              p: 1.5,
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: statusTab === 'rejected' ? 'error.main' : 'divider',
              boxShadow: statusTab === 'rejected' ? `0 6px 20px ${alpha(theme.palette.error.main, 0.15)}` : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  Bekor qilingan
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'error.main', mt: 0.3 }}>
                  {stats.rejected.toLocaleString()} ta
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 0.8,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.error.main, 0.12),
                  color: 'error.main',
                  display: 'flex'
                }}
              >
                <IconX size={22} />
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Asosiy Kart: Filtrlash va Jadval */}
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
        {/* Qidiruv va Tablar satri */}
        <Box sx={{ p: { xs: 1.5, sm: 2.5 }, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
          >
            {/* Status Tablari */}
            <Tabs
              value={statusTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 'auto',
                '& .MuiTabs-scrollButtons': {
                  width: { xs: 24, sm: 36 }
                },
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

            {/* Qidiruv formasi */}
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ width: { xs: '100%', md: 380 } }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Licshet, F.I.SH, PINFL, Pasport..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={18} color={theme.palette.text.secondary} />
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

        {/* 📱 MOBIL KARTALAR KO'RINISHI (Kichik ekranlar uchun qulay Card List) */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, p: 1.5 }}>
          {/* Mobil sarlavhadagi "Barchasini tanlash" paneli */}
          {pendingQueue.length > 0 && statusTab === 'pending' && (
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                borderRadius: '12px',
                p: 1,
                mb: 1.5
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Checkbox
                  size="small"
                  checked={selectedIds.length === pendingQueue.length && pendingQueue.length > 0}
                  indeterminate={selectedIds.length > 0 && selectedIds.length < pendingQueue.length}
                  onChange={handleSelectAllPending}
                />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Barchasini belgilash ({pendingQueue.length})
                </Typography>
              </Stack>
            </Stack>
          )}

          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} variant="rectangular" height={130} sx={{ borderRadius: '16px', mb: 1.5 }} />
            ))
          ) : items.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              <IconShieldCheck size={48} color={theme.palette.text.secondary} />
              <Typography variant="body1" sx={{ fontWeight: 700, mt: 1 }}>
                So'rovlar topilmadi
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {items.map((row) => {
                const passportFullName =
                  `${row.data?.last_name || ''} ${row.data?.first_name || ''} ${row.data?.middle_name || ''}`.trim() ||
                  "Ma'lumot yo'q";
                const billingFullName = row.billingData?.fio || row.currentAbonent?.fio || '-';
                const isPending = !row.confirm && !row.isCancel && row.status !== 'approved' && row.status !== 'rejected';
                const isApproved = row.confirm || row.status === 'approved';
                const isRejected = row.isCancel || row.status === 'rejected';
                const isFioDiff =
                  billingFullName &&
                  passportFullName &&
                  billingFullName !== '-' &&
                  billingFullName.toLowerCase().replace(/\s+/g, '') !== passportFullName.toLowerCase().replace(/\s+/g, '');

                return (
                  <Card
                    key={row._id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: selectedIds.includes(row._id) ? 'primary.main' : 'divider',
                      boxShadow: selectedIds.includes(row._id)
                        ? `0 4px 14px ${alpha(theme.palette.primary.main, 0.15)}`
                        : 'none'
                    }}
                  >
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                      <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                        {isPending && (
                          <Checkbox
                            size="small"
                            checked={selectedIds.includes(row._id)}
                            onChange={() => handleToggleSelectRow(row._id)}
                            sx={{ p: 0 }}
                          />
                        )}
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                            {row.licshet}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            {row.inspector_name || "Noma'lum"} •{' '}
                            {row.createdAt ? new Date(row.createdAt).toLocaleDateString('uz-UZ') : ''}
                          </Typography>
                        </Box>
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

                    {/* F.I.SH va Tug'ilgan sana (Asosiy parametrlar) */}
                    <Box sx={{ mb: 0.8 }}>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem' }}>
                          Pasport egasi:
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
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.92rem' }}>
                        {passportFullName}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.4, flexWrap: 'wrap' }}>
                        {row.data?.birth_date && (
                          <Stack direction="row" spacing={0.4} sx={{ alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.08), px: 0.8, py: 0.2, borderRadius: '6px' }}>
                            <IconCalendar size={13} color={theme.palette.primary.main} />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.75rem' }}>
                              {row.data.birth_date}
                            </Typography>
                          </Stack>
                        )}
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                          JSHSHIR: {row.data?.pinfl || '-'}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box sx={{ mb: 1, p: 0.8, borderRadius: '8px', bgcolor: alpha(theme.palette.text.primary, 0.03) }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block' }}>
                        Billing: <b>{billingFullName}</b>
                      </Typography>
                      {row.billingData?.mahalla && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block' }}>
                          {row.billingData.mahalla} {row.billingData.address ? `, ${row.billingData.address}` : ''}
                        </Typography>
                      )}
                    </Box>

                    {/* Tugmalar */}
                    {isPending ? (
                      <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<IconCheck size={16} />}
                          onClick={() => handleQuickApproveRow(row._id)}
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
                          onClick={() => handleOpenRejectRowDialog(row)}
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

        {/* 💻 DESKTOP JADVAL KO'RINISHI */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ display: { xs: 'none', md: 'block' }, bgcolor: 'transparent' }}
        >
          <Table sx={{ minWidth: 1000 }}>
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.5) : '#f8fafc' }}>
              <TableRow>
                <TableCell padding="checkbox" sx={{ pl: 2, width: 40 }}>
                  <Checkbox
                    size="small"
                    checked={pendingQueue.length > 0 && selectedIds.length === pendingQueue.length}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < pendingQueue.length}
                    onChange={handleSelectAllPending}
                    disabled={pendingQueue.length === 0}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 800, py: 1.5, width: 40 }}>№</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 1.5, width: 130 }}>Abonent (Licshet)</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 1.5, minWidth: 220 }}>Pasportdagi F.I.SH va Tug'ilgan sana</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 1.5, minWidth: 220 }}>Billingdagi F.I.SH va Manzil</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 1.5 }}>Nazoratchi</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 1.5 }}>Sana</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 1.5, textAlign: 'center', width: 120 }}>Holati</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 1.5, textAlign: 'center', minWidth: 180 }}>Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={9} sx={{ py: 1.5 }}>
                      <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '8px' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                    <Stack spacing={1} sx={{ alignItems: 'center' }}>
                      <IconShieldCheck size={44} color={theme.palette.text.secondary} />
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
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

                  const isPending = !row.confirm && !row.isCancel && row.status !== 'approved' && row.status !== 'rejected';
                  const isApproved = row.confirm || row.status === 'approved';
                  const isRejected = row.isCancel || row.status === 'rejected';

                  const isFioDiff =
                    billingFullName &&
                    passportFullName &&
                    billingFullName !== '-' &&
                    billingFullName.toLowerCase().replace(/\s+/g, '') !== passportFullName.toLowerCase().replace(/\s+/g, '');

                  const isSelected = selectedIds.includes(row._id);

                  return (
                    <TableRow
                      key={row._id}
                      hover
                      selected={isSelected}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'inherit'
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ pl: 2 }}>
                        {isPending && (
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(row._id)}
                          />
                        )}
                      </TableCell>

                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 1.5 }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>

                      {/* Licshet */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          {row.licshet}
                        </Typography>
                        {row.reUpdating && (
                          <Chip
                            label="2-marta"
                            color="warning"
                            size="small"
                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, mt: 0.3 }}
                          />
                        )}
                      </TableCell>

                      {/* Pasportdagi F.I.SH va Tug'ilgan sana */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          {passportFullName}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.3, flexWrap: 'wrap' }}>
                          {row.data?.birth_date && (
                            <Stack direction="row" spacing={0.4} sx={{ alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.08), px: 0.8, py: 0.2, borderRadius: '6px' }}>
                              <IconCalendar size={13} color={theme.palette.primary.main} />
                              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.75rem' }}>
                                {row.data.birth_date}
                              </Typography>
                            </Stack>
                          )}
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                            JSHSHIR: {row.data?.pinfl || '-'}
                          </Typography>
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
                                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
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
                            color="warning"
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </TableCell>

                      {/* Amallar */}
                      <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
                        {isPending ? (
                          <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                            {/* Tezkor tasdiqlash */}
                            <Tooltip title="To'g'ridan-to'g'ri tasdiqlash">
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
                                  Tasdiqlash
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
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.error.main, 0.3),
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
                                  border: '1px solid',
                                  borderColor: alpha(theme.palette.primary.main, 0.3),
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
                                fontWeight: 700,
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

      {/* 🚀 SUZUVCHI OMMAVIY AMALLAR PANELI (Floating Bulk Action Bar) */}
      {selectedIds.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            bgcolor: 'background.paper',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            border: '2px solid',
            borderColor: 'primary.main',
            px: { xs: 2, sm: 3 },
            py: 1.2,
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            maxWidth: '92vw',
            flexWrap: 'wrap',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <Chip
            icon={<IconChecklist size={16} />}
            label={`${selectedIds.length} ta tanlandi`}
            color="primary"
            sx={{ fontWeight: 800 }}
          />

          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<IconCheck size={18} />}
            onClick={handleBatchApprove}
            disabled={batchLoading}
            sx={{
              fontWeight: 800,
              borderRadius: '10px',
              textTransform: 'none',
              bgcolor: '#16a34a',
              '&:hover': { bgcolor: '#15803d' },
              px: 2
            }}
          >
            {batchLoading ? 'Bajarilmoqda...' : 'Barchasini tasdiqlash'}
          </Button>

          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<IconX size={18} />}
            onClick={() => setBatchRejectDialogOpen(true)}
            disabled={batchLoading}
            sx={{ fontWeight: 700, borderRadius: '10px', textTransform: 'none', px: 2 }}
          >
            Barchasini rad etish
          </Button>

          <Button
            size="small"
            color="inherit"
            onClick={() => setSelectedIds([])}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Bekor qilish
          </Button>
        </Box>
      )}

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

      {/* Jadvaldan to'g'ridan-to'g'ri bitta elementni rad etish dialogi */}
      <RejectReasonDialog
        open={rowRejectDialogOpen}
        onClose={() => {
          setRowRejectDialogOpen(false);
          setRowRejectItem(null);
        }}
        onConfirm={handleConfirmRowReject}
        loading={Boolean(rowActionLoading)}
      />

      {/* Ommaviy rad etish sababi dialogi */}
      <RejectReasonDialog
        open={batchRejectDialogOpen}
        onClose={() => setBatchRejectDialogOpen(false)}
        onConfirm={handleConfirmBatchReject}
        loading={batchLoading}
      />
    </Box>
  );
};

export default IdentityVerification;

