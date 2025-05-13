import React, { useEffect, useState } from 'react';
import MuiToolbar from '@mui/material/Toolbar';
import { Alert, Button, FormControl, Grid, Stack, Typography } from '@mui/material';
import api from 'utils/api';
import { useTranslation } from 'react-i18next';

function Toolbar() {
  const [lastUpdateDate, setLastUpdateDate] = useState(null);
  const { t } = useTranslation();
  useEffect(() => {
    api.get('/statistics/lastUpdateDateAbonentsSaldo').then((res) => {
      setLastUpdateDate(new Date(res.data.lastUpdateDate));
    });
  }, []);
  const now = new Date();
  return (
    <MuiToolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <Button variant="contained" color="success" sx={{ marginRight: '10px' }}>
          {t('buttons.export')}
        </Button>
        <Button variant="contained" color="success" sx={{ marginRight: '10px' }}>
          {t('buttons.refresh')}
        </Button>
      </div>
      <Alert
        sx={{ fontSize: '15px' }}
        color={
          lastUpdateDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate())
            ? 'success'
            : lastUpdateDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5)
              ? 'warning'
              : 'error'
        }
      >
        {console.log(lastUpdateDate, new Date(now.getFullYear(), now.getMonth(), now.getDate()))}
        Oxirgi yangilanish vaqti: {lastUpdateDate?.toLocaleString()}
      </Alert>
    </MuiToolbar>
  );
}

export default Toolbar;
