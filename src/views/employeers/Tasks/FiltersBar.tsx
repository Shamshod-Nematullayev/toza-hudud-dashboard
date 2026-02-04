import { TextField } from '@mui/material';
import { t } from 'i18next';
import { useState } from 'react';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import MahallaSelection from 'ui-component/MahallaSelection';

function FiltersBar() {
  const [accountNumber, setAccountNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [mahallaId, setMahallaId] = useState('');
  const [type, setType] = useState<'' | 'electricity' | 'phone'>('');
  const [nazoratchi_id, setNazoratchiId] = useState(0);
  const [status, setStatus] = useState<'' | 'completed' | 'in-progress' | 'rejected'>('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', padding: '0 20px' }}>
      <AccountNumberInput sx={{ width: '100%' }} value={accountNumber} setFunc={setAccountNumber} label={t('tableHeaders.accountNumber')} />
      <TextField value={fullName} onChange={(e) => setFullName(e.target.value)} fullWidth label={t('tableHeaders.fullName')} />
      <MahallaSelection
        label={t('tableHeaders.mfy')}
        selectedMahallaId={mahallaId}
        setSelectedMahallaId={(e) => setMahallaId(e as string)}
      />
    </div>
  );
}

export default FiltersBar;
