import React, { useEffect, useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  SelectChangeEvent
} from '@mui/material';
import {
  SupervisorAccount as NazoratchilarIcon,
  HowToReg as XatlovchilarIcon,
  AdminPanelSettings as ManagersIcon,
  Telegram as TelegramIcon,
  LockOutlined as LockIcon
} from '@mui/icons-material';
import api from 'utils/api';

export interface ICompanyTelegramGroup {
  key: string;
  name: string;
  chatId: string;
  description?: string;
}

interface TelegramGroupSelectProps {
  value: string;
  onChange: (chatId: string) => void;
  defaultChatId?: string;
  companyGroups?: ICompanyTelegramGroup[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
}

export default function TelegramGroupSelect({
  value,
  onChange,
  defaultChatId,
  companyGroups: initialGroups,
  label = 'Telegram Guruh',
  disabled = false,
  required = false,
  helperText
}: TelegramGroupSelectProps) {
  const theme = useTheme();
  const [groups, setGroups] = useState<ICompanyTelegramGroup[]>(initialGroups || []);
  const [loading, setLoading] = useState<boolean>(!initialGroups || initialGroups.length === 0);

  useEffect(() => {
    if (initialGroups && initialGroups.length > 0) {
      setGroups(initialGroups);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/auth/company');
        if (isMounted && data?.ok && data?.company) {
          const comp = data.company;
          const loadedGroups: ICompanyTelegramGroup[] = [
            {
              key: 'GROUP_ID_NAZORATCHILAR',
              name: 'Nazoratchilar guruhi',
              chatId: (comp.GROUP_ID_NAZORATCHILAR || '').trim(),
              description: 'Tashkilot nazoratchilari uchun rasmiy guruh'
            },
            {
              key: 'GROUP_ID_XATLOVCHILAR',
              name: 'Xatlovchilar guruhi',
              chatId: (comp.GROUP_ID_XATLOVCHILAR || '').trim(),
              description: 'Xatlov o‘tkazuvchilar uchun rasmiy guruh'
            },
            {
              key: 'GROUP_ID_MANAGERS',
              name: 'Boshqaruv tizimi guruhi (Menejerlar)',
              chatId: (comp.GROUP_ID_MANAGERS || '').trim(),
              description: 'Rahbariyat va boshqaruv tizimi guruhi'
            }
          ];
          setGroups(loadedGroups);
        }
      } catch (err) {
        console.error('Error fetching company groups for select:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCompany();
    return () => {
      isMounted = false;
    };
  }, [initialGroups]);

  // If initialGroups prop updates from parent
  useEffect(() => {
    if (initialGroups && initialGroups.length > 0) {
      setGroups(initialGroups);
    }
  }, [initialGroups]);

  // Resolve current selection
  const selectedGroup = groups.find((g) => g.chatId && (g.chatId === value || g.key === value));
  const configuredGroups = groups.filter((g) => Boolean(g.chatId));
  const hasNoConfiguredGroups = !loading && configuredGroups.length === 0;

  // If value is empty or not matching and defaultChatId is present, auto-sync
  useEffect(() => {
    if (!value && groups.length > 0) {
      if (defaultChatId) {
        const matchDefault = groups.find((g) => g.chatId === defaultChatId);
        if (matchDefault && matchDefault.chatId) {
          onChange(matchDefault.chatId);
          return;
        }
      }
      // fallback to first configured group
      const firstConfigured = groups.find((g) => Boolean(g.chatId));
      if (firstConfigured && firstConfigured.chatId) {
        onChange(firstConfigured.chatId);
      }
    }
  }, [value, defaultChatId, groups, onChange]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const selectedVal = event.target.value;
    const grp = groups.find((g) => g.chatId === selectedVal || g.key === selectedVal);
    if (grp && grp.chatId) {
      onChange(grp.chatId);
    } else {
      onChange(selectedVal);
    }
  };

  const getGroupIcon = (key: string) => {
    switch (key) {
      case 'GROUP_ID_NAZORATCHILAR':
        return <NazoratchilarIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
      case 'GROUP_ID_XATLOVCHILAR':
        return <XatlovchilarIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />;
      case 'GROUP_ID_MANAGERS':
        return <ManagersIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
      default:
        return <TelegramIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
        <CircularProgress size={18} color="secondary" />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Tashkilot Telegram guruhlari yuklanmoqda...
        </Typography>
      </Box>
    );
  }

  if (hasNoConfiguredGroups) {
    return (
      <Alert severity="warning" icon={<LockIcon fontSize="inherit" />} sx={{ py: 0.5, borderRadius: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Telegram guruhlar sozlanmagan
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          Tashkilot profilida Nazoratchilar, Xatlovchilar yoki Boshqaruv guruhi ID si kiritilmagan.
        </Typography>
      </Alert>
    );
  }

  // Determine current select value
  const currentValue = selectedGroup ? selectedGroup.chatId : value || (defaultChatId && groups.some(g => g.chatId === defaultChatId) ? defaultChatId : '');

  return (
    <FormControl fullWidth size="small" disabled={disabled} required={required}>
      <InputLabel id="telegram-group-select-label" sx={{ fontWeight: 500 }}>
        {label}
      </InputLabel>
      <Select
        labelId="telegram-group-select-label"
        label={label}
        value={currentValue}
        onChange={handleChange}
        renderValue={() => {
          if (!selectedGroup) {
            return (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Guruh tanlanmagan
              </Typography>
            );
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getGroupIcon(selectedGroup.key)}
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {selectedGroup.name}
              </Typography>
              <Chip
                size="small"
                label={selectedGroup.chatId}
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                  color: 'text.secondary'
                }}
              />
            </Box>
          );
        }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                maxHeight: 320,
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.divider,
                boxShadow: theme.palette.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.08)'
              }
            }
          }
        }}
      >
        {groups.map((grp) => {
          const isConfigured = Boolean(grp.chatId);
          return (
            <MenuItem
              key={grp.key}
              value={grp.chatId || grp.key}
              disabled={!isConfigured}
              sx={{
                py: 1.25,
                px: 1.5,
                opacity: isConfigured ? 1 : 0.6,
                borderBottom: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.5),
                '&:last-child': { borderBottom: 'none' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      p: 0.75,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isConfigured
                        ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08)
                        : theme.palette.action.disabledBackground
                    }}
                  >
                    {getGroupIcon(grp.key)}
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: isConfigured ? 'text.primary' : 'text.disabled'
                      }}
                    >
                      {grp.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        color: isConfigured ? 'text.secondary' : 'error.main',
                        fontSize: '0.72rem'
                      }}
                    >
                      {isConfigured ? `ID: ${grp.chatId}` : 'Tashkilot profilida kiritilmagan'}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  size="small"
                  variant={isConfigured ? 'outlined' : 'filled'}
                  color={isConfigured ? 'success' : 'default'}
                  label={isConfigured ? 'Mavjud' : 'Sozlanmagan'}
                  sx={{
                    height: 22,
                    fontSize: '0.68rem',
                    fontWeight: 600
                  }}
                />
              </Box>
            </MenuItem>
          );
        })}
      </Select>
      <FormHelperText sx={{ mx: 0.5, mt: 0.5 }}>
        {helperText || 'Faqat tashkilotning rasmiy Telegram guruhlariga yuboriladi.'}
      </FormHelperText>
    </FormControl>
  );
}
