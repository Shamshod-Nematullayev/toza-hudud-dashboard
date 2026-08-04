import { JSX, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { gridSpacing } from 'store/constant';
import RadialChart from './RadialChart';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { Box, Card, LinearProgress, Stack, SvgIconProps, Typography, useTheme, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useCustomizationStore from 'store/customizationStore';
import { IconBolt, IconChartBar, IconShieldCheck, IconUsers } from '@tabler/icons-react';

interface IStat {
  allAbonentsCount?: number;
  identifiedCount?: number;
  // etkConfirmCount?: number;
  newAbonentRequestCount?: number;
  monthlyIncomePlanAccrual?: number;
  monthlyIncomePlanTotalAmount?: number;
}

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(n);
const fmtMoney = (n: number) => fmt(n) + " so'm";

const Dashboard = () => {
  const { mahallalar, user } = useCustomizationStore();
  useEffect(() => {
    if (mahallalar.length === 0) {
      api.get('/mahallas', { params: { isMinimalize: true, page: 1, limit: 1000 } }).then(({ data }) => {
        useCustomizationStore.setState({ mahallalar: data.data });
      });
    }
  }, []);

  const theme = useTheme();
  const [isLoading, setLoading] = useState(true);
  const [stats, setStats] = useState<IStat | null>(null);
  const [debitorStats, setDebitorStats] = useState<any[]>([]);
  const [debitorLoading, setDebitorLoading] = useState(true);

  const identityProcent = Math.floor(((stats?.identifiedCount || 0) / (stats?.allAbonentsCount || 1)) * 100) || 0;
    const isProductAdmin = user?.roles?.includes('product_admin')

  useEffect(() => {
    document.title = 'GreenZone - Command Center';
    const fetchData = async () => {
      try {
        const [allAbonentsCount, identifiedCount, newAbonentRequestCount, totalIncome] = await Promise.all([api.get('/statistics/all-abonents-count'), api.get('/statistics/identified-count'), api.get('/statistics/new-abonent-request-count'), api.get("/statistics/monthly-income-percent")]);
        
        setStats({
          allAbonentsCount: allAbonentsCount.data,
          identifiedCount: identifiedCount.data,
          newAbonentRequestCount: newAbonentRequestCount.data,
          monthlyIncomePlanAccrual: totalIncome.data.sumAccrual,
          monthlyIncomePlanTotalAmount: totalIncome.data.totalAmount,
        });
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDebitorStats = async () => {
      try {
        const { data } = await api.get('/debitors/stats', { params: { byCompany: true } });
        if (data && data.success) {
          setDebitorStats(data.data || []);
        }
      } catch (error) {
        console.error('Failed to load debitor stats:', error);
      } finally {
        setDebitorLoading(false);
      }
    };
    fetchDebitorStats();
  }, []);

  return (
    <Grid container spacing={gridSpacing}>
      {/* 1. ASOSIY STRATEGIK KARTALAR */}
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={gridSpacing}>
          <StatCard
            title="Umumiy Iste'molchilar"
            count={stats?.allAbonentsCount || 0}
            icon={<IconUsers size="2.2rem" />}
            color={theme.palette.primary.main}
            loading={isLoading}
          />
          <StatCard
            title="Identifikatsiyadan o'tmagan"
            count={(stats?.allAbonentsCount || 0) - (stats?.identifiedCount || 0)}
            icon={<IconShieldCheck size="2.2rem" />}
            color={theme.palette.success.main}
            loading={isLoading}
          />
          <StatCard
            title="Yangi abonent arizalari"
            count={stats?.newAbonentRequestCount || 0}
            icon={<IconBolt size="2.2rem" />}
            color={theme.palette.warning.main}
            loading={isLoading}
          />
        </Grid>
      </Grid>

       {/* 2. ASOSIY GRAFIK PANEL (Dahshatli qism) */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <Card
          sx={{
            p: 3,
            borderRadius: '20px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
            // background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Typography variant="h3" sx={{ mb: 4, fontWeight: 800, color: '#1a237e' }}>
            Tizim Nazorati <IconChartBar size="1.5rem" style={{ verticalAlign: 'middle' }} />
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(33, 150, 243, 0.04)', borderRadius: '15px' }}>
                <RadialChart isLoading={isLoading} progress={identityProcent} label="Identifikatsiya" />
                <Typography variant="caption" color="textSecondary">
                  Umumiy bazaga nisbatan aniqlik darajasi
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255, 193, 7, 0.04)', borderRadius: '15px' }}>
                <RadialChart isLoading={isLoading} progress={Math.floor(((stats?.monthlyIncomePlanTotalAmount || 0) / (stats?. monthlyIncomePlanAccrual || 1)) * 100) || 0} label="Tushum reja bajarilishi" />
                <Typography variant="caption" color="textSecondary">
                  Oylik rejaning bajarilishi
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      {/* 3. TEZKOR PROGRESS PANEL */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <Card sx={{ p: 3, height: '100%', borderRadius: '20px' }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
            Haqiqiy vaqtda holat
          </Typography>
          <Stack spacing={4}>
            <ProgressBlock label="Ma'lumotlar sifati" value={85} color="primary" />
            <ProgressBlock label="Server yuklamasi" value={42} color="secondary" />
            <ProgressBlock label="Xavfsizlik darajasi" value={100} color="success" />
          </Stack>
        </Card>
      </Grid>

      {/* DEBITORLAR STATISTIKASI (Tashkilotlar kesimida) */}
      {isProductAdmin  && (
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3, borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}>
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 800, color: '#1a237e' }}>
              Qarzdorlar statistikasi (Tashkilotlar kesimida)
            </Typography>
          {debitorLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={50} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="rectangular" height={50} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="rectangular" height={50} sx={{ borderRadius: '8px' }} />
            </Stack>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
              <Table sx={{ minWidth: 1000 }}>
                <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Tashkilot nomi</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Faol qarzdorlar</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Yangi aniqlangan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Elektr kodi yo'q</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Telefon raqami yo'q</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tekshirilmoqda (SMS)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>HET sinxronizatsiya kutilmoqda</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Bloklanishi kutilmoqda</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Bloklangan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {debitorStats.map((row: any) => {
                    const resolved = getStatusData(row.statuses, 'resolved');
                    const activeCount = row.totalCount - resolved.count;
                    const activeDebt = row.totalDebt - resolved.totalDebt;

                    const identified = getStatusData(row.statuses, 'debt_identified');
                    const noHet = getStatusData(row.statuses, 'no_het_account');
                    const noPhone = getStatusData(row.statuses, 'no_phone');
                    const smsSent = getStatusData(row.statuses, 'sms_sent');
                    const awaitingHet = getStatusData(row.statuses, 'awaiting_het_sync');
                    const readyBlock = getStatusData(row.statuses, 'ready_to_block');
                    const blocked = getStatusData(row.statuses, 'blocked');

                    return (
                      <TableRow key={row.companyId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.companyName || 'Noma\'lum'}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.locationName || ''}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>{fmt(activeCount)} ta</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>{fmtMoney(activeDebt)}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2">{fmt(identified.count)} ta</Typography>
                            <Typography variant="caption" color="text.secondary">{fmtMoney(identified.totalDebt)}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>{fmt(noHet.count)} ta</Typography>
                            <Typography variant="caption" color="text.secondary">{fmtMoney(noHet.totalDebt)}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>{fmt(noPhone.count)} ta</Typography>
                            <Typography variant="caption" color="text.secondary">{fmtMoney(noPhone.totalDebt)}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" color="warning.main">{fmt(smsSent.count)} ta</Typography>
                            <Typography variant="caption" color="text.secondary">{fmtMoney(smsSent.totalDebt)}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" color="warning.main">{fmt(awaitingHet.count)} ta</Typography>
                            <Typography variant="caption" color="text.secondary">{fmtMoney(awaitingHet.totalDebt)}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>{fmt(readyBlock.count)} ta</Typography>
                            <Typography variant="caption" color="text.secondary">{fmtMoney(readyBlock.totalDebt)}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>{fmt(blocked.count)} ta</Typography>
                            <Typography variant="caption" color="text.secondary">{fmtMoney(blocked.totalDebt)}</Typography>
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
}

const StatCard = ({ title, count, icon, color, loading }: PropsStatCard) => (
  <Grid size={{ xs: 12, md: 4 }}>
    <Card
      sx={{
        p: 3,
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        transition: '0.3s',
        '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
      }}
    >
      <Box sx={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.1, color: color }}>{icon}</Box>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="h2" sx={{ mt: 1, fontWeight: 800 }}>
        {loading ? '...' : count?.toLocaleString()}
      </Typography>
    </Card>
  </Grid>
);

const getStatusData = (statuses: any[], statusKey: string) => {
  const match = (statuses || []).find((s: any) => s.status === statusKey);
  return match ? { count: match.count, totalDebt: match.totalDebt } : { count: 0, totalDebt: 0 };
};

const ProgressBlock = ({ label, value, color }: { label: string; value: number; color: 'primary' | 'secondary' | 'success' }) => (
  <Box>
    <Stack direction="row" sx={{ mb: 1, justifyContent: 'space-between' }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {value}%
      </Typography>
    </Stack>
    <LinearProgress variant="determinate" value={value} color={color} sx={{ height: 8, borderRadius: 5 }} />
  </Box>
);
export default Dashboard;
