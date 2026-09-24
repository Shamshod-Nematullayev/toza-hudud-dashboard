import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Stack,
  useTheme,
  alpha,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack,
  FileDownloadOutlined as FileDownloadIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  RefreshOutlined as RefreshIcon,
  TrendingUp,
  AccountBalanceWallet,
  CheckCircle,
  WarningAmber,
  ErrorOutlined,
  Search as SearchIcon,
  CalendarToday,
  LocationCity,
  Groups,
  Payment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from 'utils/api';
import MainCard from 'ui-component/cards/MainCard';
import { toast } from 'react-toastify';
import ScheduleDialog from './ScheduleDialog';
import TelegramGroupSelect from '../components/TelegramGroupSelect';

interface IMFYRow {
  id: number;
  name: string;
  inhabitantCount: number;
  organizationsCount: number;
  individualAccrualSum: number;
  legalAccrual: number;
  xisoblandi: number;
  tushum: number;
  foiz: number;
  farqi: number;
  cashAmount: number;
  terminalAmount: number;
  bankAmount: number;
  munisAmount: number;
  emoneyAmount: number;
  individualPaidCount: number;
}

interface IMFYSummary {
  totalMahallas: number;
  jamiXisoblandi: number;
  jamiTushum: number;
  jamiFoiz: number;
  jamiFarqi: number;
  jamiAholi: number;
  jamiTashkilotlar: number;
  jamiTolovchilar: number;
  completedCount: number;
  partialCount: number;
  lowCount: number;
  totalCash: number;
  totalTerminal: number;
  totalBank: number;
  totalMunis: number;
  totalEmoney: number;
}

interface IMFYReportData {
  rows: IMFYRow[];
  summary: IMFYSummary;
  company: {
    id: number;
    name: string;
    locationName?: string;
    GROUP_ID_MANAGERS?: string;
    GROUP_ID_NAZORATCHILAR?: string;
  };
  dateFrom: string;
  dateTo: string;
  onlyEkopay?: boolean;
  paymentPartner?: 'all' | 'both' | 'ekopay' | 'paynet';
}

export default function MFYIncomeReport() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Filters
  const [dateFrom, setDateFrom] = useState<string>(
    dayjs().startOf('month').format('YYYY-MM-DD')
  );
  const [dateTo, setDateTo] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [paymentPartner, setPaymentPartner] = useState<'all' | 'both' | 'ekopay' | 'paynet'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<keyof IMFYRow>('foiz');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Data & loading states
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IMFYReportData | null>(null);

  // Dialog states
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [telegramDialogOpen, setTelegramDialogOpen] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [deleteLastReport, setDeleteLastReport] = useState(true);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Quick date presets
  const handleQuickDate = (type: 'today' | 'thisMonth' | 'lastMonth') => {
    const today = dayjs();
    if (type === 'today') {
      setDateFrom(today.format('YYYY-MM-DD'));
      setDateTo(today.format('YYYY-MM-DD'));
    } else if (type === 'thisMonth') {
      setDateFrom(today.startOf('month').format('YYYY-MM-DD'));
      setDateTo(today.format('YYYY-MM-DD'));
    } else if (type === 'lastMonth') {
      const lastMonth = today.subtract(1, 'month');
      setDateFrom(lastMonth.startOf('month').format('YYYY-MM-DD'));
      setDateTo(lastMonth.endOf('month').format('YYYY-MM-DD'));
    }
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/mfy-incomes', {
        params: {
          dateFrom,
          dateTo,
          paymentPartner
        }
      });
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Fetch MFY report error:', err);
      toast.error(err.response?.data?.message || 'MFY hisobotini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, paymentPartner]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const response = await api.get('/reports/mfy-incomes/excel', {
        params: { dateFrom, dateTo, paymentPartner },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MFY_Tushumlar_${paymentPartner}_${dateFrom}_${dateTo}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel hisoboti muvaffaqiyatli yuklandi');
    } catch (err: any) {
      console.error('Excel export error:', err);
      toast.error('Excel yuklab olishda xatolik yuz berdi');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleOpenTelegramDialog = () => {
    if (data?.company?.GROUP_ID_MANAGERS || data?.company?.GROUP_ID_NAZORATCHILAR) {
      setTelegramChatId(
        data.company.GROUP_ID_MANAGERS || data.company.GROUP_ID_NAZORATCHILAR || ''
      );
    }
    setTelegramDialogOpen(true);
  };

  const handleSendTelegram = async () => {
    setSendingTelegram(true);
    try {
      const res = await api.post('/reports/mfy-incomes/send-telegram', {
        dateFrom,
        dateTo,
        paymentPartner,
        chatId: telegramChatId.trim() || undefined,
        deleteLastReport
      });
      if (res.data?.ok || res.data?.success) {
        toast.success(res.data.message || 'Hisobot Telegram guruhga rasm formatida yuborildi');
        setTelegramDialogOpen(false);
      } else {
        toast.error(res.data?.message || 'Yuborishda xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Telegram send error:', err);
      toast.error(err?.response?.data?.message || 'Telegramga yuborishda xatolik yuz berdi');
    } finally {
      setSendingTelegram(false);
    }
  };

  const handleSort = (field: keyof IMFYRow) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filtered & Sorted Rows
  const filteredRows = useMemo(() => {
    if (!data?.rows) return [];
    let list = [...data.rows];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || String(r.id).includes(q));
    }

    list.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc'
        ? Number(valA) - Number(valB)
        : Number(valB) - Number(valA);
    });

    return list;
  }, [data?.rows, searchQuery, sortField, sortOrder]);

  const summary = data?.summary;

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      {/* 1. Header Toolbar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/billing/reports')}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Mahallalar Tushumlar Tahlili (MFY)
              </Typography>
              {data && (
                <Chip
                  label={`${data.summary.totalMahallas} ta mahalla`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              TozaMakon MFA-16 hisoblangan reja va to‘lov turlari bo‘yicha tushumlar hisoboti
            </Typography>
          </Box>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ScheduleIcon />}
            onClick={() => setScheduleDialogOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Rejalashtirish
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<SendIcon />}
            onClick={handleOpenTelegramDialog}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Telegramga yuborish
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={exportingExcel ? <CircularProgress size={18} color="inherit" /> : <FileDownloadIcon />}
            onClick={handleExportExcel}
            disabled={exportingExcel || loading}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Excel yuklab olish
          </Button>

          <Tooltip title="Qayta yuklash">
            <IconButton
              onClick={fetchReport}
              disabled={loading}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* 2. Filters & Search Bar */}
      <Card sx={{ p: 2.5, mb: 3, boxShadow: 1, borderRadius: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          {/* Davr: Boshlanish sanasi */}
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              fullWidth
              label="Boshlanish sanasi"
              type="date"
              size="small"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true }
              }}
            />
          </Grid>

          {/* Davr: Tugash sanasi */}
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              fullWidth
              label="Tugash sanasi"
              type="date"
              size="small"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true }
              }}
            />
          </Grid>

          {/* Quick presets */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                label="Bugun"
                size="small"
                variant={dateFrom === dayjs().format('YYYY-MM-DD') && dateTo === dayjs().format('YYYY-MM-DD') ? 'filled' : 'outlined'}
                color="primary"
                onClick={() => handleQuickDate('today')}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              />
              <Chip
                label="Shu oy"
                size="small"
                variant={dateFrom === dayjs().startOf('month').format('YYYY-MM-DD') ? 'filled' : 'outlined'}
                color="primary"
                onClick={() => handleQuickDate('thisMonth')}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              />
              <Chip
                label="O‘tgan oy"
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => handleQuickDate('lastMonth')}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              />
            </Stack>
          </Grid>

          {/* To'lov turi filtri */}
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl component="fieldset" size="small" fullWidth>
              <RadioGroup
                row
                value={paymentPartner}
                onChange={(e) => setPaymentPartner(e.target.value as any)}
                sx={{ flexWrap: 'nowrap', overflowX: 'auto' }}
              >
                <FormControlLabel
                  value="all"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>Barchasi</Typography>}
                />
                <FormControlLabel
                  value="both"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>Eco+Paynet</Typography>}
                />
                <FormControlLabel
                  value="ekopay"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>EcoPay</Typography>}
                />
                <FormControlLabel
                  value="paynet"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>Paynet</Typography>}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Qidiruv */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Mahallani qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* 3. KPI Analytics Cards */}
      {summary && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Jami Reja */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                boxShadow: 1,
                bgcolor: 'background.paper',
                borderLeft: `5px solid ${theme.palette.info.main}`
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  JAMI REJA (HISOBLANDI)
                </Typography>
                <AccountBalanceWallet sx={{ color: 'info.main', fontSize: 28 }} />
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                {Math.round(summary.jamiXisoblandi).toLocaleString('uz-UZ')} so‘m
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {summary.totalMahallas} ta mahalla bo‘yicha hisoblangan summa
              </Typography>
            </Card>
          </Grid>

          {/* Jami Tushum */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                boxShadow: 1,
                bgcolor: 'background.paper',
                borderLeft: `5px solid ${theme.palette.success.main}`
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  JAMI TUSHUM
                </Typography>
                <TrendingUp sx={{ color: 'success.main', fontSize: 28 }} />
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.dark', mb: 0.5 }}>
                {Math.round(summary.jamiTushum).toLocaleString('uz-UZ')} so‘m
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {onlyEkopay ? 'Faqat EcoPay to‘lovlari' : 'Barcha to‘lov turlari jamlanmasi'}
              </Typography>
            </Card>
          </Grid>

          {/* Umumiy Bajarilish Foizi */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                boxShadow: 1,
                bgcolor: 'background.paper',
                borderLeft: `5px solid ${summary.jamiFoiz >= 100 ? theme.palette.success.main : theme.palette.warning.main}`
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  UMUMIY BAJARILISH
                </Typography>
                <Chip
                  label={`${summary.jamiFoiz}%`}
                  color={summary.jamiFoiz >= 100 ? 'success' : summary.jamiFoiz >= 50 ? 'warning' : 'error'}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                {summary.jamiFoiz}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(summary.jamiFoiz, 100)}
                color={summary.jamiFoiz >= 100 ? 'success' : summary.jamiFoiz >= 50 ? 'warning' : 'error'}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Card>
          </Grid>

          {/* Farqi */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                boxShadow: 1,
                bgcolor: 'background.paper',
                borderLeft: `5px solid ${summary.jamiFarqi >= 0 ? theme.palette.success.main : theme.palette.error.main}`
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  FARQI (KASSA / DEFITSIT)
                </Typography>
                {summary.jamiFarqi >= 0 ? (
                  <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
                ) : (
                  <ErrorOutlined sx={{ color: 'error.main', fontSize: 28 }} />
                )}
              </Stack>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: summary.jamiFarqi >= 0 ? 'success.main' : 'error.main',
                  mb: 0.5
                }}
              >
                {summary.jamiFarqi >= 0 ? '+' : ''}
                {Math.round(summary.jamiFarqi).toLocaleString('uz-UZ')} so‘m
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {summary.jamiFarqi >= 0 ? 'Rejadan ortiq tushum' : 'Reja bajarilishiga yetishmagan summa'}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 4. Second Level Breakdown: Mahalla taqsimoti va To'lov usullari */}
      {summary && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Mahalla Bajarilish Taqsimoti */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                Mahallalar Ko‘rsatkichlari Taqsimoti
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ textAlign: 'center', p: 1.5, flex: 1, bgcolor: 'success.lighter', borderRadius: 1.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.dark' }}>
                    {summary.completedCount}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 600 }}>
                    100%+ (Bajarilgan)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1.5, flex: 1, bgcolor: 'warning.lighter', borderRadius: 1.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                    {summary.partialCount}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                    50% - 99% (Qisman)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1.5, flex: 1, bgcolor: 'error.lighter', borderRadius: 1.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.dark' }}>
                    {summary.lowCount}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'error.dark', fontWeight: 600 }}>
                    &lt;50% (Past)
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* To'lov Turlari Jamlanmasi */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                To‘lov Kanallari Bo‘yicha Jamlanma
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'action.hover', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Naqd</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {Math.round(summary.totalCash).toLocaleString('uz-UZ')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'action.hover', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Terminal</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {Math.round(summary.totalTerminal).toLocaleString('uz-UZ')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'action.hover', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Bank</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {Math.round(summary.totalBank).toLocaleString('uz-UZ')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'action.hover', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Munis</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {Math.round(summary.totalMunis).toLocaleString('uz-UZ')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 2.4 }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.lighter', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 600 }}>Elektron Pul</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                      {Math.round(summary.totalEmoney).toLocaleString('uz-UZ')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 5. Main Data Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CircularProgress size={44} />
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
              MFY hisobot ma’lumotlari hisoblanmoqda...
            </Typography>
          </Box>
        ) : filteredRows.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" sx={{ color: 'text.secondary', mb: 1 }}>
              Ma’lumot topilmadi
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              Tanlangan sana yoki qidiruv so‘rovi bo‘yicha hisobot mavjud emas
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ '& th': { bgcolor: 'background.paper', fontWeight: 700 } }}>
                  <TableCell width={50} align="center">№</TableCell>
                  <TableCell
                    onClick={() => handleSort('name')}
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Mahalla Nomi {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </TableCell>
                  <TableCell align="right" onClick={() => handleSort('inhabitantCount')} sx={{ cursor: 'pointer' }}>
                    Aholi {sortField === 'inhabitantCount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </TableCell>
                  <TableCell align="right" onClick={() => handleSort('xisoblandi')} sx={{ cursor: 'pointer' }}>
                    Reja (so‘m) {sortField === 'xisoblandi' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </TableCell>
                  <TableCell align="right" onClick={() => handleSort('tushum')} sx={{ cursor: 'pointer' }}>
                    Tushum (so‘m) {sortField === 'tushum' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </TableCell>
                  <TableCell align="center" onClick={() => handleSort('foiz')} sx={{ cursor: 'pointer' }}>
                    Foiz {sortField === 'foiz' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </TableCell>
                  <TableCell align="right" onClick={() => handleSort('farqi')} sx={{ cursor: 'pointer' }}>
                    Farqi (so‘m) {sortField === 'farqi' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </TableCell>
                  <TableCell align="right">Naqd</TableCell>
                  <TableCell align="right">Terminal</TableCell>
                  <TableCell align="right">Bank</TableCell>
                  <TableCell align="right">Munis</TableCell>
                  <TableCell align="right">Elektron Pul</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredRows.map((row, index) => {
                  const isPositive = row.farqi >= 0;
                  const pct = row.foiz;
                  return (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        '&:nth-of-type(even)': { bgcolor: 'action.hover' }
                      }}
                    >
                      <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {row.name}
                      </TableCell>
                      <TableCell align="right">
                        {row.inhabitantCount.toLocaleString('uz-UZ')}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {Math.round(row.xisoblandi).toLocaleString('uz-UZ')}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {Math.round(row.tushum).toLocaleString('uz-UZ')}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${pct}%`}
                          size="small"
                          color={pct >= 100 ? 'success' : pct >= 50 ? 'warning' : 'error'}
                          variant="filled"
                          sx={{ fontWeight: 700, minWidth: 62 }}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 600,
                          color: isPositive ? 'success.main' : 'error.main'
                        }}
                      >
                        {isPositive ? '+' : ''}
                        {Math.round(row.farqi).toLocaleString('uz-UZ')}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>
                        {row.cashAmount > 0 ? Math.round(row.cashAmount).toLocaleString('uz-UZ') : '—'}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>
                        {row.terminalAmount > 0 ? Math.round(row.terminalAmount).toLocaleString('uz-UZ') : '—'}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>
                        {row.bankAmount > 0 ? Math.round(row.bankAmount).toLocaleString('uz-UZ') : '—'}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>
                        {row.munisAmount > 0 ? Math.round(row.munisAmount).toLocaleString('uz-UZ') : '—'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {row.emoneyAmount > 0 ? Math.round(row.emoneyAmount).toLocaleString('uz-UZ') : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Totals Row */}
                {summary && (
                  <TableRow
                    sx={{
                      bgcolor: 'action.selected',
                      '& td': { fontWeight: 700, fontSize: '0.925rem' }
                    }}
                  >
                    <TableCell align="center">Σ</TableCell>
                    <TableCell>JAMI ({filteredRows.length} ta mahalla)</TableCell>
                    <TableCell align="right">{summary.jamiAholi.toLocaleString('uz-UZ')}</TableCell>
                    <TableCell align="right">{Math.round(summary.jamiXisoblandi).toLocaleString('uz-UZ')}</TableCell>
                    <TableCell align="right">{Math.round(summary.jamiTushum).toLocaleString('uz-UZ')}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${summary.jamiFoiz}%`}
                        color={summary.jamiFoiz >= 100 ? 'success' : 'warning'}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: summary.jamiFarqi >= 0 ? 'success.main' : 'error.main' }}
                    >
                      {summary.jamiFarqi >= 0 ? '+' : ''}
                      {Math.round(summary.jamiFarqi).toLocaleString('uz-UZ')}
                    </TableCell>
                    <TableCell align="right">{Math.round(summary.totalCash).toLocaleString('uz-UZ')}</TableCell>
                    <TableCell align="right">{Math.round(summary.totalTerminal).toLocaleString('uz-UZ')}</TableCell>
                    <TableCell align="right">{Math.round(summary.totalBank).toLocaleString('uz-UZ')}</TableCell>
                    <TableCell align="right">{Math.round(summary.totalMunis).toLocaleString('uz-UZ')}</TableCell>
                    <TableCell align="right">{Math.round(summary.totalEmoney).toLocaleString('uz-UZ')}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* 6. Telegramga Yuborish Dialogi */}
      <Dialog
        open={telegramDialogOpen}
        onClose={() => !sendingTelegram && setTelegramDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <SendIcon color="secondary" />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Telegram Guruhga Yuborish
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Tanlangan davr ({dateFrom} dan {dateTo} gacha) bo‘yicha MFY tushumlar hisoboti Telegram guruhga rasm formatida yuboriladi.
          </Typography>

          <Stack spacing={2}>
            <TelegramGroupSelect
              label="Yuboriladigan Telegram Guruh"
              value={telegramChatId}
              defaultChatId={data?.company?.GROUP_ID_MANAGERS || data?.company?.GROUP_ID_NAZORATCHILAR || ''}
              onChange={(selectedId) => setTelegramChatId(selectedId)}
              helperText="Hisobot faqat tashkilotning rasmiy Telegram guruhlariga yuboriladi"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={deleteLastReport}
                  onChange={(e) => setDeleteLastReport(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Oldingi yuborilgan hisobot xabarini guruhdan o‘chirish
                </Typography>
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setTelegramDialogOpen(false)}
            color="inherit"
            disabled={sendingTelegram}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleSendTelegram}
            variant="contained"
            color="secondary"
            disabled={sendingTelegram}
            startIcon={sendingTelegram ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
          >
            {sendingTelegram ? 'Yuborilmoqda...' : 'Hozir yuborish'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 7. Rejalashtirilgan Yuborishlar (Schedule) Dialogi */}
      <ScheduleDialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        onSuccess={() => toast.success('Jadval muvaffaqiyatli saqlandi')}
      />
    </Box>
  );
}
