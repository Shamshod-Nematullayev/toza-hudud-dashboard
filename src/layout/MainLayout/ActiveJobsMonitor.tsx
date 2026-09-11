import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Collapse,
  ButtonBase,
  useTheme,
  alpha
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  HourglassEmpty,
  SyncRounded,
  CheckCircleOutlined
} from '@mui/icons-material';
import { IconBolt } from '@tabler/icons-react';
import api from 'utils/api';
import { socket } from 'utils/socket';
import useCustomizationStore from 'store/customizationStore';

export interface ActiveJobItem {
  jobId: string;
  companyId: string;
  status: 'queued' | 'running';
  progress: number;
  position: number;
  name?: string;
  message?: string;
  current?: number;
  total?: number;
}

const ActiveJobsMonitor: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { company } = useCustomizationStore();
  const [jobs, setJobs] = useState<ActiveJobItem[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const fetchActiveJobs = useCallback(async () => {
    try {
      const { data } = await api.get('/jobs/active', {
        params: company?.id ? { companyId: company.id } : undefined
      });
      if (data?.success && Array.isArray(data.data)) {
        setJobs(
          data.data.filter(
            (j: ActiveJobItem) =>
              j.name !== 'sendScheduledMahallaTushumlarReport' &&
              !j.name?.toLowerCase().includes('scheduled')
          )
        );
      }
    } catch (err) {
      // Ignore network errors
    }
  }, [company?.id]);

  useEffect(() => {
    fetchActiveJobs();

    // 4-soniyalik yengil sinxronizatsiya intervali
    const interval = setInterval(fetchActiveJobs, 4000);

    const handleActiveJobsUpdate = (updatedJobs: ActiveJobItem[]) => {
      if (Array.isArray(updatedJobs)) {
        setJobs(
          updatedJobs.filter(
            (j) =>
              j.name !== 'sendScheduledMahallaTushumlarReport' &&
              !j.name?.toLowerCase().includes('scheduled')
          )
        );
      }
    };

    const handleJobProgress = (progressData: any) => {
      if (progressData && progressData.jobId) {
        if (progressData.progress >= 100 || progressData.stopped) {
          fetchActiveJobs();
          return;
        }

        setJobs((prev) => {
          const exists = prev.some((j) => j.jobId === String(progressData.jobId));
          if (!exists) {
            fetchActiveJobs();
            return prev;
          }
          return prev.map((j) => {
            if (j.jobId === String(progressData.jobId)) {
              return {
                ...j,
                progress: typeof progressData.progress === 'number' ? progressData.progress : j.progress,
                message: progressData.message || j.message,
                current: typeof progressData.current === 'number' ? progressData.current : j.current,
                total: typeof progressData.total === 'number' ? progressData.total : j.total
              };
            }
            return j;
          });
        });
      }
    };

    const handleConnect = () => {
      fetchActiveJobs();
      socket.emit('active-jobs:get', { companyId: company?.id });
    };

    const onFocus = () => fetchActiveJobs();

    socket.on('active-jobs:update', handleActiveJobsUpdate);
    socket.on('job-progress', handleJobProgress);
    socket.on('connect', handleConnect);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      socket.off('active-jobs:update', handleActiveJobsUpdate);
      socket.off('job-progress', handleJobProgress);
      socket.off('connect', handleConnect);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchActiveJobs, company?.id]);

  const currentCompanyId = company?.id ? String(company.id) : null;

  const sortedJobs = React.useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    return [...jobs].sort((a, b) => {
      // 1. Running tasks strictly come first
      if (a.status === 'running' && b.status !== 'running') return -1;
      if (a.status !== 'running' && b.status === 'running') return 1;
      // 2. Deterministic position sorting
      if (a.position !== b.position) return a.position - b.position;
      // 3. Absolute deterministic tie-breaker by jobId
      return String(a.jobId).localeCompare(String(b.jobId));
    });
  }, [jobs]);

  // Faol job bo'lmasa component butunlay yashiriladi
  if (!jobs || jobs.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 76, sm: 24 },
        right: { xs: 16, sm: 24 },
        zIndex: 1150,
        maxWidth: { xs: 'calc(100vw - 32px)', sm: 350 },
        width: { xs: 'calc(100vw - 32px)', sm: 350 }
      }}
    >
      <Paper
        elevation={8}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: isDark ? alpha('#131B3A', 0.94) : alpha('#FFFFFF', 0.96),
          backdropFilter: 'blur(14px)',
          border: `1px solid ${isDark ? alpha('#FFFFFF', 0.12) : alpha('#673AB7', 0.16)}`,
          boxShadow: isDark
            ? '0 12px 32px rgba(0, 0, 0, 0.55), 0 2px 6px rgba(0, 0, 0, 0.4)'
            : '0 12px 32px rgba(103, 58, 183, 0.15), 0 2px 6px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.25s ease'
        }}
      >
        {/* Header Bar */}
        <ButtonBase
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            width: '100%',
            px: 1.75,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isExpanded ? `1px solid ${isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.06)}` : 'none',
            background: isDark
              ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.12) 0%, rgba(103, 58, 183, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(103, 58, 183, 0.08) 0%, rgba(33, 150, 243, 0.05) 100%)'
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.main
              }}
            >
              <IconBolt size={16} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
              Faol vazifalar
            </Typography>
            <Chip
              size="small"
              label={jobs.length}
              sx={{
                height: 20,
                fontSize: '0.68rem',
                fontWeight: 700,
                backgroundColor: theme.palette.primary.main,
                color: '#FFFFFF'
              }}
            />
          </Stack>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            sx={{ p: 0.25, color: 'text.secondary' }}
          >
            {isExpanded ? <KeyboardArrowDown sx={{ fontSize: 20 }} /> : <KeyboardArrowUp sx={{ fontSize: 20 }} />}
          </IconButton>
        </ButtonBase>

        {/* Collapsible Content */}
        <Collapse in={isExpanded} timeout="auto">
          <Box
            sx={{
              p: 1.5,
              maxHeight: 320,
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.text.primary, 0.15),
                borderRadius: 2
              }
            }}
          >
            <Stack spacing={1.25}>
              {sortedJobs.map((job) => {
                const isMyCompany = Boolean(job.name) || (Boolean(currentCompanyId) && job.companyId === currentCompanyId);
                const isRunning = job.status === 'running';

                return (
                  <Box
                    key={job.jobId}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      backgroundColor: isMyCompany
                        ? alpha(theme.palette.primary.main, isDark ? 0.16 : 0.08)
                        : isDark
                        ? alpha('#FFFFFF', 0.04)
                        : alpha('#000000', 0.02),
                      border: `1px solid ${
                        isMyCompany
                          ? alpha(theme.palette.primary.main, isDark ? 0.45 : 0.3)
                          : isDark
                          ? alpha('#FFFFFF', 0.08)
                          : alpha('#000000', 0.06)
                      }`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Header line: #Position and Status */}
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            color: isMyCompany ? theme.palette.primary.main : 'text.primary',
                            minWidth: 26
                          }}
                        >
                          #{job.position}
                        </Typography>

                        {isMyCompany && (
                          <Chip
                            size="small"
                            label="Sizning vazifangiz"
                            sx={{
                              height: 18,
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              backgroundColor: alpha(theme.palette.primary.main, 0.18),
                              color: theme.palette.primary.main,
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`
                            }}
                          />
                        )}
                      </Stack>

                      <Chip
                        size="small"
                        icon={
                          isRunning ? (
                            <SyncRounded
                              sx={{
                                fontSize: '13px !important',
                                animation: 'spin 2s linear infinite',
                                '@keyframes spin': {
                                  '0%': { transform: 'rotate(0deg)' },
                                  '100%': { transform: 'rotate(360deg)' }
                                }
                              }}
                            />
                          ) : (
                            <HourglassEmpty sx={{ fontSize: '13px !important' }} />
                          )
                        }
                        label={isRunning ? 'Bajarilmoqda' : 'Navbatda'}
                        sx={{
                          height: 19,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          backgroundColor: isRunning
                            ? alpha(theme.palette.info.main, isDark ? 0.2 : 0.12)
                            : alpha(theme.palette.warning.main, isDark ? 0.2 : 0.12),
                          color: isRunning ? theme.palette.info.main : theme.palette.warning.main
                        }}
                      />
                    </Stack>

                    {/* Private information (ONLY for the company owning this job) */}
                    {isMyCompany && (
                      <Box sx={{ mb: 0.75 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            color: 'text.primary',
                            lineHeight: 1.3
                          }}
                        >
                          {job.name || "Vazifa jarayonda..."}
                        </Typography>

                        {job.current !== undefined && job.total !== undefined ? (
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              color: 'text.secondary',
                              display: 'block',
                              mt: 0.25
                            }}
                          >
                            {job.current.toLocaleString()} / {job.total.toLocaleString()}
                          </Typography>
                        ) : job.message ? (
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 500,
                              fontSize: '0.7rem',
                              color: 'text.secondary',
                              display: 'block',
                              mt: 0.25,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {job.message}
                          </Typography>
                        ) : null}
                      </Box>
                    )}

                    {/* Progress Bar & Percentage */}
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, Math.max(0, job.progress))}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              backgroundColor: isMyCompany ? theme.palette.primary.main : isDark ? '#90CAF9' : '#2196F3'
                            }
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          color: isMyCompany ? theme.palette.primary.main : 'text.secondary',
                          minWidth: 32,
                          textAlign: 'right'
                        }}
                      >
                        {job.progress}%
                      </Typography>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default ActiveJobsMonitor;
