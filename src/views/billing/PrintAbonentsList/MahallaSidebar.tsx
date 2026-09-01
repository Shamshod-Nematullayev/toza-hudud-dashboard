import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
  Chip,
  useTheme,
  Stack
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import LocationCity from '@mui/icons-material/LocationCity';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import ChevronRight from '@mui/icons-material/ChevronRight';
import useStore from './useStore';
import { useTranslation } from 'react-i18next';

interface MahallaSidebarProps {
  onSelectMahalla: (mfyId: number | string) => void;
}

export default function MahallaSidebar({ onSelectMahalla }: MahallaSidebarProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { mahallas, selectedMahalla } = useStore();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Ham mahalla nomi, ham nazoratchi nomi bo'yicha qidiruv
  const filteredMahallas = useMemo(() => {
    if (!searchQuery.trim()) return mahallas;
    const query = searchQuery.toLowerCase().trim();
    return mahallas.filter((m) => {
      const mahallaNameMatch = m.name?.toLowerCase().includes(query);
      const inspectorMatch = m.inspectorName?.toLowerCase().includes(query);
      return mahallaNameMatch || inspectorMatch;
    });
  }, [mahallas, searchQuery]);

  return (
    <Card
      elevation={0}
      sx={{
        height: 'calc(100vh - 140px)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper'
      }}
    >
      {/* Header & Qidiruv */}
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationCity color="primary" />
            <Typography variant="subtitle1" fontWeight={700}>
              {t('Mahallalar')}
            </Typography>
          </Stack>
          <Chip
            label={`${filteredMahallas.length} ta`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '11px', height: 22 }}
          />
        </Stack>

        {/* Qidiruv (Mahalla yoki Nazoratchi nomi) */}
        <TextField
          fullWidth
          size="small"
          placeholder={t("Mahalla yoki nazoratchi qidirish...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              )
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'
            }
          }}
        />
      </Box>

      {/* Mahalla ro'yxati */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1, pt: 0 }}>
        {filteredMahallas.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="caption" display="block">
              {searchQuery ? t('Mahalla yoki nazoratchi topilmadi') : t("Ro'yxat bo'sh")}
            </Typography>
          </Box>
        ) : (
          <List disablePadding spacing={0.5}>
            {filteredMahallas.map((item) => {
              const isSelected = Number(selectedMahalla) === Number(item.id);
              return (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => onSelectMahalla(item.id)}
                    sx={{
                      borderRadius: 2,
                      py: 0.8,
                      px: 1.5,
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'transparent',
                      bgcolor: isSelected
                        ? theme.palette.mode === 'dark'
                          ? 'primary.dark'
                          : 'primary.50'
                        : 'transparent',
                      '&:hover': {
                        bgcolor: isSelected
                          ? theme.palette.mode === 'dark'
                            ? 'primary.dark'
                            : 'primary.100'
                          : 'action.hover'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={isSelected ? 700 : 600}
                          color={isSelected ? 'primary.main' : 'text.primary'}
                          noWrap
                        >
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.3, overflow: 'hidden' }}>
                          <PersonOutlined sx={{ fontSize: 13, color: 'text.secondary', flexShrink: 0 }} />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{
                              fontSize: '11px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={item.inspectorName || t('Nazoratchi biriktirilmagan')}
                          >
                            {item.inspectorName || t('Nazoratchi biriktirilmagan')}
                          </Typography>
                        </Stack>
                      }
                    />
                    <ChevronRight
                      sx={{
                        fontSize: 18,
                        color: isSelected ? 'primary.main' : 'text.disabled',
                        flexShrink: 0,
                        ml: 0.5
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Card>
  );
}
