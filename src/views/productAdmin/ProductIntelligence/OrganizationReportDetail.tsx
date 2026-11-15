import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Typography,
  Stack,
  Button,
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
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  ArrowBackOutlined,
  RefreshOutlined,
  CheckCircleOutlineOutlined,
  WarningAmberOutlined,
  ErrorOutlineOutlined,
  Telegram,
  AccessTimeOutlined,
  SendOutlined,
  PieChartOutlined,
  CorporateFareOutlined,
  PauseCircleOutlineOutlined,
  CancelOutlined,
  ScheduleOutlined
} from '@mui/icons-material';
import api from 'utils/api';
import dayjs from 'dayjs';

interface ISingleOrgReportDetail {
  company: {
    id: number;
    name: string;
    isSubscriptionActive: boolean;
    activeExpiresDate?: string | null;
    groups: Array<{ key: string; name: string; chatId: string; description: string }>;
  };
  metrics: {
    totalAvailableReports: number;
    enabledReportsCount: number;
    reportAdoptionRate: number;
    expectedDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    reportDeliverySuccessRate: number;
    problemCategory: 'full_active' | 'partial' | 'telegram_error' | 'broken' | 'inactive' | 'unused';
    problemReason?: string;
  };
  reports: Array<{
    reportType: string;
    name: string;
    enabled: boolean;
    times: string[];
    timesCount: number;
    reportMode: string;
    paymentPartner?: string;
    groupBy?: string;
    taskType?: string;
    planSource?: string;
    chatId?: string;
    chatGroupName?: string;
    isChatIdValid: boolean;
    chatError?: string;
    lastRunAt?: string | null;
    successDeliveries: number;
    failedDeliveries: number;
    deliveryRate: number;
  }>;
  recentLogs: Array<{
    id: string;
    reportType: string;
    reportName: string;
    timeSlot?: string;
    scheduledAt: string;
    startedAt: string;
    completedAt?: string;
    durationMs?: number;
    status: 'success' | 'failed' | 'skipped';
    skipReason?: string;
    errorMessage?: string;
    chatId?: string;
    attempt: number;
  }>;
}

export default function OrganizationReportDetail() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<string>('30d');
  const [data, setData] = useState<ISingleOrgReportDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDetail = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setErrorMsg(null);

      const res = await api.get(`/product-admin/automated-reports/organizations/${companyId}`, {
        params: { period }
      });

      if (res.data?.ok) {
        setData(res.data.data);
      } else {
        setErrorMsg(res.data?.error || 'Tashkilot hisobot ma’lumotlarini yuklab bo‘lmadi');
      }
    } catch (err: any) {
      console.error('Fetch org report detail error:', err);
      setErrorMsg(err?.response?.data?.error || 'Serverdan ma’lumot olishda xatolik yuz berdi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchDetail();
    }
  }, [companyId, period]);

  const getCategoryChip = (category?: string, reason?: string) => {
    switch (category) {
      case 'full_active':
        return (
          <Tooltip title={reason || 'Barcha hisobotlar faol va muvaffaqiyatli yetkazilmoqda'}>
            <Chip
              icon={<CheckCircleOutlineOutlined sx={{ fontSize: 16 }} />}
              label="To‘liq faol"
              sx={{
                bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.success.main,
                fontWeight: 700
              }}
            />
          </Tooltip>
        );
      case 'partial':
        return (
          <Tooltip title={reason || 'Qisman faol'}>
            <Chip
              icon={<PieChartOutlined sx={{ fontSize: 16 }} />}
              label="Qisman faol"
              sx={{
                bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.info.main,
                fontWeight: 700
              }}
            />
          </Tooltip>
        );
      case 'telegram_error':
        return (
          <Tooltip title={reason || 'Telegram guruhi ID xato yoki ko‘rsatilmagan'}>
            <Chip
              icon={<Telegram sx={{ fontSize: 16 }} />}
              label="Telegram xatosi"
              sx={{
                bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.error.main,
                fontWeight: 700
              }}
            />
          </Tooltip>
        );
      case 'broken':
        return (
          <Tooltip title={reason || 'Yetkazishda nosozliklar bor'}>
            <Chip
              icon={<ErrorOutlineOutlined sx={{ fontSize: 16 }} />}
              label="Nosoz"
              sx={{
                bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.error.main,
                fontWeight: 700
              }}
            />
          </Tooltip>
        );
      case 'inactive':
        return (
          <Tooltip title={reason || 'Hisobotlar to‘xtab qolgan'}>
            <Chip
              icon={<PauseCircleOutlineOutlined sx={{ fontSize: 16 }} />}
              label="To‘xtagan"
              sx={{
                bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.warning.main,
                fontWeight: 700
              }}
            />
          </Tooltip>
        );
      case 'unused':
      default:
        return (
          <Tooltip title={reason || 'Hisobotlar yoqilmagan'}>
            <Chip
              icon={<CancelOutlined sx={{ fontSize: 16 }} />}
              label="Foydalanmaydi"
              sx={{
                bgcolor: alpha(theme.palette.text.secondary, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                color: theme.palette.text.secondary,
                fontWeight: 600
              }}
            />
          </Tooltip>
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 2 }}>
          Tashkilot hisobot ma’lumotlari yuklanmoqda...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs va Navigatsiya */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate('/dashboard/product-intelligence')}
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Orqaga
        </Button>

        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: 'pointer', fontSize: 14 }}
            onClick={() => navigate('/dashboard/product-intelligence')}
          >
            Product Intelligence
          </Link>
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
            Avtomatlashtirilgan hisobotlar auditi
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {data?.company.name}
          </Typography>
        </Breadcrumbs>
      </Stack>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Tashkilot Asosiy Kartasi */}
      <Card
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: '12px'
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2.5}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' }
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.primary.main,
                display: 'flex'
              }}
            >
              <CorporateFareOutlined sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  {data?.company.name}
                </Typography>
                <Chip
                  label={`ID: #${data?.company.id}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                Obuna holati:{' '}
                {data?.company.isSubscriptionActive ? (
                  <b style={{ color: theme.palette.success.main }}>
                    Faol (tugash muddati:{' '}
                    {data.company.activeExpiresDate
                      ? dayjs(data.company.activeExpiresDate).format('DD.MM.YYYY')
                      : 'Noma’lum'}
                    )
                  </b>
                ) : (
                  <b style={{ color: theme.palette.error.main }}>
                    Obuna muddati tugagan (
                    {data?.company.activeExpiresDate
                      ? dayjs(data.company.activeExpiresDate).format('DD.MM.YYYY')
                      : 'mavjud emas'}
                    )
                  </b>
                )}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            {getCategoryChip(data?.metrics.problemCategory, data?.metrics.problemReason)}

            <FormControl size="small" sx={{ minWidth: 140 }}>
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
              size="small"
              startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshOutlined />}
              onClick={() => fetchDetail(true)}
              disabled={refreshing}
              sx={{ textTransform: 'none', borderRadius: '8px', px: 2 }}
            >
              Yangilash
            </Button>
          </Stack>
        </Stack>

        {data?.metrics.problemReason && (
          <Alert
            severity={
              data.metrics.problemCategory === 'full_active'
                ? 'success'
                : data.metrics.problemCategory === 'telegram_error' || data.metrics.problemCategory === 'broken'
                ? 'error'
                : 'warning'
            }
            sx={{ mt: 2.5 }}
          >
            {data.metrics.problemReason}
          </Alert>
        )}
      </Card>

      {/* 2 Ta Mustaqil Asosiy Metrika Kartalari */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Metrika A: Report Adoption Rate */}
        <Grid item xs={12} sm={6}>
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
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                  color: theme.palette.info.main,
                  display: 'flex'
                }}
              >
                <PieChartOutlined sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                  A. Hisobot qamrovi (Report Adoption Rate)
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: theme.palette.info.main }}>
                  {data?.metrics.reportAdoptionRate}%
                </Typography>
              </Box>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={data?.metrics.reportAdoptionRate || 0}
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 1,
                bgcolor: alpha(theme.palette.info.main, 0.15),
                '& .MuiLinearProgress-bar': { bgcolor: theme.palette.info.main }
              }}
            />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Yoqilgan turlar: <b>{data?.metrics.enabledReportsCount} ta</b> / Mavjud{' '}
              <b>{data?.metrics.totalAvailableReports} ta</b> hisobotdan
            </Typography>
          </Card>
        </Grid>

        {/* Metrika B: Report Delivery Success Rate */}
        <Grid item xs={12} sm={6}>
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
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                  color: theme.palette.success.main,
                  display: 'flex'
                }}
              >
                <SendOutlined sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                  B. Yetkazish muvaffaqiyati (Delivery Success Rate)
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, color: theme.palette.success.main }}>
                  {data?.metrics.reportDeliverySuccessRate}%
                </Typography>
              </Box>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={data?.metrics.reportDeliverySuccessRate || 0}
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 1,
                bgcolor: alpha(theme.palette.success.main, 0.15),
                '& .MuiLinearProgress-bar': { bgcolor: theme.palette.success.main }
              }}
            />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Muvaffaqiyatli yuborilgan: <b>{data?.metrics.successfulDeliveries} ta</b> / Kutilgan reja{' '}
              <b>{data?.metrics.expectedDeliveries} ta</b> yuborish
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Hisobot Turlari Kartalari */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
        Hisobot turlari sozlamalari va yetkazish holati
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {data?.reports.map((rep) => (
          <Grid item xs={12} md={6} key={rep.reportType}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: rep.enabled ? theme.palette.primary.main : theme.palette.divider,
                borderRadius: '12px'
              }}
            >
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    {rep.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Turi: {rep.reportType}
                  </Typography>
                </Box>
                <Chip
                  label={rep.enabled ? 'Faol' : 'O‘chirilgan'}
                  color={rep.enabled ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              {/* Sozlangan vaqtlar */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                  <ScheduleOutlined sx={{ fontSize: 13, verticalAlign: 'middle', mr: 0.5 }} />
                  Rejalashtirilgan vaqtlar ({rep.times.length} marta / kun):
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  {rep.times.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Telegram Guruh */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                  <Telegram sx={{ fontSize: 13, verticalAlign: 'middle', mr: 0.5 }} />
                  Biriktirilgan Telegram guruh:
                </Typography>
                {rep.isChatIdValid ? (
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {rep.chatGroupName}
                    </Typography>
                    <Chip label={rep.chatId} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                  </Stack>
                ) : (
                  <Alert severity="error" sx={{ py: 0, px: 1.5, fontSize: 12 }}>
                    {rep.chatError || 'Telegram guruhi sozlanmagan!'}
                  </Alert>
                )}
              </Box>

              {/* Yuborish statistikasi va so'nggi yuborish */}
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pt: 1.5,
                  borderTop: '1px solid',
                  borderColor: theme.palette.divider
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                    So‘nggi marta yuborildi:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {rep.lastRunAt ? dayjs(rep.lastRunAt).format('DD.MM.YYYY HH:mm') : 'Hali yuborilmagan'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                    Yetkazish:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    {rep.deliveryRate}% ({rep.successDeliveries} ta)
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* So'nggi Yuborish Loglari */}
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
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
          So‘nggi yetkazish va ijro jurnali (Audit Logs)
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.04) : alpha('#000', 0.02) }}>
                <TableCell sx={{ fontWeight: 700 }}>Vaqt</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Hisobot nomi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reja vaqti</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Holat
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Davomiyligi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Telegram Guruhi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Izoh / Xatolik</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.recentLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Ushbu davr uchun ijro jurnali yozuvlari mavjud emas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.recentLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {dayjs(log.startedAt).format('DD.MM.YYYY HH:mm:ss')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {log.reportName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={log.timeSlot || 'Darhol'} size="small" sx={{ height: 20, fontSize: 11 }} />
                    </TableCell>
                    <TableCell align="center">
                      {log.status === 'success' ? (
                        <Chip
                          label="Muvaffaqiyatli"
                          size="small"
                          color="success"
                          sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
                        />
                      ) : log.status === 'failed' ? (
                        <Chip
                          label="Xatolik"
                          size="small"
                          color="error"
                          sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
                        />
                      ) : (
                        <Chip
                          label="O‘tkazib yuborildi"
                          size="small"
                          color="warning"
                          sx={{ height: 22, fontSize: 11, fontWeight: 600 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {log.chatId || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {log.errorMessage ? (
                        <Typography variant="caption" sx={{ color: theme.palette.error.main }}>
                          {log.errorMessage}
                        </Typography>
                      ) : log.skipReason ? (
                        <Typography variant="caption" sx={{ color: theme.palette.warning.main }}>
                          {log.skipReason}
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Yetkazildi
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
