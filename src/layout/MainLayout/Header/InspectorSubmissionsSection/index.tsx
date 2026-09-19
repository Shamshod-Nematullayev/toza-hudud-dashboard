import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonBase,
  CardActions,
  Chip,
  ClickAwayListener,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  IconClipboardCheck,
  IconUserCheck,
  IconBolt,
  IconUsers,
  IconUserPlus,
  IconRefresh,
  IconChevronRight,
  IconSettings,
  IconBellOff
} from '@tabler/icons-react';
import useCustomizationStore from 'store/customizationStore';
import Transitions from 'ui-component/extended/Transitions';
import { useInspectorVerificationsStore, IVerificationSettings } from './useInspectorVerificationsStore';
import { InspectorNotificationSettingsDialog } from './InspectorNotificationSettingsDialog';

export const InspectorSubmissionsSection: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useCustomizationStore();
  const { counts, settings, fetchCounts, setupSocket, getBadgeColor } = useInspectorVerificationsStore();

  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const anchorRef = useRef<any>(null);

  const roles = user?.roles || [];
  const hasAccess =
    roles.some((role) => ['admin', 'billing', 'rahbar', 'product_admin'].includes(role)) && !roles.every((role) => role === 'dispatcher');

  useEffect(() => {
    if (!hasAccess) return;

    fetchCounts();
    const cleanupSocket = setupSocket();

    // 60 soniyalik zaxira polling
    const interval = setInterval(() => {
      fetchCounts();
    }, 60000);

    return () => {
      cleanupSocket();
      clearInterval(interval);
    };
  }, [hasAccess, fetchCounts, setupSocket]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  };

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  if (!hasAccess) {
    return null;
  }

  const badgeColor = getBadgeColor();

  // 4 ta operativ tekshiruv so'rovlari
  const items: Array<{
    id: keyof IVerificationSettings['categories'];
    title: string;
    subtitle: string;
    count: number;
    path: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }> = [
    {
      id: 'shaxsniTasdiqlash',
      title: 'Shaxsni tasdiqlash',
      subtitle: 'Pasport va JSHSHIR ma’lumotlari',
      count: counts.shaxsniTasdiqlash,
      path: '/billing/shaxsni-tasdiqlash',
      icon: <IconUserCheck size={20} />,
      color: '#2563eb',
      bgColor: '#eff6ff'
    },
    {
      id: 'elektrKodi',
      title: 'Elektr kodi (ETK)',
      subtitle: 'HET hisob raqamlarini tasdiqlash',
      count: counts.elektrKodi,
      path: '/billing/elektr-kodi',
      icon: <IconBolt size={20} />,
      color: '#d97706',
      bgColor: '#fffbeb'
    },
    {
      id: 'xatlovOdamSoni',
      title: 'Yashovchilar soni xatlov',
      subtitle: 'Xonadondagi odam soni xatlovi',
      count: counts.xatlovOdamSoni,
      path: '/billing/xatlovOdamSoni',
      icon: <IconUsers size={20} />,
      color: '#7c3aed',
      bgColor: '#f5f3ff'
    },
    {
      id: 'yangiAbonent',
      title: 'Yangi abonent ochish',
      subtitle: 'Yangi abonent ochish so’rovlari',
      count: counts.yangiAbonent,
      path: '/billing/pendingNewAbonents',
      icon: <IconUserPlus size={20} />,
      color: '#059669',
      bgColor: '#ecfdf5'
    }
  ];

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return { label: 'O‘ta muhim', color: 'error' as const };
      case 'medium':
        return { label: 'O‘rtacha', color: 'warning' as const };
      case 'low':
      default:
        return { label: 'Odatiy', color: 'primary' as const };
    }
  };

  return (
    <>
      <ButtonBase sx={{ borderRadius: '12px' }} ref={anchorRef} onClick={handleToggle}>
        <Tooltip title="Nazoratchilar kiritgan ma'lumotlar">
          <Badge color={badgeColor} variant="standard" badgeContent={counts.total} max={99}>
            <Avatar
              variant="rounded"
              sx={{
                // @ts-ignore
                ...theme.typography.commonAvatar,
                // @ts-ignore
                ...theme.typography.mediumAvatar,
                transition: 'all .2s ease-in-out',
                background: theme.palette.mode === 'dark' ? '#16204A' : theme.palette.secondary.light,
                color: theme.palette.mode === 'dark' ? '#EDEFFA' : theme.palette.secondary.dark,
                border: theme.palette.mode === 'dark' ? '1px solid #29346B' : 'none',
                '&[aria-controls="menu-list-grow"],&:hover': {
                  background: theme.palette.mode === 'dark' ? '#1B2554' : theme.palette.secondary.dark,
                  color: theme.palette.mode === 'dark' ? '#EDEFFA' : theme.palette.secondary.light
                }
              }}
              color="inherit"
            >
              <IconClipboardCheck stroke={1.5} size="1.3rem" />
            </Avatar>
          </Badge>
        </Tooltip>
      </ButtonBase>

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 14]
              }
            }
          ]
        }}
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Transitions position="top-right" in={open} {...TransitionProps}>
            <Paper
              elevation={16}
              sx={{
                width: { xs: 320, sm: 370 },
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {/* Header */}
                  <Box sx={{ p: 2, bgcolor: '#f8fafc' }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>
                          Nazoratchilar so'rovlari
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Tasdiqlash kutilayotgan ma'lumotlar
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                        <Chip label={`${counts.total} ta`} size="small" color={badgeColor} sx={{ fontWeight: 700 }} />
                        <Tooltip title="Yangilash">
                          <IconButton size="small" onClick={() => fetchCounts()} sx={{ p: 0.5 }}>
                            <IconRefresh size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sozlamalar (Priority va Mute)">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setOpen(false);
                              setSettingsOpen(true);
                            }}
                            sx={{ p: 0.5 }}
                          >
                            <IconSettings size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>

                  <Divider />

                  {/* List of 3 sections */}
                  <List disablePadding sx={{ p: 1 }}>
                    {items.map((item) => {
                      const hasPending = item.count > 0;
                      const catSetting = settings.categories[item.id];
                      const priorityInfo = getPriorityLabel(catSetting.priority);
                      const isMuted = catSetting.muted || !settings.soundEnabled;

                      return (
                        <ListItemButton
                          key={item.id}
                          onClick={() => handleNavigate(item.path)}
                          sx={{
                            borderRadius: '8px',
                            mb: 0.5,
                            p: 1.2,
                            '&:hover': {
                              bgcolor: '#f1f5f9'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 42 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 34,
                                height: 34,
                                borderRadius: '8px',
                                bgcolor: item.bgColor,
                                color: item.color
                              }}
                            >
                              {item.icon}
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                  {item.title}
                                </Typography>
                                {isMuted && (
                                  <Tooltip title="Ovoz o'chirilgan">
                                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                      <IconBellOff size={13} color="#94a3b8" />
                                    </Box>
                                  </Tooltip>
                                )}
                              </Stack>
                            }
                            secondary={
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.3 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {item.subtitle}
                                </Typography>
                              </Stack>
                            }
                          />
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Chip
                              label={item.count}
                              size="small"
                              color={hasPending ? priorityInfo.color : 'default'}
                              variant={hasPending ? 'filled' : 'outlined'}
                              sx={{
                                fontWeight: 700,
                                minWidth: 28,
                                height: 22,
                                fontSize: '0.75rem'
                              }}
                            />
                            <IconChevronRight size={16} color="#94a3b8" />
                          </Stack>
                        </ListItemButton>
                      );
                    })}
                  </List>

                  <Divider />

                  {/* Footer */}
                  <CardActions sx={{ p: 1.2, bgcolor: '#f8fafc', justifyContent: 'space-between', px: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Avto-yangilanish faol
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<IconSettings size={14} />}
                      onClick={() => {
                        setOpen(false);
                        setSettingsOpen(true);
                      }}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      Sozlash
                    </Button>
                  </CardActions>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>

      {/* Settings Dialog */}
      <InspectorNotificationSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default InspectorSubmissionsSection;
