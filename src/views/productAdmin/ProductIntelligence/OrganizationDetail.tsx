import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  ArrowBackOutlined,
  RefreshOutlined,
  PhoneOutlined,
  PersonOutlineOutlined,
  PlaceOutlined,
  CheckCircleOutlineOutlined,
  WarningAmberOutlined,
  ErrorOutlineOutlined,
  TrendingDownOutlined,
  TrendingUpOutlined,
  TrendingFlatOutlined,
  HelpOutlineOutlined,
  SignalCellularAltOutlined,
  ReceiptLongOutlined,
  InsightsOutlined
} from '@mui/icons-material';
import api from 'utils/api';
import dayjs from 'dayjs';

interface IMonthlyDynamicsItem {
  month: string;
  label: string;
  totalActs: number;
  gzActs: number;
  externalActs: number;
  adoptionRate: number | null;
}

interface ICompanyInfo {
  id: number;
  name: string;
  locationName?: string;
  phone?: string;
  address?: string;
  manager?: { fullName: string };
  billingAdmin?: { fullName: string };
}

interface IOrganizationDetailData {
  company: ICompanyInfo;
  summary: {
    companyId: number;
    companyName: string;
    locationName?: string;
    periodKey: string;
    totalActsCurrent: number;
    gzActsCurrent: number;
    externalActsCurrent: number;
    adoptionRateCurrent: number | null;
    totalActsPrevMonth: number;
    gzActsPrevMonth: number;
    externalActsPrevMonth: number;
    adoptionRatePrevMonth: number | null;
    totalActsPrevMonthSameDay: number;
    gzActsPrevMonthSameDay: number;
    externalActsPrevMonthSameDay: number;
    adoptionRatePrevMonthSameDay: number | null;
    actsGrowthCount: number;
    adoptionRateChange: number | null;
    status: 'active' | 'partial' | 'low' | 'declined' | 'insufficient_data' | 'connection_error';
    statusExplanation: string;
    connectionStatus: 'ok' | 'error' | 'not_configured';
    connectionError?: string;
    monthlyDynamics: IMonthlyDynamicsItem[];
    calculatedAt: string;
  };
}

export default function OrganizationIntelligenceDetail() {
  const theme = useTheme();
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<IOrganizationDetailData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDetail = async (force = false) => {
    if (!companyId) return;
    try {
      if (force) setRefreshing(true);
      else setLoading(true);
      setErrorMsg(null);

      const res = await api.get(`/product-admin/workflow-intelligence/organizations/${companyId}`, {
        params: { forceRefresh: force ? 'true' : 'false' }
      });

      if (res.data && res.data.ok && res.data.data) {
        setData(res.data.data);
      } else {
        setErrorMsg(res.data?.message || 'Tashkilot ma’lumotlarini yuklab bo‘lmadi');
      }
    } catch (err: any) {
      console.error('Fetch detail error:', err);
      setErrorMsg(err?.response?.data?.message || 'Tashkilot tahlil ma’lumotlarini olishda xatolik yuz berdi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDetail(false);
  }, [companyId]);

  const formatNumber = (num?: number) => {
    return new Intl.NumberFormat('uz-UZ').format(num || 0);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <Chip
            size="small"
            icon={<CheckCircleOutlineOutlined sx={{ fontSize: 16 }} />}
            label="Faol foydalanuvchi"
            sx={{
              bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
              color: theme.palette.success.main,
              fontWeight: 600
            }}
          />
        );
      case 'partial':
        return (
          <Chip
            size="small"
            icon={<SignalCellularAltOutlined sx={{ fontSize: 16 }} />}
            label="Qisman foydalanuvchi"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
              color: theme.palette.primary.main,
              fontWeight: 600
            }}
          />
        );
      case 'low':
        return (
          <Chip
            size="small"
            icon={<WarningAmberOutlined sx={{ fontSize: 16 }} />}
            label="Past foydalanish"
            sx={{
              bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
              color: theme.palette.warning.main,
              fontWeight: 600
            }}
          />
        );
      case 'declined':
        return (
          <Chip
            size="small"
            icon={<TrendingDownOutlined sx={{ fontSize: 16 }} />}
            label="Faolligi pasaygan"
            sx={{
              bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
              color: theme.palette.error.main,
              fontWeight: 600
            }}
          />
        );
      case 'connection_error':
        return (
          <Chip
            size="small"
            icon={<ErrorOutlineOutlined sx={{ fontSize: 16 }} />}
            label="Ulanish xatosi"
            sx={{
              bgcolor: alpha(theme.palette.error.dark, theme.palette.mode === 'dark' ? 0.25 : 0.12),
              color: theme.palette.error.dark,
              fontWeight: 600
            }}
          />
        );
      case 'insufficient_data':
      default:
        return (
          <Chip
            size="small"
            icon={<HelpOutlineOutlined sx={{ fontSize: 16 }} />}
            label="Yetarli emas"
            sx={{
              bgcolor: alpha(theme.palette.text.secondary, theme.palette.mode === 'dark' ? 0.2 : 0.1),
              color: theme.palette.text.secondary,
              fontWeight: 600
            }}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 2 }}>
          Tashkilot tahlili yuklanmoqda...
        </Typography>
      </Box>
    );
  }

  if (errorMsg || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate('/dashboard/product-intelligence')}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Orqaga
        </Button>
        <Alert severity="error">{errorMsg || 'Tashkilot ma’lumotlari topilmadi'}</Alert>
      </Box>
    );
  }

  const { company, summary } = data;
  const currentAdoption = summary.adoptionRateCurrent;
  const prevSameDayAdoption = summary.adoptionRatePrevMonthSameDay;
  const prevFullAdoption = summary.adoptionRatePrevMonth;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Yuqori navigatsiya va sarlavha */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate('/dashboard/product-intelligence')}
          sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
        >
          Barcha tashkilotlar
        </Button>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          /
        </Typography>
        <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
          {company.name}
        </Typography>
      </Stack>

      {/* Tashkilot Header kartasi */}
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
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
        >
          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                {company.name}
              </Typography>
              {getStatusBadge(summary.status)}
            </Stack>

            <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', mt: 1 }}>
              {company.locationName && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <PlaceOutlined sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {company.locationName} (ID: {company.id})
                  </Typography>
                </Stack>
              )}

              {company.phone && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <PhoneOutlined sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {company.phone}
                  </Typography>
                </Stack>
              )}

              {company.manager?.fullName && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <PersonOutlineOutlined sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Menejer: {company.manager.fullName}
                  </Typography>
                </Stack>
              )}

              {company.billingAdmin?.fullName && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <PersonOutlineOutlined sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Billing admin: {company.billingAdmin.fullName}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshOutlined />}
            onClick={() => fetchDetail(true)}
            disabled={refreshing}
            sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
          >
            {refreshing ? 'Yangilanmoqda...' : 'Qayta hisoblash'}
          </Button>
        </Stack>

        {/* Tahliliy Xulosa / Izoh bloki */}
        {summary.statusExplanation && (
          <Box
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: '8px',
              bgcolor:
                summary.status === 'active'
                  ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.15 : 0.08)
                  : summary.status === 'declined' || summary.status === 'connection_error'
                  ? alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.15 : 0.08)
                  : summary.status === 'low'
                  ? alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.15 : 0.08)
                  : alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
              border: '1px solid',
              borderColor:
                summary.status === 'active'
                  ? alpha(theme.palette.success.main, 0.3)
                  : summary.status === 'declined' || summary.status === 'connection_error'
                  ? alpha(theme.palette.error.main, 0.3)
                  : summary.status === 'low'
                  ? alpha(theme.palette.warning.main, 0.3)
                  : alpha(theme.palette.info.main, 0.3)
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <InsightsOutlined sx={{ fontSize: 20, mt: 0.2 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.3 }}>
                  Tahliliy xulosa va tavsiya:
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  {summary.statusExplanation}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Card>

      {/* Solishtirma Davrlar Kartalari */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Joriy oy */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.primary.main,
              borderRadius: '12px'
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                Joriy oy (bugungacha)
              </Typography>
              <Chip
                label="Hozirgi davr"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            </Stack>

            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
              {formatNumber(summary.totalActsCurrent)} <Typography component="span" variant="body2" sx={{ color: theme.palette.text.secondary }}>jami akt</Typography>
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={1}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>GreenZone orqali:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  {formatNumber(summary.gzActsCurrent)} ta
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Tashqi tizimda:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatNumber(summary.externalActsCurrent)} ta
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Adoption ko‘rsatkichi:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {currentAdoption !== null ? `${currentAdoption}%` : 'N/A'}
                </Typography>
              </Stack>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={currentAdoption || 0}
              sx={{
                mt: 1.5,
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.15)
              }}
            />
          </Card>
        </Grid>

        {/* O'tgan oyning aynan shu kunigacha (Fair comparison) */}
        <Grid item xs={12} md={4}>
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
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                O‘tgan oyning shu kunigacha
              </Typography>
              <Chip
                label="Adolatli taqqoslash"
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            </Stack>

            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
              {formatNumber(summary.totalActsPrevMonthSameDay)} <Typography component="span" variant="body2" sx={{ color: theme.palette.text.secondary }}>jami akt</Typography>
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={1}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>GreenZone orqali:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatNumber(summary.gzActsPrevMonthSameDay)} ta
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Tashqi tizimda:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatNumber(summary.externalActsPrevMonthSameDay)} ta
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Adoption ko‘rsatkichi:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {prevSameDayAdoption !== null ? `${prevSameDayAdoption}%` : 'N/A'}
                </Typography>
              </Stack>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={prevSameDayAdoption || 0}
              sx={{
                mt: 1.5,
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.divider, 0.5)
              }}
            />
          </Card>
        </Grid>

        {/* O'tgan to'liq oy */}
        <Grid item xs={12} md={4}>
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
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                O‘tgan to‘liq oy
              </Typography>
              <Chip
                label="Yakuniy natija"
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            </Stack>

            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
              {formatNumber(summary.totalActsPrevMonth)} <Typography component="span" variant="body2" sx={{ color: theme.palette.text.secondary }}>jami akt</Typography>
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={1}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>GreenZone orqali:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatNumber(summary.gzActsPrevMonth)} ta
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Tashqi tizimda:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatNumber(summary.externalActsPrevMonth)} ta
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Adoption ko‘rsatkichi:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {prevFullAdoption !== null ? `${prevFullAdoption}%` : 'N/A'}
                </Typography>
              </Stack>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={prevFullAdoption || 0}
              sx={{
                mt: 1.5,
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.divider, 0.5)
              }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Oylar bo'yicha adoption dinamikasi */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: '12px',
          mb: 3
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Oylar bo‘yicha adoption dinamikasi
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
          Oxirgi 6 oylik foydalanish ko‘rsatkichlari va GreenZone ulushining o‘zgarishi
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Davr</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Jami aktlar</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>GreenZone aktlari</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Tashqi aktlar</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, minWidth: 160 }}>Adoption darajasi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.monthlyDynamics?.map((item) => {
                const isCurrentMonth = item.month === summary.periodKey;
                return (
                  <TableRow
                    key={item.month}
                    sx={{
                      bgcolor: isCurrentMonth
                        ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.04)
                        : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: isCurrentMonth ? 700 : 500 }}>
                        {item.label} {isCurrentMonth && '(Joriy oy)'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatNumber(item.totalActs)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {formatNumber(item.gzActs)}
                    </TableCell>
                    <TableCell align="right">{formatNumber(item.externalActs)}</TableCell>
                    <TableCell align="center">
                      {item.adoptionRate === null ? (
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                          N/A
                        </Typography>
                      ) : (
                        <Box sx={{ width: '100%', px: 1 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {item.adoptionRate}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={item.adoptionRate}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.divider, 0.5),
                              '& .MuiLinearProgress-bar': {
                                bgcolor:
                                  item.adoptionRate >= 70
                                    ? theme.palette.success.main
                                    : item.adoptionRate >= 30
                                    ? theme.palette.primary.main
                                    : theme.palette.warning.main
                              }
                            }}
                          />
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Mijoz bilan bog'lanish bloki */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: '12px'
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Mijoz bilan aloqa va muammoni bartaraf etish
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
              Tashkilot mas’ullari bilan bog‘lanib, GreenZone orqali ishlash bo‘yicha yordam ko‘rsatish
            </Typography>
          </Box>

          {company.phone ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PhoneOutlined />}
              href={`tel:${company.phone}`}
              sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
            >
              Qo‘ng‘iroq qilish ({company.phone})
            </Button>
          ) : (
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Telefon raqami ko‘rsatilmagan
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
