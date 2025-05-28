import React from 'react';
import MuiToolbar from '@mui/material/Toolbar';
import { Button } from '@mui/material';
import { CancelOutlined, Done, NavigateNext, WarningOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useLoaderStore from 'store/loaderStore';

function Toolbar({ act = {}, setAct }) {
  const { t } = useTranslation();
  const { setIsLoading } = useLoaderStore();
  const handleClickDoneButton = async () => {
    setIsLoading(true);
    await api.put(`/stm/acts/${act.id}/check`, {});
    setIsLoading(false);
  };
  return (
    <MuiToolbar sx={{ gap: '5px' }}>
      <Button
        variant="contained"
        color="primary"
        disabled={!act.id || act.onDb?.checkedAt}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          width: '140px'
        }}
      >
        <Done />
        {t('tableActions.checked')}
      </Button>
      <Button
        variant="contained"
        color="warning"
        disabled={!act.id || act.onDb?.checkedAt}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          width: '140px'
        }}
      >
        <WarningOutlined />
        {t('tableActions.warning')}
      </Button>
      <Button
        variant="contained"
        color="error"
        disabled={!act.id}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          width: '140px'
        }}
      >
        <CancelOutlined sx={{ flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('tableActions.cancel')}</span>
      </Button>

      <Button variant="contained" color="secondary" disabled={!act.id || act.onDb?.checkedAt}>
        <NavigateNext />
        {t('tableActions.next')}
      </Button>
    </MuiToolbar>
  );
}

export default Toolbar;
