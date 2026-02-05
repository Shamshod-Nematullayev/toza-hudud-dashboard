import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { t } from 'i18next';
import { useId, useState } from 'react';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import InspectorSelection from 'ui-component/InspectorSelection';
import MahallaSelection from 'ui-component/MahallaSelection';
import { IFilters, useTasksStore } from './useTasksStore';

function FiltersBar() {
  const [accountNumber, setAccountNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [mahallaId, setMahallaId] = useState('');
  const [type, setType] = useState<'' | 'electricity' | 'phone'>('');
  const [nazoratchi_id, setNazoratchiId] = useState<number | ''>('');
  const [status, setStatus] = useState<'' | 'completed' | 'in-progress' | 'rejected'>('');

  const typeLabelId = useId();
  const statusLabelId = useId();

  const { setFilters } = useTasksStore();

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
    handleClickSearchButton();
    setFilters({});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', padding: '0 20px' }}>
      <AccountNumberInput sx={{ width: '100%' }} value={accountNumber} setFunc={setAccountNumber} label={t('tableHeaders.accountNumber')} />
      <TextField value={fullName} onChange={(e) => setFullName(e.target.value)} fullWidth label={t('tableHeaders.fullName')} />
      <MahallaSelection
        label={t('tableHeaders.mfy')}
        selectedMahallaId={mahallaId}
        setSelectedMahallaId={(e) => setMahallaId(e as string)}
        defaultValueDisabled={false}
        defaultValueLabel={t('all')}
      />
      <FormControl>
        <InputLabel id={typeLabelId}>{t('taskTypes.type')}</InputLabel>
        <Select
          labelId={typeLabelId}
          label={t('taskTypes.type')}
          defaultValue=""
          value={type}
          onChange={(e) => setType(e.target.value as '' | 'electricity' | 'phone')}
        >
          <MenuItem value={''}>{t('all')}</MenuItem>
          <MenuItem value={'electricity'}>{t('taskTypes.electricity')}</MenuItem>
          <MenuItem value={'phone'}>{t('taskTypes.phone')}</MenuItem>
        </Select>
      </FormControl>
      <InspectorSelection selectedIspectorId={nazoratchi_id} setSelectedIspectorId={setNazoratchiId} label={t('tableHeaders.inspector')} />
      <FormControl>
        <InputLabel id={statusLabelId}>{t('tableHeaders.status')}</InputLabel>
        <Select
          labelId={statusLabelId}
          label={t('tableHeaders.status')}
          defaultValue=""
          value={status}
          onChange={(e) => setStatus(e.target.value as '' | 'completed' | 'in-progress' | 'rejected')}
        >
          <MenuItem value={''}>{t('all')}</MenuItem>
          <MenuItem value={'completed'}>{t('tasksStatus.completed')}</MenuItem>
          <MenuItem value={'in-progress'}>{t('tasksStatus.in-progress')}</MenuItem>
          <MenuItem value={'rejected'}>{t('tasksStatus.rejected')}</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" onClick={handleClickSearchButton}>
        {t('buttons.refresh')}
      </Button>
      <Button variant="outlined" onClick={handleClickClearButton}>
        {t('buttons.clear')}
      </Button>
    </div>
  );
}

export default FiltersBar;
