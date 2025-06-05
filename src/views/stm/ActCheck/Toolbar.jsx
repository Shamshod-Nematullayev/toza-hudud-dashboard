import React, { useEffect, useRef, useState } from 'react';
import MuiToolbar from '@mui/material/Toolbar';
import { Button, FormControl, InputLabel, MenuItem, Popper, Select, TextareaAutosize, TextField, Typography } from '@mui/material';
import { CancelOutlined, Done, NavigateNext, SkipNextOutlined, SkipPreviousOutlined, WarningOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useLoaderStore from 'store/loaderStore';
import api from 'utils/api';
import { toast } from 'react-toastify';
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import useActsStore from 'store/actsStore';
import { useNavigate } from 'react-router-dom';

function Toolbar({ act = {}, setAct }) {
  const { t } = useTranslation();
  const { setIsLoading } = useLoaderStore();
  const anchorElWarning = useRef(null);
  const [openWarningPopper, setOpenWarningPopper] = useState(false);
  const [openCancelPopper, setOpenCancelPopper] = useState(false);
  const [xatoTuri, setXatoTuri] = useState('Qayta hisob kitob xato');
  const [xatoMazmuni, setXatoMazmuni] = useState('Qayta hisob kitob xato');
  const [fixedSum, setFixedSum] = useState('');
  const { playlist } = useActsStore();
  const navigate = useNavigate();
  const handleClickDoneButton = async () => {
    setIsLoading(true);
    try {
      const date = new Date(act.createdAt);
      const period = `${date.getMonth() + 1}.${date.getFullYear()}`;
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
  const handleSubmitWarning = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const date = new Date(act.createdAt);
      const period = `${date.getMonth() + 1}.${date.getFullYear()}`;
      const { data } = await api.patch(`/acts/${act.id}/check`, {
        status: 'ogohlantirildi',
        actPackId: act.actPackId,
        companyId: act.companyId,
        period,
        fixedSum,
        warningMessage: xatoMazmuni
      });
      setAct({ ...act, onDb: data.act });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmitCancel = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const date = new Date(act.createdAt);
      const period = `${date.getMonth() + 1}.${date.getFullYear()}`;
      const { data } = await api.patch(`/acts/${act.id}/check`, {
        status: 'bekor_qilindi',
        actPackId: act.actPackId,
        companyId: act.companyId,
        period,
        fixedSum,
        warningMessage: xatoMazmuni
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
        disabled={!act.id || (act.onDb?.checkedAt && act.onDb?.status !== 'ogohlantirildi')}
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
              <Typography variant="h6">{t('checkActPage.Ogohlantirish')}</Typography>
              <form onSubmit={handleSubmitWarning}>
                <FormControl variant="standard" sx={{ gap: '10px' }}>
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

                  {xatoTuri === 'Qayta hisob kitob xato' && (
                    <TextField
                      variant="standard"
                      label={t("checkActPage.Aslida to'g'ri summa")}
                      type="number"
                      required
                      value={fixedSum}
                      onChange={(e) => setFixedSum(e.target.value)}
                    />
                  )}
                  <TextareaAutosize
                    minRows={5}
                    placeholder={t("checkActPage.Qo'shimcha izohlar")}
                    style={{ width: '100%', marginTop: '10px' }}
                    onChange={(e) => setXatoMazmuni(e.target.value)}
                    required={xatoTuri === 'boshqa'}
                  />
                  <Button variant="contained" color="primary" type="submit">
                    <Done />
                    {t('buttons.continue')}
                  </Button>
                </FormControl>
              </form>
            </MainCard>
          </Transitions>
        )}
      </Popper>
      <Button
        variant="contained"
        color="error"
        disabled={!act.id || act.onDb?.status === 'bekor_qilindi'}
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
        onClick={() => setOpenCancelPopper(!openCancelPopper)}
      >
        <CancelOutlined sx={{ flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('tableActions.cancel')}</span>
      </Button>
      <Popper open={openCancelPopper} anchorEl={anchorElWarning.current}>
        {({ TransitionProps }) => (
          <Transitions in={openCancelPopper} {...TransitionProps}>
            <MainCard>
              <form onSubmit={handleSubmitCancel}>
                <Typography variant="h6">{t('checkActPage.Bekor qilish')}</Typography>
                <FormControl variant="standard" sx={{ gap: '10px' }}>
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

                  {xatoTuri === 'Qayta hisob kitob xato' && (
                    <TextField
                      variant="standard"
                      label={t("checkActPage.Aslida to'g'ri summa")}
                      type="number"
                      required
                      value={fixedSum}
                      onChange={(e) => setFixedSum(e.target.value)}
                    />
                  )}
                  <TextareaAutosize
                    minRows={5}
                    placeholder={t("checkActPage.Qo'shimcha izohlar")}
                    style={{ width: '100%', marginTop: '10px' }}
                    onChange={(e) => setXatoMazmuni(e.target.value)}
                    required={xatoTuri === 'boshqa'}
                  />
                  <Button variant="contained" color="primary" type="submit">
                    <Done />
                    {t('buttons.continue')}
                  </Button>
                </FormControl>
              </form>
            </MainCard>
          </Transitions>
        )}
      </Popper>

      <Button
        variant="contained"
        color="secondary"
        disabled={!playlist.length || playlist.findIndex((row) => row.id === act.id) === 0}
        onClick={() => navigate('/stm/actCheck/' + playlist[playlist.findIndex((row) => row.id === act.id) - 1].id)}
      >
        <SkipPreviousOutlined />
        {t('tableActions.prev')}
      </Button>
      <Button
        variant="contained"
        color="secondary"
        disabled={!playlist.length || playlist.findIndex((row) => row.id === act.id) === playlist.length - 1}
        onClick={() => navigate('/stm/actCheck/' + playlist[playlist.findIndex((row) => row.id === act.id) + 1].id)}
      >
        <SkipNextOutlined />
        {t('tableActions.next')}
      </Button>
    </MuiToolbar>
  );
}

export default Toolbar;
