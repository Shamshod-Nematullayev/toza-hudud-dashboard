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
  IconArrowsExchange
} from '@tabler/icons-react';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { INewAbonentItem, IStats } from './types';
import { NewAbonentModal } from './NewAbonentModal';
import { RejectReasonDialog } from './RejectReasonDialog';
import { RokirovkaModal } from './RokirovkaModal';

export const PendingNewAbonents: React.FC = () => {
  const theme = useTheme();

  const [items, setItems] = useState<INewAbonentItem[]>([]);
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
  const [selectedItem, setSelectedItem] = useState<INewAbonentItem | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [rowActionLoading, setRowActionLoading] = useState<string | null>(null);

  // Jadvaldan to'g'ridan-to'g'ri rad etish dialogi
  const [rowRejectItem, setRowRejectItem] = useState<INewAbonentItem | null>(null);
  const [rowRejectDialogOpen, setRowRejectDialogOpen] = useState<boolean>(false);

  // Rokirovka modali
  const [rokirovkaItem, setRokirovkaItem] = useState<INewAbonentItem | null>(null);
  const [rokirovkaModalOpen, setRokirovkaModalOpen] = useState<boolean>(false);

  // Tezkor navbat (Queue)
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  // Kutilayotgan so'rovlar navbati
  const pendingQueue = useMemo(() => {
    return items.filter((item) => item.status === 'pending');
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
      toast.info("Ko'rib chiqilmagan so'rovlar mavjud emas");
      return;
    }
    setQueueIndex(0);
    const firstItem = pendingQueue[0];
    setSelectedItem(firstItem);
    setModalOpen(true);

    try {
      const res = await api.get(`/pendingNewAbonents/get-by-id/${firstItem._id}`);
      if (res.data?.ok && res.data?.data) {
        setSelectedItem(res.data.data);
      }
    } catch (e) {}
  };

  // Navbatda keyingisiga o'tish
  const handleNextInQueue = async () => {
    if (queueIndex < pendingQueue.length - 1) {
      const nextIdx = queueIndex + 1;
      const nextItem = pendingQueue[nextIdx];
      setQueueIndex(nextIdx);
      setSelectedItem(nextItem);

      try {
        const res = await api.get(`/pendingNewAbonents/get-by-id/${nextItem._id}`);
        if (res.data?.ok && res.data?.data) {
          setSelectedItem(res.data.data);
        }
      } catch (e) {}
    } else {
      toast.success("Navbatdagi barcha kutilayotgan so'rovlar ko'rib chiqildi!");
      setModalOpen(false);
    }
  };

  // Navbatda oldingisiga o'tish
  const handlePrevInQueue = async () => {
    if (queueIndex > 0) {
      const prevIdx = queueIndex - 1;
      const prevItem = pendingQueue[prevIdx];
      setQueueIndex(prevIdx);
      setSelectedItem(prevItem);

      try {
        const res = await api.get(`/pendingNewAbonents/get-by-id/${prevItem._id}`);
        if (res.data?.ok && res.data?.data) {
          setSelectedItem(res.data.data);
        }
      } catch (e) {}
    }
  };

  // Tasdiqlash
  const handleApprove = async (id: string): Promise<boolean> => {
    setActionLoading(true);
    setRowActionLoading(id);
    try {
      const res = await api.put(`/pendingNewAbonents/accept/${id}`);
      if (res.data?.ok) {
        toast.success(res.data?.message || 'Abonent muvaffaqiyatli yaratildi');
        fetchData();
        return true;
      } else {
        toast.error(res.data?.message || 'Tasdiqlashda xatolik yuz berdi');
        return false;
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.message || err.message || 'Tasdiqlashda xatolik yuz berdi';
      toast.error(errMsg);
      return false;
    } finally {
      setActionLoading(false);
      setRowActionLoading(null);
    }
  };

  // Rad etishni ochish (Modal ichidan)
  const handleRejectFromModal = (item: INewAbonentItem) => {
    setRowRejectItem(item);
    setRowRejectDialogOpen(true);
  };

  // Rad etishni ochish (Jadval qatoridan)
  const handleOpenRowReject = (item: INewAbonentItem) => {
    setRowRejectItem(item);
    setRowRejectDialogOpen(true);
  };

  // Rad etishni tasdiqlash
  const handleConfirmReject = async (reason: string) => {
    if (!rowRejectItem) return;
    setActionLoading(true);
    setRowActionLoading(rowRejectItem._id);
    try {
      const res = await api.put(`/pendingNewAbonents/cancel/${rowRejectItem._id}`, {
        reason
      });
      if (res.data?.ok) {
        toast.info('Ariza rad etildi va nazoratchiga xabar yuborildi');
        setRowRejectDialogOpen(false);
        setRowRejectItem(null);

        // Agar modal ochiq bo'lsa va avto-o'tish yoniq bo'lsa
        if (modalOpen && autoAdvance && queueIndex < pendingQueue.length - 1) {
          handleNextInQueue();
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
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b' }}>
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
              bgcolor: '#ffffff',
              borderColor: '#e2e8f0',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
            }}
          >
            Yangilash
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                JAMI SO'ROVLAR
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, color: '#1e293b' }}>
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
                bgcolor: '#eff6ff',
                color: '#3b82f6',
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #fed7aa',
              bgcolor: '#fffaf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#c2410c', fontWeight: 700 }}>
                KUTILAYOTGAN
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, color: '#ea580c' }}>
                {loading ? <Skeleton width={60} /> : stats.pending}
              </Typography>
              <Typography variant="caption" sx={{ color: '#c2410c', mt: 0.5, display: 'block' }}>
                Tasdiqlash navbatida
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: '#ffedd5',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconClock size={26} />
            </Box>
          </Card>
        </Grid>

        {/* Tasdiqlangan */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #bbf7d0',
              bgcolor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700 }}>
                TASDIQLANGAN
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, color: '#16a34a' }}>
                {loading ? <Skeleton width={60} /> : stats.approved}
              </Typography>
              <Typography variant="caption" sx={{ color: '#166534', mt: 0.5, display: 'block' }}>
                Abonent ochilgan
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: '#dcfce7',
                color: '#16a34a',
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #fecaca',
              bgcolor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 700 }}>
                BEKOR QILINGAN
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, color: '#dc2626' }}>
                {loading ? <Skeleton width={60} /> : stats.rejected}
              </Typography>
              <Typography variant="caption" sx={{ color: '#991b1b', mt: 0.5, display: 'block' }}>
                Rad etilgan so'rovlar
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: '#fee2e2',
                color: '#dc2626',
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
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
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
            borderBottom: '1px solid #f1f5f9'
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
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', width: 60 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Fuqaro (F.I.O / PINFL)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Manzil (Mahalla, Ko'cha)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Kadastr raqami</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Odam soni</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Nazoratchi / Sana</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Holati</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right', pr: 3 }}>Amallar</TableCell>
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
                    <Box sx={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <IconUser size={48} stroke={1.5} />
                      <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#64748b' }}>
                        So'rovlar topilmadi
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5 }}>
                        Tanlangan filtr yoki qidiruv bo'yicha hech qanday ariza mavjud emas
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row, index) => {
                  const isRowPending = row.status === 'pending';
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
                        bgcolor: isRowPending ? '#ffffff' : '#fcfcfd'
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
                              bgcolor: '#e0f2fe',
                              color: '#0284c7',
                              fontWeight: 700,
                              fontSize: '0.875rem'
                            }}
                          >
                            {rowFullName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
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
                          <IconMapPin size={16} color="#0284c7" />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {row.mahallaName}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', pl: 2.8 }}>
                          {row.streetName}
                        </Typography>
                      </TableCell>

                      {/* Kadastr raqami */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
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
                            bgcolor: '#f3e8ff',
                            color: '#7e22ce',
                            border: '1px solid #e9d5ff'
                          }}
                        />
                      </TableCell>

                      {/* Nazoratchi & Sana */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
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
                                color: '#0284c7',
                                bgcolor: '#f0f9ff',
                                '&:hover': { bgcolor: '#e0f2fe' }
                              }}
                            >
                              <IconEye size={18} />
                            </IconButton>
                          </Tooltip>

                          {isRowPending && (
                            <>
                              {/* Tezkor tasdiqlash */}
                              <Tooltip title="Tasdiqlash va Abonent Ochish">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleApprove(row._id)}
                                    disabled={isCurrentRowLoading}
                                    sx={{
                                      color: 'success.main',
                                      bgcolor: '#f0fdf4',
                                      '&:hover': { bgcolor: '#dcfce7' }
                                    }}
                                  >
                                    <IconCheck size={18} />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              {/* Rokirovka qilish */}
                              {/*
                              <Tooltip title="Rokirovka qilish">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenRokirovka(row)}
                                    disabled={isCurrentRowLoading}
                                    sx={{
                                      color: 'info.main',
                                      bgcolor: '#f0f9ff',
                                      '&:hover': { bgcolor: '#e0f2fe' }
                                    }}
                                  >
                                    <IconArrowsExchange size={18} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              */}
                              {/* Tezkor rad etish */}
                              <Tooltip title="Rad etish">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenRowReject(row)}
                                    disabled={isCurrentRowLoading}
                                    sx={{
                                      color: 'error.main',
                                      bgcolor: '#fef2f2',
                                      '&:hover': { bgcolor: '#fee2e2' }
                                    }}
                                  >
                                    <IconX size={18} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </>
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
    </Box>
  );
};

export default PendingNewAbonents;
