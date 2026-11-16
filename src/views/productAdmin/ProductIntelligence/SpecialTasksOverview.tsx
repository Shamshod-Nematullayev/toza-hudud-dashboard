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
  CircularProgress,
  Alert
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  RefreshOutlined,
  SearchOutlined,
  AssignmentTurnedInOutlined,
  FactCheckOutlined,
  WarningAmberOutlined,
  ErrorOutlineOutlined,
  ArrowForwardIosOutlined,
  CheckCircleOutlineOutlined,
  CancelOutlined,
  PhoneAndroidOutlined,
  BoltOutlined,
  VerifiedUserOutlined
} from '@mui/icons-material';
import api from 'utils/api';

interface ISpecialTasksCompanySummary {
  companyId: number;
  companyName: string;
  isSubscriptionActive: boolean;
  activeExpiresDate?: string | null;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  checkingTasks: number;
  rejectedTasks: number;
  phoneTasks: number;
  electricityTasks: number;
  completionRate: number;
  inspectorsCount: number;
  controlWorkflow: {
    enabled: boolean;
    workflowType?: string;
    deadlineTime?: string;
    progressTimes?: string[];
    chatId?: string;
    lastRunDate?: string;
    lastRunDecision?: string;
    todayCompletedSum?: number;
    todayEvaluatedInspectors?: number;
    todayGoodInspectorsCount?: number;
    todayPoorInspectorsCount?: number;
  };
  reportsConfig: {
    dailyReportEnabled: boolean;
    totalReportEnabled: boolean;
    chatId?: string;
    lastRunAt?: string | null;
  };
  status: 'controlled' | 'uncontrolled' | 'no_tasks';
  statusExplanation: string;
}

interface ISpecialTasksIntelligenceSummary {
  totalCompanies: number;
  companiesWithTasksCount: number;
  companiesWithControlWorkflowCount: number;
  companiesWithReportsCount: number;
  uncontrolledCompaniesCount: number;
  totalEcosystemTasks: number;
  totalCompletedTasks: number;
  totalInProgressTasks: number;
  totalCheckingTasks: number;
  overallCompletionRate: number;
  totalPhoneTasks: number;
  totalElectricityTasks: number;
  companies: ISpecialTasksCompanySummary[];
}

export default function SpecialTasksOverview() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<ISpecialTasksIntelligenceSummary | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setErrorMsg(null);

      const res = await api.get('/product-admin/special-tasks-intelligence/summary');
      if (res.data?.ok) {
        setSummary(res.data.data);
      } else {
        setErrorMsg(res.data?.error || 'Maxsus topshiriqlar statistikasini yuklab bo‘lmadi');
      }
    } catch (err: any) {
      console.error('Fetch special tasks error:', err);
      setErrorMsg(err?.response?.data?.error || 'Serverdan ma’lumot olishda xatolik yuz berdi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }

    return list;
  }, [summary, search, statusFilter]);

  const getStatusChip = (status: string, explanation?: string) => {
    switch (status) {
      case 'controlled':
        return (
          <Tooltip title={explanation || 'Faol kunlik nazorat ostida'}>
            <Chip
              icon={<CheckCircleOutlineOutlined sx={{ fontSize: 16 }} />}
              label="Nazoratda"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.success.main,
                fontWeight: 600
              }}
            />
          </Tooltip>
        );
      case 'uncontrolled':
        return (
          <Tooltip title={explanation || 'Topshiriqlar bor, ammo nazorat o‘rnatilmagan'}>
            <Chip
              icon={<WarningAmberOutlined sx={{ fontSize: 16 }} />}
              label="Nazoratsiz"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: theme.palette.warning.main,
                fontWeight: 600
              }}
            />
          </Tooltip>
        );
      case 'no_tasks':
      default:
        return (
          <Tooltip title={explanation || 'Tashkilotda topshiriqlar mavjud emas'}>
            <Chip
              icon={<CancelOutlined sx={{ fontSize: 16 }} />}
              label="Topshiriq yo‘q"
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
      {/* Sarlavha va Yangilash */}
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
            Maxsus topshiriqlar va ularning nazorati
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Nazoratchilarga berilgan topshiriqlar ijrosi, kunlik nazorat workflow'i va Telegram hisobotlari monitoringi
          </Typography>
        </Box>

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

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {/* KPI Kartalari */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* 1. Jami topshiriqlar */}
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
                <FactCheckOutlined sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                  Jami topshiriqlar
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  {loading ? '-' : (summary?.totalEcosystemTasks || 0).toLocaleString()} ta
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Telefon: <b>{loading ? '-' : (summary?.totalPhoneTasks || 0).toLocaleString()}</b> | Elektr:{' '}
              <b>{loading ? '-' : (summary?.totalElectricityTasks || 0).toLocaleString()}</b>
            </Typography>
          </Card>
        </Grid>

        {/* 2. Bajarilish darajasi */}
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
                <AssignmentTurnedInOutlined sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                  Bajarilish darajasi
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  {loading ? '-' : `${summary?.overallCompletionRate || 0}%`}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Bajarildi: <b>{loading ? '-' : (summary?.totalCompletedTasks || 0).toLocaleString()} ta</b> topshiriq
            </Typography>
          </Card>
        </Grid>

        {/* 3. Nazorat workflow qamrovi */}
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
                <VerifiedUserOutlined sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                  Kunlik nazorat qamrovi
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                  {loading ? '-' : `${summary?.companiesWithControlWorkflowCount || 0} / ${summary?.companiesWithTasksCount || 0}`}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Har kuni soat 20:00 da avtomatik baholanuvchi tashkilotlar
            </Typography>
          </Card>
        </Grid>

        {/* 4. Nazoratsiz tashkilotlar */}
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
                  Nazorat o‘rnatilmagan
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: (summary?.uncontrolledCompaniesCount || 0) > 0 ? theme.palette.warning.main : theme.palette.text.primary
                  }}
                >
                  {loading ? '-' : `${summary?.uncontrolledCompaniesCount || 0} ta`}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Topshiriqlari bor, lekin nazorat workflow'i yoqilmagan
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filter va Qidiruv */}
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
              { id: 'controlled', label: 'Nazorat ostida' },
              { id: 'uncontrolled', label: 'Nazorat yo‘q (Action Needed)' },
              { id: 'no_tasks', label: 'Topshiriq yo‘q' }
            ].map((tab) => (
              <Chip
                key={tab.id}
                label={tab.label}
                clickable
                onClick={() => setStatusFilter(tab.id)}
                color={statusFilter === tab.id ? 'primary' : 'default'}
                variant={statusFilter === tab.id ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: statusFilter === tab.id ? 700 : 500,
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
        <Table sx={{ minWidth: 850 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.04) : alpha('#000', 0.02) }}>
              <TableCell sx={{ fontWeight: 700 }}>№</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tashkilot</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Jami topshiriqlar
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Nazoratchilar
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Bajarilish sur’ati
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Topshiriq turlari
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Kunlik nazorat (20:00)
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Telegram hisoboti
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Holat
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Harakat
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                    Ma’lumotlar yuklanmoqda...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
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
                  onClick={() => navigate(`/dashboard/product-intelligence/special-tasks/${comp.companyId}`)}
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
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {comp.totalTasks > 0 ? comp.totalTasks.toLocaleString() : '—'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {comp.inspectorsCount > 0 ? `${comp.inspectorsCount} ta` : '—'}
                    </Typography>
                  </TableCell>

                  <TableCell align="center" sx={{ minWidth: 150 }}>
                    {comp.totalTasks > 0 ? (
                      <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', width: '100%' }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {comp.completedTasks.toLocaleString()} ta
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                            {comp.completionRate}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={comp.completionRate}
                          sx={{
                            width: '100%',
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.primary.main, 0.15)
                          }}
                        />
                      </Stack>
                    ) : (
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        —
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {comp.totalTasks > 0 ? (
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                        <Tooltip title={`Telefon: ${comp.phoneTasks.toLocaleString()} ta`}>
                          <Chip
                            icon={<PhoneAndroidOutlined sx={{ fontSize: 13 }} />}
                            label={comp.phoneTasks.toLocaleString()}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: 11 }}
                          />
                        </Tooltip>
                        <Tooltip title={`Elektr (ETK): ${comp.electricityTasks.toLocaleString()} ta`}>
                          <Chip
                            icon={<BoltOutlined sx={{ fontSize: 13 }} />}
                            label={comp.electricityTasks.toLocaleString()}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: 11 }}
                          />
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        —
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {comp.controlWorkflow.enabled ? (
                      <Chip
                        label={`Faol (${comp.controlWorkflow.deadlineTime || '20:00'})`}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 600, height: 22, fontSize: 11 }}
                      />
                    ) : comp.totalTasks > 0 ? (
                      <Chip
                        label="Sozlanmagan"
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 600, height: 22, fontSize: 11 }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        —
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {comp.reportsConfig.dailyReportEnabled || comp.reportsConfig.totalReportEnabled ? (
                      <Chip
                        label="Yoqilgan"
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ fontWeight: 600, height: 22, fontSize: 11 }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        O‘chirilgan
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {getStatusChip(comp.status, comp.statusExplanation)}
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="Batafsil audit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/product-intelligence/special-tasks/${comp.companyId}`);
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
