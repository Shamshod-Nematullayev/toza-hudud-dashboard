import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { gridSpacing } from 'store/constant';
import RadialChart from './RadialChart';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { Box, Card, LinearProgress, Stack, SvgIconProps, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useCustomizationStore from 'store/customizationStore';
import { IconBolt, IconChartBar, IconShieldCheck, IconUsers } from '@tabler/icons-react';

const Dashboard = () => {
  const { mahallalar } = useCustomizationStore();
  useEffect(() => {
    if (mahallalar.length === 0) {
      api.get('/mahallas', { params: { isMinimalize: true, page: 1, limit: 1000 } }).then(({ data }) => {
        useCustomizationStore.setState({ mahallalar: data.data });
      });
    }
  }, []);

  const theme = useTheme();
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState(true);
  const [identity, setIdentity] = useState({ confirmed: 0, allAbonentsCount: 1 });
  const [etkIdentity, setEtkIdentity] = useState({ confirmed: 0, allAbonentsCount: 1 });

  const identityProcent = Math.floor((identity.confirmed / identity.allAbonentsCount) * 100) || 0;
  const etkIdentityProcent = Math.floor((etkIdentity.confirmed / etkIdentity.allAbonentsCount) * 100) || 0;

  useEffect(() => {
    document.title = 'GreenZone - Command Center';
    const fetchData = async () => {
      try {
        const [res1, res2] = await Promise.all([api.get('/statistics/identity'), api.get('/statistics/elektrConfirm')]);
        setIdentity(res1.data);
        setEtkIdentity(res2.data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Grid container spacing={gridSpacing}>
      {/* 1. ASOSIY STRATEGIK KARTALAR */}
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <StatCard
            title="Umumiy Iste'molchilar"
            count={identity?.allAbonentsCount}
            icon={<IconUsers size="2.2rem" />}
            color={theme.palette.primary.main}
            loading={isLoading}
          />
          <StatCard
            title="Tasdiqlangan Shaxs"
            count={identity?.confirmed}
            icon={<IconShieldCheck size="2.2rem" />}
            color={theme.palette.success.main}
            loading={isLoading}
          />
          <StatCard
            title="Elektr Tasdiq"
            count={etkIdentity.confirmed}
            icon={<IconBolt size="2.2rem" />}
            color={theme.palette.warning.main}
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* 2. ASOSIY GRAFIK PANEL (Dahshatli qism) */}
      <Grid item xs={12} lg={8}>
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

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(33, 150, 243, 0.04)', borderRadius: '15px' }}>
                <RadialChart isLoading={isLoading} progress={identityProcent || 51} label="Identifikatsiya" />
                <Typography variant="caption" color="textSecondary">
                  Umumiy bazaga nisbatan aniqlik darajasi
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255, 193, 7, 0.04)', borderRadius: '15px' }}>
                <RadialChart isLoading={isLoading} progress={etkIdentityProcent || 45} label="ETK Tasdiq" />
                <Typography variant="caption" color="textSecondary">
                  Elektr tarmoqlari bilan sinxronizatsiya
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      {/* 3. TEZKOR PROGRESS PANEL */}
      <Grid item xs={12} lg={4}>
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
  <Grid item xs={12} sm={4}>
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

const ProgressBlock = ({ label, value, color }: { label: string; value: number; color: 'primary' | 'secondary' | 'success' }) => (
  <Box>
    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
      <Typography variant="body2" fontWeight={600}>
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
