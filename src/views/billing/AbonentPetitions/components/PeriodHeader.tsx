import React, { useState, useEffect } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CalendarMonth,
  HomeOutlined,
  FolderOpenOutlined,
  FilterAltOutlined,
  Refresh,
  SearchOutlined,
  Close,
  AllInclusive
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

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
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

const MONTH_NAMES_UZ = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr'
];

export const formatPeriodLabel = (periodStr: string): string => {
  if (!periodStr || periodStr === 'all') return 'Barcha davrlar';
  const parts = periodStr.split('-');
  if (parts.length < 2) return periodStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  return `${MONTH_NAMES_UZ[monthIdx] || parts[1]}, ${year}`;
};

const PeriodHeader: React.FC<PeriodHeaderProps> = ({
  period,
  onPeriodChange,
  category,
  onCategoryClear,
  statusFilter,
  onStatusClear,
  onRefresh,
  categoryLabel,
  statusLabel,
  searchQuery = '',
  onSearchChange
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [headerSearch, setHeaderSearch] = useState(searchQuery);

  useEffect(() => {
    setHeaderSearch(searchQuery);
  }, [searchQuery]);

  const isAllPeriod = period === 'all';
  const currentDayjs = isAllPeriod ? dayjs() : dayjs(`${period}-01`);

  const handlePrevMonth = () => {
    const prev = currentDayjs.subtract(1, 'month').format('YYYY-MM');
    onPeriodChange(prev);
  };

  const handleNextMonth = () => {
    const next = currentDayjs.add(1, 'month').format('YYYY-MM');
    onPeriodChange(next);
  };

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(headerSearch.trim());
  };

  // Quick pick list for current year
  const currentYear = currentDayjs.year();
  const quickMonths = Array.from({ length: 12 }, (_, i) => {
    const monthNum = String(i + 1).padStart(2, '0');
    return {
      value: `${currentYear}-${monthNum}`,
      label: `${MONTH_NAMES_UZ[i]}, ${currentYear}`
    };
  });

  return (
    <Card
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 'none',
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        alignItems: { xs: 'flex-start', lg: 'center' },
        justifyContent: 'space-between',
        gap: 1.5
      }}
    >
      {/* Left: Breadcrumbs & Hierarchy */}
      <Box sx={{ minWidth: 260 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0.2 }}>
          <Stack
            direction="row"
            spacing={0.5}
            onClick={() => {
              onCategoryClear();
              onStatusClear();
            }}
            sx={{
              alignItems: 'center',
              cursor: 'pointer',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <HomeOutlined sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 500, color: 'inherit' }}>
              {t('menu.recalculation', 'Qayta hisob-kitob arizalari')}
            </Typography>
          </Stack>

          <Typography
            variant="caption"
            sx={{
              fontWeight: category || statusFilter ? 500 : 700,
              color: category || statusFilter ? 'text.secondary' : 'primary.main',
              cursor: category || statusFilter ? 'pointer' : 'default'
            }}
            onClick={() => {
              if (category || statusFilter) {
                onCategoryClear();
                onStatusClear();
              }
            }}
          >
            {formatPeriodLabel(period)}
          </Typography>

          {category && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <FolderOpenOutlined sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {categoryLabel || category}
              </Typography>
            </Stack>
          )}

          {!category && statusFilter && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <FilterAltOutlined sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {statusLabel || statusFilter}
              </Typography>
            </Stack>
          )}
        </Breadcrumbs>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            {category ? categoryLabel : statusFilter ? `${statusLabel} arizalari` : 'Hujjat turlari (Kataloglar)'}
          </Typography>

          {category && (
            <Chip
              label="Katalog ichida"
              size="small"
              color="primary"
              variant="outlined"
              onDelete={onCategoryClear}
              sx={{ fontWeight: 600, height: 22, fontSize: '0.75rem' }}
            />
          )}

          {statusFilter && (
            <Chip
              label={`Status: ${statusLabel || statusFilter}`}
              size="small"
              color="secondary"
              onDelete={onStatusClear}
              sx={{ fontWeight: 600, height: 22, fontSize: '0.75rem' }}
            />
          )}

          {searchQuery && (
            <Chip
              label={`Qidiruv: "${searchQuery}"`}
              size="small"
              color="info"
              variant="filled"
              onDelete={() => onSearchChange?.('')}
              sx={{ fontWeight: 600, height: 22, fontSize: '0.75rem' }}
            />
          )}
        </Stack>
      </Box>

      {/* Center: Global Search Bar */}
      {onSearchChange && (
        <Box
          component="form"
          onSubmit={handleHeaderSearchSubmit}
          sx={{
            flex: { xs: '1 1 100%', lg: '0 1 400px' },
            width: { xs: '100%', lg: 'auto' }
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder={t('searchPlaceholderGlobal', 'Umumiy qidiruv (akt №, hisob raqam, F.I.Sh)...')}
            value={headerSearch}
            onChange={(e) => {
              setHeaderSearch(e.target.value);
              if (!e.target.value.trim() && searchQuery) {
                onSearchChange('');
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: headerSearch ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setHeaderSearch('');
                        onSearchChange('');
                      }}
                      edge="end"
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: {
                  borderRadius: 2,
                  fontSize: '0.84rem',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'
                }
              }
            }}
          />
        </Box>
      )}

      {/* Right: Period Switcher + Refresh */}
      <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', alignSelf: { xs: 'stretch', sm: 'auto' } }}>
        <Tooltip title="Oldingi oy">
          <IconButton
            onClick={handlePrevMonth}
            color="primary"
            size="small"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              p: 0.6,
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
        </Tooltip>

        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={isAllPeriod ? <AllInclusive sx={{ fontSize: 18 }} /> : <CalendarMonth sx={{ fontSize: 18 }} />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            fontWeight: 700,
            fontSize: '0.85rem',
            textTransform: 'none',
            minWidth: 140
          }}
        >
          {formatPeriodLabel(period)}
        </Button>

        <Tooltip title="Keyingi oy">
          <IconButton
            onClick={handleNextMonth}
            color="primary"
            size="small"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              p: 0.6,
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Refresh Icon Button */}
        <Tooltip title="Ma‘lumotlarni yangilash">
          <IconButton
            onClick={onRefresh}
            color="primary"
            size="small"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              p: 0.6,
              backgroundColor: 'primary.lighter',
              '&:hover': { backgroundColor: 'primary.light' }
            }}
          >
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Quick Month Picker Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          slotProps={{
            paper: {
              sx: {
                maxHeight: 340,
                width: 220,
                borderRadius: 2,
                boxShadow: 3
              }
            }
          }}
        >
          {/* Barcha davrlar option */}
          <MenuItem
            selected={isAllPeriod}
            onClick={() => {
              onPeriodChange('all');
              setAnchorEl(null);
            }}
            sx={{
              fontWeight: isAllPeriod ? 700 : 500,
              color: isAllPeriod ? 'primary.main' : 'text.primary',
              fontSize: '0.85rem',
              py: 0.8,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <AllInclusive sx={{ fontSize: 18, mr: 1, color: isAllPeriod ? 'primary.main' : 'text.secondary' }} />
            Barcha davrlar (Umumiy)
          </MenuItem>

          <Box sx={{ px: 2, py: 0.8, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {currentYear}-yil oylari
            </Typography>
          </Box>
          {quickMonths.map((m) => {
            const isSelected = m.value === period;
            return (
              <MenuItem
                key={m.value}
                selected={isSelected}
                onClick={() => {
                  onPeriodChange(m.value);
                  setAnchorEl(null);
                }}
                sx={{
                  fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? 'primary.main' : 'text.primary',
                  fontSize: '0.82rem',
                  py: 0.7
                }}
              >
                {m.label}
              </MenuItem>
            );
          })}
        </Menu>
      </Stack>
    </Card>
  );
};

export default PeriodHeader;
