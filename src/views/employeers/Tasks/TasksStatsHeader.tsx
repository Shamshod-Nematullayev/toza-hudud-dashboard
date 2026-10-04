import React, { useEffect } from 'react';
import { Box, Card, Grid, Typography, Skeleton, Chip, Stack, useTheme } from '@mui/material';
import {
  AssignmentOutlined,
  PhoneAndroidOutlined,
  FlashOnOutlined,
  HourglassEmptyOutlined,
  CheckCircleOutlined,
  FactCheckOutlined,
} from '@mui/icons-material';
import { useTasksStore } from './useTasksStore';

function TasksStatsHeader() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { stats, statsLoading, fetchStats, type, status, applyQuickFilter } = useTasksStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cardsData = [
    {
      title: 'Jami Topshiriqlar',
      value: stats?.totalTasks ?? 0,
      icon: <AssignmentOutlined sx={{ fontSize: 24, color: 'primary.main' }} />,
      color: theme.palette.primary.main,
      subText: 'Nazoratchilar topshiriqlari bazasi',
      isActive: type === '' && status === '',
      onClick: () => applyQuickFilter({ type: '', status: '' })
    },
    {
      title: 'Telefon Topshiriqlari',
      value: stats?.phoneTasks ?? 0,
      icon: <PhoneAndroidOutlined sx={{ fontSize: 24, color: 'info.main' }} />,
      color: theme.palette.info.main,
      subText: 'Raqam aniqlash va biriktirish',
      isActive: type === 'phone',
      onClick: () => applyQuickFilter({ type: type === 'phone' ? '' : 'phone' })
    },
    {
      title: 'Elektr Topshiriqlari',
      value: stats?.electricityTasks ?? 0,
      icon: <FlashOnOutlined sx={{ fontSize: 24, color: 'warning.main' }} />,
      color: theme.palette.warning.main,
      subText: 'ETK hisob kodi bilan ishlash',
      isActive: type === 'electricity',
      onClick: () => applyQuickFilter({ type: type === 'electricity' ? '' : 'electricity' })
    },
    {
      title: 'Jarayonda',
      value: stats?.inProgressTasks ?? 0,
      icon: <HourglassEmptyOutlined sx={{ fontSize: 24, color: 'secondary.main' }} />,
      color: theme.palette.secondary.main,
      subText: 'Ijro etilishi kutilmoqda',
      isActive: status === 'in-progress',
      onClick: () => applyQuickFilter({ status: status === 'in-progress' ? '' : 'in-progress' })
    },
    {
      title: 'Tekshirilmoqda',
      value: stats?.checkingTasks ?? 0,
      icon: <FactCheckOutlined sx={{ fontSize: 24, color: 'info.main' }} />,
      color: theme.palette.info.main,
      subText: "Ma'lumot kiritilgan, tekshiruvda",
      isActive: status === 'checking',
      onClick: () => applyQuickFilter({ status: status === 'checking' ? '' : 'checking' })
    },
    {
      title: 'Bajarilgan Topshiriqlar',
      value: stats?.completedTasks ?? 0,
      icon: <CheckCircleOutlined sx={{ fontSize: 24, color: 'success.main' }} />,
      color: theme.palette.success.main,
      rate: stats?.completionRate ?? 0,
      subText: 'Muvaffaqiyatli yakunlangan',
      isActive: status === 'completed',
      onClick: () => applyQuickFilter({ status: status === 'completed' ? '' : 'completed' })
    },
  ];

  return (
    <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
      {cardsData.map((card, index) => {
        const active = card.isActive;
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
            <Card
              elevation={0}
              onClick={card.onClick}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: active
                  ? isDark
                    ? 'rgba(33, 150, 243, 0.12)'
                    : `${card.color}12`
                  : 'background.paper',
                border: '1.5px solid',
                borderColor: active ? card.color : isDark ? 'divider' : 'grey.200',
                boxShadow: active
                  ? `0 4px 14px ${card.color}25`
                  : isDark
                  ? 'none'
                  : '0 2px 8px rgba(0,0,0,0.04)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                transform: active ? 'translateY(-2px)' : 'none',
                '&:hover': {
                  borderColor: card.color,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 6px 16px ${card.color}20`
                }
              }}
            >
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  variant="caption"
                  color={active ? 'primary.main' : 'text.secondary'}
                  sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.5,
                    bgcolor: isDark ? 'action.hover' : `${card.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>

              <Box sx={{ my: 1.5 }}>
                {statsLoading && !stats ? (
                  <Skeleton variant="text" width={80} height={36} />
                ) : (
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {new Intl.NumberFormat('uz-UZ').format(card.value)}
                    </Typography>
                    {card.rate !== undefined && (
                      <Chip
                        label={`${card.rate}%`}
                        color={card.rate > 50 ? 'success' : 'warning'}
                        size="small"
                        sx={{ fontWeight: 700, height: 22 }}
                      />
                    )}
                  </Stack>
                )}
              </Box>

              <Typography variant="caption" color="text.secondary">
                {card.subText}
              </Typography>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default TasksStatsHeader;
