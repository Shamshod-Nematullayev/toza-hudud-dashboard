import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  TablePagination
} from '@mui/material';
import {
  ArrowBack,
  FileDownloadOutlined as FileDownloadIcon,
  SearchOutlined as SearchIcon,
  ClearOutlined as ClearIcon,
  RefreshOutlined as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  FlashOn as FlashOnIcon,
  PhoneCallback as PhoneIcon,
  SyncProblem as SyncIcon,
  MessageOutlined as MessageIcon,
  Block as BlockIcon,
  Autorenew as RepeatIcon,
  FiberNew as NewIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from 'utils/api';
import MainCard from 'ui-component/cards/MainCard';
import { toast } from 'react-toastify';

interface DebtorItem {
  _id: string;
  residentId: number;
  accountNumber: string;
  accountNumberEtk?: string;
  fullName: string;
  debtAmount: number;
  debtMonths: number;
  status: string;
  phoneStatus: string;
  primaryPhone?: string;
  primaryPhoneSource?: string;
  createdAt: string;
}

interface QueueMeta {
  title: string;
  subtitle: string;
  description: string;
  nextActionText: string;
  statusParams: Record<string, string>;
  color: 'error' | 'warning' | 'info' | 'secondary' | 'primary' | 'default';
  icon: React.ReactNode;
}

const queueMetaMap: Record<string, QueueMeta> = {
  ready_to_block: {
    title: "Elektrni o'chirishga tayyor abonentlar",
    subtitle: "Tayyor bloklash navbati",
    description: "Ushbu abonentlar bo'yicha barcha ogohlantirish va tekshiruv jarayonlari yakunlangan hamda elektr energiyasini o'chirish tayyor holatga kelgan.",
    nextActionText: "Elektr energiyasini bloklash",
    statusParams: { status: 'ready_to_block' },
    color: 'error',
    icon: <FlashOnIcon />
  },
  phone_action_required: {
    title: "Telefon raqami e'tibor talab etadigan abonentlar",
    subtitle: "Raqam xatlovi navbati",
    description: "Abonentlarning telefon raqami topilmagan, o'zgargan yoki qayta xatlov o'tkazish talab etiladi.",
    nextActionText: "Telefon raqamini kiritish / Xatlov",
    statusParams: { phoneStatus: 'not_found,no_phone,new' },
    color: 'warning',
    icon: <PhoneIcon />
  },
  het_verification_required: {
    title: "HET / Elektr kodi tekshiruvi talab etiladiganlar",
    subtitle: "HET sinxronizatsiya navbati",
    description: "Elektr hisob raqami (HET kodi) kiritilmagan yoki HET bazasiga sinxronizatsiya kutilmoqda.",
    nextActionText: "HET kodi / Sinxronlash",
    statusParams: { phoneStatus: 'needs_het_sync' },
    color: 'info',
    icon: <SyncIcon />
  },
  sms_processing: {
    title: "SMS ishlov berish jarayonidagi abonentlar",
    subtitle: "SMS yetkazish navbati",
    description: "Abonentlarga SMS ogohlantirish yuborilgan hamda yetkazib berilganlik tasdig'i kutilmoqda.",
    nextActionText: "SMS holatini kutish",
    statusParams: { status: 'sms_sent' },
    color: 'secondary',
    icon: <MessageIcon />
  },
  currently_blocked: {
    title: "Hozirda bloklangan abonentlar",
    subtitle: "Bloklanganlar navbati",
    description: "Elektr energiyasi o'chirilgan va qarzdorlik to'lanishi hamda qayta ulanishi kuzatilmoqda.",
    nextActionText: "To'lov / Qayta ulanishni kuzatish",
    statusParams: { status: 'blocked' },
    color: 'secondary',
    icon: <BlockIcon />
  },
  re_blocking_candidates: {
    title: "Qayta bloklash nomzodlari",
    subtitle: "Takroriy bloklash navbati",
    description: "Ilgari bloklangan, lekin takroriy qarzdorlik to'planib takroriy o'chirishga tushgan abonentlar.",
    nextActionText: "Qayta bloklash bosqichiga o'tkazish",
    statusParams: { status: 'awaiting_het_sync' },
    color: 'primary',
    icon: <RepeatIcon />
  },
  newly_identified: {
    title: "Yangi aniqlangan qarzdorlar",
    subtitle: "Boshlang'ich aniqlash navbati",
    description: "Tizimga yangi kiritilgan qarzdorlar, birinchi bosqich ogohlantirishi kutilmoqda.",
    nextActionText: "Boshlang'ich tekshiruv va SMS",
    statusParams: { status: 'debt_identified' },
    color: 'default',
    icon: <NewIcon />
  }
};

const statusTranslateMap: Record<string, string> = {
  ready_to_block: "O'chirishga tayyor",
  blocked: "Bloklangan",
  no_phone: "Raqam yo'q",
  no_het_account: "HET kodi yo'q",
  sms_sent: "SMS yuborildi",
  awaiting_het_sync: "HET kutilmoqda",
  debt_identified: "Qarzdor aniqlandi",
  resolved: "Hal qilindi"
};

function WorkQueueDetail() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { queueId } = useParams<{ queueId: string }>();
  const navigate = useNavigate();

  const meta = (queueId && queueMetaMap[queueId]) || {
    title: "Operatsion navbat",
    subtitle: "Navbat tafsilotlari",
    description: "Tanlangan operatsion navbat bo'yicha abonentlar ro'yxati.",
    nextActionText: "Keyingi harakat",
    statusParams: {},
    color: 'primary',
    icon: <PlayArrowIcon />
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [debtors, setDebtors] = useState<DebtorItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchQueueDebtors = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        ...meta.statusParams
      };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get('/debitors', { params });
      if (res.data?.success) {
        setDebtors(res.data.data || []);
        setTotalCount(res.data.meta?.total || 0);
      } else {
        toast.error('Navbat ma’lumotlarini yuklashda xatolik');
      }
    } catch (err) {
      console.error(err);
      toast.error('Ma’lumotlarni olishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueDebtors();
  }, [queueId, page, rowsPerPage, searchQuery]);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      Object.entries(meta.statusParams).forEach(([k, v]) => params.append(k, v));
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await api.get(`/debitors/excel?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `navbat_${queueId || 'debitors'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Navbat fayli Excel formatida yuklandi');
    } catch (err) {
      console.error(err);
      toast.error('Excel faylini yuklashda xatolik');
    } finally {
      setExporting(false);
    }
  };

  const totalQueueDebt = useMemo(() => {
    return debtors.reduce((sum, d) => sum + (d.debtAmount || 0), 0);
  }, [debtors]);

  const avgQueueDebt = useMemo(() => {
    return debtors.length > 0 ? Math.round(totalQueueDebt / debtors.length) : 0;
  }, [debtors, totalQueueDebt]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6 }}>
      {/* HEADER BAR */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/billing/debt-collection-center')}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Undirish markaziga qaytish
          </Button>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
              {meta.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {meta.subtitle} · {meta.description}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="success"
          startIcon={exporting ? <CircularProgress size={18} color="inherit" /> : <FileDownloadIcon />}
          onClick={handleExportExcel}
          disabled={exporting || loading}
          sx={{ borderRadius: 2.5, px: 3, py: 1, fontWeight: 700 }}
        >
          {exporting ? 'Yuklanmoqda...' : 'Excelga yuklash'}
        </Button>
      </Box>

      {/* QUEUE SUMMARY METRICS */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
              Navbatdagi jami abonentlar
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: `${meta.color}.main` }}>
              {totalCount.toLocaleString()} ta
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
              Sahifadagi jami qarz
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'text.primary' }}>
              {totalQueueDebt.toLocaleString()} so'm
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
              O'rtacha qarz (1 abonentga)
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'secondary.main' }}>
              {avgQueueDebt.toLocaleString()} so'm
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* TABLE & SEARCH CONTAINER */}
      <Card
        sx={{
          borderRadius: 3.5,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Operatsion navbat ro'yxati
            </Typography>
            <Chip label={`${totalCount} abonent`} size="small" color={meta.color as any} sx={{ fontWeight: 700 }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TextField
              size="small"
              placeholder="F.I.Sh yoki hisob raqam bo'yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: searchQuery ? (
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ) : null
                }
              }}
              sx={{ width: { xs: '100%', sm: 340 } }}
            />

            <Tooltip title="Yangilash">
              <IconButton onClick={fetchQueueDebtors} color="primary" sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress color="secondary" size={40} />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: isDark ? alpha(theme.palette.common.white, 0.04) : theme.palette.grey[100] }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>T/R</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Abonent F.I.Sh</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Hisob kodi</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>HET kodi</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Qarz summasi
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Qarz oylari
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Telefon</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Holat</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      NAVBATDAGI HARAKAT
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', width: 70 }}>
                      Karta
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {debtors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        Ushbu operatsion navbatda abonentlar topilmadi
                      </TableCell>
                    </TableRow>
                  ) : (
                    debtors.map((d, index) => (
                      <TableRow key={d._id} hover>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontFamily: 'monospace' }}>
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: 'secondary.main',
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                            onClick={() => navigate(`/billing/abonents/${d.residentId}`)}
                          >
                            {d.fullName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{d.accountNumber}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{d.accountNumberEtk || '—'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontFamily: 'monospace', color: `${meta.color}.main` }}>
                          {d.debtAmount.toLocaleString()} so'm
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={`${d.debtMonths} oy`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {d.primaryPhone ? `+998${d.primaryPhone}` : <span style={{ opacity: 0.5 }}>Topilmadi</span>}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusTranslateMap[d.status] || d.status}
                            size="small"
                            color={meta.color as any}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={meta.nextActionText}
                            size="small"
                            variant="filled"
                            color={meta.color as any}
                            sx={{ fontWeight: 700, px: 0.5 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Abonent kartasiga o'tish">
                            <IconButton size="small" color="secondary" onClick={() => navigate(`/billing/abonents/${d.residentId}`)}>
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Card>
    </Box>
  );
}

export default WorkQueueDetail;
