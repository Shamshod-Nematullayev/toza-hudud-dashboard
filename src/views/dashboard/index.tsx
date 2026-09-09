import { JSX, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { gridSpacing } from 'store/constant';
import RadialChart from './RadialChart';
import api from 'utils/api';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Card,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import useCustomizationStore from 'store/customizationStore';
import { IconBolt, IconChartBar, IconShieldCheck, IconUsers } from '@tabler/icons-react';
import DispatcherDashboard from 'views/dispatcher/Dashboard';
import { useTranslation } from 'react-i18next';
import { TourHelpButton } from 'ui-component/tour';
import { startAppOnboardingTour } from 'layout/MainLayout/OnboardingTour';
import ArizalarReportWidget from './ArizalarReportWidget';

interface IStat {
  allAbonentsCount?: number;
  identifiedCount?: number;
  newAbonentRequestCount?: number;
  monthlyIncomePlanAccrual?: number;
  monthlyIncomePlanTotalAmount?: number;
}

interface IDebitorOperationsSummary {
  overview?: {
    activeCount: number;
    totalDebt: number;
    resolvedCount: number;
    readyForActionCount?: number;
    notReadyCount?: number;
    notReadyDebt?: number;
  };
  queues?: Array<{
    id: string;
    title: string;
    count: number;
    totalDebt: number;
  }>;
  notReady?: Array<{ count: number; totalDebt: number }>;
  totalOverview?: Array<{ activeCount: number; totalDebt: number; resolvedCount: number; allCount: number }>;
  readyToBlock?: Array<{ count: number; totalDebt: number }>;
  phoneActionRequired?: Array<{ count: number; totalDebt: number }>;
  hetVerificationRequired?: Array<{ count: number; totalDebt: number }>;
  smsProcessing?: Array<{ count: number; totalDebt: number }>;
  currentlyBlocked?: Array<{ count: number; totalDebt: number }>;
  resolved?: Array<{ count: number; totalDebt: number }>;
}

interface IMultiplyInhabitantsStats {
  totalRequests: number;
  totalInhabitantsToAdd: number;
  pendingCount: number;
  pendingInhabitantsToAdd: number;
  inDocumentPendingConfirmCount: number;
  inDocumentInhabitantsToAdd: number;
  confirmedCount: number;
  confirmedInhabitantsToAdd: number;
  canceledCount: number;
  canceledInhabitantsToAdd: number;
  totalDocuments: number;
  topMahallas: Array<{
    _id?: string;
    mahallaName?: string;
    requestCount?: number;
    count?: number;
    totalInhabitantsToAdd?: number;
    inhabitants?: number;
  }>;
  topMahallasByFilter?: {
    all?: Array<{
      _id?: string;
      mahallaName?: string;
      requestCount?: number;
      count?: number;
      totalInhabitantsToAdd?: number;
      inhabitants?: number;
    }>;
    pending?: Array<{
      _id?: string;
      mahallaName?: string;
      requestCount?: number;
      count?: number;
      totalInhabitantsToAdd?: number;
      inhabitants?: number;
    }>;
    inDocument?: Array<{
      _id?: string;
      mahallaName?: string;
      requestCount?: number;
      count?: number;
      totalInhabitantsToAdd?: number;
      inhabitants?: number;
    }>;
    confirmed?: Array<{
      _id?: string;
      mahallaName?: string;
      requestCount?: number;
      count?: number;
      totalInhabitantsToAdd?: number;
      inhabitants?: number;
    }>;
  };
}

interface IIdentityVerificationStats {
  totalRequests: number;
  pendingCount: number;
  confirmedCount: number;
  canceledCount: number;
  topInspectors: Array<{
    _id?: string;
    inspectorName?: string;
    confirmedCount?: number;
    count?: number;
  }>;
  topInspectorsByFilter?: {
    all?: Array<{
      _id?: string;
      inspectorName?: string;
      confirmedCount?: number;
      count?: number;
    }>;
    pending?: Array<{
      _id?: string;
      inspectorName?: string;
      confirmedCount?: number;
      count?: number;
    }>;
    confirmed?: Array<{
      _id?: string;
      inspectorName?: string;
      confirmedCount?: number;
      count?: number;
    }>;
    canceled?: Array<{
      _id?: string;
      inspectorName?: string;
      confirmedCount?: number;
      count?: number;
    }>;
  };
}

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(n || 0);
const fmtMoney = (n: number) => fmt(n) + " so'm";

const Dashboard = () => {
  const { mahallalar, user } = useCustomizationStore();
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(true);
  const [stats, setStats] = useState<IStat | null>(null);

  // Debitors operations summary (for executive widget)
  const [debitorOps, setDebitorOps] = useState<IDebitorOperationsSummary | null>(null);
  const [debitorOpsLoading, setDebitorOpsLoading] = useState(true);

  // Multiply inhabitants stats
  const [multiplyStats, setMultiplyStats] = useState<IMultiplyInhabitantsStats | null>(null);
  const [multiplyLoading, setMultiplyLoading] = useState(true);
  const [xatlovFilter, setXatlovFilter] = useState<'all' | 'pending' | 'inDocument' | 'confirmed'>('all');

  // Identity verification stats (CustomDataRequest)
  const [identityStats, setIdentityStats] = useState<IIdentityVerificationStats | null>(null);
  const [identityLoading, setIdentityLoading] = useState(true);
  const [identityFilter, setIdentityFilter] = useState<'all' | 'pending' | 'confirmed' | 'canceled'>('all');

  // Debitors per-company table (for product_admin)
  const [debitorStats, setDebitorStats] = useState<any[]>([]);
  const [debitorLoading, setDebitorLoading] = useState(true);

  const identityProcent = Math.floor(((stats?.identifiedCount || 0) / (stats?.allAbonentsCount || 1)) * 100) || 0;
  const isProductAdmin = user?.roles?.includes('product_admin');
  const canViewArizalar = Boolean(
    user?.roles?.some((r) => ['billing', 'meneger', 'manager', 'rahbar', 'admin', 'product_admin'].includes(r))
  );

  // Custom warning color: to'q sariq (dark yellow) in light mode, och sariq (light yellow) in dark mode
  const darkYellowColor = theme.palette.mode === 'dark' ? '#fcd34d' : '#b45309';

  useEffect(() => {
    if (mahallalar.length === 0) {
      api.get('/mahallas', { params: { isMinimalize: true, page: 1, limit: 1000 } }).then(({ data }) => {
        useCustomizationStore.setState({ mahallalar: data.data });
      });
    }
  }, []);

  useEffect(() => {
    document.title = 'GreenZone - Command Center';

    const fetchData = async () => {
      try {
        const [allAbonentsCount, identifiedCount, newAbonentRequestCount, totalIncome] = await Promise.all([
          api.get('/statistics/all-abonents-count'),
          api.get('/statistics/identified-count'),
          api.get('/statistics/new-abonent-request-count'),
          api.get('/statistics/monthly-income-percent')
        ]);

        setStats({
          allAbonentsCount: allAbonentsCount.data,
          identifiedCount: identifiedCount.data,
          newAbonentRequestCount: newAbonentRequestCount.data,
          monthlyIncomePlanAccrual: totalIncome.data.sumAccrual,
          monthlyIncomePlanTotalAmount: totalIncome.data.totalAmount
        });
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // 1. Debitors operational summary
    api
      .get('/debitors/operations-summary')
      .then(({ data }) => {
        const payload = data?.data || data;
        if (payload) {
          setDebitorOps(payload);
        }
      })
      .catch((err) => console.error('Debitor operations summary error:', err))
      .finally(() => setDebitorOpsLoading(false));

    // 2. Multiply inhabitants stats
    api
      .get('/statistics/multiply-inhabitants-stats')
      .then(({ data }) => {
        const payload = data?.data || data;
        if (payload) {
          setMultiplyStats(payload);
        }
      })
      .catch((err) => console.error('Multiply stats error:', err))
      .finally(() => setMultiplyLoading(false));

    // 3. Identity verification stats
    api
      .get('/statistics/identity-verification-stats')
      .then(({ data }) => {
        const payload = data?.data || data;
        if (payload) {
          setIdentityStats(payload);
        }
      })
      .catch((err) => console.error('Identity stats error:', err))
      .finally(() => setIdentityLoading(false));
  }, []);

  useEffect(() => {
    if (isProductAdmin) {
      const fetchDebitorStats = async () => {
        try {
          const { data } = await api.get('/debitors/stats', { params: { byCompany: true } });
          if (data && (data.success || data.ok)) {
            setDebitorStats(data.data || []);
          }
        } catch (error) {
          console.error('Failed to load debitor stats:', error);
        } finally {
          setDebitorLoading(false);
        }
      };
      fetchDebitorStats();
    }
  }, [isProductAdmin]);

  // Derived metrics for Debitor Executive card with robust queue/array fallback
  const getQueue = (id: string, directArray?: Array<{ count: number; totalDebt: number }>) => {
    if (directArray && directArray.length > 0 && directArray[0]?.count !== undefined) {
      return directArray[0];
    }
    const queues = debitorOps?.queues;
    if (Array.isArray(queues)) {
      const match = queues.find((q) => q.id === id);
      if (match) {
        return { count: match.count || 0, totalDebt: match.totalDebt || 0 };
      }
    }
    return { count: 0, totalDebt: 0 };
  };

  const phoneQ = getQueue('phone_action_required', debitorOps?.phoneActionRequired);
  const hetQ = getQueue('het_verification_required', debitorOps?.hetVerificationRequired);
  const smsQ = getQueue('sms_processing', debitorOps?.smsProcessing);
  const readyQ = getQueue('ready_to_block', debitorOps?.readyToBlock);
  const blockedQ = getQueue('currently_blocked', debitorOps?.currentlyBlocked);

  const readyToBlockCount = readyQ.count;
  const readyToBlockDebt = readyQ.totalDebt;

  const currentlyBlockedCount = blockedQ.count;
  const currentlyBlockedDebt = blockedQ.totalDebt;

  const totalActiveDebtCount = debitorOps?.overview?.activeCount ?? debitorOps?.totalOverview?.[0]?.activeCount ?? 0;

  const totalActiveDebtSum = debitorOps?.overview?.totalDebt ?? debitorOps?.totalOverview?.[0]?.totalDebt ?? 0;

  // Tayyor emas = Jami faol qarzdorlik - Bloklashga tayyorlar - Bloklanganlar
  // Bu bitta debitor bir vaqtning o'zida telefon va het navbatlarida takror hisoblanib ketishining oldini oladi
  const notReadyCount =
    debitorOps?.notReady?.[0]?.count ??
    debitorOps?.overview?.notReadyCount ??
    Math.max(0, totalActiveDebtCount - readyToBlockCount - currentlyBlockedCount);

  const notReadyDebt =
    debitorOps?.notReady?.[0]?.totalDebt ??
    debitorOps?.overview?.notReadyDebt ??
    Math.max(0, totalActiveDebtSum - readyToBlockDebt - currentlyBlockedDebt);

  return (
    <Grid container spacing={gridSpacing}>
      {/* 0. WELCOME / ONBOARDING TOUR HEADER */}
      <Grid size={{ xs: 12 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {t('dashboard.welcomeTitle', 'Boshqaruv Paneli')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}>
              {t('dashboard.welcomeSubtitle', 'Tizimdagi asosiy faoliyat ko‘rsatkichlari va tahlillar')}
            </Typography>
          </Box>
          <TourHelpButton
            id="tour-dashboard-help-btn"
            onClick={startAppOnboardingTour}
            title={t('tour.onboarding.menuItem', 'Tizim bo‘yicha yo‘riqnoma')}
            size="medium"
          />
        </Stack>
      </Grid>

      {/* 1. ASOSIY STRATEGIK KARTALAR */}
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={gridSpacing}>
          <StatCard
            title={t('dashboard.allConsumers', "Umumiy Iste'molchilar")}
            count={stats?.allAbonentsCount || 0}
            icon={<IconUsers size="2.2rem" />}
            color={theme.palette.primary.main}
            loading={isLoading}
          />
          <StatCard
            title={t('dashboard.unidentified', "Identifikatsiyadan o'tmagan")}
            count={(stats?.allAbonentsCount || 0) - (stats?.identifiedCount || 0)}
            icon={<IconShieldCheck size="2.2rem" />}
            color={theme.palette.success.main}
            loading={isLoading}
          />
          <StatCard
            title={t('dashboard.newAbonentRequests', "Yangi abonent arizalari")}
            count={stats?.newAbonentRequestCount || 0}
            icon={<IconBolt size="2.2rem" />}
            color={theme.palette.warning.main}
            loading={isLoading}
            to="/billing/pendingNewAbonents"
          />
        </Grid>
      </Grid>

      {/* 2. ASOSIY GRAFIK PANEL & DEBITORLAR TEZKOR HOLATI */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <Card
          sx={{
            p: 3,
            height: '100%',
            borderRadius: '20px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Typography variant="h3" sx={{ mb: 4, fontWeight: 800, color: '#1a237e' }}>
            {t('dashboard.systemControl', 'Tizim Nazorati')} <IconChartBar size="1.5rem" style={{ verticalAlign: 'middle' }} />
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(33, 150, 243, 0.04)', borderRadius: '15px' }}>
                <RadialChart isLoading={isLoading} progress={identityProcent} label={t('dashboard.identified', 'Identifikatsiya')} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t('dashboard.identificationAccuracy', 'Umumiy bazaga nisbatan aniqlik darajasi')}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255, 193, 7, 0.04)', borderRadius: '15px' }}>
                <RadialChart
                  isLoading={isLoading}
                  progress={Math.floor(((stats?.monthlyIncomePlanTotalAmount || 0) / (stats?.monthlyIncomePlanAccrual || 1)) * 100) || 0}
                  label={t('dashboard.monthlyIncomePlanExecution', 'Tushum reja bajarilishi')}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t('dashboard.monthlyIncomePlanSub', 'Oylik rejaning bajarilishi')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      {/* 3. DEBITORLAR OPERATIV HOLATI (Boshliqlar uchun xulosa) */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <Card
          sx={{
            p: 3,
            height: '100%',
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e' }}>
                  {t('dashboard.debitorsStatus', 'Debitorlar holati')}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t('dashboard.quickManagementIndicator', "Boshqaruv uchun tezkor ko'rsatkich")}
                </Typography>
              </Box>
              <Chip
                label={t('dashboard.operational', 'Operativ')}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  color: '#dc2626'
                }}
              />
            </Stack>

            {debitorOpsLoading ? (
              <Stack spacing={1.5} sx={{ my: 1 }}>
                <Skeleton variant="rounded" height={52} />
                <Skeleton variant="rounded" height={52} />
                <Skeleton variant="rounded" height={52} />
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                {/* 1. Tayyor emas */}
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(100, 116, 139, 0.06)',
                    border: '1px solid rgba(100, 116, 139, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#64748b' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {t('dashboard.notReady', 'Tayyor emas')}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                      {t('dashboard.notReadySub', "Tel yo'q / HET tekshiruvda")}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155' }}>
                      {fmt(notReadyCount)} {t('dashboard.countUnit', 'ta')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      {fmtMoney(notReadyDebt)}
                    </Typography>
                  </Box>
                </Box>

                {/* 2. Bloklashga tayyor */}
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: darkYellowColor }}>
                        {t('dashboard.readyToBlock', 'Bloklashga tayyor')}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                      {t('dashboard.readyToBlockSub', 'HET orqali uzish navbatida')}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: darkYellowColor }}>
                      {fmt(readyToBlockCount)} {t('dashboard.countUnit', 'ta')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: darkYellowColor, fontWeight: 600 }}>
                      {fmtMoney(readyToBlockDebt)}
                    </Typography>
                  </Box>
                </Box>

                {/* 3. Bloklangan */}
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc2626' }}>
                        {t('dashboard.currentlyBlocked', 'Bloklangan')}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                      {t('dashboard.currentlyBlockedSub', "Elektr tarmog'idan uzilgan")}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#dc2626' }}>
                      {fmt(currentlyBlockedCount)} {t('dashboard.countUnit', 'ta')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>
                      {fmtMoney(currentlyBlockedDebt)}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            )}
          </Box>

          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {t('dashboard.totalActiveDebt', 'Jami faol qarzdorlik')} ({fmt(totalActiveDebtCount)} {t('dashboard.countUnit', 'ta')}):
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a237e' }}>
                {fmtMoney(totalActiveDebtSum)}
              </Typography>
            </Stack>
            <Button
              variant="outlined"
              fullWidth
              size="small"
              onClick={() => navigate('/billing/debt-collection-center')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                borderColor: 'rgba(26, 35, 126, 0.25)',
                color: '#1a237e',
                '&:hover': {
                  borderColor: '#1a237e',
                  bgcolor: 'rgba(26, 35, 126, 0.04)'
                }
              }}
            >
              {t('dashboard.goToDebtCollection', "Undiruv markaziga o'tish →")}
            </Button>
          </Box>
        </Card>
      </Grid>

      {/* 3.1 ARIZALAR OYLIK HISOBOTI (Billing, Meneger, Admin rollari uchun) */}
      {canViewArizalar && (
        <Grid size={{ xs: 12 }}>
          <ArizalarReportWidget />
        </Grid>
      )}

      {/* 4. YASHOVCHILAR SONINI OSHIRISH (XATLOV / MULTIPLY INHABITANTS) HISOBOTI */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Card
          sx={{
            p: 3,
            height: '100%',
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a237e' }}>
                {t('dashboard.multiplyInhabitantsTitle', "Yashovchilar sonini ko'paytirish (Xatlov)")}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t('dashboard.multiplyInhabitantsSubtitle', 'Inspektorlar kiritgan so\'rovlar va dalolatnomalar holati')}
              </Typography>
            </Box>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate('/billing/xatlovOdamSoni')}
              sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              {t('dashboard.details', 'Batafsil →')}
            </Button>
          </Stack>

          {/* 4 ta indikator kartalar */}
          <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
            {/* 1. Jami so'rovlar */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                onClick={() => setXatlovFilter('all')}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: xatlovFilter === 'all' ? 'rgba(33, 150, 243, 0.14)' : 'rgba(33, 150, 243, 0.06)',
                  border: xatlovFilter === 'all' ? '2px solid #1976d2' : '1px solid rgba(33, 150, 243, 0.2)',
                  boxShadow: xatlovFilter === 'all' ? '0 4px 12px rgba(25, 118, 210, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)'
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  {t('dashboard.totalRequests', "Jami so'rovlar")}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1976d2', mt: 0.5 }}>
                  {multiplyLoading ? '...' : fmt(multiplyStats?.totalRequests || 0)} {t('dashboard.countUnit', 'ta')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 700, display: 'block', mt: 0.5 }}>
                  +{multiplyLoading ? '...' : fmt(multiplyStats?.totalInhabitantsToAdd || 0)} {t('dashboard.peopleUnit', 'kishi')}
                </Typography>
              </Box>
            </Grid>

            {/* 2. Kiritilmagan (Yangi) */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                onClick={() => setXatlovFilter('pending')}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: xatlovFilter === 'pending' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(239, 68, 68, 0.06)',
                  border: xatlovFilter === 'pending' ? '2px solid #dc2626' : '1px solid rgba(239, 68, 68, 0.2)',
                  boxShadow: xatlovFilter === 'pending' ? '0 4px 12px rgba(220, 38, 38, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  {t('dashboard.notEnteredNew', 'Kiritilmagan (Yangi)')}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#dc2626', mt: 0.5 }}>
                  {multiplyLoading ? '...' : fmt(multiplyStats?.pendingCount || 0)} {t('dashboard.countUnit', 'ta')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 700, display: 'block', mt: 0.5 }}>
                  +{multiplyLoading ? '...' : fmt(multiplyStats?.pendingInhabitantsToAdd || 0)} {t('dashboard.peopleUnit', 'kishi')}
                </Typography>
              </Box>
            </Grid>

            {/* 3. Dalolatnoma qilingan (kutilmoqda) */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                onClick={() => setXatlovFilter('inDocument')}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: xatlovFilter === 'inDocument' ? 'rgba(245, 158, 11, 0.16)' : 'rgba(245, 158, 11, 0.08)',
                  border: xatlovFilter === 'inDocument' ? `2px solid ${darkYellowColor}` : '1px solid rgba(245, 158, 11, 0.25)',
                  boxShadow: xatlovFilter === 'inDocument' ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  {t('dashboard.actCreatedWaiting', 'Dalolatnoma qilingan')}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: darkYellowColor, mt: 0.5 }}>
                  {multiplyLoading ? '...' : fmt(multiplyStats?.inDocumentPendingConfirmCount || 0)} {t('dashboard.countUnit', 'ta')}
                </Typography>
                <Typography variant="caption" sx={{ color: darkYellowColor, fontWeight: 700, display: 'block', mt: 0.5 }}>
                  +{multiplyLoading ? '...' : fmt(multiplyStats?.inDocumentInhabitantsToAdd || 0)} {t('dashboard.peopleUnit', 'kishi')}
                </Typography>
              </Box>
            </Grid>

            {/* 4. TozaMakonga kiritilgan */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                onClick={() => setXatlovFilter('confirmed')}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: xatlovFilter === 'confirmed' ? 'rgba(34, 197, 94, 0.16)' : 'rgba(34, 197, 94, 0.08)',
                  border: xatlovFilter === 'confirmed' ? '2px solid #15803d' : '1px solid rgba(34, 197, 94, 0.25)',
                  boxShadow: xatlovFilter === 'confirmed' ? '0 4px 12px rgba(34, 197, 94, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)'
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  {t('dashboard.enteredConfirmed', 'Kiritilgan (Tasdiq)')}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>
                  {multiplyLoading ? '...' : fmt(multiplyStats?.confirmedCount || 0)} {t('dashboard.countUnit', 'ta')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, display: 'block', mt: 0.5 }}>
                  +{multiplyLoading ? '...' : fmt(multiplyStats?.confirmedInhabitantsToAdd || 0)} {t('dashboard.peopleUnit', 'kishi')}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Top mahallalar kesimi */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            {xatlovFilter === 'confirmed'
              ? t('dashboard.topMahallasConfirmed', "TozaMakonga kiritilgan mahallalar (Tasdiqlanganlar bo'yicha Top 5):")
              : xatlovFilter === 'pending'
                ? t('dashboard.topMahallasPending', "Eng ko'p kutilayotgan mahallalar (Kiritilmagan / Yangi bo'yicha Top 5):")
                : xatlovFilter === 'inDocument'
                  ? t('dashboard.topMahallasInDocument', "Dalolatnoma qilingan mahallalar (Kutilayotganlar bo'yicha Top 5):")
                  : t('dashboard.topMahallasAll', "Eng ko'p yashovchi so'ralgan mahallalar (Jami so'rovlar bo'yicha Top 5):")}
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '10px' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: useCustomizationStore.getState().customization.mode == 'dark' ? 'grey.800' : 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, py: 1 }}>{t('dashboard.mahallaName', 'Mahalla nomi')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1, textAlign: 'center' }}>{t('dashboard.requestCount', "So'rovlar soni")}</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1, textAlign: 'right' }}>{t('dashboard.inhabitantsToAdd', "Qo'shiladigan kishi")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {multiplyLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ py: 2, textAlign: 'center' }}>
                      <Skeleton height={30} />
                    </TableCell>
                  </TableRow>
                ) : !(multiplyStats?.topMahallasByFilter?.[xatlovFilter] || multiplyStats?.topMahallas) ||
                  (multiplyStats?.topMahallasByFilter?.[xatlovFilter] || multiplyStats?.topMahallas || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
                      {t('dashboard.noRequestsYet', "Hozircha so'rovlar mavjud emas")}
                    </TableCell>
                  </TableRow>
                ) : (
                  (multiplyStats?.topMahallasByFilter?.[xatlovFilter] || multiplyStats?.topMahallas || []).map((item, idx) => (
                    <TableRow key={item._id || idx} hover>
                      <TableCell sx={{ py: 1, fontWeight: 600 }}>{item.mahallaName || t('dashboard.unknownMahalla', "Noma'lum")}</TableCell>
                      <TableCell sx={{ py: 1, textAlign: 'center' }}>{fmt(item.requestCount ?? item.count ?? 0)} {t('dashboard.countUnit', 'ta')}</TableCell>
                      <TableCell sx={{ py: 1, textAlign: 'right', fontWeight: 700, color: 'primary.main' }}>
                        +{fmt(item.totalInhabitantsToAdd ?? item.inhabitants ?? 0)} {t('dashboard.personUnit', 'nafar')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>

      {/* 5. SHAXSNI TASDIQLASH VA JSHSHIR HISOBOTI */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Card
          sx={{
            p: 3,
            height: '100%',
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a237e' }}>
                {t('dashboard.identityRequestsTitle', "Shaxsni tasdiqlash so'rovlari")}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {t('dashboard.identityRequestsSubtitle', "Inspektorlar kiritgan pasport/JSHSHIR so'rovlari holati")}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/billing/shaxsni-tasdiqlash')}
                sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap', borderRadius: '8px' }}
              >
                {t('dashboard.requests', "So'rovlar →")}
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/billing/report-identifikatsiya')}
                sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                {t('dashboard.report', "Hisobot →")}
              </Button>
            </Stack>
          </Stack>

          {/* 4 ta indikator kartalar */}
          <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
            {/* 1. Jami so'rovlar */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                onClick={() => setIdentityFilter('all')}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: identityFilter === 'all' ? 'rgba(33, 150, 243, 0.14)' : 'rgba(33, 150, 243, 0.06)',
                  border: identityFilter === 'all' ? '2px solid #1976d2' : '1px solid rgba(33, 150, 243, 0.2)',
                  boxShadow: identityFilter === 'all' ? '0 4px 12px rgba(25, 118, 210, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)'
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  {t('dashboard.totalRequests', "Jami so'rovlar")}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1976d2', mt: 0.5 }}>
                  {identityLoading ? '...' : fmt(identityStats?.totalRequests || 0)} {t('dashboard.countUnit', 'ta')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600, display: 'block', mt: 0.5 }}>
                  {t('dashboard.sentFromBot', "Botdan yuborilgan")}
                </Typography>
              </Box>
            </Grid>

            {/* 2. Faol (Kutilmoqda) */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                onClick={() => setIdentityFilter('pending')}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: identityFilter === 'pending' ? 'rgba(245, 158, 11, 0.16)' : 'rgba(245, 158, 11, 0.08)',
                  border: identityFilter === 'pending' ? `2px solid ${darkYellowColor}` : '1px solid rgba(245, 158, 11, 0.25)',
                  boxShadow: identityFilter === 'pending' ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  {t('dashboard.activeWaiting', "Faol (Kutilmoqda)")}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: darkYellowColor, mt: 0.5 }}>
                  {identityLoading ? '...' : fmt(identityStats?.pendingCount || 0)} {t('dashboard.countUnit', 'ta')}
                </Typography>
                <Typography variant="caption" sx={{ color: darkYellowColor, fontWeight: 600, display: 'block', mt: 0.5 }}>
                  {t('dashboard.waitingConfirmation', "Tasdiq kutilmoqda")}
                </Typography>
              </Box>
            </Grid>

            {/* 3. Tasdiqlangan */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                onClick={() => setIdentityFilter('confirmed')}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: identityFilter === 'confirmed' ? 'rgba(34, 197, 94, 0.16)' : 'rgba(34, 197, 94, 0.08)',
                  border: identityFilter === 'confirmed' ? '2px solid #15803d' : '1px solid rgba(34, 197, 94, 0.25)',
                  boxShadow: identityFilter === 'confirmed' ? '0 4px 12px rgba(34, 197, 94, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)'
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  {t('dashboard.confirmed', "Tasdiqlangan")}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>
                  {identityLoading ? '...' : fmt(identityStats?.confirmedCount || 0)} {t('dashboard.countUnit', 'ta')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600, display: 'block', mt: 0.5 }}>
                  {t('dashboard.identityVerified', "Shaxsi tekshirilgan")}
                </Typography>
              </Box>
            </Grid>

            {/* 4. Bekor qilingan */}
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box
                onClick={() => setIdentityFilter('canceled')}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: identityFilter === 'canceled' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(239, 68, 68, 0.06)',
                  border: identityFilter === 'canceled' ? '2px solid #dc2626' : '1px solid rgba(239, 68, 68, 0.2)',
                  boxShadow: identityFilter === 'canceled' ? '0 4px 12px rgba(220, 38, 38, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
                  }
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  {t('dashboard.canceled', "Bekor qilingan")}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#dc2626', mt: 0.5 }}>
                  {identityLoading ? '...' : fmt(identityStats?.canceledCount || 0)} {t('dashboard.countUnit', 'ta')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600, display: 'block', mt: 0.5 }}>
                  {t('dashboard.rejected', "Rad etilgan")}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Top nazoratchilar reytingi */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            {identityFilter === 'confirmed'
              ? t('dashboard.topInspectorsConfirmed', "Shaxsi tasdiqlangan so'rovlar bo'yicha nazoratchilar (Top 5):")
              : identityFilter === 'pending'
                ? t('dashboard.topInspectorsPending', "Faol kutilayotgan so'rovlar bo'yicha nazoratchilar (Top 5):")
                : identityFilter === 'canceled'
                  ? t('dashboard.topInspectorsCanceled', "Bekor qilingan so'rovlar bo'yicha nazoratchilar (Top 5):")
                  : t('dashboard.topInspectorsAll', "Eng ko'p so'rov kiritgan nazoratchilar (Jami so'rovlar bo'yicha Top 5):")}
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '10px' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: useCustomizationStore.getState().customization.mode == 'dark' ? 'grey.800' : 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, py: 1, width: 40 }}>№</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1 }}>{t('dashboard.inspectorFullName', 'Nazoratchi F.I.SH')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1, textAlign: 'right' }}>
                    {identityFilter === 'pending'
                      ? t('dashboard.pendingRequests', "Kutilayotgan so'rovlar")
                      : identityFilter === 'confirmed'
                        ? t('dashboard.confirmed', 'Tasdiqlangan')
                        : identityFilter === 'canceled'
                          ? t('dashboard.canceled', 'Bekor qilingan')
                          : t('dashboard.requestCount', "So'rovlar soni")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {identityLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ py: 2, textAlign: 'center' }}>
                      <Skeleton height={30} />
                    </TableCell>
                  </TableRow>
                ) : !(identityStats?.topInspectorsByFilter?.[identityFilter] || identityStats?.topInspectors) ||
                  (identityStats?.topInspectorsByFilter?.[identityFilter] || identityStats?.topInspectors || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
                      {t('dashboard.noDataYet', "Hozircha ma'lumot mavjud emas")}
                    </TableCell>
                  </TableRow>
                ) : (
                  (identityStats?.topInspectorsByFilter?.[identityFilter] || identityStats?.topInspectors || []).map((inspector, idx) => (
                    <TableRow key={inspector._id || idx} hover>
                      <TableCell sx={{ py: 1, fontWeight: 700, color: 'text.secondary' }}>{idx + 1}</TableCell>
                      <TableCell sx={{ py: 1, fontWeight: 600 }}>{inspector.inspectorName || t('dashboard.unknownInspector', "Noma'lum nazoratchi")}</TableCell>
                      <TableCell
                        sx={{
                          py: 1,
                          textAlign: 'right',
                          fontWeight: 700,
                          color:
                            identityFilter === 'confirmed'
                              ? '#15803d'
                              : identityFilter === 'pending'
                                ? darkYellowColor
                                : identityFilter === 'canceled'
                                  ? '#dc2626'
                                  : '#1976d2'
                        }}
                      >
                        {fmt(inspector.confirmedCount ?? inspector.count ?? 0)} {t('dashboard.countUnit', 'ta')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>

      {/* 6. DEBITORLAR STATISTIKASI (Tashkilotlar kesimida) - Faqat Product Admin uchun */}
      {isProductAdmin && (
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3, borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}>
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 800, color: '#1a237e' }}>
              {t('dashboard.debtorsByCompanyTitle', 'Qarzdorlar statistikasi (Tashkilotlar kesimida)')}
            </Typography>
            {debitorLoading ? (
              <Stack spacing={2}>
                <Skeleton variant="rectangular" height={50} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rectangular" height={50} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rectangular" height={50} sx={{ borderRadius: '8px' }} />
              </Stack>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}
              >
                <Table sx={{ minWidth: 1000 }}>
                  <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.companyName', 'Tashkilot nomi')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.activeDebtors', 'Faol qarzdorlar')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.newlyIdentified', 'Yangi aniqlangan')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.noElectricityCode', "Elektr kodi yo'q")}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.noPhoneNumber', "Telefon raqami yo'q")}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.checkingSms', 'Tekshirilmoqda (SMS)')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.awaitingHetSync', 'HET sinxronizatsiya kutilmoqda')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.awaitingBlock', 'Bloklanishi kutilmoqda')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('dashboard.blocked', 'Bloklangan')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {debitorStats.map((row: any) => {
                      const resolved = row.resolved || getStatusData(row.statuses, 'resolved');
                      const activeCount = row.activeCount !== undefined ? row.activeCount : row.totalCount - resolved.count;
                      const activeDebt = row.activeDebt !== undefined ? row.activeDebt : row.totalDebt - resolved.totalDebt;

                      const identified =
                        row.dataNeedsAttention ||
                        getStatusData(row.statuses, 'data_needs_attention') ||
                        getStatusData(row.statuses, 'debt_identified');
                      const noHet = row.noHetAccount || getStatusData(row.statuses, 'no_het_account');
                      const noPhone = row.noPhone || getStatusData(row.statuses, 'no_phone');
                      const smsSent = row.smsChecking || getStatusData(row.statuses, 'sms_sent') || getStatusData(row.statuses, 'checking');
                      const awaitingHet =
                        row.needsHetSync ||
                        getStatusData(row.statuses, 'awaiting_het_sync') ||
                        getStatusData(row.statuses, 'needs_het_sync');
                      const readyBlock = row.readyToBlock || getStatusData(row.statuses, 'ready_to_block');
                      const blocked = row.blocked || getStatusData(row.statuses, 'blocked');

                      return (
                        <TableRow key={row.companyId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {row.companyName || t('dashboard.unknownMahalla', "Noma'lum")}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {row.locationName || ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                {fmt(activeCount)} {t('dashboard.countUnit', 'ta')}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                {fmtMoney(activeDebt)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2">{fmt(identified.count)} {t('dashboard.countUnit', 'ta')}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {fmtMoney(identified.totalDebt)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                                {fmt(noHet.count)} {t('dashboard.countUnit', 'ta')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {fmtMoney(noHet.totalDebt)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                                {fmt(noPhone.count)} {t('dashboard.countUnit', 'ta')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {fmtMoney(noPhone.totalDebt)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2" sx={{ color: darkYellowColor, fontWeight: 700 }}>
                                {fmt(smsSent.count)} {t('dashboard.countUnit', 'ta')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {fmtMoney(smsSent.totalDebt)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2" sx={{ color: darkYellowColor, fontWeight: 700 }}>
                                {fmt(awaitingHet.count)} {t('dashboard.countUnit', 'ta')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {fmtMoney(awaitingHet.totalDebt)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                                {fmt(readyBlock.count)} {t('dashboard.countUnit', 'ta')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {fmtMoney(readyBlock.totalDebt)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                                {fmt(blocked.count)} {t('dashboard.countUnit', 'ta')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {fmtMoney(blocked.totalDebt)}
                              </Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

// Yordamchi Komponentlar
interface PropsStatCard {
  title: string;
  count: number;
  icon: JSX.Element;
  color: string;
  loading: boolean;
  to?: string;
  onClick?: () => void;
}

const StatCard = ({ title, count, icon, color, loading, to, onClick }: PropsStatCard) => {
  const isClickable = Boolean(to || onClick);

  const cardContent = (
    <Card
      onClick={onClick}
      sx={{
        p: 3,
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        height: '100%',
        cursor: isClickable ? 'pointer' : 'default',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: isClickable ? 8 : 6,
          ...(isClickable && {
            borderColor: color
          })
        }
      }}
    >
      <Box sx={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.1, color: color }}>{icon}</Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {title}
        </Typography>
        {isClickable && (
          <Typography variant="caption" sx={{ color: color, fontWeight: 700, fontSize: '0.85rem' }}>
            →
          </Typography>
        )}
      </Stack>
      <Typography variant="h2" sx={{ mt: 1, fontWeight: 800 }}>
        {loading ? '...' : count?.toLocaleString()}
      </Typography>
    </Card>
  );

  return (
    <Grid size={{ xs: 12, md: 4 }}>
      {to ? (
        <Link to={to} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </Grid>
  );
};

const getStatusData = (statuses: any[], statusKey: string) => {
  const match = (statuses || []).find((s: any) => s.status === statusKey);
  return match ? { count: match.count, totalDebt: match.totalDebt } : { count: 0, totalDebt: 0 };
};

const DashboardWrapper = () => {
  const { user } = useCustomizationStore();
  if (user?.roles?.includes('dispatcher') && !user?.roles?.includes('admin')) {
    return <DispatcherDashboard />;
  }
  return <Dashboard />;
};

export default DashboardWrapper;
