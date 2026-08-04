import { Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { SearchOutlined, ClearOutlined } from '@mui/icons-material';
import { t } from 'i18next';
import { useId } from 'react';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import InspectorSelection from 'ui-component/InspectorSelection';
import MahallaSelection from 'ui-component/MahallaSelection';
import { IFilters, useTasksStore } from './useTasksStore';

function FiltersBar() {
  const typeLabelId = useId();
  const statusLabelId = useId();

  const {
    setFilters,
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
    setStatus
  } = useTasksStore();

  const handleClickSearchButton = () => {
    let filters: IFilters = {};
    if (accountNumber) filters.accountNumber = accountNumber;
    if (fullName) filters.fullName = fullName;
    if (mahallaId) filters.mahallaId = Number(mahallaId);
    if (type) filters.type = type;
    if (nazoratchi_id) filters.nazoratchi_id = Number(nazoratchi_id);
    if (status) filters.status = status;
    setFilters(filters);
  };

  const handleClickClearButton = () => {
    setAccountNumber('');
    setFullName('');
    setMahallaId('');
    setType('');
    setNazoratchiId('');
    setStatus('');
    setFilters({});
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        my: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2.5
      }}
    >
      <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 1, display: 'block', mb: 2 }}>
        🔍 FILTRLAR VA QIDIRUV
      </Typography>

      <Grid container spacing={2}>
        {/* Qator 1: Hisob raqam, F.I.O, MFY */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <AccountNumberInput
            sx={{ width: '100%' }}
            size="small"
            value={accountNumber}
            setFunc={setAccountNumber}
            label={t('tableHeaders.accountNumber')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            size="small"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
            label={t('tableHeaders.fullName')}
            placeholder="Abonent F.I.O. bo'yicha izlash"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MahallaSelection
            label={t('tableHeaders.mfy')}
            selectedMahallaId={mahallaId}
            setSelectedMahallaId={(e) => setMahallaId(e as string)}
            defaultValueDisabled={false}
            defaultValueLabel={t('all')}
          />
        </Grid>

        {/* Qator 2: Topshiriq Turi, Inspektor, Holati */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel id={typeLabelId}>{t('taskTypes.type')}</InputLabel>
            <Select
              labelId={typeLabelId}
              label={t('taskTypes.type')}
              value={type}
              onChange={(e) => setType(e.target.value as '' | 'electricity' | 'phone')}
            >
              <MenuItem value="">{t('all')}</MenuItem>
              <MenuItem value="electricity">{t('taskTypes.electricity')}</MenuItem>
              <MenuItem value="phone">{t('taskTypes.phone')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InspectorSelection
            selectedIspectorId={nazoratchi_id}
            setSelectedIspectorId={setNazoratchiId}
            label={t('tableHeaders.inspector')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel id={statusLabelId}>{t('tableHeaders.status')}</InputLabel>
            <Select
              labelId={statusLabelId}
              label={t('tableHeaders.status')}
              value={status}
              onChange={(e) => setStatus(e.target.value as '' | 'completed' | 'in-progress' | 'rejected' | 'checking')}
            >
              <MenuItem value="">{t('all')}</MenuItem>
              <MenuItem value="completed">{t('tasksStatus.completed')}</MenuItem>
              <MenuItem value="checking">{t('tasksStatus.checking')}</MenuItem>
              <MenuItem value="in-progress">{t('tasksStatus.in-progress')}</MenuItem>
              <MenuItem value="rejected">{t('tasksStatus.rejected')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Action Buttons */}
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
          <Button variant="outlined" color="inherit" onClick={handleClickClearButton} startIcon={<ClearOutlined />}>
            Tozalash
          </Button>
          <Button variant="contained" color="primary" onClick={handleClickSearchButton} startIcon={<SearchOutlined />}>
            Qo'llash
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default FiltersBar;
