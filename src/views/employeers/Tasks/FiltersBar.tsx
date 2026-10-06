import React, { useId } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
  alpha,
  Stack,
  Drawer,
  IconButton,
  Paper
} from '@mui/material';
import {
  RestartAltOutlined,
  FilterAltOutlined,
  RefreshOutlined,
  CloseOutlined
} from '@mui/icons-material';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { t } from 'i18next';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import InspectorSelection from 'ui-component/InspectorSelection';
import MahallaSelection from 'ui-component/MahallaSelection';
import { IFilters, useTasksStore } from './useTasksStore';

function FiltersBar() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = theme.palette.primary.main;

  const typeLabelId = useId();
  const statusLabelId = useId();

  const {
    openFilterDrawer,
    setOpenFilterDrawer,
    accountNumber,
    setAccountNumber,
    fullName,
    setFullName,
    mahallaId,
    setMahallaId,
    type,
    setType,
    nazoratchi_id,
    setNazoratchiId,
    status,
    setStatus,
    setFilters
  } = useTasksStore();

  const handleApplyFilter = () => {
    let filters: IFilters = { _nonce: Date.now() };
    if (accountNumber) filters.accountNumber = accountNumber;
    if (fullName) filters.fullName = fullName;
    if (mahallaId) filters.mahallaId = Number(mahallaId);
    if (type) filters.type = type;
    if (nazoratchi_id) filters.nazoratchi_id = Number(nazoratchi_id);
    if (status) filters.status = status;
    setFilters(filters);
    setOpenFilterDrawer(false);
  };

  const handleClearFilter = () => {
    setAccountNumber('');
    setFullName('');
    setMahallaId('');
    setType('');
    setNazoratchiId('');
    setStatus('');
    setFilters({});
  };

  const activeFiltersCount = [
    accountNumber,
    fullName,
    mahallaId,
    type,
    nazoratchi_id,
    status
  ].filter(Boolean).length;

  return (
    <>
      {/* 1. O'ng chekkadagi doimiy vertikal Filter tab/tugmasi (foydalanuvchi ilova qilgan rasmdagi kabi) */}
      {!openFilterDrawer && (
        <Paper
          elevation={4}
          onClick={() => setOpenFilterDrawer(true)}
          sx={{
            position: 'fixed',
            right: 0,
            top: '40%',
            zIndex: 1050,
            cursor: 'pointer',
            py: 1.75,
            px: 0.9,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderRight: 'none',
            borderColor: accentColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.75,
            boxShadow: isDark
              ? '0 4px 16px rgba(0,0,0,0.6)'
              : '0 4px 16px rgba(33, 150, 243, 0.25)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(accentColor, isDark ? 0.2 : 0.08),
              pr: 1.3
            }
          }}
        >
          <KeyboardDoubleArrowLeftIcon sx={{ fontSize: 18, color: accentColor }} />
          <Typography
            variant="caption"
            sx={{
              writingMode: 'vertical-rl',
              fontWeight: 700,
              letterSpacing: 1,
              color: 'text.primary'
            }}
          >
            Filter {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
          </Typography>
        </Paper>
      )}

      {/* 2. O'ngdan chiquvchi Filtrlar Sidepaneli (Drawer) */}
      <Drawer
        anchor="right"
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 400 },
              bgcolor: 'background.paper',
              borderLeft: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)'
            }
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.primary.main, 0.04)
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <FilterAltOutlined color="primary" sx={{ fontSize: 22 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Filtrlar
            </Typography>
            {activeFiltersCount > 0 && (
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                {activeFiltersCount} ta faol
              </Box>
            )}
          </Stack>
          <IconButton size="small" onClick={() => setOpenFilterDrawer(false)} sx={{ color: 'text.secondary' }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Box>

        {/* Body with inputs */}
        <Box sx={{ p: 2.5, flex: 1, overflowY: 'auto' }}>
          <Stack spacing={2.5}>
            {/* Hisob raqami */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                {t('tableHeaders.accountNumber')}
              </Typography>
              <AccountNumberInput
                sx={{ width: '100%' }}
                size="small"
                value={accountNumber}
                setFunc={setAccountNumber}
                label={t('tableHeaders.accountNumber')}
              />
            </Box>

            {/* F.I.O */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                {t('tableHeaders.fullName')}
              </Typography>
              <TextField
                size="small"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
                label={t('tableHeaders.fullName')}
                placeholder="Abonent F.I.O. bo'yicha izlash"
              />
            </Box>

            {/* Mahalla / MFY */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                {t('tableHeaders.mfy')}
              </Typography>
              <MahallaSelection
                size="small"
                label={t('tableHeaders.mfy')}
                selectedMahallaId={mahallaId}
                setSelectedMahallaId={(e) => setMahallaId(e as string)}
                defaultValueDisabled={false}
                defaultValueLabel={t('all')}
              />
            </Box>

            {/* Topshiriq turi */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                {t('taskTypes.type')}
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id={typeLabelId}>{t('taskTypes.type')}</InputLabel>
                <Select
                  labelId={typeLabelId}
                  label={t('taskTypes.type')}
                  value={type}
                  onChange={(e) => setType(e.target.value as '' | 'electricity' | 'phone')}
                >
                  <MenuItem value="">{t('all')}</MenuItem>
                  <MenuItem value="electricity">⚡ {t('taskTypes.electricity')}</MenuItem>
                  <MenuItem value="phone">📱 {t('taskTypes.phone')}</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Inspektor */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                {t('tableHeaders.inspector')}
              </Typography>
              <InspectorSelection
                size="small"
                selectedIspectorId={nazoratchi_id}
                setSelectedIspectorId={setNazoratchiId}
                label={t('tableHeaders.inspector')}
              />
            </Box>

            {/* Topshiriq holati */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                {t('tableHeaders.status')}
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id={statusLabelId}>{t('tableHeaders.status')}</InputLabel>
                <Select
                  labelId={statusLabelId}
                  label={t('tableHeaders.status')}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as '' | 'completed' | 'in-progress' | 'rejected' | 'checking')}
                >
                  <MenuItem value="">{t('all')}</MenuItem>
                  <MenuItem value="completed">✅ {t('tasksStatus.completed')}</MenuItem>
                  <MenuItem value="checking">🔍 {t('tasksStatus.checking')}</MenuItem>
                  <MenuItem value="in-progress">⏳ {t('tasksStatus.in-progress')}</MenuItem>
                  <MenuItem value="rejected">❌ {t('tasksStatus.rejected')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.grey[500], 0.03),
            display: 'flex',
            gap: 1.5
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            onClick={handleClearFilter}
            disabled={activeFiltersCount === 0}
            startIcon={<RestartAltOutlined />}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            Tozalash
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleApplyFilter}
            startIcon={<RefreshOutlined />}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            Qo'llash
          </Button>
        </Box>
      </Drawer>
    </>
  );
}

export default FiltersBar;
