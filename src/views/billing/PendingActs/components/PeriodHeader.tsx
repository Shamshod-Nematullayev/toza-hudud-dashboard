import React, { useState } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CalendarMonth,
  HomeOutlined,
  FolderOpenOutlined,
  FilterAltOutlined,
  Refresh,
  LockClockOutlined
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatPendingPeriodLabel, getPeriodOptions } from '../utils/periodHelper';

interface PeriodHeaderProps {
  period: string;
  onPeriodChange: (newPeriod: string) => void;
  category: string | null;
  onCategoryClear: () => void;
  statusFilter: string | null;
  onStatusClear: () => void;
  onRefresh: () => void;
  categoryLabel?: string;
  statusLabel?: string;
}

const PeriodHeader: React.FC<PeriodHeaderProps> = ({
  period,
  onPeriodChange,
  category,
  onCategoryClear,
  statusFilter,
  onStatusClear,
  onRefresh,
  categoryLabel,
  statusLabel
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const currentDayjs = dayjs(`${period}-01`);

  const handlePrevPeriod = () => {
    const prev = currentDayjs.subtract(1, 'month').format('YYYY-MM');
    onPeriodChange(prev);
  };

  const handleNextPeriod = () => {
    const next = currentDayjs.add(1, 'month').format('YYYY-MM');
    onPeriodChange(next);
  };

  const periodOptions = getPeriodOptions(period, 12);

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: theme.palette.divider,
        bgcolor: theme.palette.background.paper,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 1px 3px rgba(0,0,0,0.3)'
            : '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}
      >
        {/* Chap qism: Breadcrumbs & Sarlavha */}
        <Stack spacing={0.5} sx={{ minWidth: 260 }}>
          <Breadcrumbs
            separator="/"
            sx={{
              '& .MuiBreadcrumbs-separator': {
                color: theme.palette.text.secondary,
                fontSize: '0.8rem'
              }
            }}
          >
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: 'center',
                cursor: 'pointer',
                color: theme.palette.text.secondary,
                '&:hover': { color: theme.palette.primary.main }
              }}
              onClick={onCategoryClear}
            >
              <HomeOutlined sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'inherit' }}>
                Kataloglar
              </Typography>
            </Stack>

            {category && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <FolderOpenOutlined sx={{ fontSize: 15, color: theme.palette.primary.main }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  {categoryLabel || category}
                </Typography>
              </Stack>
            )}

            {statusFilter && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <FilterAltOutlined sx={{ fontSize: 15, color: theme.palette.warning.main }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  {statusLabel || statusFilter}
                </Typography>
              </Stack>
            )}
          </Breadcrumbs>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              {category ? categoryLabel || category : 'Avtomatik kiritiladigan aktlar'}
            </Typography>

            <Chip
              icon={<LockClockOutlined sx={{ fontSize: 14 }} />}
              label="Davr: 25-dan 25-gacha"
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                color: theme.palette.info.main,
                border: '1px solid',
                borderColor: alpha(theme.palette.info.main, 0.2)
              }}
            />
          </Stack>
        </Stack>

        {/* O'ng qism: Davr boshqaruvi (Oyning 25-dan keyingi oyning 25-gacha) */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'space-between', md: 'flex-end' },
            flexWrap: 'wrap'
          }}
        >
          {/* Faol filtrlar chipi */}
          {category && (
            <Chip
              label={categoryLabel || category}
              onDelete={onCategoryClear}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}

          {statusFilter && (
            <Chip
              label={statusLabel || statusFilter}
              onDelete={onStatusClear}
              size="small"
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}

          {/* Davr almashtirgich (25-sanasidan 25-sanasigacha) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2,
              border: '1px solid',
              borderColor: theme.palette.divider,
              bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.04),
              p: 0.5
            }}
          >
            <Tooltip title="Oldingi davr (25-dan 25-gacha)">
              <IconButton size="small" onClick={handlePrevPeriod} sx={{ p: 0.5 }}>
                <ChevronLeft fontSize="small" />
              </IconButton>
            </Tooltip>

            <Button
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              startIcon={<CalendarMonth sx={{ fontSize: 16 }} />}
              sx={{
                px: 1.5,
                py: 0.5,
                fontWeight: 700,
                fontSize: '0.85rem',
                color: theme.palette.text.primary,
                textTransform: 'none',
                minWidth: 220
              }}
            >
              {formatPendingPeriodLabel(period)}
            </Button>

            <Tooltip title="Keyingi davr (25-dan 25-gacha)">
              <IconButton size="small" onClick={handleNextPeriod} sx={{ p: 0.5 }}>
                <ChevronRight fontSize="small" />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              slotProps={{
                paper: {
                  sx: {
                    maxHeight: 380,
                    width: 320,
                    borderRadius: 2,
                    mt: 0.5,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }
                }
              }}
            >
              <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: theme.palette.divider }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                  Akt kiritish davrini tanlang (25-sanasidan 25-gacha)
                </Typography>
              </Box>
              {periodOptions.map((opt) => (
                <MenuItem
                  key={opt.value}
                  selected={opt.value === period}
                  onClick={() => {
                    onPeriodChange(opt.value);
                    setAnchorEl(null);
                  }}
                  sx={{
                    fontSize: '0.825rem',
                    fontWeight: opt.value === period ? 700 : 500,
                    py: 1
                  }}
                >
                  {opt.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Yangilash tugmasi */}
          <Tooltip title={t('buttons.refresh', 'Yangilash')}>
            <IconButton
              size="small"
              onClick={onRefresh}
              sx={{
                border: '1px solid',
                borderColor: theme.palette.divider,
                bgcolor: theme.palette.background.paper,
                p: 0.75,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Card>
  );
};

export default PeriodHeader;
