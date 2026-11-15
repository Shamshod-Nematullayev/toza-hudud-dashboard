import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  Button,
  TextField,
  InputAdornment,
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
  InputLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  RefreshOutlined,
  SearchOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  TrendingFlatOutlined,
  CorporateFareOutlined,
  AssignmentTurnedInOutlined,
  ReceiptLongOutlined,
  CheckCircleOutlineOutlined,
  WarningAmberOutlined,
  ErrorOutlineOutlined,
  ArrowForwardIosOutlined,
  HelpOutlineOutlined,
  SignalCellularAltOutlined,
  SmartToyOutlined,
  FactCheckOutlined
} from '@mui/icons-material';
import api from 'utils/api';
import dayjs from 'dayjs';
import AutomatedReportsOverview from './AutomatedReportsOverview';
import SpecialTasksOverview from './SpecialTasksOverview';

interface IMonthlyDynamicsItem {
  month: string;
  label: string;
  totalActs: number;
  gzActs: number;
  externalActs: number;
  adoptionRate: number | null;
}

interface IOrganizationSummary {
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
}

interface IKpis {
  totalOrganizations: number;
  activeOrganizationsWithActs: number;
  totalActs: number;
  totalGzActs: number;
  overallAdoptionRate: number | null;
  attentionRequiredCount: number;
}

export default function ProductIntelligenceDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam === 'reports' ? 'reports' : tabParam === 'special_tasks' ? 'special_tasks' : 'acts';

  const handleTabChange = (_: any, newTab: string) => {
    setSearchParams(newTab === 'acts' ? {} : { tab: newTab });
  };

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpis, setKpis] = useState<IKpis | null>(null);
  const [organizations, setOrganizations] = useState<IOrganizationSummary[]>([]);
  const [lastCalculatedAt, setLastCalculatedAt] = useState<string>('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'totalActs' | 'adoptionRate' | 'growth' | 'name'>('totalActs');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);
      setErrorMsg(null);

      const res = await api.get('/product-admin/workflow-intelligence/summary', {
        params: { forceRefresh: force ? 'true' : 'false' }
      });

      if (res.data && res.data.ok && res.data.data) {
        setKpis(res.data.data.kpis);
        setOrganizations(res.data.data.organizations || []);
        setLastCalculatedAt(res.data.data.lastCalculatedAt || new Date().toISOString());
      } else {
        setErrorMsg(res.data?.message || 'Ma’lumotlarni yuklab bo‘lmadi');
      }
    } catch (err: any) {
      console.error('Workflow intelligence fetch error:', err);
      setErrorMsg(err?.response?.data?.message || 'Serverdan ma’lumot olishda xatolik yuz berdi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

  // Filter va saralash
  const filteredOrganizations = useMemo(() => {
    let list = [...organizations];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (org) =>
          org.companyName.toLowerCase().includes(q) ||
          (org.locationName && org.locationName.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((org) => org.status === statusFilter);
    }

    list.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') {
        comp = a.companyName.localeCompare(b.companyName);
      } else if (sortBy === 'adoptionRate') {
        const valA = a.adoptionRateCurrent ?? -1;
        const valB = b.adoptionRateCurrent ?? -1;
        comp = valA - valB;
      } else if (sortBy === 'growth') {
        comp = a.actsGrowthCount - b.actsGrowthCount;
      } else {
        comp = a.totalActsCurrent - b.totalActsCurrent;
      }
      return sortOrder === 'desc' ? -comp : comp;
    });

    return list;
  }, [organizations, search, statusFilter, sortBy, sortOrder]);

  const getStatusBadge = (status: IOrganizationSummary['status']) => {
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
              fontWeight: 600,
              fontSize: '0.75rem'
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
              fontWeight: 600,
              fontSize: '0.75rem'
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
              fontWeight: 600,
              fontSize: '0.75rem'
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
              fontWeight: 600,
              fontSize: '0.75rem'
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
              fontWeight: 600,
              fontSize: '0.75rem'
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
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
        );
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('uz-UZ').format(num);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Yuqori Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 3
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Product Intelligence
            </Typography>
            <Chip
              label="Workflow Intelligence MVP"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600
              }}
            />
          </Stack>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
            Abonentlar bilan ishlash → Qayta hisob-kitob aktlari monitoringi va butun ekotizim adoption ko‘rsatkichlari
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {lastCalculatedAt && (
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Oxirgi yangilanish: {dayjs(lastCalculatedAt).format('DD.MM.YYYY HH:mm')}
            </Typography>
          )}
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshOutlined />}
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}
          >
            {refreshing ? 'Yangilanmoqda...' : 'Yangilash'}
          </Button>
        </Stack>
      </Stack>

      {/* Workflow Tabs (Product Intelligence Modules) */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              minHeight: 48,
              px: 2.5
            }
          }}
        >
          <Tab
            value="acts"
            label="Qayta hisob-kitob aktlari"
            icon={<ReceiptLongOutlined sx={{ fontSize: 20 }} />}
            iconPosition="start"
          />
          <Tab
            value="reports"
            label="Avtomatlashtirilgan hisobotlar"
            icon={<SmartToyOutlined sx={{ fontSize: 20 }} />}
            iconPosition="start"
          />
          <Tab
            value="special_tasks"
            label="Maxsus topshiriqlar va nazorat"
            icon={<FactCheckOutlined sx={{ fontSize: 20 }} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {activeTab === 'reports' ? (
        <AutomatedReportsOverview />
      ) : activeTab === 'special_tasks' ? (
        <SpecialTasksOverview />
      ) : (
        <>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMsg}
            </Alert>
          )}

          {/* KPI Kartalari */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* 1. Jami tashkilotlar */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: '12px'
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '8px',
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                  color: theme.palette.primary.main,
                  display: 'flex'
                }}
              >
                <CorporateFareOutlined sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Jami tashkilotlar
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {loading ? '-' : formatNumber(kpis?.totalOrganizations || 0)}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Ekotizimdagi barcha faol korxonalar
            </Typography>
          </Card>
        </Grid>

        {/* 2. Akt yaratgan tashkilotlar */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: '12px'
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '8px',
                  bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                  color: theme.palette.success.main,
                  display: 'flex'
                }}
              >
                <AssignmentTurnedInOutlined sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Shu oyda faol
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {loading ? '-' : formatNumber(kpis?.activeOrganizationsWithActs || 0)}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Shu oy akt yaratgan tashkilotlar
            </Typography>
          </Card>
        </Grid>

        {/* 3. Jami aktlar */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: '12px'
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '8px',
                  bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                  color: theme.palette.info.main,
                  display: 'flex'
                }}
              >
                <ReceiptLongOutlined sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Jami aktlar
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {loading ? '-' : formatNumber(kpis?.totalActs || 0)}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Barcha kanallar (GZ + Tashqi)
            </Typography>
          </Card>
        </Grid>

        {/* 4. GreenZone aktlari */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: '12px'
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '8px',
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                  color: theme.palette.primary.main,
                  display: 'flex'
                }}
              >
                <CheckCircleOutlineOutlined sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                GreenZone aktlari
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {loading ? '-' : formatNumber(kpis?.totalGzActs || 0)}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              GreenZone tizimida yaratilgan
            </Typography>
          </Card>
        </Grid>

        {/* 5. Umumiy Adoption foizi */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: '12px'
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '8px',
                  bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                  color: theme.palette.secondary.main,
                  display: 'flex'
                }}
              >
                <TrendingUpOutlined sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Adoption darajasi
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {loading
                ? '-'
                : kpis?.overallAdoptionRate !== null && kpis?.overallAdoptionRate !== undefined
                ? `${kpis.overallAdoptionRate}%`
                : 'N/A'}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={kpis?.overallAdoptionRate || 0}
              sx={{
                mt: 1,
                mb: 0.5,
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.15)
              }}
            />
          </Card>
        </Grid>

        {/* 6. E'tibor talab qiladigan tashkilotlar */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: '12px'
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '8px',
                  bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                  color: theme.palette.error.main,
                  display: 'flex'
                }}
              >
                <WarningAmberOutlined sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                E’tibor talab
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
              {loading ? '-' : formatNumber(kpis?.attentionRequiredCount || 0)}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Past adoption yoki pasaygan
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter va Jadval bloki */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        {/* Filter Paneli */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: theme.palette.divider }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flex: 1 }}>
              {/* Qidiruv */}
              <TextField
                placeholder="Tashkilot nomi yoki hududi bo‘yicha qidirish..."
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                      </InputAdornment>
                    )
                  }
                }}
                sx={{ minWidth: { xs: '100%', sm: 280 } }}
              />

              {/* Holat filtri */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="status-filter-label">Holat bo‘yicha</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Holat bo‘yicha"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Barchasi</MenuItem>
                  <MenuItem value="active">Faol (≥ 70%)</MenuItem>
                  <MenuItem value="partial">Qisman (30–69%)</MenuItem>
                  <MenuItem value="low">Past foydalanish (&lt; 30%)</MenuItem>
                  <MenuItem value="declined">Faolligi pasaygan</MenuItem>
                  <MenuItem value="insufficient_data">Yetarli emas</MenuItem>
                  <MenuItem value="connection_error">Ulanish xatosi</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Saralash */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="sort-by-label">Saralash</InputLabel>
                <Select
                  labelId="sort-by-label"
                  value={sortBy}
                  label="Saralash"
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <MenuItem value="totalActs">Jami aktlar</MenuItem>
                  <MenuItem value="adoptionRate">Adoption foizi</MenuItem>
                  <MenuItem value="growth">O‘zgarish trendi</MenuItem>
                  <MenuItem value="name">Tashkilot nomi</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                size="small"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                sx={{ minWidth: 42, px: 1, py: 0.9, borderRadius: '8px' }}
              >
                {sortOrder === 'desc' ? 'Kamayish ↓' : 'O‘sish ↑'}
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Jadval */}
        <TableContainer>
          <Table sx={{ minWidth: 850 }}>
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Tashkilot</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>O‘tgan oy jami</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Joriy oy jami</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>GZ aktlari</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Tashqi aktlar</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, minWidth: 160 }}>Adoption</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>O‘zgarish</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Holat</TableCell>
                <TableCell align="center" sx={{ width: 50 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1.5 }}>
                      Tashkilotlar ma’lumotlari tahlil qilinmoqda...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredOrganizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <HelpOutlineOutlined sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Mos tashkilotlar topilmadi
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                      Qidiruv yoki filter mezonlarini o‘zgartirib ko‘ring
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrganizations.map((org) => {
                  const adoption = org.adoptionRateCurrent;
                  const growth = org.actsGrowthCount;

                  return (
                    <TableRow
                      key={org.companyId}
                      hover
                      onClick={() => navigate(`/dashboard/product-intelligence/${org.companyId}`)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      {/* Tashkilot nomi */}
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {org.companyName}
                        </Typography>
                        {org.locationName && (
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {org.locationName} ({org.companyId})
                          </Typography>
                        )}
                      </TableCell>

                      {/* O'tgan oy jami */}
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatNumber(org.totalActsPrevMonth)}
                        </Typography>
                      </TableCell>

                      {/* Joriy oy jami */}
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {formatNumber(org.totalActsCurrent)}
                        </Typography>
                      </TableCell>

                      {/* GZ aktlari */}
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          {formatNumber(org.gzActsCurrent)}
                        </Typography>
                      </TableCell>

                      {/* Tashqi aktlar */}
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {formatNumber(org.externalActsCurrent)}
                        </Typography>
                      </TableCell>

                      {/* Adoption Foizi */}
                      <TableCell align="center">
                        {adoption === null ? (
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            N/A
                          </Typography>
                        ) : (
                          <Box sx={{ width: '100%', px: 1 }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {adoption}%
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={adoption}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.divider, 0.5),
                                '& .MuiLinearProgress-bar': {
                                  bgcolor:
                                    adoption >= 70
                                      ? theme.palette.success.main
                                      : adoption >= 30
                                      ? theme.palette.primary.main
                                      : theme.palette.warning.main
                                }
                              }}
                            />
                          </Box>
                        )}
                      </TableCell>

                      {/* O'zgarish */}
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                          {growth > 0 ? (
                            <>
                              <TrendingUpOutlined sx={{ fontSize: 16, color: theme.palette.success.main }} />
                              <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                                +{growth}
                              </Typography>
                            </>
                          ) : growth < 0 ? (
                            <>
                              <TrendingDownOutlined sx={{ fontSize: 16, color: theme.palette.error.main }} />
                              <Typography variant="body2" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                                {growth}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <TrendingFlatOutlined sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                0
                              </Typography>
                            </>
                          )}
                        </Stack>
                      </TableCell>

                      {/* Holat */}
                      <TableCell align="center">{getStatusBadge(org.status)}</TableCell>

                      {/* Arrow */}
                      <TableCell align="center">
                        <IconButton size="small">
                          <ArrowForwardIosOutlined sx={{ fontSize: 13, color: theme.palette.text.secondary }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
        </>
      )}
    </Box>
  );
}
