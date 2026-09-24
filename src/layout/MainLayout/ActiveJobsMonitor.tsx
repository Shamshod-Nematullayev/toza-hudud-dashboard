import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Collapse,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  HourglassEmpty,
  SyncRounded,
  DragIndicator,
  RestartAlt
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

const STORAGE_KEY = 'active_jobs_monitor_pos_v2';

// Slot 1 ga tegishli og'ir debitor job nomlari ro'yxati (whitelist)
const ALLOWED_SLOT1_KEYWORDS = [
  'debitor',
  'tozamakon',
  'het',
  'blocking',
  'phoneandsms',
  'boshqa tashkilot vazifasi',
  'hisob raqami',
  'autocreateabonents'
];

const isSlot1Job = (job: ActiveJobItem): boolean => {
  if (!job) return false;
  const name = (job.name || '').toLowerCase();
  // Yengil va bot hisobotlarini (slot 2 va bot tasklar) qat'iy chetlatamiz:
  if (name.includes('scheduled')) return false;
  if (name.includes('telegram')) return false;
  if (name.includes('importact')) return false;
  if (name.includes('aktlarni')) return false;
  if (name.includes('pendingacts')) return false;
  if (name.includes('kutilayotgan')) return false;
  if (name.includes('abonent') && !name.includes('hisob raqami') && !name.includes('autocreateabonents')) return false;

  return ALLOWED_SLOT1_KEYWORDS.some((kw) => name.includes(kw));
};

const ActiveJobsMonitor: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { company } = useCustomizationStore();
  const currentCompanyId = company?.id ? String(company.id) : null;

  const [jobs, setJobs] = useState<ActiveJobItem[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
  } | null>(null);

  // Saqlangan koordinatalarni yuklash
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          const padding = 12;
          const boxWidth = 350;
          const boxHeight = 120;
          const maxX = Math.max(padding, window.innerWidth - boxWidth - padding);
          const maxY = Math.max(padding, window.innerHeight - boxHeight - padding);
          setPosition({
            x: Math.min(Math.max(padding, parsed.x), maxX),
            y: Math.min(Math.max(padding, parsed.y), maxY)
          });
        }
      }
    } catch (e) {
      // LocalStorage xatosi e'tiborsiz qoldiriladi
    }
  }, []);

  // Ekran o'lchami o'zgarganda ekrandan chiqib ketmasligini ta'minlash
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev || !containerRef.current) return prev;
        const rect = containerRef.current.getBoundingClientRect();
        const padding = 12;
        const maxX = Math.max(padding, window.innerWidth - rect.width - padding);
        const maxY = Math.max(padding, window.innerHeight - rect.height - padding);
        return {
          x: Math.min(Math.max(padding, prev.x), maxX),
          y: Math.min(Math.max(padding, prev.y), maxY)
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mergeJobsState = useCallback((incomingJobs: ActiveJobItem[]) => {
    // Faqat Slot 1 og'ir debitor ishlarini qabul qilamiz
    const filtered = incomingJobs.filter(isSlot1Job);

    setJobs((prevJobs) => {
      const prevMap = new Map(prevJobs.map((j) => [String(j.jobId), j]));
      return filtered.map((incoming) => {
        const prev = prevMap.get(String(incoming.jobId));
        if (!prev) return incoming;

        // Progress orqaga qaytmasligi uchun monotonic saqlash
        const shouldUsePrevProgress =
          prev.status === 'running' &&
          incoming.status === 'running' &&
          typeof prev.progress === 'number' &&
          prev.progress > 0 &&
          (!incoming.progress || incoming.progress < prev.progress);

        return {
          ...incoming,
          // Agar avvalroq to'g'ri nom olingan bo'lsa, uni vaqtinchalik umumiy nomga almashtirib lippillatmaymiz
          name:
            prev.name && prev.name !== 'Boshqa tashkilot vazifasi' && incoming.name === 'Boshqa tashkilot vazifasi'
              ? prev.name
              : incoming.name,
          progress: shouldUsePrevProgress ? prev.progress : incoming.progress,
          message: shouldUsePrevProgress && prev.message ? prev.message : incoming.message,
          current: shouldUsePrevProgress && prev.current !== undefined ? prev.current : incoming.current,
          total: shouldUsePrevProgress && prev.total !== undefined ? prev.total : incoming.total
        };
      });
    });
  }, []);

  const fetchActiveJobs = useCallback(async () => {
    try {
      const { data } = await api.get('/jobs/active', {
        params: company?.id ? { companyId: company.id } : undefined
      });
      if (data?.success && Array.isArray(data.data)) {
        mergeJobsState(data.data);
      }
    } catch (err) {
      // Ignore network errors
    }
  }, [company?.id, mergeJobsState]);

  // Tashkilot o'zgarganda socket xonasini va joblarni zudlik bilan yangilash
  useEffect(() => {
    if (company?.id) {
      socket.emit('active-jobs:join-company', { companyId: company.id });
      socket.emit('active-jobs:get', { companyId: company.id });
    }
    fetchActiveJobs();
  }, [company?.id, fetchActiveJobs]);

  useEffect(() => {
    const interval = setInterval(fetchActiveJobs, 4000);

    const handleActiveJobsUpdate = (updatedJobs: ActiveJobItem[]) => {
      if (Array.isArray(updatedJobs)) {
        mergeJobsState(updatedJobs);
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
      if (company?.id) {
        socket.emit('active-jobs:join-company', { companyId: company.id });
        socket.emit('active-jobs:get', { companyId: company.id });
      }
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
  }, [fetchActiveJobs, mergeJobsState, company?.id]);

  // Dragging event listenerlar
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 12;
      const maxX = Math.max(padding, window.innerWidth - rect.width - padding);
      const maxY = Math.max(padding, window.innerHeight - rect.height - padding);

      const targetX = Math.min(Math.max(padding, dragRef.current.initialX + dx), maxX);
      const targetY = Math.min(Math.max(padding, dragRef.current.initialY + dy), maxY);
      setPosition({ x: targetX, y: targetY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragRef.current || !containerRef.current || !e.touches[0]) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 12;
      const maxX = Math.max(padding, window.innerWidth - rect.width - padding);
      const maxY = Math.max(padding, window.innerHeight - rect.height - padding);

      const targetX = Math.min(Math.max(padding, dragRef.current.initialX + dx), maxX);
      const targetY = Math.min(Math.max(padding, dragRef.current.initialY + dy), maxY);
      setPosition({ x: targetX, y: targetY });
    };

    const handleEnd = () => {
      if (dragRef.current) {
        if (dragRef.current.hasMoved && position) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
          } catch (e) {
            // ignore
          }
        } else if (!dragRef.current.hasMoved) {
          // Oddiy click bo'lsa collapse/expand qilamiz
          setIsExpanded((prev) => !prev);
        }
      }
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, position]);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: rect.left,
      initialY: rect.top,
      hasMoved: false
    };
    setIsDragging(true);
  };

  const handleResetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {}
    setPosition(null);
  };

  const sortedJobs = React.useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    return [...jobs].sort((a, b) => {
      if (a.status === 'running' && b.status !== 'running') return -1;
      if (a.status !== 'running' && b.status === 'running') return 1;
      if (a.position !== b.position) return a.position - b.position;
      return String(a.jobId).localeCompare(String(b.jobId));
    });
  }, [jobs]);

  if (!jobs || jobs.length === 0) {
    return null;
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        left: position ? `${position.x}px` : undefined,
        top: position ? `${position.y}px` : undefined,
        right: position ? undefined : { xs: 16, sm: 24 },
        bottom: position ? undefined : { xs: 76, sm: 24 },
        zIndex: 1150,
        maxWidth: { xs: 'calc(100vw - 24px)', sm: 350 },
        width: { xs: 'calc(100vw - 24px)', sm: 350 },
        userSelect: isDragging ? 'none' : 'auto',
        touchAction: 'none',
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease, opacity 0.2s ease'
      }}
    >
      <Paper
        elevation={8}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: isDark ? alpha('#131B3A', 0.95) : alpha('#FFFFFF', 0.97),
          backdropFilter: 'blur(14px)',
          border: `1px solid ${isDark ? alpha('#FFFFFF', 0.12) : alpha('#673AB7', 0.16)}`,
          boxShadow: isDark
            ? '0 12px 32px rgba(0, 0, 0, 0.55), 0 2px 6px rgba(0, 0, 0, 0.4)'
            : '0 12px 32px rgba(103, 58, 183, 0.15), 0 2px 6px rgba(0, 0, 0, 0.06)',
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        {/* Header Bar - Draggable Handle */}
        <Box
          onMouseDown={(e) => {
            if (e.button !== 0) return; // Faqat chap tugma
            handleDragStart(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            if (e.touches[0]) {
              handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          sx={{
            width: '100%',
            px: 1.5,
            py: 1.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: isDragging ? 'grabbing' : 'grab',
            borderBottom: isExpanded ? `1px solid ${isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.06)}` : 'none',
            background: isDark
              ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.14) 0%, rgba(103, 58, 183, 0.10) 100%)'
              : 'linear-gradient(135deg, rgba(103, 58, 183, 0.08) 0%, rgba(33, 150, 243, 0.05) 100%)'
          }}
        >
          <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
            <DragIndicator sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.6 }} />
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.main
              }}
            >
              <IconBolt size={15} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.84rem' }}>
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

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            {position && (
              <Tooltip title="O'rnini asl holatiga qaytarish">
                <IconButton
                  size="small"
                  onClick={handleResetPosition}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  sx={{ p: 0.25, color: 'text.secondary' }}
                >
                  <RestartAlt sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              sx={{ p: 0.25, color: 'text.secondary' }}
            >
              {isExpanded ? <KeyboardArrowDown sx={{ fontSize: 20 }} /> : <KeyboardArrowUp sx={{ fontSize: 20 }} />}
            </IconButton>
          </Stack>
        </Box>

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
                const isMyCompany = Boolean(currentCompanyId) && String(job.companyId) === String(currentCompanyId);
                const isRunning = job.status === 'running';

                const jobTitle = isMyCompany
                  ? (job.name && job.name !== 'Boshqa tashkilot vazifasi' ? job.name : "Debitorlar to'liq ishlovi")
                  : 'Boshqa tashkilot vazifasi';

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
                            minWidth: 24
                          }}
                        >
                          #{job.position}
                        </Typography>

                        {isMyCompany ? (
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
                        ) : (
                          <Chip
                            size="small"
                            label="Boshqa tashkilot"
                            sx={{
                              height: 18,
                              fontSize: '0.62rem',
                              fontWeight: 600,
                              backgroundColor: isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.06),
                              color: 'text.secondary'
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

                    {/* Job Title & Details */}
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
                        {jobTitle}
                      </Typography>

                      {isMyCompany && (
                        job.current !== undefined && job.total !== undefined ? (
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
                        ) : null
                      )}
                    </Box>

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
