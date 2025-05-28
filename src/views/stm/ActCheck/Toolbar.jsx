import React, { useEffect, useRef, useState } from 'react';
import MuiToolbar from '@mui/material/Toolbar';
import { Button, ClickAwayListener, FormControl, InputLabel, MenuItem, Popper, Select, TextareaAutosize } from '@mui/material';
import { CancelOutlined, Done, NavigateNext, WarningOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useLoaderStore from 'store/loaderStore';
import api from 'utils/api';
import { toast } from 'react-toastify';
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';

function Toolbar({ act = {}, setAct }) {
  const { t } = useTranslation();
  const { setIsLoading } = useLoaderStore();
  const anchorElWarning = useRef(null);
  const [openWarningPopper, setOpenWarningPopper] = useState(false);
  const [xatoTuri, setXatoTuri] = useState('Qayta hisob kitob xato');
  const [xatoMazmuni, setXatoMazmuni] = useState('Qayta hisob kitob xato');
  const handleClickDoneButton = async () => {
    setIsLoading(true);
    try {
      const date = new Date(act.createdAt);
      const period = `${date.toLocaleString('ru', { year: 'numeric', month: '2-digit' })}`;
      const { data } = await api.patch(`/acts/${act.id}/check`, {
        status: 'tekshirildi',
        actPackId: act.actPackId,
        companyId: act.companyId,
        period
      });
      setAct({ ...act, onDb: data.act });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    setXatoMazmuni(xatoTuri);
  }, [xatoTuri]);
  return (
    <MuiToolbar sx={{ gap: '5px' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClickDoneButton}
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
        ref={anchorElWarning}
        variant="contained"
        color="warning"
        disabled={!act.id || act.onDb?.checkedAt}
        onClick={() => setOpenWarningPopper(!openWarningPopper)}
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
      <Popper open={openWarningPopper} anchorEl={anchorElWarning.current}>
        {({ TransitionProps }) => (
          <Transitions in={openWarningPopper} {...TransitionProps}>
            <MainCard>
              <FormControl variant="standard">
                <InputLabel id="checkStatus">{t('checkActPage.Xatolik')}</InputLabel>
                <Select
                  label={t('tableHeaders.checkStatus')}
                  labelId="checkStatus"
                  sx={{ minWidth: 250 }}
                  value={xatoTuri}
                  onChange={(e) => setXatoTuri(e.target.value)}
                >
                  <MenuItem value="Qayta hisob kitob xato">{t('checkActPage.Qayta hisob kitob xato')}</MenuItem>
                  <MenuItem value="Noto'g'ri fayl biriktirilgan">{t("checkActPage.Noto'g'ri fayl biriktirilgan")}</MenuItem>
                  <MenuItem value="boshqa">{t('checkActPage.Boshqa')}</MenuItem>
                </Select>
                {xatoTuri === 'boshqa' && (
                  <TextareaAutosize
                    minRows={5}
                    placeholder={t('checkActPage.Xatolik')}
                    style={{ width: '100%', marginTop: '10px' }}
                    onChange={(e) => setXatoMazmuni(e.target.value)}
                  />
                )}
              </FormControl>
            </MainCard>
          </Transitions>
        )}
      </Popper>
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

      <Button variant="contained" color="secondary">
        <NavigateNext />
        {t('tableActions.next')}
      </Button>
    </MuiToolbar>
  );
}

export default Toolbar;
