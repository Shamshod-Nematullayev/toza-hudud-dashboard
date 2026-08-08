import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
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
  TablePagination
} from '@mui/material';
import api from 'utils/api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

interface OverviewData {
  activeUsers: { today: number; last7Days: number; last30Days: number };
  organizations: { activeToday: number; active7Days: number; inactive: number };
  activity: { totalTracked: number; today: number; last7Days: number };
  lastActivities: Array<{
    userId: string;
    userFullName: string;
    organizationId: number;
    organizationName: string;
    lastAction: string;
    lastActivity: string;
  }>;
}

interface EndpointData {
  mostRequested: Array<{ endpoint: string; method: string; requests: number; uniqueUsers: number; avgResponseTime: number }>;
  slowEndpoints: Array<{ endpoint: string; method: string; requests: number; avgResponseTime: number }>;
  errorEndpoints: Array<{ endpoint: string; method: string; statusCode: number; errorCount: number; uniqueUsers: number; avgDuration: number }>;
}

interface UserData {
  userId: string;
  user: string;
  organizationId: number;
  organizationName: string;
  lastActive: string;
  requests: number;
}

interface TelegramData {
  kpi: { activeUsersToday: number; activeUsers7d: number; activeUsers30d: number; totalActivity7d: number };
  mostUsedCommands: Array<{ command: string; uses: number; uniqueUsers: number }>;
  mostUsedButtons: Array<{ button: string; clicks: number; uniqueUsers: number }>;
  features: Array<{ feature: string; started: number; completed: number; completionRate: number }>;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProductAnalytics() {
  const theme = useTheme();
  const [period, setPeriod] = useState('7d');
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
    } catch (err: any) {
      toast.error("Overview data xatoligi");
    }
  };

  const fetchEndpoints = async () => {
    try {
      const res = await api.get(`/product-admin/analytics/endpoints?period=${period}`);
      if (res.data?.success) setEndpoints(res.data.data);
    } catch (err: any) {
      toast.error("Endpoints data xatoligi");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/product-admin/analytics/users?period=${period}&page=${page + 1}&limit=${rowsPerPage}`);
      if (res.data?.success) {
        setUsers(res.data.data);
        setTotalUsers(res.data.pagination.total);
      }
    } catch (err: any) {
      toast.error("Users data xatoligi");
    }
  };

  const fetchTelegram = async () => {
    try {
      const res = await api.get(`/product-admin/analytics/telegram?period=${period}`);
      if (res.data?.success) setTelegram(res.data.data);
    } catch (err: any) {
      toast.error("Telegram data xatoligi");
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

  const handlePeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: string) => {
    if (newPeriod !== null) setPeriod(newPeriod);
  };

  if (loading && !overview) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3">Mahsulot Analitikasi (Product Analytics)</Typography>
        <ToggleButtonGroup
          color="primary"
          value={period}
          exclusive
          onChange={handlePeriodChange}
          size="small"
          sx={{ backgroundColor: theme.palette.background.paper }}
        >
          <ToggleButton value="today">Bugun</ToggleButton>
          <ToggleButton value="7d">Oxirgi 7 kun</ToggleButton>
          <ToggleButton value="30d">Oxirgi 30 kun</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Faol Foydalanuvchilar</Typography>
            <Typography variant="h3">{overview?.activeUsers?.last7Days || 0}</Typography>
            <Typography variant="caption" color="textSecondary">
              Bugun: {overview?.activeUsers?.today || 0} | 30 kun: {overview?.activeUsers?.last30Days || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Faol Tashkilotlar</Typography>
            <Typography variant="h3">{overview?.organizations?.active7Days || 0}</Typography>
            <Typography variant="caption" color="textSecondary">
              Bugun: {overview?.organizations?.activeToday || 0} | Nofaol: {overview?.organizations?.inactive || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>Tizim Faolligi (So'rovlar)</Typography>
            <Typography variant="h3">{overview?.activity?.last7Days || 0}</Typography>
            <Typography variant="caption" color="textSecondary">
              Jami: {overview?.activity?.totalTracked || 0} | Bugun: {overview?.activity?.today || 0}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} aria-label="analytics tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="Umumiy (Overview)" />
            <Tab label="API Statistikasi (Endpoints)" />
            <Tab label="Foydalanuvchilar (Users)" />
            <Tab label="Telegram (V1.1)" />
          </Tabs>
        </Box>

        {/* TAB 0: OVERVIEW & RECENT */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h4" sx={{ px: 2, mb: 2 }}>Oxirgi faolliklar</Typography>
          {!overview?.lastActivities?.length ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">Hali faollik ma'lumotlari yo'q.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Foydalanuvchi</TableCell>
                    <TableCell>Tashkilot</TableCell>
                    <TableCell>Harakat (Endpoint)</TableCell>
                    <TableCell>Vaqt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overview.lastActivities.map((act, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{act.userFullName}</TableCell>
                      <TableCell>{act.organizationName}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{act.lastAction}</TableCell>
                      <TableCell>{dayjs(act.lastActivity).format('DD.MM.YYYY HH:mm:ss')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* TAB 1: ENDPOINTS */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h4" sx={{ px: 2, mb: 2 }}>Eng ko'p foydalanilgan API</Typography>
          {!endpoints?.mostRequested?.length ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="textSecondary">Ma'lumot topilmadi.</Typography></Box>
          ) : (
            <TableContainer sx={{ mb: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Endpoint</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>So'rovlar (Requests)</TableCell>
                    <TableCell>Unique Users</TableCell>
                    <TableCell>Avg Vaqt (ms)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {endpoints.mostRequested.map((ep, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{ep.endpoint}</TableCell>
                      <TableCell>{ep.method}</TableCell>
                      <TableCell>{ep.requests}</TableCell>
                      <TableCell>{ep.uniqueUsers}</TableCell>
                      <TableCell>{ep.avgResponseTime} ms</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Typography variant="h4" sx={{ px: 2, mb: 2 }}>Sekin API lar (Slow Endpoints)</Typography>
          <TableContainer sx={{ mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Endpoint</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Avg Vaqt (ms)</TableCell>
                  <TableCell>So'rovlar (Requests)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {endpoints?.slowEndpoints?.map((ep, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{ep.endpoint}</TableCell>
                    <TableCell>{ep.method}</TableCell>
                    <TableCell>{ep.avgResponseTime} ms</TableCell>
                    <TableCell>{ep.requests}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Typography variant="h4" sx={{ px: 2, mb: 2 }}>Xatolikli API lar (4xx/5xx)</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Endpoint</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Xatolar Soni</TableCell>
                  <TableCell>Unique Users</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {endpoints?.errorEndpoints?.map((ep, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{ep.endpoint}</TableCell>
                    <TableCell>{ep.method}</TableCell>
                    <TableCell>{ep.statusCode}</TableCell>
                    <TableCell>{ep.errorCount}</TableCell>
                    <TableCell>{ep.uniqueUsers}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* TAB 2: USERS */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Foydalanuvchi</TableCell>
                  <TableCell>Tashkilot</TableCell>
                  <TableCell>So'rovlar (Requests)</TableCell>
                  <TableCell>Oxirgi faollik</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{u.user}</TableCell>
                    <TableCell>{u.organizationName}</TableCell>
                    <TableCell>{u.requests}</TableCell>
                    <TableCell>{dayjs(u.lastActive).format('DD.MM.YYYY HH:mm:ss')}</TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">Ma'lumot yo'q</Typography>
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
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TabPanel>

        {/* TAB 3: TELEGRAM */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light', color: 'primary.main' }}>
                <Typography variant="subtitle2" gutterBottom>Telegram Faol (Bugun)</Typography>
                <Typography variant="h3" color="inherit">{telegram?.kpi?.activeUsersToday || 0}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Telegram Faol (7 kun)</Typography>
                <Typography variant="h3">{telegram?.kpi?.activeUsers7d || 0}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Telegram Faol (30 kun)</Typography>
                <Typography variant="h3">{telegram?.kpi?.activeUsers30d || 0}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Jami Faollik (7 kun)</Typography>
                <Typography variant="h3">{telegram?.kpi?.totalActivity7d || 0}</Typography>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ px: 2, mb: 2 }}>Eng ko'p ishlatilgan Commandlar</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Command</TableCell>
                      <TableCell>Ishlatildi (Uses)</TableCell>
                      <TableCell>Unique Users</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {telegram?.mostUsedCommands?.map((cmd, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{cmd.command}</TableCell>
                        <TableCell>{cmd.uses}</TableCell>
                        <TableCell>{cmd.uniqueUsers}</TableCell>
                      </TableRow>
                    ))}
                    {!telegram?.mostUsedCommands?.length && (
                      <TableRow><TableCell colSpan={3} align="center">Ma'lumot yo'q</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ px: 2, mb: 2 }}>Eng ko'p bosilgan Tugmalar (Buttons)</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Button</TableCell>
                      <TableCell>Bosildi (Clicks)</TableCell>
                      <TableCell>Unique Users</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {telegram?.mostUsedButtons?.map((btn, i) => (
                      <TableRow key={i} hover>
                        <TableCell>{btn.button}</TableCell>
                        <TableCell>{btn.clicks}</TableCell>
                        <TableCell>{btn.uniqueUsers}</TableCell>
                      </TableRow>
                    ))}
                    {!telegram?.mostUsedButtons?.length && (
                      <TableRow><TableCell colSpan={3} align="center">Ma'lumot yo'q</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          <Typography variant="h4" sx={{ px: 2, mb: 2, mt: 2 }}>Funksiyalar (Features Completion)</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell>Boshlandi (Started)</TableCell>
                  <TableCell>Tugadi (Completed)</TableCell>
                  <TableCell>To'liqlik (Completion Rate)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {telegram?.features?.map((f, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{f.feature}</TableCell>
                    <TableCell>{f.started}</TableCell>
                    <TableCell>{f.completed}</TableCell>
                    <TableCell>
                      <Typography color={f.completionRate < 50 ? 'error' : (f.completionRate > 80 ? 'success.main' : 'warning.main')}>
                        {f.completionRate}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {!telegram?.features?.length && (
                  <TableRow><TableCell colSpan={4} align="center">Ma'lumot yo'q</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Box>
  );
}
