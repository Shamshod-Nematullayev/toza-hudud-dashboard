import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  ChevronLeft,
  ChevronRight,
  Refresh,
  AssignmentTurnedIn,
  HourglassTop,
  CancelOutlined,
  DescriptionOutlined,
  PeopleOutlined,
  ReceiptLongOutlined,
  ContentCopyOutlined,
  SwapHorizOutlined,
  GpsFixedOutlined,
  PersonRemoveOutlined,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from 'utils/api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface IArizalarSummary {
  totalCount: number;
  totalAktSummasi: number;
  confirmedCount: number;
  aktKiritilganCount: number;
  inProgressCount: number;
  canceledCount: number;
  inhabitantsDiff: number;
}

interface IDocumentTypeStat {
  _id: string;
  count: number;
  totalSumma: number;
  inhabitantsDiff?: number;
}

interface IStatusStat {
  _id: string;
  count: number;
  totalSumma: number;
}

interface IArizalarMonthlyReport {
  month: string;
  summary: IArizalarSummary;
  byStatus: IStatusStat[];
  byActStatus: Array<{ _id: string; count: number }>;
  byDocumentType: IDocumentTypeStat[];
  dailyStats: Array<{ _id: number; count: number; totalSumma: number }>;
}

type StatusFilterType = 'all' | 'pending' | 'act_kiritilgan' | 'confirmed' | 'canceled';

const fmt = (n?: number) => new Intl.NumberFormat('uz-UZ').format(n || 0);
const fmtMoney = (n?: number) => fmt(n) + " so'm";

const docTypeMeta: Record<string, { labelKey: string; defaultLabel: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  odam_soni: {
    labelKey: 'dashboard.docTypes.odam_soni',
    defaultLabel: 'Odam soni',
    icon: <PeopleOutlined sx={{ fontSize: 20 }} />,
    color: '#0284c7',
    bgColor: 'rgba(2, 132, 199, 0.08)'
  },
  viza: {
    labelKey: 'dashboard.docTypes.viza',
    defaultLabel: 'Qayta hisob-kitob (Viza)',
    icon: <ReceiptLongOutlined sx={{ fontSize: 20 }} />,
    color: '#7c3aed',
    bgColor: 'rgba(124, 58, 237, 0.08)'
  },
  dvaynik: {
    labelKey: 'dashboard.docTypes.dvaynik',
    defaultLabel: 'Dublikat litseshyot',
    icon: <ContentCopyOutlined sx={{ fontSize: 20 }} />,
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.08)'
  },
  pul_kuchirish: {
    labelKey: 'dashboard.docTypes.pul_kuchirish',
    defaultLabel: "Pul ko'chirish",
    icon: <SwapHorizOutlined sx={{ fontSize: 20 }} />,
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.08)'
  },
  death: {
    labelKey: 'dashboard.docTypes.death',
    defaultLabel: 'Vafot etganlik',
    icon: <PersonRemoveOutlined sx={{ fontSize: 20 }} />,
    color: '#475569',
    bgColor: 'rgba(71, 85, 105, 0.08)'
  },
  gps: {
    labelKey: 'dashboard.docTypes.gps',
    defaultLabel: 'GPS dalolatnoma',
    icon: <GpsFixedOutlined sx={{ fontSize: 20 }} />,
    color: '#ea580c',
    bgColor: 'rgba(234, 88, 12, 0.08)'
  }
};

export default function ArizalarReportWidget() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [selectedMonth, setSelectedMonth] = useState<string>(() => dayjs().format('YYYY-MM'));
  const [loading, setLoading] = useState<boolean>(true);
  const [report, setReport] = useState<IArizalarMonthlyReport | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilterType>('all');

  const darkYellowColor = theme.palette.mode === 'dark' ? '#fcd34d' : '#b45309';

  const fetchReport = async (month: string) => {
    setLoading(true);
    try {
      const { data } = await api.get('/statistics/arizalar-monthly-report', {
        params: { month }
      });
      if (data?.data) {
        setReport(data.data);
      }
    } catch (err) {
      console.error('Failed to load arizalar report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedMonth);
  }, [selectedMonth]);

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => dayjs(prev).subtract(1, 'month').format('YYYY-MM'));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => dayjs(prev).add(1, 'month').format('YYYY-MM'));
  };

  const summary = report?.summary || {
    totalCount: 0,
    totalAktSummasi: 0,
    confirmedCount: 0,
    aktKiritilganCount: 0,
    inProgressCount: 0,
    canceledCount: 0,
    inhabitantsDiff: 0
  };

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: '20px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header: Sarlavha & Oy navigatsiyasi */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2.5
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                bgcolor: 'rgba(99, 102, 241, 0.1)',
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DescriptionOutlined sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a237e' }}>
                {t('dashboard.arizalarMonthlyReportTitle', 'Arizalar Oylik Hisoboti')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}>
                {t('dashboard.arizalarMonthlyReportSubtitle', "Ariza obyektiga kirgan ma'lumotlarning oylik tahlili")}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Oyni almashtirish boshqaruvi */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: '12px',
              p: 0.5,
              border: '1px solid rgba(0,0,0,0.08)'
            }}
          >
            <Tooltip title={t('dashboard.prevMonth', 'Oldingi oy')}>
              <IconButton size="small" onClick={handlePrevMonth} sx={{ color: 'text.primary' }}>
                <ChevronLeft fontSize="small" />
              </IconButton>
            </Tooltip>

            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                px: 1.5,
                minWidth: 120,
                textAlign: 'center',
                textTransform: 'capitalize'
              }}
            >
              {selectedMonth.split('-').reverse().join('.')}
            </Typography>

            <Tooltip title={t('dashboard.nextMonth', 'Keyingi oy')}>
              <IconButton size="small" onClick={handleNextMonth} sx={{ color: 'text.primary' }}>
                <ChevronRight fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Tooltip title={t('dashboard.refresh', 'Yangilash')}>
            <IconButton
              size="small"
              onClick={() => fetchReport(selectedMonth)}
              sx={{
                bgcolor: 'rgba(99, 102, 241, 0.08)',
                color: '#6366f1',
                borderRadius: '10px',
                p: 1,
                '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.16)' }
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>

          <Button
            variant="text"
            size="small"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/billing/recalculation')}
            sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            {t('dashboard.details', 'Batafsil →')}
          </Button>
        </Stack>
      </Stack>

      {/* 4 Ta Bosiladigan (Filter) Kartalar */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {/* 1. Jami arizalar */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box
            onClick={() => setActiveFilter('all')}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: activeFilter === 'all' ? 'rgba(33, 150, 243, 0.14)' : 'rgba(33, 150, 243, 0.06)',
              border: activeFilter === 'all' ? '2px solid #1976d2' : '1px solid rgba(33, 150, 243, 0.2)',
              boxShadow: activeFilter === 'all' ? '0 4px 12px rgba(25, 118, 210, 0.2)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)'
              }
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                {t('dashboard.totalArizas', 'Jami arizalar')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1976d2', mt: 0.5 }}>
                {loading ? '...' : fmt(summary.totalCount)} {t('dashboard.countUnit', 'ta')}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 700, display: 'block', mt: 0.5 }}>
              {loading ? '...' : fmtMoney(summary.totalAktSummasi)}
            </Typography>
          </Box>
        </Grid>

        {/* 2. Jarayonda (Yangi) */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box
            onClick={() => setActiveFilter('pending')}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: activeFilter === 'pending' ? 'rgba(245, 158, 11, 0.16)' : 'rgba(245, 158, 11, 0.08)',
              border: activeFilter === 'pending' ? `2px solid ${darkYellowColor}` : '1px solid rgba(245, 158, 11, 0.25)',
              boxShadow: activeFilter === 'pending' ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
              }
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                {t('dashboard.inProgressNew', 'Jarayonda (Yangi)')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: darkYellowColor, mt: 0.5 }}>
                {loading ? '...' : fmt(summary.inProgressCount)} {t('dashboard.countUnit', 'ta')}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: darkYellowColor, fontWeight: 700, display: 'block', mt: 0.5 }}>
              {summary.totalCount > 0 ? `${Math.round((summary.inProgressCount / summary.totalCount) * 100)}%` : '0%'}{' '}
              {t('dashboard.share', 'ulushi')}
            </Typography>
          </Box>
        </Grid>

        {/* 3. Akt kiritilgan / Tasdiqlangan */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box
            onClick={() => setActiveFilter('confirmed')}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: activeFilter === 'confirmed' ? 'rgba(34, 197, 94, 0.16)' : 'rgba(34, 197, 94, 0.08)',
              border: activeFilter === 'confirmed' ? '2px solid #15803d' : '1px solid rgba(34, 197, 94, 0.25)',
              boxShadow: activeFilter === 'confirmed' ? '0 4px 12px rgba(34, 197, 94, 0.2)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)'
              }
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                {t('dashboard.actEnteredConfirmed', 'Akt kiritilgan / Tasdiq')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>
                {loading ? '...' : fmt(summary.confirmedCount + summary.aktKiritilganCount)} {t('dashboard.countUnit', 'ta')}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, display: 'block', mt: 0.5 }}>
              {summary.totalCount > 0
                ? `${Math.round(((summary.confirmedCount + summary.aktKiritilganCount) / summary.totalCount) * 100)}%`
                : '0%'}{' '}
              {t('dashboard.executionRate', 'bajarildi')}
            </Typography>
          </Box>
        </Grid>

        {/* 4. Bekor qilingan */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box
            onClick={() => setActiveFilter('canceled')}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: activeFilter === 'canceled' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(239, 68, 68, 0.06)',
              border: activeFilter === 'canceled' ? '2px solid #dc2626' : '1px solid rgba(239, 68, 68, 0.2)',
              boxShadow: activeFilter === 'canceled' ? '0 4px 12px rgba(220, 38, 38, 0.2)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
              }
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                {t('dashboard.canceled', 'Bekor qilingan')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#dc2626', mt: 0.5 }}>
                {loading ? '...' : fmt(summary.canceledCount)} {t('dashboard.countUnit', 'ta')}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 700, display: 'block', mt: 0.5 }}>
              {summary.totalCount > 0 ? `${Math.round((summary.canceledCount / summary.totalCount) * 100)}%` : '0%'}{' '}
              {t('dashboard.share', 'ulushi')}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Hujjat turlari bo'yicha tahliliy jadval */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
        {t('dashboard.docTypesBreakdown', "Hujjat turlari bo'yicha taqsimot")}:
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', overflow: 'hidden' }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, py: 1 }}>{t('tableHeaders.documentType', 'Ariza turi')}</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1, textAlign: 'center' }}>{t('dashboard.requestCount', "So'rovlar soni")}</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1, textAlign: 'center' }}>{t('dashboard.share', 'Ulushi')}</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1, textAlign: 'right' }}>{t('dashboard.totalActSum', 'Jami akt summasi')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ py: 2, textAlign: 'center' }}>
                  <Skeleton height={32} />
                </TableCell>
              </TableRow>
            ) : !report?.byDocumentType || report.byDocumentType.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ py: 2.5, textAlign: 'center', color: 'text.secondary' }}>
                  {t('dashboard.noArizasThisMonth', 'Ushbu oy uchun hali hech qanday ariza kiritilmagan')}
                </TableCell>
              </TableRow>
            ) : (
              report.byDocumentType.map((item) => {
                const meta = docTypeMeta[item._id] || {
                  labelKey: '',
                  defaultLabel: item._id,
                  icon: <DescriptionOutlined sx={{ fontSize: 20 }} />,
                  color: '#6366f1',
                  bgColor: 'rgba(99, 102, 241, 0.08)'
                };
                const label = meta.labelKey ? t(meta.labelKey, meta.defaultLabel) : meta.defaultLabel;
                const percent = summary.totalCount > 0 ? Math.round((item.count / summary.totalCount) * 100) : 0;

                return (
                  <TableRow key={item._id} hover>
                    <TableCell sx={{ py: 1 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            bgcolor: meta.bgColor,
                            color: meta.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {meta.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {label}
                          </Typography>
                          {item._id === 'odam_soni' && item.inhabitantsDiff !== undefined && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: item.inhabitantsDiff >= 0 ? '#16a34a' : '#dc2626',
                                fontWeight: 700,
                                display: 'block'
                              }}
                            >
                              {item.inhabitantsDiff > 0 ? `+${fmt(item.inhabitantsDiff)}` : fmt(item.inhabitantsDiff)}{' '}
                              {t('dashboard.peopleDiff', 'kishi farq')}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell sx={{ py: 1, textAlign: 'center', fontWeight: 700, color: meta.color }}>
                      {fmt(item.count)} {t('dashboard.countUnit', 'ta')}
                    </TableCell>

                    <TableCell sx={{ py: 1, textAlign: 'center' }}>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.25,
                          borderRadius: '6px',
                          bgcolor: 'rgba(0,0,0,0.04)',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      >
                        {percent}%
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 1, textAlign: 'right', fontWeight: 700 }}>{fmtMoney(item.totalSumma)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
