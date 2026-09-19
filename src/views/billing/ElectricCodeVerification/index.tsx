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
  IconCheck,
  IconX,
  IconClock,
  IconBolt as IconFast,
  IconCopy,
  IconBolt
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
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      {/* 1. Yuqori Header */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3
        }}
      >
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#1e293b' }}>
            Elektr kodi so'rovlarini tasdiqlash
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Nazoratchilar kiritgan HET elektr hisob raqamlari ma'lumotlarini tekshirish, tasdiqlash va bekor qilish
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<IconRefresh size={18} />}
            onClick={() => fetchData()}
            disabled={loading}
            sx={{ fontWeight: 600, borderRadius: '8px' }}
          >
            Yangilash
          </Button>

          {stats.pending > 0 && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<IconFast size={18} />}
              onClick={handleStartFastQueue}
              sx={{
                fontWeight: 700,
                borderRadius: '8px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)'
              }}
            >
              Tezkor ko'rib chiqish ({stats.pending})
            </Button>
          )}
        </Stack>
      </Stack>

      {/* 2. Statistik Kartalar (KPIs) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              bgcolor: statusTab === 'all' ? '#f0fdf4' : '#ffffff',
              borderColor: statusTab === 'all' ? '#86efac' : '#e2e8f0',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
            onClick={() => {
              setStatusTab('all');
              setPage(0);
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Jami so'rovlar
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {stats.total.toLocaleString()}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              bgcolor: statusTab === 'pending' ? '#fffbeb' : '#ffffff',
              borderColor: statusTab === 'pending' ? '#fcd34d' : '#e2e8f0',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
            onClick={() => {
              setStatusTab('pending');
              setPage(0);
            }}
          >
            <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 700 }}>
              ⏳ Kutilmoqda
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#b45309', mt: 0.5 }}>
              {stats.pending.toLocaleString()}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              bgcolor: statusTab === 'approved' ? '#f0fdf4' : '#ffffff',
              borderColor: statusTab === 'approved' ? '#86efac' : '#e2e8f0',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
            onClick={() => {
              setStatusTab('approved');
              setPage(0);
            }}
          >
            <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
              ✓ Tasdiqlangan
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>
              {stats.approved.toLocaleString()}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              bgcolor: statusTab === 'rejected' ? '#fef2f2' : '#ffffff',
              borderColor: statusTab === 'rejected' ? '#fca5a5' : '#e2e8f0',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
            onClick={() => {
              setStatusTab('rejected');
              setPage(0);
            }}
          >
            <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 700 }}>
              ✕ Bekor qilingan
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#b91c1c', mt: 0.5 }}>
              {stats.rejected.toLocaleString()}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Filtrlash va Qidiruv Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff'
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
        >
          {/* Status Tablar */}
          <Tabs
            value={statusTab}
            onChange={(_, val) => {
              setStatusTab(val);
              setPage(0);
            }}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 40 }}
          >
            <Tab label={`Barchasi (${stats.total})`} value="all" sx={{ fontWeight: 700, minHeight: 40 }} />
            <Tab label={`Kutilmoqda (${stats.pending})`} value="pending" sx={{ fontWeight: 700, minHeight: 40 }} />
            <Tab label={`Tasdiqlangan (${stats.approved})`} value="approved" sx={{ fontWeight: 700, minHeight: 40 }} />
            <Tab label={`Bekor qilingan (${stats.rejected})`} value="rejected" sx={{ fontWeight: 700, minHeight: 40 }} />
          </Tabs>

          {/* Qidiruv */}
          <Box sx={{ width: { xs: '100%', md: 360 } }}>
            <TextField
              placeholder="Hisob raqam, ETK, FIO yoki nazoratchi..."
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
                        <IconX size={16} />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }
              }}
            />
          </Box>
        </Stack>
      </Paper>

      {/* 4. Asosiy Jadval */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.8 }}>Chiqindi L/H</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.8 }}>Abonent (Billing vs HET)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.8 }}>Elektr kodi (ETK) & Hudud</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.8 }}>HET Holati</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.8 }}>Nazoratchi</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.8 }}>Sana</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.8 }}>Holat</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', py: 1.8 }}>
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
                    <IconBolt size={48} color="#cbd5e1" />
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
                      '&:hover': { bgcolor: '#f8fafc' },
                      transition: 'background-color 0.15s'
                    }}
                  >
                    {/* Chiqindi L/H */}
                    <TableCell>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
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
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          {row.billingdaFIO || "Billing FIO yo'q"}
                        </Typography>
                        {row.fio && row.fio !== row.billingdaFIO && (
                          <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600, display: 'block' }}>
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
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#b45309' }}>
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
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
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
                                  bgcolor: 'rgba(34, 197, 94, 0.1)',
                                  '&:hover': { bgcolor: 'rgba(34, 197, 94, 0.2)' }
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
                                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
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
                              bgcolor: 'rgba(2, 132, 199, 0.1)',
                              '&:hover': { bgcolor: 'rgba(2, 132, 199, 0.2)' }
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

        {/* Paginatsiya */}
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
          labelRowsPerPage="Sahifadagi qatorlar:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} dan ${count !== -1 ? count : `${to} dan ko'p`}`}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

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
