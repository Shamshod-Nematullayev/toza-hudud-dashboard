import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Grid,
  Tab,
  Tabs,
  Typography,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
  alpha,
} from '@mui/material';
import api from 'utils/api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

interface OverviewData {
  activeUsers: { today: number; last7Days: number; last30Days: number; total?: number };
  organizations: {
    activeToday: number;
    active7Days: number;
    active30Days?: number;
    inactive: number;
    total?: number;
  };
  activity: {
    totalTracked: number;
    total?: number;
    today: number;
    last7Days: number;
    last30Days?: number;
  };
  lastActivities: Array<{
    userId: string;
    userFullName: string;
    organizationId?: number;
    organizationName: string;
    lastAction: string;
    source?: string;
    lastActivity: string;
  }>;
}

interface FeatureItem {
  key: string;
  feature: string;
  source: string;
  type: string;
  uses: number;
  uniqueUsers: number;
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
  lastUsedAt: string;
}

interface EndpointData {
  features?: FeatureItem[];
  mostRequested: Array<{
    endpoint: string;
    method: string;
    source?: string;
    requests: number;
    uniqueUsers: number;
    total?: number;
    today?: number;
    last7Days?: number;
    last30Days?: number;
    lastUsedAt?: string;
  }>;
}

interface UserData {
  userId: string;
  user: string;
  organizationId: number;
  organizationName: string;
  lastActive: string;
  requests: number;
  telegramActivity?: number;
}

interface TelegramData {
  kpi: {
    activeUsersToday: number;
    activeUsers7d: number;
    activeUsers30d: number;
    totalActivityToday?: number;
    totalActivity7d: number;
    totalActivity30d?: number;
    totalActivity?: number;
  };
  mostUsedCommands: Array<{
    command: string;
    uses: number;
    uniqueUsers: number;
    total?: number;
    lastUsedAt?: string;
  }>;
  mostUsedButtons: Array<{
    button: string;
    clicks: number;
    uniqueUsers: number;
    total?: number;
    lastUsedAt?: string;
  }>;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProductAnalytics() {
  const theme = useTheme();
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'total'>('7d');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [endpoints, setEndpoints] = useState<EndpointData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [telegram, setTelegram] = useState<TelegramData | null>(null);

  // Pagination for users tab
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchOverview = async () => {
    try {
      const res = await api.get(`/product-admin/analytics/overview?period=${period}`);
      if (res.data?.success) setOverview(res.data.data);
    } catch {
      toast.error('Overview data xatoligi');
    }
  };

  const fetchEndpoints = async () => {
    try {
      const res = await api.get(`/product-admin/analytics/endpoints?period=${period}`);
      if (res.data?.success) setEndpoints(res.data.data);
    } catch {
      toast.error('Funksiyalar statistikasi xatoligi');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get(
        `/product-admin/analytics/users?period=${period}&page=${page + 1}&limit=${rowsPerPage}`,
      );
      if (res.data?.success) {
        setUsers(res.data.data);
        setTotalUsers(res.data.pagination.total);
      }
    } catch {
      toast.error('Users data xatoligi');
    }
  };

  const fetchTelegram = async () => {
    try {
      const res = await api.get(`/product-admin/analytics/telegram?period=${period}`);
      if (res.data?.success) setTelegram(res.data.data);
    } catch {
      toast.error('Telegram data xatoligi');
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchOverview(), fetchEndpoints(), fetchUsers(), fetchTelegram()]);
      setLoading(false);
    };
    loadAll();
  }, [period]);

  useEffect(() => {
    if (tabValue === 2) fetchUsers();
  }, [page, rowsPerPage]);

  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: 'today' | '7d' | '30d' | 'total' | null,
  ) => {
    if (newPeriod !== null) {
      setPage(0);
      setPeriod(newPeriod);
    }
  };

  if (loading && !overview) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const displayedActiveUsers =
    period === 'today'
      ? overview?.activeUsers?.today || 0
      : period === '30d'
        ? overview?.activeUsers?.last30Days || 0
        : period === 'total'
          ? overview?.activeUsers?.total ?? overview?.activeUsers?.last30Days ?? 0
          : overview?.activeUsers?.last7Days || 0;

  const displayedActiveOrgs =
    period === 'today'
      ? overview?.organizations?.activeToday || 0
      : period === '30d' || period === 'total'
        ? overview?.organizations?.active30Days ?? overview?.organizations?.active7Days ?? 0
        : overview?.organizations?.active7Days || 0;

  const displayedActivity =
    period === 'today'
      ? overview?.activity?.today || 0
      : period === '30d'
        ? overview?.activity?.last30Days ?? overview?.activity?.totalTracked ?? 0
        : period === 'total'
          ? overview?.activity?.totalTracked || 0
          : overview?.activity?.last7Days || 0;

  const featuresList: FeatureItem[] =
    endpoints?.features ||
    (endpoints?.mostRequested || []).map((ep) => ({
      key: ep.endpoint,
      feature: ep.endpoint,
      source: ep.source || ep.method.toLowerCase(),
      type: 'feature',
      uses: ep.requests,
      uniqueUsers: ep.uniqueUsers,
      total: ep.total ?? ep.requests,
      today: ep.today ?? 0,
      last7Days: ep.last7Days ?? ep.requests,
      last30Days: ep.last30Days ?? ep.requests,
      lastUsedAt: ep.lastUsedAt || '',
    }));

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Mahsulot Analitikasi (Product Analytics)
        </Typography>
        <ToggleButtonGroup
          color="primary"
          value={period}
          exclusive
          onChange={handlePeriodChange}
          size="small"
          sx={{ backgroundColor: theme.palette.background.paper }}
        >
          <ToggleButton value="today">Bugun</ToggleButton>
          <ToggleButton value="7d">7 kun</ToggleButton>
          <ToggleButton value="30d">30 kun</ToggleButton>
          <ToggleButton value="total">Jami</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
            }}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Faol Foydalanuvchilar
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, my: 0.5 }}>
              {displayedActiveUsers}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Bugun: {overview?.activeUsers?.today || 0} | 7 kun: {overview?.activeUsers?.last7Days || 0} | 30 kun:{' '}
              {overview?.activeUsers?.last30Days || 0}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
            }}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Faol Tashkilotlar
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, my: 0.5 }}>
              {displayedActiveOrgs}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Bugun: {overview?.organizations?.activeToday || 0} | 7 kun:{' '}
              {overview?.organizations?.active7Days || 0} | 30 kun:{' '}
              {overview?.organizations?.active30Days ?? overview?.organizations?.active7Days ?? 0} | Nofaol:{' '}
              {overview?.organizations?.inactive || 0}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider,
            }}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Tizim Faolligi
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, my: 0.5 }}>
              {displayedActivity}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Jami: {overview?.activity?.totalTracked || 0} | Bugun: {overview?.activity?.today || 0} | 7 kun:{' '}
              {overview?.activity?.last7Days || 0} | 30 kun:{' '}
              {overview?.activity?.last30Days ?? overview?.activity?.totalTracked ?? 0}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(_e, val) => setTabValue(val)}
            aria-label="analytics tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Oxirgi faolliklar (Overview)" />
            <Tab label="Eng ko‘p ishlatilgan funksiyalar" />
            <Tab label="Faol foydalanuvchilar" />
            <Tab label="Telegram Faolligi" />
          </Tabs>
        </Box>

        {/* TAB 0: OVERVIEW & RECENT ACTIVITIES */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h4" sx={{ px: 2, mb: 2, fontWeight: 600 }}>
            Oxirgi faolliklar
          </Typography>
          {!overview?.lastActivities?.length ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">Hali faollik ma&apos;lumotlari yo&apos;q.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Foydalanuvchi</TableCell>
                    <TableCell>Tashkilot</TableCell>
                    <TableCell>Harakat</TableCell>
                    <TableCell>Manba</TableCell>
                    <TableCell>Vaqt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overview.lastActivities.map((act, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{act.userFullName}</TableCell>
                      <TableCell>{act.organizationName}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                        {act.lastAction}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={act.source === 'telegram' ? 'Telegram' : 'Web / API'}
                          sx={{
                            bgcolor: alpha(
                              act.source === 'telegram'
                                ? theme.palette.info.main
                                : theme.palette.primary.main,
                              theme.palette.mode === 'dark' ? 0.2 : 0.1,
                            ),
                            color:
                              act.source === 'telegram'
                                ? theme.palette.info.main
                                : theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>{dayjs(act.lastActivity).format('DD.MM.YYYY HH:mm:ss')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* TAB 1: TOP FEATURES */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h4" sx={{ px: 2, mb: 2, fontWeight: 600 }}>
            Eng ko‘p ishlatilgan funksiyalar
          </Typography>
          {!featuresList.length ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">Ma&apos;lumot topilmadi.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Feature</TableCell>
                    <TableCell>Manba</TableCell>
                    <TableCell>Uses (Tanlangan davr)</TableCell>
                    <TableCell>Unique Users</TableCell>
                    <TableCell>Bugun / 7k / 30k / Jami</TableCell>
                    <TableCell>Oxirgi faollik</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {featuresList.map((f, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {f.feature}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={f.source === 'telegram' ? 'Telegram' : 'Web / API'}
                          sx={{
                            bgcolor: alpha(
                              f.source === 'telegram'
                                ? theme.palette.info.main
                                : theme.palette.primary.main,
                              theme.palette.mode === 'dark' ? 0.2 : 0.1,
                            ),
                            color:
                              f.source === 'telegram'
                                ? theme.palette.info.main
                                : theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{f.uses}</TableCell>
                      <TableCell>{f.uniqueUsers}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="textSecondary">
                          {f.today} / {f.last7Days} / {f.last30Days} / {f.total}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {f.lastUsedAt ? dayjs(f.lastUsedAt).format('DD.MM.YYYY HH:mm') : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* TAB 2: USERS */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Foydalanuvchi</TableCell>
                  <TableCell>Tashkilot</TableCell>
                  <TableCell>Jami harakatlar</TableCell>
                  <TableCell>Oxirgi faollik</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{u.user}</TableCell>
                    <TableCell>{u.organizationName}</TableCell>
                    <TableCell>{u.requests}</TableCell>
                    <TableCell>{dayjs(u.lastActive).format('DD.MM.YYYY HH:mm:ss')}</TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">Ma&apos;lumot yo&apos;q</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TabPanel>

        {/* TAB 3: TELEGRAM */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3} sx={{ px: 2, mb: 4 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === 'dark' ? 0.2 : 0.08,
                  ),
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                }}
              >
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Telegram Faol (Bugun)
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  {telegram?.kpi?.activeUsersToday || 0}
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: theme.palette.background.paper,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                }}
              >
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Telegram Faol (7 kun)
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {telegram?.kpi?.activeUsers7d || 0}
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: theme.palette.background.paper,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                }}
              >
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Telegram Faol (30 kun)
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {telegram?.kpi?.activeUsers30d || 0}
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: theme.palette.background.paper,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                }}
              >
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Telegram Faollik (Jami)
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {telegram?.kpi?.totalActivity ?? telegram?.kpi?.totalActivity7d ?? 0}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Bugun: {telegram?.kpi?.totalActivityToday || 0} | 7 kun:{' '}
                  {telegram?.kpi?.totalActivity7d || 0} | 30 kun:{' '}
                  {telegram?.kpi?.totalActivity30d || 0}
                </Typography>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ px: 2, pb: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                Eng ko‘p ishlatilgan Commandlar
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Command</TableCell>
                      <TableCell>Uses</TableCell>
                      <TableCell>Unique Users</TableCell>
                      <TableCell>Oxirgi faollik</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {telegram?.mostUsedCommands?.map((cmd, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {cmd.command}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{cmd.uses}</TableCell>
                        <TableCell>{cmd.uniqueUsers}</TableCell>
                        <TableCell>
                          {cmd.lastUsedAt ? dayjs(cmd.lastUsedAt).format('DD.MM.YYYY HH:mm') : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!telegram?.mostUsedCommands?.length && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography color="textSecondary">Ma&apos;lumot yo&apos;q</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                Eng ko‘p bosilgan Tugmalar
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Button</TableCell>
                      <TableCell>Clicks</TableCell>
                      <TableCell>Unique Users</TableCell>
                      <TableCell>Oxirgi faollik</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {telegram?.mostUsedButtons?.map((btn, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {btn.button}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{btn.clicks}</TableCell>
                        <TableCell>{btn.uniqueUsers}</TableCell>
                        <TableCell>
                          {btn.lastUsedAt ? dayjs(btn.lastUsedAt).format('DD.MM.YYYY HH:mm') : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!telegram?.mostUsedButtons?.length && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography color="textSecondary">Ma&apos;lumot yo&apos;q</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}
