import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Switch,
  Box,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  IconSettings,
  IconBell,
  IconBellOff,
  IconUserCheck,
  IconBolt,
  IconUsers,
  IconUserPlus,
  IconRotateClockwise,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import {
  useInspectorVerificationsStore,
  IVerificationSettings,
  VerificationPriority
} from './useInspectorVerificationsStore';
import { toast } from 'react-toastify';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ICategoryConfig {
  key: keyof IVerificationSettings['categories'];
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export const InspectorNotificationSettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onClose
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';
  const { settings, updateSettings, resetSettings } = useInspectorVerificationsStore();
  const [localSettings, setLocalSettings] = useState<IVerificationSettings>(settings);

  const categories: ICategoryConfig[] = useMemo(
    () => [
      {
        key: 'shaxsniTasdiqlash',
        title: 'Shaxsni tasdiqlash',
        subtitle: 'Pasport va JSHSHIR ma’lumotlari',
        icon: <IconUserCheck size={20} />,
        color: theme.palette.primary.main,
        bgColor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1)
      },
      {
        key: 'elektrKodi',
        title: 'Elektr kodi (ETK)',
        subtitle: 'HET hisob raqamlarini tasdiqlash',
        icon: <IconBolt size={20} />,
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, isDark ? 0.2 : 0.1)
      },
      {
        key: 'xatlovOdamSoni',
        title: 'Yashovchilar soni xatlov',
        subtitle: 'Xonadondagi odam soni xatlovi',
        icon: <IconUsers size={20} />,
        color: theme.palette.secondary?.main || '#7c3aed',
        bgColor: alpha(theme.palette.secondary?.main || '#7c3aed', isDark ? 0.2 : 0.1)
      },
      {
        key: 'yangiAbonent',
        title: 'Yangi abonent ochish',
        subtitle: 'Yangi abonent ochish so’rovlari',
        icon: <IconUserPlus size={20} />,
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, isDark ? 0.2 : 0.1)
      }
    ],
    [theme, isDark]
  );

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, open]);

  const handlePriorityChange = (
    key: keyof IVerificationSettings['categories'],
    priority: VerificationPriority
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [key]: {
          ...prev.categories[key],
          priority
        }
      }
    }));
  };

  const handleMuteToggle = (key: keyof IVerificationSettings['categories']) => {
    setLocalSettings((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [key]: {
          ...prev.categories[key],
          muted: !prev.categories[key].muted
        }
      }
    }));
  };

  const handleGlobalSoundToggle = (checked: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      soundEnabled: checked
    }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    toast.success('Bildirishnoma sozlamalari saqlandi');
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    toast.info('Standart sozlamalarga qaytarildi');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            borderRadius: isMobile ? 0 : '16px',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            overflow: 'hidden'
          }
        }
      }}
    >
      <DialogTitle
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1
          }}
        >
          <Stack
            direction="row"
            spacing={1.2}
            sx={{
              alignItems: 'center',
              minWidth: 0
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 34, sm: 40 },
                height: { xs: 34, sm: 40 },
                borderRadius: '10px',
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1),
                color: 'primary.main',
                flexShrink: 0
              }}
            >
              <IconSettings size={20} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: 'text.primary',
                  fontSize: { xs: '0.95rem', sm: '1.15rem' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                Bildirishnoma sozlamalari
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  fontSize: { xs: '0.72rem', sm: '0.8rem' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                Muhimlik darajasi va tovushni sozlash
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', flexShrink: 0 }}>
            <IconX size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        {/* Umumiy tovush sozlamasi */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 2.5,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: localSettings.soundEnabled
              ? alpha(theme.palette.success.main, isDark ? 0.15 : 0.08)
              : alpha(theme.palette.background.default, 0.6)
          }}
        >
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  color: localSettings.soundEnabled ? 'success.main' : 'text.disabled',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {localSettings.soundEnabled ? <IconBell size={24} /> : <IconBellOff size={24} />}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Umumiy bildirishnoma tovushi
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {localSettings.soundEnabled
                    ? 'Yangi so‘rov kelganda ovoz yangraydi'
                    : 'Barcha ovozli xabarlar o‘chirilgan'}
                </Typography>
              </Box>
            </Stack>

            <Switch
              checked={localSettings.soundEnabled}
              onChange={(e) => handleGlobalSoundToggle(e.target.checked)}
              color="success"
            />
          </Stack>
        </Paper>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
          Bo'limlar bo'yicha muhimlik va mute holati:
        </Typography>

        {/* Har bir bo'lim uchun sozlama */}
        <Stack spacing={1.5}>
          {categories.map((cat) => {
            const catSetting = localSettings.categories[cat.key];
            const isMuted = catSetting.muted || !localSettings.soundEnabled;

            return (
              <Paper
                key={cat.key}
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  transition: 'border-color 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.4)
                  }
                }}
              >
                {/* Bo'lim nomi va Mute switch */}
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}
                >
                  <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 34,
                        height: 34,
                        borderRadius: '8px',
                        bgcolor: cat.bgColor,
                        color: cat.color,
                        flexShrink: 0
                      }}
                    >
                      {cat.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {cat.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {cat.subtitle}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Mute tugmasi */}
                  <Tooltip title={isMuted ? 'Tovush o‘chirilgan (Mute)' : 'Tovush yoqilgan'}>
                    <IconButton
                      size="small"
                      onClick={() => handleMuteToggle(cat.key)}
                      disabled={!localSettings.soundEnabled}
                      sx={{
                        bgcolor: isMuted ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                        color: isMuted ? 'error.main' : 'success.main',
                        flexShrink: 0,
                        '&:hover': {
                          bgcolor: isMuted ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.success.main, 0.2)
                        }
                      }}
                    >
                      {isMuted ? <IconBellOff size={18} /> : <IconBell size={18} />}
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Priority Selector */}
                <Stack
                  direction="row"
                  spacing={0.8}
                  sx={{
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 0.8,
                    mt: 1
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.5 }}>
                    Muhimlik:
                  </Typography>

                  <Chip
                    label="Odatiy"
                    size="small"
                    variant={catSetting.priority === 'low' ? 'filled' : 'outlined'}
                    color={catSetting.priority === 'low' ? 'primary' : 'default'}
                    onClick={() => handlePriorityChange(cat.key, 'low')}
                    sx={{
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      height: 26,
                      borderRadius: '6px'
                    }}
                  />

                  <Chip
                    label="O'rtacha"
                    size="small"
                    variant={catSetting.priority === 'medium' ? 'filled' : 'outlined'}
                    color={catSetting.priority === 'medium' ? 'warning' : 'default'}
                    onClick={() => handlePriorityChange(cat.key, 'medium')}
                    sx={{
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      height: 26,
                      borderRadius: '6px'
                    }}
                  />

                  <Chip
                    label="O'ta muhim"
                    size="small"
                    variant={catSetting.priority === 'high' ? 'filled' : 'outlined'}
                    color={catSetting.priority === 'high' ? 'error' : 'default'}
                    onClick={() => handlePriorityChange(cat.key, 'high')}
                    sx={{
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      height: 26,
                      borderRadius: '6px'
                    }}
                  />
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5
        }}
      >
        <Button
          startIcon={<IconRotateClockwise size={16} />}
          onClick={handleReset}
          color="inherit"
          size="small"
          sx={{
            fontWeight: 600,
            whiteSpace: 'nowrap',
            color: 'text.secondary',
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}
        >
          Standartga qaytarish
        </Button>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            justifyContent: 'flex-end'
          }}
        >
          <Button
            onClick={onClose}
            color="inherit"
            sx={{
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flex: { xs: 1, sm: 'none' },
              px: 2
            }}
          >
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            startIcon={<IconCheck size={18} />}
            sx={{
              fontWeight: 700,
              whiteSpace: 'nowrap',
              flex: { xs: 1, sm: 'none' },
              px: 2.5
            }}
          >
            Saqlash
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

