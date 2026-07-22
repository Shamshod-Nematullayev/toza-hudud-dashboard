import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Add
} from '@mui/icons-material';
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

function Inspector360() {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress color="secondary" />
        <Typography variant="body1" color="text.secondary">
          Inspector 360° yuklanmoqda...
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Nazoratchi topilmadi yoki yuklashda xatolik yuz berdi.</Alert>
      </Box>
    );
  }

  const { profile, performance, neighborhoods, tasks, complaints, specialAssignments } = data;

  // Find best/worst neighborhoods
  let bestNeighborhood = '—';
  let worstNeighborhood = '—';
  let bestPct = 0;
  let worstPct = 1000;
  let totalSubscribers = 0;

  neighborhoods.forEach((n) => {
    totalSubscribers += n.subscribersCount || 0;
    const pct = n.reja > 0 ? (n.revenue / n.reja) * 100 : 0;
    if (n.reja > 0) {
      if (pct > bestPct) {
        bestPct = pct;
        bestNeighborhood = `${n.name} · ${Math.round(pct)}%`;
      }
      if (pct < worstPct) {
        worstPct = pct;
        worstNeighborhood = `${n.name} · ${Math.round(pct)}%`;
      }
    }
  });

  if (bestPct === 0) bestNeighborhood = '—';
  if (worstPct === 1000) worstNeighborhood = '—';

  // Direct today plan and month plan checks (even if target is 0 or low)
  const hasTodayPlan = performance.today.target >= 0;
  const todayCompletionPct = performance.today.completion;
  const hasMonthPlan = performance.month.target >= 0;

  // Segmented Bar Calculation
  const totalMonthlyIncome = performance.month.revenue || 0;
  const ecoPayPercent = totalMonthlyIncome > 0 ? (performance.month.ecoPay / totalMonthlyIncome) * 100 : 0;
  const collectionPercent = totalMonthlyIncome > 0 ? (performance.month.inspectorCollection / totalMonthlyIncome) * 100 : 100;

  // Tasks status counts
  const overdueTasks = tasks.filter((t) => t.status === 'overdue');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  // Complaints status counts
  const newComplaints = complaints.filter((c) => c.status === 'open' && dayjs().diff(dayjs(c.createdAt), 'day') <= 2);
  const inProgressComplaints = complaints.filter((c) => c.status === 'open' && dayjs().diff(dayjs(c.createdAt), 'day') > 2);
  const closedComplaints = complaints.filter((c) => c.status === 'closed');
  const overdueComplaintsCount = complaints.filter((c) => c.status === 'open' && dayjs().diff(dayjs(c.createdAt), 'day') > 7).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Upper Navigation and Header Area */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => navigate('/employeers/inspectors')} color="primary" size="small">
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="caption" sx={{ letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold' }}>
          Greenzone / Inspektorlar / <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Inspector 360°</Box>
        </Typography>
      </Box>

      {/* ============ PROFILE HEADER ============ */}
      <MainCard>
        <Grid container spacing={3} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              {/* Avatar ring with circular progress */}
              <Box sx={{ position: 'relative', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box
                  component="svg"
                  viewBox="0 0 72 72"
                  sx={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', width: '100%', height: '100%' }}
                >
                  <circle cx="36" cy="36" r="33" fill="none" stroke="#26332C" strokeWidth="2"/>
                  <circle
                    cx="36"
                    cy="36"
                    r="33"
                    fill="none"
                    stroke="#4F9D6E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="207.3"
                    strokeDashoffset={207.3 * (1 - Math.min(100, todayCompletionPct) / 100)}
                  />
                </Box>
                <Avatar
                  src={profile.photo}
                  sx={{
                    width: 58,
                    height: 58,
                    fontSize: '1.25rem',
                    bgcolor: 'secondary.main',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  {profile.name.split(' ').map((n) => n.charAt(0)).join('') || 'N'}
                </Avatar>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                  {profile.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                  {/* Status Pill */}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1.2,
                      py: 0.4,
                      borderRadius: '100px',
                      bgcolor: 'rgba(79,157,110,0.12)',
                      border: '1px solid rgba(79,157,110,0.35)',
                      color: '#74D194',
                      fontSize: '12.5px',
                      fontWeight: 500
                    }}
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: '#74D194',
                        boxShadow: '0 0 0 0 rgba(116,209,148,0.6)',
                        animation: 'pulse-dot 2.2s infinite',
                        '@keyframes pulse-dot': {
                          '0%': { boxShadow: '0 0 0 0 rgba(116,209,148,0.45)' },
                          '70%': { boxShadow: '0 0 0 7px rgba(116,209,148,0)' },
                          '100%': { boxShadow: '0 0 0 0 rgba(116,209,148,0)' }
                        }
                      }}
                    />
                    {profile.status === 'active' ? 'Faol' : profile.status === 'on-leave' ? 'Tatilda' : 'Nofaol'}
                  </Box>

                  <Typography sx={{ fontFamily: 'monospace', fontSize: '13px', color: 'text.secondary' }}>
                    {profile.phone || '—'}
                  </Typography>

                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    • {profile.assignedNeighborhoodsCount} mahalla
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography variant="caption" sx={{ letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', display: 'block' }}>
              So'nggi faollik
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, mt: 0.5 }}>
              {profile.lastActivityTime ? dayjs(profile.lastActivityTime).format('DD.MM.YYYY HH:mm') : 'Hali faollik yo‘q'}
            </Typography>
          </Grid>
        </Grid>
      </MainCard>

      {/* ============ TABS ============ */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        textColor="secondary"
        indicatorColor="secondary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}
      >
        <Tab label="Umumiy holat" />
        <Tab label="Daromad" />
        <Tab label={<Box component="span">Mahallalar <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.7, ml: 0.5 }}>{neighborhoods.length}</Box></Box>} />
        <Tab label={<Box component="span">Vazifalar <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.7, ml: 0.5 }}>{tasks.length}</Box></Box>} />
        <Tab label={<Box component="span">Murojaatlar <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.7, ml: 0.5 }}>{complaints.length}</Box></Box>} />
        <Tab label={<Box component="span">Maxsus topshiriqlar <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.7, ml: 0.5 }}>{specialAssignments.length}</Box></Box>} />
      </Tabs>

      {/* Tab Panels */}
      <Box sx={{ minHeight: '400px' }}>
        {/* ============ OVERVIEW PANEL ============ */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                {/* Gauge Card */}
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%' }}>
                  <Typography variant="caption" sx={{ letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold' }}>
                    Bugungi bajarilish
                  </Typography>
                  
                  <Box sx={{ position: 'relative', width: 200, height: 200, my: 2 }}>
                    <Box
                      component="svg"
                      viewBox="0 0 210 210"
                      sx={{ width: '100%', height: '100%' }}
                    >
                      <circle cx="105" cy="105" r="92" fill="none" stroke="#1D2820" strokeWidth="10"/>
                      <circle
                        cx="105"
                        cy="105"
                        r="92"
                        fill="none"
                        stroke="#74D194"
                        strokeWidth="10"
                        strokeLinecap="round"
                        transform="rotate(-90 105 105)"
                        strokeDasharray="578"
                        strokeDashoffset={578 * (1 - Math.min(100, todayCompletionPct) / 100)}
                      />
                      {/* ticks */}
                      {Array.from({ length: 24 }).map((_, i) => {
                        const angle = (i * 15) * Math.PI / 180;
                        const x1 = 105 + 84 * Math.cos(angle);
                        const y1 = 105 + 84 * Math.sin(angle);
                        const x2 = 105 + 92 * Math.cos(angle);
                        const y2 = 105 + 92 * Math.sin(angle);
                        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#263229" strokeWidth="2" />;
                      })}
                    </Box>
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '34px', fontWeight: 'bold', color: '#74D194', lineHeight: 1 }}>
                        {hasTodayPlan ? `${todayCompletionPct}%` : '—'}
                      </Typography>
                      <Typography sx={{ fontSize: '11.5px', color: 'text.secondary', mt: 1 }}>
                        rejadan bajarilgan
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary">Bugungi daromad</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{performance.today.revenue.toLocaleString()} so'm</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary">Bugungi reja</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{hasTodayPlan ? `${performance.today.target.toLocaleString()} so'm` : '—'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Farq</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', color: !hasTodayPlan ? 'text.secondary' : (performance.today.difference >= 0 ? '#74D194' : '#D9704F') }}>
                        {hasTodayPlan ? `${performance.today.difference >= 0 ? '+' : ''}${performance.today.difference.toLocaleString()} so'm` : '—'}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
                  {/* Compare strip */}
                  <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="caption" sx={{ letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold' }}>
                      Solishtirma tahlil
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">O'tgan oyning shu kuni</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 600, mt: 0.5, fontFamily: 'monospace' }}>
                          {performance.sameDayLastMonth.revenue.toLocaleString()}{' '}
                          <Box component="span" sx={{ fontSize: '13px', fontWeight: 'normal', color: 'text.secondary' }}>so'm</Box>
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Shu oyning bugungi kuni</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 600, mt: 0.5, fontFamily: 'monospace' }}>
                          {performance.today.revenue.toLocaleString()}{' '}
                          <Box component="span" sx={{ fontSize: '13px', fontWeight: 'normal', color: 'text.secondary' }}>so'm</Box>
                          {performance.sameDayLastMonth.revenue >= 0 && (
                            <Box component="span" sx={{
                              display: 'inline-flex', alignItems: 'center', gap: 0.5, fontFamily: 'monospace', fontSize: '12px',
                              ml: 1, px: 1, py: 0.25, borderRadius: '100px',
                              color: performance.today.revenue >= performance.sameDayLastMonth.revenue ? '#74D194' : '#D9704F',
                              bgcolor: performance.today.revenue >= performance.sameDayLastMonth.revenue ? 'rgba(116,209,148,0.1)' : 'rgba(217,112,79,0.12)'
                            }}>
                              {performance.today.revenue >= performance.sameDayLastMonth.revenue ? '▲' : '▼'}{' '}
                              {performance.sameDayLastMonth.revenue > 0 ? Math.round(Math.abs((performance.today.revenue - performance.sameDayLastMonth.revenue) / performance.sameDayLastMonth.revenue) * 100) : 0}%
                            </Box>
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>

                  {/* Quick Cards */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', p: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Ochiq vazifalar
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 600, fontFamily: 'monospace', my: 1 }}>
                          {tasks.filter((t) => t.status !== 'completed').length}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, fontSize: '12px', color: 'text.secondary' }}>
                          <Box component="span"><Box component="b" sx={{ color: 'text.primary' }}>{overdueTasks.length}</Box> muddati o'tgan</Box>
                          <Box component="span"><Box component="b" sx={{ color: 'text.primary' }}>{inProgressTasks.length + pendingTasks.length}</Box> jarayonda</Box>
                        </Box>
                      </Card>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', p: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Ochiq murojaatlar
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 600, fontFamily: 'monospace', my: 1 }}>
                          {complaints.filter((c) => c.status === 'open').length}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, fontSize: '12px', color: 'text.secondary' }}>
                          <Box component="span"><Box component="b" sx={{ color: 'text.primary' }}>{overdueComplaintsCount}</Box> muddati o'tgan</Box>
                          <Box component="span"><Box component="b" sx={{ color: 'text.primary' }}>{newComplaints.length + inProgressComplaints.length}</Box> jarayonda</Box>
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>

            {/* Neighborhood quick summary */}
            <Typography variant="h4" sx={{ fontWeight: 600, mt: 3, mb: 2 }}>
              Mahalla kesimida qisqacha
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', p: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>Eng yaxshi natija</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#74D194' }}>{bestNeighborhood}</Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', p: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>E'tibor talab qiladi</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#D9704F' }}>{worstNeighborhood}</Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', p: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>Jami obunachilar</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{totalSubscribers} ta</Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ============ REVENUE PANEL ============ */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Daromad va bajarilish (Accrual / Hisoblandi bo'yicha)
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', p: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>Jami daromad</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{performance.month.revenue.toLocaleString()} so'm</Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', p: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>Accrual (Reja / Hisoblandi)</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{hasMonthPlan ? `${performance.month.target.toLocaleString()} so'm` : '—'}</Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', p: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>Bajarilish</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, fontFamily: 'monospace', color: hasMonthPlan ? '#74D194' : 'text.secondary' }}>{hasMonthPlan ? `${performance.month.completion.toFixed(1)}%` : '—'}</Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Manba bo'yicha taqsimot */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', p: 3 }}>
              <Typography variant="caption" sx={{ letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold' }}>
                Manba bo'yicha taqsimot
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2, mb: 1, fontSize: '13px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 9, height: 9, borderRadius: '3px', bgcolor: '#4F9D6E' }} />
                  <Typography variant="body2" color="text.secondary">
                    Inspektor orqali yig'im:{' '}
                    <Box component="span" sx={{ fontFamily: 'monospace', color: 'text.primary', fontWeight: 500 }}>
                      {performance.month.inspectorCollection.toLocaleString()} so'm
                    </Box>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 9, height: 9, borderRadius: '3px', bgcolor: '#3A5A45' }} />
                  <Typography variant="body2" color="text.secondary">
                    EcoPay:{' '}
                    <Box component="span" sx={{ fontFamily: 'monospace', color: 'text.primary', fontWeight: 500 }}>
                      {performance.month.ecoPay.toLocaleString()} so'm
                    </Box>
                  </Typography>
                </Box>
              </Box>

              {/* Segmented Progress Bar */}
              <Box sx={{ height: 10, borderRadius: '100px', overflow: 'hidden', display: 'flex', bgcolor: 'divider', mt: 1.5, mb: 1, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ width: `${collectionPercent}%`, bgcolor: '#4F9D6E' }} />
                <Box sx={{ width: `${ecoPayPercent}%`, bgcolor: '#3A5A45' }} />
              </Box>
            </Card>

            {/* Kunlik solishtirma */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', p: 3 }}>
              <Typography variant="caption" sx={{ letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold', display: 'block', mb: 2 }}>
                Kunlik solishtirma
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">Bugungi daromad</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{performance.today.revenue.toLocaleString()} so'm</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">Kecha</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {performance.yesterday.revenue.toLocaleString()} so'm
                    <Box component="span" sx={{
                      display: 'inline-flex', alignItems: 'center', gap: 0.5, fontFamily: 'monospace', fontSize: '11px', ml: 1,
                      color: performance.today.revenue >= performance.yesterday.revenue ? '#74D194' : '#D9704F'
                    }}>
                      {performance.today.revenue >= performance.yesterday.revenue ? '▲' : '▼'}{' '}
                      {Math.round(performance.yesterday.completion)}%
                    </Box>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1 }}>
                  <Typography variant="body2" color="text.secondary">O'tgan oyning shu kuni</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {performance.sameDayLastMonth.revenue.toLocaleString()} so'm
                    <Box component="span" sx={{
                      display: 'inline-flex', alignItems: 'center', gap: 0.5, fontFamily: 'monospace', fontSize: '11px', ml: 1,
                      color: performance.today.revenue >= performance.sameDayLastMonth.revenue ? '#74D194' : '#D9704F'
                    }}>
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
                const statusColor = n.reja > 0 ? (completionPct >= 100 ? '#74D194' : completionPct >= 80 ? '#E0A63C' : '#D9704F') : '#526056';
                const isWarning = n.reja > 0 && completionPct < 80;

                return (
                  <Card
                    key={n.id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: isWarning ? 'rgba(217,112,79,0.4)' : 'divider',
                      borderRadius: '14px',
                      boxShadow: 'none'
                    }}
                  >
                    <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: 'Space Grotesk' }}>
                          {n.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {n.subscribersCount} obunachi
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Accrual (Reja)</Typography>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                          {n.reja.toLocaleString()} so'm
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Daromad</Typography>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                          {n.revenue.toLocaleString()} so'm
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Qarzdorlik</Typography>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                          {n.debt.toLocaleString()} so'm
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 2 }} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                        {/* mini ring */}
                        <Box sx={{ position: 'relative', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Box component="svg" viewBox="0 0 38 38" sx={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                            <circle cx="19" cy="19" r="16" fill="none" stroke="#1D2820" strokeWidth="4"/>
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
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Add />}
                onClick={() => setTaskDialogOpen(true)}
              >
                Yangi vazifa biriktirish
              </Button>
            </Box>

            <Grid container spacing={2}>
              {/* Overdue column */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider', color: 'error.main' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: 'error.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Muddati o'tgan · {overdueTasks.length}
                    </Typography>
                  </Box>
                  {overdueTasks.map((t) => (
                    <Card key={t._id} sx={{ border: '1px solid', borderColor: 'rgba(217,112,79,0.35)', borderRadius: '12px', p: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: 'text.primary' }}>
                        {t.title}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, fontSize: '11px', fontFamily: 'monospace', color: 'error.main' }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider', color: 'warning.main' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: 'warning.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Jarayonda · {inProgressTasks.length}
                    </Typography>
                  </Box>
                  {inProgressTasks.map((t) => (
                    <Card key={t._id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', p: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                        {t.title}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, fontSize: '11px', fontFamily: 'monospace', color: 'text.secondary' }}>
                        <Box component="span">Muddat: {dayjs(t.deadline).format('DD.MM')}</Box>
                        <Box component="span" sx={{ textTransform: 'capitalize' }}>{t.priority}</Box>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider', color: 'text.secondary' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: 'text.secondary' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Kutilmoqda · {pendingTasks.length}
                    </Typography>
                  </Box>
                  {pendingTasks.map((t) => (
                    <Card key={t._id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', p: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                        {t.title}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, fontSize: '11px', fontFamily: 'monospace', color: 'text.secondary' }}>
                        <Box component="span">Muddat: {dayjs(t.deadline).format('DD.MM')}</Box>
                        <Box component="span" sx={{ textTransform: 'capitalize' }}>{t.priority}</Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                        <Button size="small" variant="contained" color="warning" onClick={() => handleUpdateTaskStatus(t._id, 'in-progress')}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider', color: 'success.main' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: 'success.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Bajarilgan · {completedTasks.length}
                    </Typography>
                  </Box>
                  {completedTasks.map((t) => (
                    <Card key={t._id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', p: 2, opacity: 0.7 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, textDecoration: 'line-through' }}>
                        {t.title}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, fontSize: '11px', fontFamily: 'monospace', color: 'text.secondary' }}>
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
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', p: 2, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: '#8FBBE0', fontFamily: 'monospace' }}>
                    {newComplaints.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Yangi</Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', p: 2, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: '#E0A63C', fontFamily: 'monospace' }}>
                    {inProgressComplaints.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Jarayonda</Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', p: 2, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: '#74D194', fontFamily: 'monospace' }}>
                    {closedComplaints.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Bajarilgan</Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '14px', p: 2, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: '#D9704F', fontFamily: 'monospace' }}>
                    {overdueComplaintsCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Muddati o'tgan</Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Complaints list */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {complaints.map((c) => {
                const ageDays = dayjs().diff(dayjs(c.createdAt), 'day');
                const isOverdue = c.status === 'open' && ageDays > 7;
                const isNew = c.status === 'open' && ageDays <= 2;
                const isInProgress = c.status === 'open' && ageDays > 2 && ageDays <= 7;

                let label = 'Ochiq';
                let bg = 'rgba(255,255,255,0.05)';
                let text = '#fff';

                if (c.status === 'closed') {
                  label = 'Bajarilgan';
                  bg = 'rgba(116,209,148,0.12)';
                  text = '#74D194';
                } else if (isOverdue) {
                  label = "Muddati o'tgan";
                  bg = 'rgba(217,112,79,0.15)';
                  text = '#D9704F';
                } else if (isNew) {
                  label = 'Yangi';
                  bg = 'rgba(143,187,224,0.12)';
                  text = '#8FBBE0';
                } else if (isInProgress) {
                  label = 'Jarayonda';
                  bg = 'rgba(224,166,60,0.12)';
                  text = '#E0A63C';
                }

                return (
                  <Card key={c._id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>{c.muallif}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.manzil || 'Manzil kiritilmagan'}
                      </Typography>
                    </Box>
                    <Box sx={{
                      fontFamily: 'monospace', fontSize: '11px', px: 1.5, py: 0.5, borderRadius: '100px',
                      bgcolor: bg, color: text, whiteSpace: 'nowrap'
                    }}>
                      {label}
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ============ SPECIAL ASSIGNMENTS PANEL ============ */}
        {activeTab === 5 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Maxsus topshiriqlar
            </Typography>

            {/* Filter controls */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
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

              <FormControl size="small" sx={{ minWidth: 160 }}>
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

              <FormControl size="small" sx={{ minWidth: 160 }}>
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {specialAssignments
                .filter((s) => {
                  const typeMatch = specialFilterType === 'all' || s.type === specialFilterType;
                  const statusMatch = specialFilterStatus === 'all' || s.status === specialFilterStatus;
                  const mahallaMatch = specialFilterMahalla === 'all' || Number(s.mahallaId) === Number(specialFilterMahalla);
                  return typeMatch && statusMatch && mahallaMatch;
                })
                .map((s) => {
                  let statusLabel = 'Jarayonda';
                  let statusBg = 'rgba(224,166,60,0.12)';
                  let statusText = '#E0A63C';

                  if (s.status === 'completed') {
                    statusLabel = 'Bajarilgan';
                    statusBg = 'rgba(116,209,148,0.12)';
                    statusText = '#74D194';
                  } else if (s.status === 'rejected') {
                    statusLabel = 'Rad etilgan';
                    statusBg = 'rgba(217,112,79,0.15)';
                    statusText = '#D9704F';
                  }

                  return (
                    <Card key={s._id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: 'Space Grotesk' }}>
                          {s.fullName}
                        </Typography>
                        <Box sx={{
                          fontFamily: 'monospace', fontSize: '11px', px: 1.5, py: 0.5, borderRadius: '100px',
                          bgcolor: statusBg, color: statusText, whiteSpace: 'nowrap'
                        }}>
                          {statusLabel}
                        </Box>
                      </Box>

                      {/* Fields grid */}
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" color="text.secondary" display="block">Abonent hisob raqami</Typography>
                          <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>{s.accountNumber}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" color="text.secondary" display="block">Turi</Typography>
                          <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>{s.type}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" color="text.secondary" display="block">Biriktirilgan</Typography>
                          <Typography variant="subtitle2">{profile.name}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="caption" color="text.secondary" display="block">Holat</Typography>
                          <Typography variant="subtitle2" sx={{ color: statusText }}>{statusLabel}</Typography>
                        </Grid>
                      </Grid>

                      {/* Instruction details */}
                      <Box sx={{
                        fontSize: '13.5px', color: 'text.secondary', lineHeight: 1.55,
                        p: 2, bgcolor: 'action.hover', borderRadius: '10px',
                        borderLeft: '2px solid', borderLeftColor: '#4F9D6E', mb: 1.5
                      }}>
                        {s.purpose || 'Qo‘shimcha ko‘rsatma kiritilmagan'}
                      </Box>
                    </Card>
                  );
                })}
            </Box>
          </Box>
        )}
      </Box>

      {/* Task Creation Dialog */}
      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleCreateTask}>
          <DialogTitle sx={{ fontWeight: 700 }}>Yangi vazifa biriktirish</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Vazifa sarlavhasi"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
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
              InputLabelProps={{ shrink: true }}
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
    </Box>
  );
}

export default Inspector360;
