import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Box,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Stack
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
  IconCheck
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

const CATEGORIES: ICategoryConfig[] = [
  {
    key: 'shaxsniTasdiqlash',
    title: 'Shaxsni tasdiqlash',
    subtitle: 'Pasport va JSHSHIR ma’lumotlari',
    icon: <IconUserCheck size={20} />,
    color: '#2563eb',
    bgColor: '#eff6ff'
  },
  {
    key: 'elektrKodi',
    title: 'Elektr kodi (ETK)',
    subtitle: 'HET hisob raqamlarini tasdiqlash',
    icon: <IconBolt size={20} />,
    color: '#d97706',
    bgColor: '#fffbeb'
  },
  {
    key: 'xatlovOdamSoni',
    title: 'Yashovchilar soni xatlov',
    subtitle: 'Xonadondagi odam soni xatlovi',
    icon: <IconUsers size={20} />,
    color: '#7c3aed',
    bgColor: '#f5f3ff'
  },
  {
    key: 'yangiAbonent',
    title: 'Yangi abonent ochish',
    subtitle: 'Yangi abonent ochish so’rovlari',
    icon: <IconUserPlus size={20} />,
    color: '#059669',
    bgColor: '#ecfdf5'
  }
];

export const InspectorNotificationSettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onClose
}) => {
  const { settings, updateSettings, resetSettings } = useInspectorVerificationsStore();
  const [localSettings, setLocalSettings] = useState<IVerificationSettings>(settings);

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: '#e0f2fe',
              color: '#0284c7'
            }}
          >
            <IconSettings size={22} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
              Bildirishnoma va Muhimlik sozlamalari
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Har bir so'rov turi uchun muhimlik darajasi va tovushni sozlang
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 2.5 }}>
        {/* Umumiy tovush sozlamasi */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            bgcolor: localSettings.soundEnabled ? '#f0fdf4' : '#f8fafc'
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
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Umumiy bildirishnoma tovushi
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#475569' }}>
          Bo'limlar bo'yicha muhimlik va mute holati:
        </Typography>

        {/* Har bir bo'lim uchun sozlama */}
        <Stack spacing={2}>
          {CATEGORIES.map((cat) => {
            const catSetting = localSettings.categories[cat.key];
            const isMuted = catSetting.muted || !localSettings.soundEnabled;

            return (
              <Paper
                key={cat.key}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff'
                }}
              >
                {/* Bo'lim nomi va Mute switch */}
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
                >
                  <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 34,
                        height: 34,
                        borderRadius: '8px',
                        bgcolor: cat.bgColor,
                        color: cat.color
                      }}
                    >
                      {cat.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {cat.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                        bgcolor: isMuted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        color: isMuted ? 'error.main' : 'success.main',
                        '&:hover': {
                          bgcolor: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'
                        }
                      }}
                    >
                      {isMuted ? <IconBellOff size={18} /> : <IconBell size={18} />}
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Priority Selector */}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.5 }}>
                    Muhimlik:
                  </Typography>

                  <Chip
                    label="Odatiy (Ko'k)"
                    size="small"
                    variant={catSetting.priority === 'low' ? 'filled' : 'outlined'}
                    color={catSetting.priority === 'low' ? 'primary' : 'default'}
                    onClick={() => handlePriorityChange(cat.key, 'low')}
                    sx={{ fontWeight: 700, cursor: 'pointer' }}
                  />

                  <Chip
                    label="O'rtacha (Sariq)"
                    size="small"
                    variant={catSetting.priority === 'medium' ? 'filled' : 'outlined'}
                    color={catSetting.priority === 'medium' ? 'warning' : 'default'}
                    onClick={() => handlePriorityChange(cat.key, 'medium')}
                    sx={{ fontWeight: 700, cursor: 'pointer' }}
                  />

                  <Chip
                    label="O'ta muhim (Qizil)"
                    size="small"
                    variant={catSetting.priority === 'high' ? 'filled' : 'outlined'}
                    color={catSetting.priority === 'high' ? 'error' : 'default'}
                    onClick={() => handlePriorityChange(cat.key, 'high')}
                    sx={{ fontWeight: 700, cursor: 'pointer' }}
                  />
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          startIcon={<IconRotateClockwise size={16} />}
          onClick={handleReset}
          color="inherit"
          size="small"
          sx={{ fontWeight: 600 }}
        >
          Standartga qaytarish
        </Button>

        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} color="inherit">
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            startIcon={<IconCheck size={18} />}
            sx={{ fontWeight: 700, px: 2.5 }}
          >
            Saqlash
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
