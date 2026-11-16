import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Typography,
  Stack,
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
  LinearProgress,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  RefreshOutlined,
  SearchOutlined,
  SmartToyOutlined,
  SendOutlined,
  CheckCircleOutlineOutlined,
  WarningAmberOutlined,
  ErrorOutlineOutlined,
  ArrowForwardIosOutlined,
  Telegram,
  PauseCircleOutlineOutlined,
  CancelOutlined,
  PieChartOutlined
} from '@mui/icons-material';
import api from 'utils/api';
import dayjs from 'dayjs';

interface ICompanyReportMetrics {
  companyId: number;
  companyName: string;
  isSubscriptionActive: boolean;
  activeExpiresDate?: string | null;
  totalAvailableReports: number;
  enabledReportsCount: number;
  reportAdoptionRate: number;
  expectedDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  reportDeliverySuccessRate: number;
  problemCategory: 'full_active' | 'partial' | 'telegram_error' | 'broken' | 'inactive' | 'unused';
  problemReason?: string;
  hasMissingTelegramChat: boolean;
  lastRunAt?: string | null;
  enabledReportTypes: string[];
}

interface IReportTypePopularity {
  reportType: string;
  name: string;
  agendaJobName: string;
  defaultTimes: string[];
  companiesEnabledCount: number;
  adoptionPct: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
}

interface IAutomatedReportsSummary {
  period: string;
  dateFrom: string;
  dateTo: string;
  totalCompanies: number;
  activeCompaniesCount: number;
  activeCompaniesPct: number;
  averageAdoptionRate: number;
  averageDeliverySuccessRate: number;
  attentionRequiredCount: number;
  problemCounts: {
    full_active: number;
    partial: number;
    telegram_error: number;
    broken: number;
    inactive: number;
    unused: number;
  };
  companies: ICompanyReportMetrics[];
}

export default function AutomatedReportsOverview() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<string>('30d');
  const [summary, setSummary] = useState<IAutomatedReportsSummary | null>(null);
  const [popularities, setPopularities] = useState<IReportTypePopularity[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setErrorMsg(null);

      const [summaryRes, popularityRes] = await Promise.all([
        api.get('/product-admin/automated-reports/summary', { params: { period } }),
        api.get('/product-admin/automated-reports/report-types', { params: { period } })
      ]);

      if (summaryRes.data?.ok) {
        setSummary(summaryRes.data.data);
      } else {
        setErrorMsg(summaryRes.data?.error || 'Hisobotlar statistikasini yuklab bo‘lmadi');
      }

      if (popularityRes.data?.ok) {
        setPopularities(popularityRes.data.data || []);
      }
    } catch (err: any) {
      console.error('Automated reports fetch error:', err);
      setErrorMsg(err?.response?.data?.error || 'Serverdan ma’lumot olishda xatolik yuz berdi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const filteredCompanies = useMemo(() => {
    if (!summary?.companies) return [];
    let list = [...summary.companies];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          String(c.companyId).includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      list = list.filter((c) => c.problemCategory === categoryFilter);
    }

    return list;
  }, [summary, search, categoryFilter]);

  const getCategoryChip = (category: string, reason?: string) => {
    switch (category) {
      case 'full_active':
        return (
          <Tooltip title={reason || 'Barcha hisobotlar faol va muvaffaqiyatli yetkazilmoqda'}>
            <Chip
              icon={<CheckCircleOutlineOutlined sx={{ fontSize: 16 }} />}
              label="To‘liq faol"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.success.main,
                fontWeight: 600
              }}
            />
          </Tooltip>
        );
      case 'partial':
        return (
          <Tooltip title={reason || 'Qisman faol: ayrim hisobot turlari yoqilmagan'}>
            <Chip
              icon={<PieChartOutlined sx={{ fontSize: 16 }} />}
              label="Qisman faol"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.info.main,
                fontWeight: 600
              }}
            />
          </Tooltip>
        );
      case 'telegram_error':
        return (
          <Tooltip title={reason || 'Telegram Chat ID sozlanmagan yoki xato'}>
            <Chip
              icon={<Telegram sx={{ fontSize: 16 }} />}
              label="Telegram xatosi"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.error.main,
                fontWeight: 600
              }}
            />
          </Tooltip>
        );
      case 'broken':
        return (
          <Tooltip title={reason || 'Hisobot yaratish yoki yetkazishda nosozliklar bor'}>
            <Chip
              icon={<ErrorOutlineOutlined sx={{ fontSize: 16 }} />}
              label="Nosoz / Xato"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.error.main,
                fontWeight: 600
              }}
            />
          </Tooltip>
        );
      case 'inactive':
        return (
          <Tooltip title={reason || 'Hisobotlar to‘xtab qolgan yoki obuna muddati tugagan'}>
            <Chip
              icon={<PauseCircleOutlineOutlined sx={{ fontSize: 16 }} />}
              label="To‘xtagan"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.warning.main,
                fontWeight: 600
              }}
            />
          </Tooltip>
        );
      case 'unused':
      default:
        return (
          <Tooltip title={reason || 'Birorta ham hisobot yoqilmagan'}>
            <Chip
              icon={<CancelOutlined sx={{ fontSize: 16 }} />}
              label="Foydalanmaydi"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.text.secondary, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                color: theme.palette.text.secondary,
                fontWeight: 500
              }}
            />
          </Tooltip>
        );
    }
  };

  return (
    <Box>
      {/* Yuqori Panel: Sarlavha, Davr Tanlagich va Yangilash */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
            Avtomatlashtirilgan hisobotlar tahlili
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Tashkilotlarning Telegram hisobotlaridan foydalanishi, qamrovi va yetkazish monitoringi
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              sx={{ borderRadius: '8px', bgcolor: theme.palette.background.paper }}
            >
              <MenuItem value="today">Bugun</MenuItem>
              <MenuItem value="7d">Oxirgi 7 kun</MenuItem>
              <MenuItem value="30d">Oxirgi 30 kun</MenuItem>
              <MenuItem value="this_month">Joriy oy</MenuItem>
              <MenuItem value="last_month">O‘tgan oy</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshOutlined />}
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600, px: 2 }}
          >
            {refreshing ? 'Yangilanmoqda...' : 'Yangilash'}
          </Button>
        </Stack>
      </Stack>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {/* KPI Kartalari */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* 1. Hisobotlardan foydalanish */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: '12px'
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                  color: theme.palette.primary.main,
                  display: 'flex'
                }}
              >
                <SmartToyOutlined sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                  Faol tashkilotlar
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  {loading ? '-' : `${summary?.activeCompaniesCount || 0} / ${summary?.totalCompanies || 0}`}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Avtomatik hisobot yoqilgan: <b>{loading ? '-' : `${summary?.activeCompaniesPct || 0}%`}</b>
            </Typography>
          </Card>
        </Grid>

        {/* 2. O'rtacha hisobot qamrovi (Report Adoption Rate) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: '12px'
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                  color: theme.palette.info.main,
                  display: 'flex'
                }}
              >
                <PieChartOutlined sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                  Hisobot qamrovi (Adoption)
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                  {loading ? '-' : `${summary?.averageAdoptionRate || 0}%`}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Mavjud 4 ta hisobot turidan o‘rtacha yoqilgani
            </Typography>
          </Card>
        </Grid>

        {/* 3. Yetkazish muvaffaqiyati (Delivery Success Rate) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: '12px'
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                  color: theme.palette.success.main,
                  display: 'flex'
                }}
              >
                <SendOutlined sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                  Yetkazish muvaffaqiyati
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  {loading ? '-' : `${summary?.averageDeliverySuccessRate || 0}%`}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Rejadagi yuborishlarning Telegramga yetib borishi
            </Typography>
          </Card>
        </Grid>

        {/* 4. E'tibor talab qiladiganlar */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: '12px'
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                  color: theme.palette.warning.main,
                  display: 'flex'
                }}
              >
                <WarningAmberOutlined sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                  E’tibor talab qiladigan
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: (summary?.attentionRequiredCount || 0) > 0 ? theme.palette.warning.main : theme.palette.text.primary
                  }}
                >
                  {loading ? '-' : `${summary?.attentionRequiredCount || 0} ta`}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Telegram xatosi, to‘xtagan yoki nosoz tashkilotlar
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Hisobot turlari ommabopligi (Popularity breakdown) */}
      <Card
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: '12px'
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
          Hisobot turlari bo‘yicha tahlil va ommaboplik
        </Typography>

        <Grid container spacing={2}>
          {popularities.map((pop) => (
            <Grid item xs={12} sm={6} md={3} key={pop.reportType}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  border: '1px solid',
                  borderColor: theme.palette.divider
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 1,
                    minHeight: 44,
                    lineHeight: 1.3
                  }}
                >
                  {pop.name}
                </Typography>

                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Qamrov (tashkilotlar):
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {pop.companiesEnabledCount} ta ({pop.adoptionPct}%)
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={pop.adoptionPct}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    mb: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.15)
                  }}
                />

                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Yetkazish darajasi:
                  </Typography>
                  <Chip
                    label={`${pop.successRate}%`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 12,
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                      color: theme.palette.success.main
                    }}
                  />
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* Filter va Saralash Paneli */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: '12px'
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' }
          }}
        >
          <TextField
            placeholder="Tashkilot nomi yoki ID bo‘yicha qidirish..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchOutlined sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: 20 }} />
              }
            }}
            sx={{ minWidth: { xs: '100%', md: 320 } }}
          />

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'full_active', label: 'To‘liq faol' },
              { id: 'partial', label: 'Qisman faol' },
              { id: 'telegram_error', label: 'Telegram xatosi' },
              { id: 'inactive', label: 'To‘xtagan' },
              { id: 'unused', label: 'Foydalanmaydi' }
            ].map((tab) => (
              <Chip
                key={tab.id}
                label={tab.label}
                clickable
                onClick={() => setCategoryFilter(tab.id)}
                color={categoryFilter === tab.id ? 'primary' : 'default'}
                variant={categoryFilter === tab.id ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: categoryFilter === tab.id ? 700 : 500,
                  borderRadius: '8px'
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Card>

      {/* Tashkilotlar Jadvali */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid',
          borderColor: theme.palette.divider,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.04) : alpha('#000', 0.02) }}>
              <TableCell sx={{ fontWeight: 700 }}>№</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tashkilot</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Yoqilgan hisobotlar
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Qamrov (Adoption Rate)
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Yetkazish (Delivery Rate)
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Telegram guruhi
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Holat
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Oxirgi yuborish
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Harakat
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                    Ma’lumotlar yuklanmoqda...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    Hech qanday tashkilot topilmadi
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((comp, idx) => (
                <TableRow
                  key={comp.companyId}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/dashboard/product-intelligence/reports/${comp.companyId}`)}
                >
                  <TableCell sx={{ color: theme.palette.text.secondary }}>{idx + 1}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                      {comp.companyName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      ID: #{comp.companyId}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {comp.enabledReportsCount} / {comp.totalAvailableReports}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 140 }}>
                    <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                        {comp.reportAdoptionRate}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={comp.reportAdoptionRate}
                        sx={{
                          width: '100%',
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.info.main, 0.15),
                          '& .MuiLinearProgress-bar': { bgcolor: theme.palette.info.main }
                        }}
                      />
                    </Stack>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 140 }}>
                    <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color:
                            comp.reportDeliverySuccessRate >= 80
                              ? theme.palette.success.main
                              : comp.reportDeliverySuccessRate >= 50
                              ? theme.palette.warning.main
                              : theme.palette.text.secondary
                        }}
                      >
                        {comp.enabledReportsCount > 0 ? `${comp.reportDeliverySuccessRate}%` : '—'}
                      </Typography>
                      {comp.enabledReportsCount > 0 && (
                        <LinearProgress
                          variant="determinate"
                          value={comp.reportDeliverySuccessRate}
                          sx={{
                            width: '100%',
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.success.main, 0.15),
                            '& .MuiLinearProgress-bar': {
                              bgcolor:
                                comp.reportDeliverySuccessRate >= 80
                                  ? theme.palette.success.main
                                  : theme.palette.warning.main
                            }
                          }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    {comp.hasMissingTelegramChat ? (
                      <Chip
                        label="Sozlanmagan"
                        size="small"
                        color="error"
                        sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
                      />
                    ) : comp.enabledReportsCount > 0 ? (
                      <Chip
                        label="Ulangan"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {getCategoryChip(comp.problemCategory, comp.problemReason)}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {comp.lastRunAt ? dayjs(comp.lastRunAt).format('DD.MM.YYYY HH:mm') : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Batafsil audit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/product-intelligence/reports/${comp.companyId}`);
                        }}
                      >
                        <ArrowForwardIosOutlined sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
