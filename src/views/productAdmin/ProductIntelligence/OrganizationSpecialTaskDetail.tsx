import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CancelOutlined,
  FactCheckOutlined,
  AssignmentTurnedInOutlined,
  VerifiedUserOutlined,
  CorporateFareOutlined,
  Telegram,
  ScheduleOutlined,
  SearchOutlined,
  PhoneAndroidOutlined,
  BoltOutlined,
  StarsOutlined,
  ThumbUpOutlined,
  ReportProblemOutlined
} from '@mui/icons-material';
import api from 'utils/api';
import dayjs from 'dayjs';

interface IInspectorTaskStat {
  inspectorId: number;
  inspectorName: string;
  phone: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  checkingTasks: number;
  rejectedTasks: number;
  phoneTasks: number;
  electricityTasks: number;
  completionRate: number;
  todayCompleted: number;
  todayCategory?: 'alo' | 'yaxshi' | 'qoniqarli' | 'yomon' | 'tolik' | 'none';
}

interface ISingleOrgSpecialTaskDetail {
  company: {
    id: number;
    name: string;
    isSubscriptionActive: boolean;
    activeExpiresDate?: string | null;
  };
  metrics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    checkingTasks: number;
    rejectedTasks: number;
    phoneTasks: number;
    electricityTasks: number;
    completionRate: number;
    inspectorsCount: number;
    status: 'controlled' | 'uncontrolled' | 'no_tasks';
    statusExplanation: string;
  };
  controlWorkflow: {
    enabled: boolean;
    workflowType: string;
    deadlineTime: string;
    progressTimes: string[];
    defaultMeetingTime: string;
    chatId?: string;
    responsibleAdminName?: string;
    lastRun?: {
      date: string;
      decision: string;
      meetingAt?: string;
      resultsMessageId?: number;
      categoryCounts: {
        alo: number;
        yaxshi: number;
        qoniqarli: number;
        yomon: number;
        tolik: number;
      };
    };
  };
  reportsConfig: {
    dailyReport: {
      enabled: boolean;
      times: string[];
      chatId?: string;
      lastRunAt?: string | null;
    };
    totalReport: {
      enabled: boolean;
      times: string[];
      chatId?: string;
      lastRunAt?: string | null;
    };
  };
  inspectors: IInspectorTaskStat[];
}

export default function OrganizationSpecialTaskDetail() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<ISingleOrgSpecialTaskDetail | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDetail = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setErrorMsg(null);

      const res = await api.get(`/product-admin/special-tasks-intelligence/organizations/${companyId}`);
      if (res.data?.ok) {
        setData(res.data.data);
      } else {
        setErrorMsg(res.data?.error || 'Tashkilot maxsus topshiriqlari ma’lumotini yuklab bo‘lmadi');
      }
    } catch (err: any) {
      console.error('Fetch org special tasks error:', err);
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
  }, [companyId]);

  const filteredInspectors = useMemo(() => {
    if (!data?.inspectors) return [];
    let list = [...data.inspectors];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (ins) =>
          ins.inspectorName.toLowerCase().includes(q) ||
          String(ins.inspectorId).includes(q) ||
          ins.phone.includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      list = list.filter((ins) => ins.todayCategory === categoryFilter);
    }

    return list;
  }, [data, search, categoryFilter]);

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'alo':
        return (
          <Chip
            icon={<StarsOutlined sx={{ fontSize: 14 }} />}
            label="A’lo (20+)"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.25 : 0.1),
              color: theme.palette.success.main,
              fontWeight: 700
            }}
          />
        );
      case 'yaxshi':
        return (
          <Chip
            icon={<ThumbUpOutlined sx={{ fontSize: 14 }} />}
            label="Yaxshi (15-19)"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.25 : 0.1),
              color: theme.palette.info.main,
              fontWeight: 700
            }}
          />
        );
      case 'qoniqarli':
        return (
          <Chip
            label="Qoniqarli (10-14)"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.25 : 0.1),
              color: theme.palette.warning.main,
              fontWeight: 700
            }}
          />
        );
      case 'yomon':
        return (
          <Chip
            icon={<ReportProblemOutlined sx={{ fontSize: 14 }} />}
            label="Yomon (<10)"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.25 : 0.1),
              color: theme.palette.error.main,
              fontWeight: 700
            }}
          />
        );
      case 'tolik':
        return (
          <Chip
            label="To‘liq bajarilgan"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.25 : 0.1),
              color: theme.palette.secondary.main,
              fontWeight: 700
            }}
          />
        );
      case 'none':
      default:
        return (
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Baholanmagan
          </Typography>
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 2 }}>
          Tashkilot maxsus topshiriqlari tahlili yuklanmoqda...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate('/dashboard/product-intelligence?tab=special_tasks')}
          sx={{ textTransform: 'none', borderRadius: '8px' }}
        >
          Orqaga
        </Button>

        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: 'pointer', fontSize: 14 }}
            onClick={() => navigate('/dashboard/product-intelligence?tab=special_tasks')}
          >
            Product Intelligence
          </Link>
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
            Maxsus topshiriqlar va nazorat auditi
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
                <Chip label={`ID: #${data?.company.id}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
              </Stack>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                {data?.metrics.statusExplanation}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            {data?.metrics.status === 'controlled' ? (
              <Chip
                icon={<CheckCircleOutlineOutlined sx={{ fontSize: 16 }} />}
                label="Faol nazoratda"
                color="success"
                sx={{ fontWeight: 700 }}
              />
            ) : data?.metrics.status === 'uncontrolled' ? (
              <Chip
                icon={<WarningAmberOutlined sx={{ fontSize: 16 }} />}
                label="Nazorat o‘rnatilmagan"
                color="warning"
                sx={{ fontWeight: 700 }}
              />
            ) : (
              <Chip label="Topshiriq yo‘q" sx={{ fontWeight: 600 }} />
            )}

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
      </Card>

      {/* KPI Kartalari */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
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
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, mb: 0.5 }}>
              Jami topshiriqlar
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
              {(data?.metrics.totalTasks || 0).toLocaleString()} ta
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Telefon: <b>{(data?.metrics.phoneTasks || 0).toLocaleString()}</b> | Elektr:{' '}
              <b>{(data?.metrics.electricityTasks || 0).toLocaleString()}</b>
            </Typography>
          </Card>
        </Grid>

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
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, mb: 0.5 }}>
              Bajarilganlar sur’ati
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.success.main, mb: 1 }}>
              {data?.metrics.completionRate}%
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Bajarildi: <b>{(data?.metrics.completedTasks || 0).toLocaleString()} ta</b> topshiriq
            </Typography>
          </Card>
        </Grid>

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
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, mb: 0.5 }}>
              Jarayonda / Tekshirilmoqda
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.info.main, mb: 1 }}>
              {(data?.metrics.inProgressTasks || 0).toLocaleString()} ta
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Tekshirilmoqda: <b>{(data?.metrics.checkingTasks || 0).toLocaleString()} ta</b>
            </Typography>
          </Card>
        </Grid>

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
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, mb: 0.5 }}>
              Biriktirilgan nazoratchilar
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 1 }}>
              {data?.metrics.inspectorsCount || 0} nafar
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Topshiriqlari bor nazoratchilar soni
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Kunlik Nazorat Workflow Sozlamalari va Oxirgi Ijro Natijalari */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: '12px',
              height: '100%'
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                Kunlik nazorat workflow'i (20:00 da baholash)
              </Typography>
              <Chip
                label={data?.controlWorkflow.enabled ? 'Faol yoqilgan' : 'O‘chirilgan'}
                color={data?.controlWorkflow.enabled ? 'success' : 'default'}
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                  Yakuniy baholash muddati:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  {data?.controlWorkflow.deadlineTime || '20:00'} (Har kuni)
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                  Mas’ul admin / rahbar:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  {data?.controlWorkflow.responsibleAdminName || 'Belgilanmagan'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                  Oraliq monitoring vaqtlari:
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {data?.controlWorkflow.progressTimes.map((t) => (
                    <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                  Telegram guruhi:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {data?.controlWorkflow.chatId || 'Guruh ko‘rsatilmagan'}
                </Typography>
              </Grid>
            </Grid>

            {data?.controlWorkflow.lastRun && (
              <Box
                sx={{
                  mt: 2.5,
                  p: 2,
                  borderRadius: '10px',
                  bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  border: '1px solid',
                  borderColor: theme.palette.divider
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Oxirgi kungi ijro natijasi ({data.controlWorkflow.lastRun.date}):
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label={`A’lo: ${data.controlWorkflow.lastRun.categoryCounts.alo} ta`}
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.success.main, 0.15), color: theme.palette.success.main, fontWeight: 700 }}
                  />
                  <Chip
                    label={`Yaxshi: ${data.controlWorkflow.lastRun.categoryCounts.yaxshi} ta`}
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.info.main, 0.15), color: theme.palette.info.main, fontWeight: 700 }}
                  />
                  <Chip
                    label={`Qoniqarli: ${data.controlWorkflow.lastRun.categoryCounts.qoniqarli} ta`}
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.warning.main, 0.15), color: theme.palette.warning.main, fontWeight: 700 }}
                  />
                  <Chip
                    label={`Yomon: ${data.controlWorkflow.lastRun.categoryCounts.yomon} ta`}
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.15), color: theme.palette.error.main, fontWeight: 700 }}
                  />
                  <Chip
                    label={`To‘liq: ${data.controlWorkflow.lastRun.categoryCounts.tolik} ta`}
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.15), color: theme.palette.secondary.main, fontWeight: 700 }}
                  />
                </Stack>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Telegram Hisobotlari Holati */}
        <Grid item xs={12} md={5}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
              borderRadius: '12px',
              height: '100%'
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 2 }}>
              Telegram hisobotlari holati
            </Typography>

            {/* Kunlik tezkor hisobot */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: theme.palette.divider,
                mb: 1.5
              }}
            >
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Kunlik tezkor hisobot
                </Typography>
                <Chip
                  label={data?.reportsConfig.dailyReport.enabled ? 'Faol' : 'O‘chirilgan'}
                  color={data?.reportsConfig.dailyReport.enabled ? 'success' : 'default'}
                  size="small"
                  sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                />
              </Stack>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                Vaqtlari: {data?.reportsConfig.dailyReport.times.join(', ')}
              </Typography>
            </Box>

            {/* Jami hisobot */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Jami jamlangan hisobot
                </Typography>
                <Chip
                  label={data?.reportsConfig.totalReport.enabled ? 'Faol' : 'O‘chirilgan'}
                  color={data?.reportsConfig.totalReport.enabled ? 'success' : 'default'}
                  size="small"
                  sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                />
              </Stack>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                Vaqtlari: {data?.reportsConfig.totalReport.times.join(', ')}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Nazoratchilar bo'yicha Tahlil Jadvali */}
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
            placeholder="Nazoratchi F.I.Sh yoki ID bo‘yicha qidirish..."
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
              { id: 'alo', label: 'A’lo (20+)' },
              { id: 'yaxshi', label: 'Yaxshi (15-19)' },
              { id: 'qoniqarli', label: 'Qoniqarli (10-14)' },
              { id: 'yomon', label: 'Yomon (<10)' },
              { id: 'tolik', label: 'To‘liq bajarilgan' }
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
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.04) : alpha('#000', 0.02) }}>
              <TableCell sx={{ fontWeight: 700 }}>№</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Nazoratchi</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Telefon</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Jami topshiriq
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Bajarildi
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Jarayonda
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Bajarilish sur’ati
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Telefon / Elektr
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Bugun kiritgan
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Bugungi toifasi
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInspectors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    Nazoratchilar topilmadi
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredInspectors.map((ins, idx) => (
                <TableRow key={ins.inspectorId} hover>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>{idx + 1}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                      {ins.inspectorName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      ID: #{ins.inspectorId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{ins.phone}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {ins.totalTasks.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      {ins.completedTasks.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {ins.inProgressTasks.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 130 }}>
                    <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        {ins.completionRate}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={ins.completionRate}
                        sx={{
                          width: '100%',
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.15)
                        }}
                      />
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      Tel: <b>{ins.phoneTasks}</b> | Elektr: <b>{ins.electricityTasks}</b>
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: ins.todayCompleted > 0 ? theme.palette.success.main : theme.palette.text.secondary
                      }}
                    >
                      {ins.todayCompleted > 0 ? `+${ins.todayCompleted} ta` : '0 ta'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {getCategoryBadge(ins.todayCategory)}
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
