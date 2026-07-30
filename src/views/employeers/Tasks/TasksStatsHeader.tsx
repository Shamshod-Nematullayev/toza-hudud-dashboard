import React, { useEffect } from 'react';
import { Box, Card, Grid, Typography, Skeleton, Chip, Stack, useTheme } from '@mui/material';
import {
  AssignmentOutlined,
  PhoneAndroidOutlined,
  FlashOnOutlined,
  HourglassEmptyOutlined,
  CheckCircleOutlined,
} from '@mui/icons-material';
import { useTasksStore } from './useTasksStore';

function TasksStatsHeader() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { stats, statsLoading, fetchStats } = useTasksStore();

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
    },
    {
      title: 'Telefon Topshiriqlari',
      value: stats?.phoneTasks ?? 0,
      icon: <PhoneAndroidOutlined sx={{ fontSize: 24, color: 'info.main' }} />,
      color: theme.palette.info.main,
      subText: 'Raqam aniqlash va biriktirish',
    },
    {
      title: 'Elektr Topshiriqlari',
      value: stats?.electricityTasks ?? 0,
      icon: <FlashOnOutlined sx={{ fontSize: 24, color: 'warning.main' }} />,
      color: theme.palette.warning.main,
      subText: 'ETK hisob kodi bilan ishlash',
    },
    {
      title: 'Jarayonda',
      value: stats?.inProgressTasks ?? 0,
      icon: <HourglassEmptyOutlined sx={{ fontSize: 24, color: 'secondary.main' }} />,
      color: theme.palette.secondary.main,
      subText: 'Ijro etilishi kutilmoqda',
    },
    {
      title: 'Bajarilgan Topshiriqlar',
      value: stats?.completedTasks ?? 0,
      icon: <CheckCircleOutlined sx={{ fontSize: 24, color: 'success.main' }} />,
      color: theme.palette.success.main,
      rate: stats?.completionRate ?? 0,
      subText: 'Muvaffaqiyatli yakunlangan',
    },
  ];

  return (
    <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
      {cardsData.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={index}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: isDark ? 'divider' : 'grey.200',
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
              {statsLoading ? (
                <Skeleton variant="text" width={80} height={36} />
              ) : (
                <Stack direction="row" alignItems="baseline" spacing={1}>
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
      ))}
    </Grid>
  );
}

export default TasksStatsHeader;
