import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Avatar,
  Card,
  Tab,
  Tabs,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Tooltip,
  useTheme,
  alpha,
  LinearProgress
} from '@mui/material';
import { ArrowBack, Add, Edit as EditIcon, SaveOutlined as SaveOutlinedIcon, Close as CloseIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import api from 'utils/api';
import MainCard from 'ui-component/cards/MainCard';

interface Profile {
  _id: string;
  id: number;
  name: string;
  phone: string;
  status: 'active' | 'inactive' | 'on-leave';
  photo: string;
  lastActivityTime: string | null;
  assignedNeighborhoodsCount: number;
}

interface PerformanceMetric {
  revenue: number;
  target: number;
  completion: number;
  difference: number;
}

interface MonthPerformance extends PerformanceMetric {
  ecoPay: number;
  inspectorCollection: number;
}

interface NeighborhoodStat {
  id: number;
  name: string;
  subscribersCount: number;
  reja: number;
  revenue: number;
  debt: number;
}

interface InspectorTask {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  createdAt: string;
}

interface Complaint {
  _id: string;
  murojaatRaqami: string;
  muallif: string;
  manzil: string;
  telefon: string;
  mazmuni: string;
  status: 'open' | 'closed';
  createdAt: string;
}

interface SpecialAssignment {
  _id: string;
  id: number;
  accountNumber: string;
  fullName: string;
  type: 'phone' | 'electricity';
  status: 'completed' | 'in-progress' | 'rejected';
  purpose: string;
  mahallaId?: number;
}

interface Inspector360Data {
  profile: Profile;
  performance: {
    today: PerformanceMetric;
    yesterday: PerformanceMetric;
    sameDayLastMonth: PerformanceMetric;
    month: MonthPerformance;
  };
  neighborhoods: NeighborhoodStat[];
  tasks: InspectorTask[];
  complaints: Complaint[];
  specialAssignments: SpecialAssignment[];
}

// Utility: Calculate total working days in a month (excluding Sundays)
function getWorkingDaysInMonth(year: number, monthZeroBased: number): number {
  const daysInMonth = dayjs(new Date(year, monthZeroBased, 1)).daysInMonth();
  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = dayjs(new Date(year, monthZeroBased, d)).day();
    if (dayOfWeek !== 0) {
      // Exclude Sunday
      workingDays++;
    }
  }
  return workingDays || 26;
}

// Utility: Calculate remaining working days in a month from current day to month end
function getRemainingWorkingDays(year: number, monthZeroBased: number, currentDay: number): number {
  const daysInMonth = dayjs(new Date(year, monthZeroBased, 1)).daysInMonth();
  let remainingDays = 0;
  for (let d = currentDay; d <= daysInMonth; d++) {
    const dayOfWeek = dayjs(new Date(year, monthZeroBased, d)).day();
    if (dayOfWeek !== 0) {
      // Exclude Sunday
      remainingDays++;
    }
  }
  return remainingDays;
}

function Inspector360() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { inspectorId } = useParams<{ inspectorId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Inspector360Data | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Task dialog state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDeadline, setTaskDeadline] = useState(dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'));
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskRelatedSubscriber, setTaskRelatedSubscriber] = useState('');
  const [taskSaving, setTaskSaving] = useState(false);

  // Special assignments edit dialog state
  const [editSpecialDialogOpen, setEditSpecialDialogOpen] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState<SpecialAssignment | null>(null);
  const [editSpecialSaving, setEditSpecialSaving] = useState(false);

  // Special assignments filters state
  const [specialFilterType, setSpecialFilterType] = useState<string>('all');
  const [specialFilterStatus, setSpecialFilterStatus] = useState<string>('all');
  const [specialFilterMahalla, setSpecialFilterMahalla] = useState<string>('all');

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/inspectors/profile-360/${inspectorId}`);
      if (res.data?.ok) {
        setData(res.data.data);
      } else {
        toast.error('Ma‘lumotlarni yuklashda xatolik yuz berdi');
      }
    } catch (err) {
      console.error(err);
      toast.error('Profil ma‘lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inspectorId) {
      fetchProfileData();
    }
  }, [inspectorId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setTaskSaving(true);
    try {
      const res = await api.post('/inspectors/tasks-360', {
        title: taskTitle,
        description: taskDescription,
        deadline: taskDeadline,
        priority: taskPriority,
        assignedInspector: Number(inspectorId),
        relatedSubscriber: taskRelatedSubscriber || undefined
      });

      if (res.data?.ok) {
        toast.success('Vazifa muvaffaqiyatli yaratildi va Telegramga yuborildi');
        setTaskDialogOpen(false);
        setTaskTitle('');
        setTaskDescription('');
        setTaskRelatedSubscriber('');
        fetchProfileData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Vazifa yaratishda xatolik yuz berdi');
    } finally {
      setTaskSaving(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await api.put(`/inspectors/tasks-360/${taskId}`, {
        status: newStatus
      });
      if (res.data?.ok) {
        toast.success('Vazifa holati yangilandi');
        fetchProfileData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Vazifa holatini yangilashda xatolik');
    }
  };

  const handleOpenEditSpecial = (special: SpecialAssignment) => {
    setEditingSpecial({ ...special });
    setEditSpecialDialogOpen(true);
  };

  const handleSaveSpecialAssignment = async () => {
    if (!editingSpecial) return;
    setEditSpecialSaving(true);
    try {
      try {
        await api.put(`/inspectors/special-assignments/${editingSpecial._id || editingSpecial.id}`, editingSpecial);
      } catch (e) {
        await api.put(`/tasks/${editingSpecial._id || editingSpecial.id}`, editingSpecial).catch(() => {});
      }

      if (data) {
        setData({
          ...data,
          specialAssignments: data.specialAssignments.map((s) =>
            (s._id && s._id === editingSpecial._id) || (s.id && s.id === editingSpecial.id) ? editingSpecial : s
          )
        });
      }
      toast.success('Maxsus topshiriq muvaffaqiyatli yangilandi');
      setEditSpecialDialogOpen(false);
      setEditingSpecial(null);
    } catch (err) {
      console.error(err);
      toast.error('Maxsus topshiriqni saqlashda xatolik');
    } finally {
      setEditSpecialSaving(false);
    }
  };

  // Dynamic Daily Target Calculation based on Working Days
  const dynamicTodayTargetData = useMemo(() => {
    if (!data) return { dynamicTodayTarget: 0, todayCompletionPct: 0, difference: 0, totalWorkingDays: 26, remainingWorkingDays: 1 };

    const now = dayjs();
    const year = now.year();
    const month = now.month();
    const currentDay = now.date();

    const totalWorkingDays = getWorkingDaysInMonth(year, month);
    const remainingWorkingDays = getRemainingWorkingDays(year, month, currentDay);

    const monthTarget = data.performance.month.target || 0;
    const monthRevenue = data.performance.month.revenue || 0;
    const todayRevenue = data.performance.today.revenue || 0;

    const pastRevenue = Math.max(0, monthRevenue - todayRevenue);
    const remainingMonthTarget = Math.max(0, monthTarget - pastRevenue);

    let dynamicTodayTarget = 0;
    if (remainingWorkingDays > 0) {
      dynamicTodayTarget = Math.round(remainingMonthTarget / remainingWorkingDays);
    } else if (totalWorkingDays > 0) {
      dynamicTodayTarget = Math.round(monthTarget / totalWorkingDays);
    } else {
      dynamicTodayTarget = data.performance.today.target || 0;
    }

    const todayCompletionPct = dynamicTodayTarget > 0 ? Math.min(100, Math.round((todayRevenue / dynamicTodayTarget) * 100)) : 0;
    const difference = todayRevenue - dynamicTodayTarget;

    return {
      dynamicTodayTarget,
      todayCompletionPct,
      difference,
      totalWorkingDays,
      remainingWorkingDays
    };
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="secondary" size={48} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Orqaga
        </Button>
        <Alert severity="error">Nazoratchi topilmadi yoki yuklashda xatolik yuz berdi.</Alert>
      </Box>
    );
  }

  const { profile, performance, neighborhoods, tasks, complaints, specialAssignments } = data;

  const totalSubscribers = neighborhoods.reduce((sum, n) => sum + (n.subscribersCount || 0), 0);
  const totalDebt = neighborhoods.reduce((sum, n) => sum + (n.debt || 0), 0);

  const bestNeighborhood =
    neighborhoods.length > 0
      ? [...neighborhoods].sort((a, b) => (b.reja > 0 ? b.revenue / b.reja : 0) - (a.reja > 0 ? a.revenue / a.reja : 0))[0]?.name || '—'
      : '—';

  const worstNeighborhood =
    neighborhoods.length > 0
      ? [...neighborhoods].sort((a, b) => (a.reja > 0 ? a.revenue / a.reja : 0) - (b.reja > 0 ? b.revenue / b.reja : 0))[0]?.name || '—'
      : '—';

  const hasMonthPlan = performance.month.target > 0;
  const hasTodayPlan = dynamicTodayTargetData.dynamicTodayTarget > 0;

  const ecoPayPercent = performance.month.revenue > 0 ? Math.round((performance.month.ecoPay / performance.month.revenue) * 100) : 0;
  const collectionPercent =
    performance.month.revenue > 0 ? Math.round((performance.month.inspectorCollection / performance.month.revenue) * 100) : 0;

  const overdueTasks = tasks.filter((t) => t.status === 'overdue');
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const newComplaints = complaints.filter((c) => c.status === 'open' && dayjs().diff(dayjs(c.createdAt), 'day') <= 2);
  const inProgressComplaints = complaints.filter(
    (c) => c.status === 'open' && dayjs().diff(dayjs(c.createdAt), 'day') > 2 && dayjs().diff(dayjs(c.createdAt), 'day') <= 7
  );
  const overdueComplaintsCount = complaints.filter((c) => c.status === 'open' && dayjs().diff(dayjs(c.createdAt), 'day') > 7).length;
  const closedComplaints = complaints.filter((c) => c.status === 'closed');

  const totalSpecial = specialAssignments.length;
  const completedSpecial = specialAssignments.filter((s) => s.status === 'completed').length;
  const specialCompletionPct = totalSpecial > 0 ? Math.round((completedSpecial / totalSpecial) * 100) : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 5 }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/employeers/inspectors')} sx={{ borderRadius: 2 }}>
          Nazoratchilar ro'yxatiga qaytish
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          So'nggi faollik: {profile.lastActivityTime ? dayjs(profile.lastActivityTime).format('DD.MM.YYYY HH:mm') : 'Mavjud emas'}
        </Typography>
      </Box>

      {/* EXECUTIVE PROFILE BANNER */}
      <MainCard
        border={false}
        content={false}
        boxShadow
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'none',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar
                src={profile.photo}
                alt={profile.name}
                sx={{
                  width: 76,
                  height: 76,
                  boxShadow: theme.shadows[4],
                  border: `3px solid ${theme.palette.secondary.main}`
                }}
              />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    {profile.name}
                  </Typography>
                  <Chip
                    label={profile.status === 'active' ? 'Faol' : profile.status === 'on-leave' ? "Ta'tilda" : 'Nofaol'}
                    size="small"
                    color={profile.status === 'active' ? 'success' : profile.status === 'on-leave' ? 'warning' : 'default'}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Tel: <b>{profile.phone}</b> | ID: <code style={{ fontWeight: 700 }}>{profile.id}</code>
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, sm: 3, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: isDark ? alpha(theme.palette.common.white, 0.04) : alpha(theme.palette.common.black, 0.02)
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Biriktirilgan mahallalar
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                    {profile.assignedNeighborhoodsCount} ta
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: isDark ? alpha(theme.palette.common.white, 0.04) : alpha(theme.palette.common.black, 0.02)
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Jami abonentlar
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {totalSubscribers.toLocaleString()} ta
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 12 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: isDark ? alpha(theme.palette.common.white, 0.04) : alpha(theme.palette.common.black, 0.02),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      DHJ1 Saldo oxiri qarzdorlik
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main', fontFamily: 'monospace' }}>
                      {totalDebt.toLocaleString()} so'm
                    </Typography>
                  </Box>
                  <Chip label="DHJ1 Hisobot" size="small" color="error" variant="outlined" sx={{ fontWeight: 600 }} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainCard>

      {/* DASHBOARD TABS */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        textColor="secondary"
        indicatorColor="secondary"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Umumiy ko'rinish" />
        <Tab label="Daromad va Hisoblandi" />
        <Tab
          label={
            <Box component="span">
              Mahallalar{' '}
              <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.7, ml: 0.5 }}>
                {neighborhoods.length}
              </Box>
            </Box>
          }
        />
        <Tab
          label={
            <Box component="span">
              Topshiriqlar{' '}
              <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.7, ml: 0.5 }}>
                {tasks.length}
              </Box>
            </Box>
          }
        />
        <Tab
          label={
            <Box component="span">
              Murojaatlar{' '}
              <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.7, ml: 0.5 }}>
                {complaints.length}
              </Box>
            </Box>
          }
        />
        <Tab
          label={
            <Box component="span">
              Maxsus topshiriqlar{' '}
              <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.7, ml: 0.5 }}>
                {specialAssignments.length}
              </Box>
            </Box>
          }
        />
      </Tabs>

      {/* TAB PANELS */}
      <Box sx={{ minHeight: '400px' }}>
        {/* ============ OVERVIEW PANEL ============ */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={3}>
              {/* Gauge Card with Working-Day Dynamic Daily Target */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '16px',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    height: '100%',
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold' }}
                  >
                    Bugungi kunlik reja ({dynamicTodayTargetData.remainingWorkingDays} ish kuni qoldi)
                  </Typography>

                  <Box sx={{ position: 'relative', width: 200, height: 200, my: 2 }}>
                    <Box component="svg" viewBox="0 0 210 210" sx={{ width: '100%', height: '100%' }}>
                      <circle
                        cx="105"
                        cy="105"
                        r="92"
                        fill="none"
                        stroke={isDark ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.08)}
                        strokeWidth="10"
                      />
                      <circle
                        cx="105"
                        cy="105"
                        r="92"
                        fill="none"
                        stroke={theme.palette.secondary.main}
                        strokeWidth="10"
                        strokeLinecap="round"
                        transform="rotate(-90 105 105)"
                        strokeDasharray="578"
                        strokeDashoffset={578 * (1 - Math.min(100, dynamicTodayTargetData.todayCompletionPct) / 100)}
                      />
                      {Array.from({ length: 24 }).map((_, i) => {
                        const angle = (i * 15 * Math.PI) / 180;
                        const x1 = 105 + 84 * Math.cos(angle);
                        const y1 = 105 + 84 * Math.sin(angle);
                        const x2 = 105 + 92 * Math.cos(angle);
                        const y2 = 105 + 92 * Math.sin(angle);
                        return (
                          <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={isDark ? alpha(theme.palette.common.white, 0.15) : alpha(theme.palette.common.black, 0.15)}
                            strokeWidth="2"
                          />
                        );
                      })}
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '34px',
                          fontWeight: 'bold',
                          color: theme.palette.secondary.main,
                          lineHeight: 1
                        }}
                      >
                        {hasTodayPlan ? `${dynamicTodayTargetData.todayCompletionPct}%` : '—'}
                      </Typography>
                      <Typography sx={{ fontSize: '11.5px', color: 'text.secondary', mt: 1 }}>rejadan bajarildi</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1 }}>
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Bugungi daromad
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {performance.today.revenue.toLocaleString()} so'm
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}
                    >
                      <Tooltip title={`Oydagi ${dynamicTodayTargetData.totalWorkingDays} ish kuniga dinamik bo'lingan bugungi reja`}>
                        <Typography variant="body2" color="text.secondary">
                          Bugungi moslashuvchan reja
                        </Typography>
                      </Tooltip>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', color: 'secondary.main' }}>
                        {hasTodayPlan ? `${dynamicTodayTargetData.dynamicTodayTarget.toLocaleString()} so'm` : '—'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Farq (Rejaga nisbatan)
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          color: !hasTodayPlan ? 'text.secondary' : dynamicTodayTargetData.difference >= 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        {hasTodayPlan
                          ? `${dynamicTodayTargetData.difference >= 0 ? '+' : ''}${dynamicTodayTargetData.difference.toLocaleString()} so'm`
                          : '—'}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
                  {/* Solishtirma Tahlil */}
                  <Card
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '16px',
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      backgroundColor: theme.palette.background.paper
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold' }}
                    >
                      Solishtirma tahlil (Kunlik tushum)
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          O'tgan oyning shu kuni
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 600, mt: 0.5, fontFamily: 'monospace' }}>
                          {performance.sameDayLastMonth.revenue.toLocaleString()}{' '}
                          <Box component="span" sx={{ fontSize: '13px', fontWeight: 'normal', color: 'text.secondary' }}>
                            so'm
                          </Box>
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Shu oyning bugungi kuni
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 600, mt: 0.5, fontFamily: 'monospace' }}>
                          {performance.today.revenue.toLocaleString()}{' '}
                          <Box component="span" sx={{ fontSize: '13px', fontWeight: 'normal', color: 'text.secondary' }}>
                            so'm
                          </Box>
                          {performance.sameDayLastMonth.revenue >= 0 && (
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                ml: 1,
                                px: 1,
                                py: 0.25,
                                borderRadius: '100px',
                                color: performance.today.revenue >= performance.sameDayLastMonth.revenue ? 'success.main' : 'error.main',
                                bgcolor:
                                  performance.today.revenue >= performance.sameDayLastMonth.revenue
                                    ? alpha(theme.palette.success.main, 0.15)
                                    : alpha(theme.palette.error.main, 0.15)
                              }}
                            >
                              {performance.today.revenue >= performance.sameDayLastMonth.revenue ? '▲' : '▼'}{' '}
                              {performance.sameDayLastMonth.revenue > 0
                                ? Math.round(
                                    Math.abs(
                                      (performance.today.revenue - performance.sameDayLastMonth.revenue) /
                                        performance.sameDayLastMonth.revenue
                                    ) * 100
                                  )
                                : 0}
                              %
                            </Box>
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>

                  {/* Overview Stats Grid */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '16px',
                          p: 2.5,
                          backgroundColor: theme.palette.background.paper
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Ochiq vazifalar
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 600, fontFamily: 'monospace', my: 1 }}>
                          {tasks.filter((t) => t.status !== 'completed').length}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, fontSize: '12px', color: 'text.secondary' }}>
                          <Box component="span">
                            <Box component="b" sx={{ color: 'error.main' }}>
                              {overdueTasks.length}
                            </Box>{' '}
                            muddati o'tgan
                          </Box>
                          <Box component="span">
                            <Box component="b" sx={{ color: 'text.primary' }}>
                              {inProgressTasks.length + pendingTasks.length}
                            </Box>{' '}
                            jarayonda
                          </Box>
                        </Box>
                      </Card>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '16px',
                          p: 2.5,
                          backgroundColor: theme.palette.background.paper
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Ochiq murojaatlar
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 600, fontFamily: 'monospace', my: 1 }}>
                          {complaints.filter((c) => c.status === 'open').length}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, fontSize: '12px', color: 'text.secondary' }}>
                          <Box component="span">
                            <Box component="b" sx={{ color: 'error.main' }}>
                              {overdueComplaintsCount}
                            </Box>{' '}
                            muddati o'tgan
                          </Box>
                          <Box component="span">
                            <Box component="b" sx={{ color: 'text.primary' }}>
                              {newComplaints.length + inProgressComplaints.length}
                            </Box>{' '}
                            jarayonda
                          </Box>
                        </Box>
                      </Card>
                    </Grid>

                    {/* Special Assignments Stat Card */}
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '16px',
                          p: 2.5,
                          backgroundColor: theme.palette.background.paper
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Maxsus topshiriqlar
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 600, fontFamily: 'monospace', my: 1, color: 'secondary.main' }}>
                          {completedSpecial} / {totalSpecial}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <LinearProgress
                            variant="determinate"
                            value={specialCompletionPct}
                            color="secondary"
                            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                            {specialCompletionPct}%
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Neighborhood Summary */}
                  <Typography variant="h4" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                    Mahalla kesimida qisqacha
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '14px',
                          p: 2,
                          backgroundColor: theme.palette.background.paper
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Eng yaxshi natija
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {bestNeighborhood}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '14px',
                          p: 2,
                          backgroundColor: theme.palette.background.paper
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          E'tibor talab qiladi
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main' }}>
                          {worstNeighborhood}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '14px',
                          p: 2,
                          backgroundColor: theme.palette.background.paper
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Jami abonentlar
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {totalSubscribers.toLocaleString()} ta
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ============ REVENUE & HISOBLANDI PANEL ============ */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Daromad va bajarilish (Hisoblandi bo'yicha)
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '14px',
                    p: 2.5,
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Jami daromad
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {performance.month.revenue.toLocaleString()} so'm
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '14px',
                    p: 2.5,
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Hisoblandi (Reja)
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {hasMonthPlan ? `${performance.month.target.toLocaleString()} so'm` : '—'}
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '14px',
                    p: 2.5,
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Bajarilish
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 600, fontFamily: 'monospace', color: hasMonthPlan ? 'success.main' : 'text.secondary' }}
                  >
                    {hasMonthPlan ? `${performance.month.completion.toFixed(1)}%` : '—'}
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Manba Bo'yicha Taqsimot */}
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '16px',
                p: 3,
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Typography
                variant="caption"
                sx={{ letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold' }}
              >
                Manba bo'yicha taqsimot
              </Typography>

              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2, mb: 1, fontSize: '13px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: theme.palette.secondary.main }} />
                  <Typography variant="body2" color="text.secondary">
                    Boshqa tushumlar:{' '}
                    <Box component="span" sx={{ fontFamily: 'monospace', color: 'text.primary', fontWeight: 600 }}>
                      {performance.month.inspectorCollection.toLocaleString()} so'm
                    </Box>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: theme.palette.primary.main }} />
                  <Typography variant="body2" color="text.secondary">
                    Inspektor orqali yig'im (EcoPay):{' '}
                    <Box component="span" sx={{ fontFamily: 'monospace', color: 'text.primary', fontWeight: 600 }}>
                      {performance.month.ecoPay.toLocaleString()} so'm
                    </Box>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ height: 10, borderRadius: '100px', overflow: 'hidden', display: 'flex', bgcolor: 'divider', mt: 1.5, mb: 1 }}>
                <Box sx={{ width: `${collectionPercent}%`, bgcolor: theme.palette.secondary.main }} />
                <Box sx={{ width: `${ecoPayPercent}%`, bgcolor: theme.palette.primary.main }} />
              </Box>
            </Card>

            {/* Kunlik Solishtirma */}
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '16px',
                p: 3,
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  fontWeight: 'bold',
                  display: 'block',
                  mb: 2
                }}
              >
                Kunlik solishtirma
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">
                    Bugungi daromad
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {performance.today.revenue.toLocaleString()} so'm
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">
                    Kecha
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {performance.yesterday.revenue.toLocaleString()} so'm
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        ml: 1,
                        color: performance.today.revenue >= performance.yesterday.revenue ? 'success.main' : 'error.main'
                      }}
                    >
                      {performance.today.revenue >= performance.yesterday.revenue ? '▲' : '▼'}{' '}
                      {Math.round(performance.yesterday.completion)}%
                    </Box>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    O'tgan oyning shu kuni
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {performance.sameDayLastMonth.revenue.toLocaleString()} so'm
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        ml: 1,
                        color: performance.today.revenue >= performance.sameDayLastMonth.revenue ? 'success.main' : 'error.main'
                      }}
                    >
                      {performance.today.revenue >= performance.sameDayLastMonth.revenue ? '▲' : '▼'}{' '}
                      {Math.round(performance.sameDayLastMonth.completion)}%
                    </Box>
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        )}

        {/* ============ NEIGHBORHOODS PANEL ============ */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Biriktirilgan mahallalar
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {neighborhoods.map((n) => {
                const completionPct = n.reja > 0 ? (n.revenue / n.reja) * 100 : 0;
                const statusColor =
                  n.reja > 0
                    ? completionPct >= 100
                      ? theme.palette.success.main
                      : completionPct >= 80
                        ? theme.palette.warning.main
                        : theme.palette.error.main
                    : theme.palette.grey[500];

                return (
                  <Card
                    key={n.id}
                    sx={{
                      p: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '14px',
                      boxShadow: 'none',
                      backgroundColor: theme.palette.background.paper
                    }}
                  >
                    <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {n.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {n.subscribersCount} abonent
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Hisoblandi (Reja)
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {n.reja.toLocaleString()} so'm
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Daromad
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {n.revenue.toLocaleString()} so'm
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          DHJ1 Saldo oxiri debitorlik
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'error.main' }}>
                          {n.debt.toLocaleString()} so'm
                        </Typography>
                      </Grid>

                      <Grid
                        size={{ xs: 6, sm: 2 }}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            width: 38,
                            height: 38,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Box component="svg" viewBox="0 0 38 38" sx={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                            <circle
                              cx="19"
                              cy="19"
                              r="16"
                              fill="none"
                              stroke={isDark ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.common.black, 0.08)}
                              strokeWidth="4"
                            />
                            <circle
                              cx="19"
                              cy="19"
                              r="16"
                              fill="none"
                              stroke={statusColor}
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray="100.5"
                              strokeDashoffset={n.reja > 0 ? 100.5 * (1 - Math.min(100, completionPct) / 100) : 100.5}
                            />
                          </Box>
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: statusColor }}>
                          {n.reja > 0 ? `${Math.round(completionPct)}%` : '—'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ============ TASKS PANEL (KANBAN) ============ */}
        {activeTab === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Topshiriqlar
              </Typography>
              <Button variant="contained" color="secondary" startIcon={<Add />} onClick={() => setTaskDialogOpen(true)}>
                Yangi vazifa biriktirish
              </Button>
            </Box>

            <Grid container spacing={2}>
              {/* Overdue column */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      color: 'error.main'
                    }}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: 'error.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Muddati o'tgan · {overdueTasks.length}
                    </Typography>
                  </Box>
                  {overdueTasks.map((t) => (
                    <Card
                      key={t._id}
                      sx={{
                        border: '1px solid',
                        borderColor: alpha(theme.palette.error.main, 0.4),
                        borderRadius: '12px',
                        p: 2,
                        backgroundColor: theme.palette.background.paper
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: 'text.primary' }}>
                        {t.title}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mt: 1.5,
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          color: 'error.main'
                        }}
                      >
                        <Box component="span">Muddat: {dayjs(t.deadline).format('DD.MM')}</Box>
                        <Box component="span">Muddati o'tgan</Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Grid>

              {/* In progress column */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      color: 'warning.main'
                    }}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: 'warning.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Jarayonda · {inProgressTasks.length}
                    </Typography>
                  </Box>
                  {inProgressTasks.map((t) => (
                    <Card
                      key={t._id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '12px',
                        p: 2,
                        backgroundColor: theme.palette.background.paper
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                        {t.title}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mt: 1.5,
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          color: 'text.secondary'
                        }}
                      >
                        <Box component="span">Muddat: {dayjs(t.deadline).format('DD.MM')}</Box>
                        <Box component="span" sx={{ textTransform: 'capitalize' }}>
                          {t.priority}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                        <Button size="small" variant="outlined" color="success" onClick={() => handleUpdateTaskStatus(t._id, 'completed')}>
                          Bajarildi
                        </Button>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Grid>

              {/* Pending column */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      color: 'text.secondary'
                    }}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: 'text.secondary' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Kutilmoqda · {pendingTasks.length}
                    </Typography>
                  </Box>
                  {pendingTasks.map((t) => (
                    <Card
                      key={t._id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '12px',
                        p: 2,
                        backgroundColor: theme.palette.background.paper
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                        {t.title}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mt: 1.5,
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          color: 'text.secondary'
                        }}
                      >
                        <Box component="span">Muddat: {dayjs(t.deadline).format('DD.MM')}</Box>
                        <Box component="span" sx={{ textTransform: 'capitalize' }}>
                          {t.priority}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          onClick={() => handleUpdateTaskStatus(t._id, 'in-progress')}
                        >
                          Jarayon
                        </Button>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Grid>

              {/* Done column */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      color: 'success.main'
                    }}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: 'success.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Bajarilgan · {completedTasks.length}
                    </Typography>
                  </Box>
                  {completedTasks.map((t) => (
                    <Card
                      key={t._id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '12px',
                        p: 2,
                        opacity: 0.7,
                        backgroundColor: theme.palette.background.paper
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, textDecoration: 'line-through' }}>
                        {t.title}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mt: 1.5,
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          color: 'text.secondary'
                        }}
                      >
                        <Box component="span">Bajarildi</Box>
                        <Box component="span">—</Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ============ COMPLAINTS PANEL ============ */}
        {activeTab === 4 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Murojaatlar
            </Typography>

            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '14px',
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  <Typography variant="h3" sx={{ fontWeight: 600, color: 'primary.main', fontFamily: 'monospace' }}>
                    {newComplaints.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Yangi
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '14px',
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  <Typography variant="h3" sx={{ fontWeight: 600, color: 'warning.main', fontFamily: 'monospace' }}>
                    {inProgressComplaints.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Jarayonda
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '14px',
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  <Typography variant="h3" sx={{ fontWeight: 600, color: 'success.main', fontFamily: 'monospace' }}>
                    {closedComplaints.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Bajarilgan
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '14px',
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  <Typography variant="h3" sx={{ fontWeight: 600, color: 'error.main', fontFamily: 'monospace' }}>
                    {overdueComplaintsCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Muddati o'tgan
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Complaints List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {complaints.map((c) => {
                const ageDays = dayjs().diff(dayjs(c.createdAt), 'day');
                const isOverdue = c.status === 'open' && ageDays > 7;
                const isNew = c.status === 'open' && ageDays <= 2;
                const isInProgress = c.status === 'open' && ageDays > 2 && ageDays <= 7;

                let label = 'Ochiq';
                let color: 'success' | 'error' | 'primary' | 'warning' | 'default' = 'default';

                if (c.status === 'closed') {
                  label = 'Bajarilgan';
                  color = 'success';
                } else if (isOverdue) {
                  label = "Muddati o'tgan";
                  color = 'error';
                } else if (isNew) {
                  label = 'Yangi';
                  color = 'primary';
                } else if (isInProgress) {
                  label = 'Jarayonda';
                  color = 'warning';
                }

                return (
                  <Card
                    key={c._id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: theme.palette.background.paper
                    }}
                  >
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {c.muallif}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.manzil || 'Manzil kiritilmagan'}
                      </Typography>
                    </Box>
                    <Chip label={label} color={color} size="small" sx={{ fontWeight: 600 }} />
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ============ SPECIAL ASSIGNMENTS PANEL (TABLE VIEW WITH EDIT MODAL) ============ */}
        {activeTab === 5 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Maxsus topshiriqlar jadvali
                </Typography>
                <Chip
                  label={`${completedSpecial} / ${totalSpecial} bajarildi (${specialCompletionPct}%)`}
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {/* Filters bar */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel id="special-filter-type-label">Turi</InputLabel>
                  <Select
                    labelId="special-filter-type-label"
                    label="Turi"
                    value={specialFilterType}
                    onChange={(e) => setSpecialFilterType(e.target.value)}
                  >
                    <MenuItem value="all">Barchasi</MenuItem>
                    <MenuItem value="phone">Telefon tekshirish</MenuItem>
                    <MenuItem value="electricity">Elektr mapped</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel id="special-filter-status-label">Holati</InputLabel>
                  <Select
                    labelId="special-filter-status-label"
                    label="Holati"
                    value={specialFilterStatus}
                    onChange={(e) => setSpecialFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">Barchasi</MenuItem>
                    <MenuItem value="in-progress">Jarayonda</MenuItem>
                    <MenuItem value="completed">Bajarilgan</MenuItem>
                    <MenuItem value="rejected">Rad etilgan</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="special-filter-mahalla-label">Mahalla</InputLabel>
                  <Select
                    labelId="special-filter-mahalla-label"
                    label="Mahalla"
                    value={specialFilterMahalla}
                    onChange={(e) => setSpecialFilterMahalla(e.target.value)}
                  >
                    <MenuItem value="all">Barchasi</MenuItem>
                    {neighborhoods.map((n) => (
                      <MenuItem key={n.id} value={n.id}>
                        {n.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Special Assignments Table */}
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', backgroundColor: theme.palette.background.paper }}
            >
              <Table size="medium">
                <TableHead sx={{ backgroundColor: isDark ? alpha(theme.palette.common.white, 0.04) : theme.palette.grey[100] }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Abonent Hisob Raqami</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>F.I.Sh</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Topshiriq Turi</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Maqsadi / Ko'rsatma</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Holat</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', width: 90 }}>
                      Amal
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {specialAssignments
                    .filter((s) => {
                      const typeMatch = specialFilterType === 'all' || s.type === specialFilterType;
                      const statusMatch = specialFilterStatus === 'all' || s.status === specialFilterStatus;
                      const mahallaMatch = specialFilterMahalla === 'all' || Number(s.mahallaId) === Number(specialFilterMahalla);
                      return typeMatch && statusMatch && mahallaMatch;
                    })
                    .map((s) => {
                      let statusLabel = 'Jarayonda';
                      let statusColor: 'warning' | 'success' | 'error' = 'warning';

                      if (s.status === 'completed') {
                        statusLabel = 'Bajarilgan';
                        statusColor = 'success';
                      } else if (s.status === 'rejected') {
                        statusLabel = 'Rad etilgan';
                        statusColor = 'error';
                      }

                      return (
                        <TableRow key={s._id || s.id} hover>
                          <TableCell>
                            <Chip
                              label={s.accountNumber}
                              size="small"
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                backgroundColor: isDark ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.black, 0.06),
                                color: theme.palette.text.primary
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>{s.fullName}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>
                            <Chip
                              label={s.type === 'phone' ? 'Tel tekshirish' : 'Elektr mapped'}
                              size="small"
                              variant="outlined"
                              color={s.type === 'phone' ? 'primary' : 'secondary'}
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                            {s.purpose || 'Qo‘shimcha ko‘rsatma kiritilmagan'}
                          </TableCell>
                          <TableCell>
                            <Chip label={statusLabel} color={statusColor} size="small" sx={{ fontWeight: 600 }} />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Tahrirlash">
                              <IconButton size="small" color="primary" onClick={() => handleOpenEditSpecial(s)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* Task Creation Dialog */}
      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleCreateTask}>
          <DialogTitle sx={{ fontWeight: 700 }}>Yangi vazifa biriktirish</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField required fullWidth label="Vazifa sarlavhasi" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Tafsilotlar / Qo‘shimcha ko‘rsatmalar"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
            <TextField
              required
              fullWidth
              type="datetime-local"
              label="Bajarilish muddati"
              slotProps={{
                inputLabel: {
                  shrink: true
                }
              }}
              value={taskDeadline}
              onChange={(e) => setTaskDeadline(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel id="task-priority-label">Muhimlik darajasi</InputLabel>
              <Select
                labelId="task-priority-label"
                label="Muhimlik darajasi"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
              >
                <MenuItem value="low">Past</MenuItem>
                <MenuItem value="medium">O‘rtacha</MenuItem>
                <MenuItem value="high">Yuqori</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Abonent hisob raqami (ixtiyoriy)"
              value={taskRelatedSubscriber}
              onChange={(e) => setTaskRelatedSubscriber(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTaskDialogOpen(false)} variant="outlined">
              Bekor qilish
            </Button>
            <Button type="submit" variant="contained" color="secondary" disabled={taskSaving}>
              {taskSaving ? <CircularProgress size={20} /> : 'Telegram orqali jo‘natish'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Special Assignment Edit Dialog */}
      <Dialog
        open={editSpecialDialogOpen}
        onClose={() => setEditSpecialDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: { borderRadius: 3 }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Maxsus topshiriqni tahrirlash
          <IconButton size="small" onClick={() => setEditSpecialDialogOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {editingSpecial && (
            <>
              <TextField
                fullWidth
                label="Abonent hisob raqami"
                value={editingSpecial.accountNumber}
                onChange={(e) => setEditingSpecial({ ...editingSpecial, accountNumber: e.target.value })}
              />
              <TextField
                fullWidth
                label="F.I.Sh"
                value={editingSpecial.fullName}
                onChange={(e) => setEditingSpecial({ ...editingSpecial, fullName: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel id="edit-special-type-label">Topshiriq turi</InputLabel>
                <Select
                  labelId="edit-special-type-label"
                  label="Topshiriq turi"
                  value={editingSpecial.type}
                  onChange={(e) => setEditingSpecial({ ...editingSpecial, type: e.target.value as any })}
                >
                  <MenuItem value="phone">Telefon tekshirish</MenuItem>
                  <MenuItem value="electricity">Elektr mapped</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="edit-special-status-label">Holat</InputLabel>
                <Select
                  labelId="edit-special-status-label"
                  label="Holat"
                  value={editingSpecial.status}
                  onChange={(e) => setEditingSpecial({ ...editingSpecial, status: e.target.value as any })}
                >
                  <MenuItem value="in-progress">Jarayonda</MenuItem>
                  <MenuItem value="completed">Bajarilgan</MenuItem>
                  <MenuItem value="rejected">Rad etilgan</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Maqsadi / Qo'shimcha ko'rsatma"
                value={editingSpecial.purpose}
                onChange={(e) => setEditingSpecial({ ...editingSpecial, purpose: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setEditSpecialDialogOpen(false)}>
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SaveOutlinedIcon />}
            onClick={handleSaveSpecialAssignment}
            disabled={editSpecialSaving}
          >
            {editSpecialSaving ? <CircularProgress size={20} /> : "O'zgartirishlarni saqlash"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Inspector360;
