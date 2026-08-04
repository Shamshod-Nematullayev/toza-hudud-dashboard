import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Chip,
  useTheme,
  alpha,
  LinearProgress,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Speed as SpeedIcon,
  FlashOn as FlashOnIcon,
  PhoneCallback as PhoneIcon,
  SyncProblem as SyncIcon,
  MessageOutlined as MessageIcon,
  Block as BlockIcon,
  Autorenew as RepeatIcon,
  FiberNew as NewIcon,
  ArrowForward as ArrowForwardIcon,
  RefreshOutlined as RefreshIcon,
  CheckCircleOutline,
  AssignmentTurnedInOutlined,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from 'utils/api';
import MainCard from 'ui-component/cards/MainCard';
import { toast } from 'react-toastify';

interface QueueSummary {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  totalDebt: number;
  actionName: string;
  nextActionText: string;
  statusFilter: string[];
  phoneStatusFilter?: string[];
  color: 'error' | 'warning' | 'info' | 'secondary' | 'primary' | 'default';
}

interface OverviewData {
  overview: {
    activeCount: number;
    totalDebt: number;
    resolvedCount: number;
    readyForActionCount: number;
    currentlyBlockedCount: number;
  };
  queues: QueueSummary[];
}

const queueIconsMap: Record<string, React.ReactNode> = {
  ready_to_block: <FlashOnIcon fontSize="medium" />,
  phone_action_required: <PhoneIcon fontSize="medium" />,
  het_verification_required: <SyncIcon fontSize="medium" />,
  sms_processing: <MessageIcon fontSize="medium" />,
  currently_blocked: <BlockIcon fontSize="medium" />,
  re_blocking_candidates: <RepeatIcon fontSize="medium" />,
  newly_identified: <NewIcon fontSize="medium" />
};

function DebtCollectionOverview() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<OverviewData | null>(null);

  const fetchOperationsSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/debitors/operations-summary');
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        toast.error('Operatsion markaz ma’lumotlarini yuklashda xatolik');
      }
    } catch (err) {
      console.error(err);
      toast.error('Ma’lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationsSummary();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="secondary" size={48} />
      </Box>
    );
  }

  const overview = data?.overview || {
    activeCount: 0,
    totalDebt: 0,
    resolvedCount: 0,
    readyForActionCount: 0,
    currentlyBlockedCount: 0
  };

  const queues = data?.queues || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6 }}>
      {/* HEADER CONTROL BAR */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1.2,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.secondary.main, 0.12),
                color: 'secondary.main',
                display: 'flex'
              }}
            >
              <SpeedIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                Debitor undirish markazi
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Qarzdor abonentlar bilan ishlash va undiruv bosqichlarini operatsion boshqarish
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchOperationsSummary}
            sx={{ borderRadius: 2.5, px: 2.5 }}
          >
            Yangilash
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<FilterListIcon />}
            onClick={() => navigate('/billing/debitors')}
            sx={{ borderRadius: 2.5, px: 3, fontWeight: 700 }}
          >
            Eski filtrlar ro'yxatiga o'tish
          </Button>
        </Box>
      </Box>

      {/* EXECUTIVE HIGH-LEVEL SUMMARY */}
      <MainCard
        border={false}
        content={false}
        boxShadow
        sx={{
          p: 3,
          borderRadius: 3.5,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02)
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
                Jami faol qarzdorlar
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'text.primary' }}>
                {overview.activeCount.toLocaleString()} ta
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontFamily: 'monospace' }}>
                Qarz summasi: <b>{overview.totalDebt.toLocaleString()}</b> so'm
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${alpha(theme.palette.error.main, 0.4)}`,
                backgroundColor: alpha(theme.palette.error.main, isDark ? 0.1 : 0.04)
              }}
            >
              <Typography variant="caption" color="error.main" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>
                Darhol harakat talab etiladi
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'error.main' }}>
                {overview.readyForActionCount.toLocaleString()} ta
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Bloklash yoki raqam kiritish navbatida
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02)
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
                Hozirda bloklanganlar
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'secondary.main' }}>
                {overview.currentlyBlockedCount.toLocaleString()} ta
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Elektr energiyasi o'chirilgan
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02)
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
                Hal etilgan / To'langan
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'success.main' }}>
                {overview.resolvedCount.toLocaleString()} ta
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Qarzdorlik muvaffaqiyatli yopilgan
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </MainCard>

      {/* SECTION TITLE */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Operatsion ish navbatlari (Work Queues)
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Abonentlarni navbatma-navbat ishlash bosqichlari
        </Typography>
      </Box>

      {/* WORK QUEUE CARDS GRID */}
      <Grid container spacing={2.5}>
        {queues.map((queue) => {
          const colorTheme =
            queue.color === 'error'
              ? theme.palette.error
              : queue.color === 'warning'
              ? theme.palette.warning
              : queue.color === 'info'
              ? theme.palette.info
              : queue.color === 'secondary'
              ? theme.palette.secondary
              : theme.palette.primary;

          const pctOfTotal = overview.activeCount > 0 ? Math.round((queue.count / overview.activeCount) * 100) : 0;

          return (
            <Grid item xs={12} sm={6} md={4} key={queue.id}>
              <Card
                sx={{
                  height: '100%',
                  p: 3,
                  borderRadius: 3.5,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  transition: 'all 0.25s ease-in-out',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    borderColor: colorTheme.main
                  }
                }}
              >
                {/* Accent top stripe */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    bgcolor: colorTheme.main
                  }}
                />

                {/* Queue Title & Icon */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 2.5,
                        bgcolor: alpha(colorTheme.main, 0.12),
                        color: colorTheme.main,
                        display: 'flex'
                      }}
                    >
                      {queueIconsMap[queue.id] || <AssignmentTurnedInOutlined />}
                    </Box>

                    <Chip
                      label={`${queue.count.toLocaleString()} abonent`}
                      size="small"
                      color={queue.color as any}
                      sx={{ fontWeight: 700, fontFamily: 'monospace' }}
                    />
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {queue.title}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, minHeight: 36 }}>
                    {queue.subtitle}
                  </Typography>
                </Box>

                {/* Queue Debt Amount & Progress */}
                <Box sx={{ my: 1.5 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? alpha(theme.palette.common.white, 0.04) : alpha(theme.palette.common.black, 0.03),
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      mb: 1.5
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Jami qarz hajmi:
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'monospace', color: colorTheme.main }}>
                      {queue.totalDebt.toLocaleString()} so'm
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Navbatdagi ulushi:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {pctOfTotal}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, pctOfTotal)}
                    color={queue.color as any}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                {/* Next Action Badge & Open Queue Button */}
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Navbatdagi vazifa:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: colorTheme.main }}>
                      {queue.nextActionText}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    color={queue.color as any}
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate(`/billing/debt-collection-center/queue/${queue.id}`)}
                    sx={{
                      borderRadius: 2.5,
                      py: 1,
                      fontWeight: 700,
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    {queue.actionName}
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default DebtCollectionOverview;
