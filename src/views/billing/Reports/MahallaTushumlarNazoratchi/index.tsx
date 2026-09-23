import React, { useState, useEffect, useCallback } from 'react';
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
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  useTheme,
  alpha,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack,
  FileDownloadOutlined as FileDownloadIcon,
  PrintOutlined as PrintIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  RefreshOutlined as RefreshIcon,
  TrendingUp,
  AccountBalanceWallet,
  Percent,
  CheckCircle,
  CancelOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from 'utils/api';
import MainCard from 'ui-component/cards/MainCard';
import { toast } from 'react-toastify';
import ScheduleDialog from './ScheduleDialog';

interface IPlanRow {
  id: number;
  name: string;
  inspectorId?: number;
  inspectorName?: string;
  mahallaId?: number;
  mahallaName?: string;
  kunlikReja: number;
  bajarilishi: number;
  foiz: number;
  farqi: number;
}

interface IClassicRow {
  id: number;
  name: string;
  inspectorId?: number;
  inspectorName?: string;
  mahallaId?: number;
  mahallaName?: string;
  tushumSoni: number;
  summasi: number;
  allSumma: number;
  allCount: number;
}

interface IMahallaTushumlarReportResult {
  date: string;
  displayDate: string;
  reportMode: 'plan' | 'classic';
  paymentPartner?: 'ekopay' | 'paynet' | 'both' | 'all';
  groupBy?: 'inspector' | 'mahalla';
  partnerTitle?: string;
  company: {
    id: number;
    name: string;
    GROUP_ID_NAZORATCHILAR?: string;
  };
  planData?: {
    rows: IPlanRow[];
    jamiKunlikReja: number;
    jamiBajarilishi: number;
    jamiFoiz: number;
    jamiFarqi: number;
  };
  classicData?: {
    rows: IClassicRow[];
    jamiTushumSoni: number;
    jamiTushumSummasi: number;
  };
}

export default function MahallaTushumlarNazoratchi() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [reportMode, setReportMode] = useState<'plan' | 'classic'>('plan');
  const [paymentPartner, setPaymentPartner] = useState<'ekopay' | 'paynet' | 'both' | 'all'>('ekopay');
  const [groupBy, setGroupBy] = useState<'inspector' | 'mahalla'>('inspector');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IMahallaTushumlarReportResult | null>(null);

  // Dialogs
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [telegramDialogOpen, setTelegramDialogOpen] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/mahalla-tushumlar-nazoratchi', {
        params: {
          date,
          reportMode,
          paymentPartner,
          groupBy
        }
      });
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      toast.error(err.response?.data?.message || 'Hisobotni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [date, reportMode, paymentPartner, groupBy]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const response = await api.get('/reports/mahalla-tushumlar-nazoratchi/excel', {
        params: { date, reportMode, paymentPartner, groupBy },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Mahalla_tushumlar_${reportMode}_${paymentPartner}_${groupBy}_${date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel fayli muvaffaqiyatli yuklandi');
    } catch (err: any) {
      console.error('Excel export error:', err);
      toast.error('Excel yuklab olishda xatolik');
    } finally {
      setExportingExcel(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenTelegramDialog = () => {
    if (data?.company?.GROUP_ID_NAZORATCHILAR) {
      setTelegramChatId(data.company.GROUP_ID_NAZORATCHILAR);
    }
    setTelegramDialogOpen(true);
  };

  const handleSendTelegram = async () => {
    setSendingTelegram(true);
    try {
      const res = await api.post('/reports/mahalla-tushumlar-nazoratchi/send-telegram', {
        date,
        reportMode,
        paymentPartner,
        groupBy,
        chatId: telegramChatId.trim() || undefined
      });
      if (res.data?.ok || res.data?.success) {
        toast.success(res.data.message || 'Hisobot Telegram guruhga yuborildi');
        setTelegramDialogOpen(false);
      } else {
        toast.error(res.data?.message || 'Telegramga yuborishda xatolik');
      }
    } catch (err: any) {
      console.error('Send telegram error:', err);
      toast.error(err.response?.data?.message || 'Telegramga yuborishda xatolik');
    } finally {
      setSendingTelegram(false);
    }
  };

  const planSummary = data?.planData;
  const classicSummary = data?.classicData;

  return (
    <MainCard contentSX={{ padding: 2.5 }}>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report-area, #printable-report-area * {
            visibility: visible;
          }
          #printable-report-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header & Controls */}
      <Box className="no-print" sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between'
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Tooltip title="Orqaga">
              <IconButton onClick={() => navigate('/billing/reports')} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <ArrowBack />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Mahalla tushumlar
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Nazoratchilar kesimida kunlik tushumlar va reja monitoringi
              </Typography>
            </Box>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ScheduleIcon />}
              onClick={() => setScheduleDialogOpen(true)}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Rejalashtirish
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SendIcon />}
              onClick={handleOpenTelegramDialog}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Telegramga yuborish
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Chop etish
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={exportingExcel ? <CircularProgress size={18} color="inherit" /> : <FileDownloadIcon />}
              onClick={handleExportExcel}
              disabled={exportingExcel}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Excel yuklash
            </Button>
          </Stack>
        </Stack>

        {/* Filters Bar */}
        <Paper
          elevation={0}
          sx={{
            mt: 2.5,
            p: 2,
            backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : alpha('#f8fafc', 0.8),
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between'
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
              {/* Date picker */}
              <TextField
                type="date"
                label="Sana"
                size="small"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true }
                }}
                sx={{ minWidth: 160 }}
              />

              {/* Mode Toggle */}
              <ToggleButtonGroup
                value={reportMode}
                exclusive
                size="small"
                onChange={(_, next) => {
                  if (next) setReportMode(next);
                }}
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 2,
                    py: 0.8,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.secondary.main,
                      color: theme.palette.common.white,
                      '&:hover': {
                        backgroundColor: theme.palette.secondary.dark
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="plan">Reja bilan (Kunlik)</ToggleButton>
                <ToggleButton value="classic">Klassik (Summalar)</ToggleButton>
              </ToggleButtonGroup>

              {/* Group By Toggle */}
              <ToggleButtonGroup
                value={groupBy}
                exclusive
                size="small"
                onChange={(_, next) => {
                  if (next) setGroupBy(next);
                }}
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 1.5,
                    py: 0.8,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.warning.dark || '#f57c00',
                      color: theme.palette.common.white,
                      '&:hover': {
                        backgroundColor: theme.palette.warning.main || '#ff9800'
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="inspector">Faqat nazoratchi</ToggleButton>
                <ToggleButton value="mahalla">Mahalla kesimida</ToggleButton>
              </ToggleButtonGroup>

              {/* Partner Toggle */}
              <ToggleButtonGroup
                value={paymentPartner}
                exclusive
                size="small"
                onChange={(_, next) => {
                  if (next) setPaymentPartner(next);
                }}
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 1.5,
                    py: 0.8,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="ekopay">EcoPay</ToggleButton>
                <ToggleButton value="paynet">Paynet</ToggleButton>
                <ToggleButton value="both">EcoPay + Paynet</ToggleButton>
                <ToggleButton value="all">Barchasi</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Tooltip title="Yangilash">
              <Button
                variant="outlined"
                color="inherit"
                onClick={fetchReport}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                Yangilash
              </Button>
            </Tooltip>
          </Stack>
        </Paper>
      </Box>

      {/* Printable Area starts here */}
      <Box id="printable-report-area">
        {/* Printable Header (Visible on print & on screen) */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {data?.company?.name || 'Tashkilot'} — Mahalla tushumlar ({data?.displayDate || date})
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Hisobot turi: {reportMode === 'plan' ? 'Kunlik reja bajarilishi' : 'Klassik tushumlar tahlili'}
          </Typography>
        </Box>

        {/* KPI Cards (Plan Mode) */}
        {reportMode === 'plan' && planSummary && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      backgroundColor: alpha(theme.palette.info.main, 0.12),
                      color: theme.palette.info.main,
                      display: 'flex'
                    }}
                  >
                    <AccountBalanceWallet fontSize="small" />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    JAMI KUNLIK REJA
                  </Typography>
                </Stack>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {planSummary.jamiKunlikReja.toLocaleString()} <Typography component="span" variant="caption">so‘m</Typography>
                </Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      backgroundColor: alpha(theme.palette.success.main, 0.12),
                      color: theme.palette.success.main,
                      display: 'flex'
                    }}
                  >
                    <TrendingUp fontSize="small" />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    JAMI BAJARILISHI ({data?.partnerTitle || 'EcoPay'})
                  </Typography>
                </Stack>
                <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  {planSummary.jamiBajarilishi.toLocaleString()} <Typography component="span" variant="caption">so‘m</Typography>
                </Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.7) : theme.palette.background.paper
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      color: theme.palette.primary.main,
                      display: 'flex'
                    }}
                  >
                    <Percent fontSize="small" />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    BAJARILISH FOIZI
                  </Typography>
                </Stack>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color:
                      planSummary.jamiFoiz >= 100
                        ? theme.palette.success.main
                        : planSummary.jamiFoiz >= 60
                        ? theme.palette.warning.main
                        : theme.palette.error.main
                  }}
                >
                  {planSummary.jamiFoiz}%
                </Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.7) : theme.palette.background.paper
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      backgroundColor: alpha(
                        planSummary.jamiFarqi >= 0 ? theme.palette.success.main : theme.palette.error.main,
                        0.12
                      ),
                      color: planSummary.jamiFarqi >= 0 ? theme.palette.success.main : theme.palette.error.main,
                      display: 'flex'
                    }}
                  >
                    {planSummary.jamiFarqi >= 0 ? <CheckCircle fontSize="small" /> : <CancelOutlined fontSize="small" />}
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    FARQI (+ / -)
                  </Typography>
                </Stack>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: planSummary.jamiFarqi >= 0 ? theme.palette.success.main : theme.palette.error.main
                  }}
                >
                  {planSummary.jamiFarqi > 0 ? `+${planSummary.jamiFarqi.toLocaleString()}` : planSummary.jamiFarqi.toLocaleString()}{' '}
                  <Typography component="span" variant="caption">so‘m</Typography>
                </Typography>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* KPI Cards (Classic Mode) */}
        {reportMode === 'classic' && classicSummary && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.7) : theme.palette.background.paper
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  JAMI TO‘LOV TRANZAKSIYALARI
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mt: 1 }}>
                  {classicSummary.jamiTushumSoni.toLocaleString()} <Typography component="span" variant="caption">ta</Typography>
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.7) : theme.palette.background.paper
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  JAMI {data?.partnerTitle ? data.partnerTitle.toUpperCase() : 'HAMKOR'} TUSHUM SUMMASI
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.secondary.main, mt: 1 }}>
                  {classicSummary.jamiTushumSummasi.toLocaleString()} <Typography component="span" variant="caption">so‘m</Typography>
                </Typography>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Loading Indicator */}
        {loading ? (
          <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress color="secondary" />
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Hisobot ma'lumotlari hisoblanmoqda...
            </Typography>
          </Box>
        ) : (
          /* Report Table */
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Table size="small">
              <TableHead>
                {reportMode === 'plan' ? (
                  <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : theme.palette.action.hover }}>
                    <TableCell sx={{ fontWeight: 700, width: 50, py: 1.5 }}>T/r</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Nazoratchi F.I.Sh</TableCell>
                    {groupBy === 'mahalla' && (
                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Mahalla</TableCell>
                    )}
                    <TableCell align="right" sx={{ fontWeight: 700, py: 1.5 }}>Kunlik Reja (so‘m)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, py: 1.5 }}>Bajarilishi ({data?.partnerTitle || 'EcoPay'}) (so‘m)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, py: 1.5 }}>Foiz (%)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, py: 1.5 }}>Farqi (so‘m)</TableCell>
                  </TableRow>
                ) : (
                  <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : theme.palette.action.hover }}>
                    <TableCell sx={{ fontWeight: 700, width: 50, py: 1.5 }}>T/r</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Nazoratchi F.I.Sh</TableCell>
                    {groupBy === 'mahalla' && (
                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Mahalla</TableCell>
                    )}
                    <TableCell align="right" sx={{ fontWeight: 700, py: 1.5 }}>Tushum soni</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, py: 1.5 }}>{data?.partnerTitle || 'EcoPay'} summasi</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, py: 1.5 }}>Jami summa (so‘m)</TableCell>
                  </TableRow>
                )}
              </TableHead>

              <TableBody>
                {reportMode === 'plan' && planSummary?.rows && planSummary.rows.length > 0 ? (
                  <>
                    {planSummary.rows.map((row, idx) => {
                      const isHigh = row.foiz >= 100;
                      const isMedium = row.foiz >= 60;
                      return (
                        <TableRow
                          key={`${row.id}_${idx}`}
                          hover
                          sx={{
                            '&:nth-of-type(even)': {
                              backgroundColor: theme.palette.mode === 'dark' ? alpha('#ffffff', 0.02) : '#fcfcfc'
                            }
                          }}
                        >
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{idx + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {groupBy === 'mahalla' ? (row.inspectorName || row.name.split(' — ')[0]) : row.name}
                          </TableCell>
                          {groupBy === 'mahalla' && (
                            <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>
                              {row.mahallaName || (row.name.includes(' — ') ? row.name.split(' — ')[1] : '-')}
                            </TableCell>
                          )}
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {row.kunlikReja.toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                            {row.bajarilishi.toLocaleString()}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={`${row.foiz}%`}
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                backgroundColor: isHigh
                                  ? alpha(theme.palette.success.main, 0.15)
                                  : isMedium
                                  ? alpha(theme.palette.warning.main, 0.15)
                                  : alpha(theme.palette.error.main, 0.15),
                                color: isHigh
                                  ? theme.palette.success.main
                                  : isMedium
                                  ? theme.palette.warning.main
                                  : theme.palette.error.main
                              }}
                            />
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 600,
                              color: row.farqi >= 0 ? theme.palette.success.main : theme.palette.error.main
                            }}
                          >
                            {row.farqi > 0 ? `+${row.farqi.toLocaleString()}` : row.farqi.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {/* Total Summary Row */}
                    <TableRow
                      sx={{
                        backgroundColor:
                          theme.palette.mode === 'dark' ? alpha(theme.palette.secondary.main, 0.1) : alpha(theme.palette.secondary.light, 0.2),
                        '& td': {
                          fontWeight: 700,
                          py: 1.5,
                          borderTop: `2px solid ${theme.palette.divider}`
                        }
                      }}
                    >
                      <TableCell colSpan={groupBy === 'mahalla' ? 3 : 2} sx={{ fontWeight: 700 }}>
                        JAMI
                      </TableCell>
                      <TableCell align="right">
                        {planSummary.jamiKunlikReja.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                        {planSummary.jamiBajarilishi.toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={`${planSummary.jamiFoiz}%`}
                          color="secondary"
                          sx={{ fontWeight: 800 }}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: planSummary.jamiFarqi >= 0 ? theme.palette.success.main : theme.palette.error.main
                        }}
                      >
                        {planSummary.jamiFarqi > 0
                          ? `+${planSummary.jamiFarqi.toLocaleString()}`
                          : planSummary.jamiFarqi.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </>
                ) : reportMode === 'classic' && classicSummary?.rows && classicSummary.rows.length > 0 ? (
                  <>
                    {classicSummary.rows.map((row, idx) => (
                      <TableRow
                        key={`${row.id}_${idx}`}
                        hover
                        sx={{
                          '&:nth-of-type(even)': {
                            backgroundColor: theme.palette.mode === 'dark' ? alpha('#ffffff', 0.02) : '#fcfcfc'
                          }
                        }}
                      >
                        <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{idx + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {groupBy === 'mahalla' ? (row.inspectorName || row.name.split(' — ')[0]) : row.name}
                        </TableCell>
                        {groupBy === 'mahalla' && (
                          <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>
                            {row.mahallaName || (row.name.includes(' — ') ? row.name.split(' — ')[1] : '-')}
                          </TableCell>
                        )}
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          {row.tushumSoni.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                          {row.summasi.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {row.allSumma.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Classic Total Summary Row */}
                    <TableRow
                      sx={{
                        backgroundColor:
                          theme.palette.mode === 'dark' ? alpha(theme.palette.secondary.main, 0.1) : alpha(theme.palette.secondary.light, 0.2),
                        '& td': {
                          fontWeight: 700,
                          py: 1.5,
                          borderTop: `2px solid ${theme.palette.divider}`
                        }
                      }}
                    >
                      <TableCell colSpan={groupBy === 'mahalla' ? 3 : 2} sx={{ fontWeight: 700 }}>
                        JAMI
                      </TableCell>
                      <TableCell align="right">
                        {classicSummary.jamiTushumSoni.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.success.main }}>
                        {classicSummary.jamiTushumSummasi.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {classicSummary.jamiTushumSummasi.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={groupBy === 'mahalla' ? 7 : 6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Tanlangan sanada ma'lumotlar topilmadi
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Schedule Dialog */}
      <ScheduleDialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        onSuccess={() => {
          fetchReport();
        }}
      />

      {/* Telegram Instant Dispatch Dialog */}
      <Dialog
        open={telegramDialogOpen}
        onClose={() => !sendingTelegram && setTelegramDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Telegram guruhga yuborish</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Tanlangan sana ({date}) bo‘yicha nazoratchilar tushum hisoboti telegram guruhga matn ko‘rinishida yuboriladi.
          </Typography>
          <TextField
            fullWidth
            label="Telegram Guruh ID (ixtiyoriy)"
            size="small"
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
            placeholder={data?.company?.GROUP_ID_NAZORATCHILAR || 'Masalan: -100123456789'}
            helperText={
              data?.company?.GROUP_ID_NAZORATCHILAR
                ? `Bo‘sh qoldirilsa, tashkilotning guruhi (${data.company.GROUP_ID_NAZORATCHILAR}) ishlatiladi.`
                : 'Telegram chat yoki guruh ID raqami'
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setTelegramDialogOpen(false)} color="inherit" disabled={sendingTelegram}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleSendTelegram}
            variant="contained"
            color="primary"
            disabled={sendingTelegram}
            startIcon={sendingTelegram ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
          >
            {sendingTelegram ? 'Yuborilmoqda...' : 'Yuborish'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
