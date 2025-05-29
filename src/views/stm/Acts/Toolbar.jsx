import React, { useEffect, useRef, useState } from 'react';
import MuiToolbar from '@mui/material/Toolbar';
import { Button, FormControl, InputLabel, MenuItem, Popper, Select, TextareaAutosize, TextField, Typography } from '@mui/material';
import { Cancel, Done, Warning } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { actStatusOptions } from 'store/constant';
import Transitions from 'ui-component/extended/Transitions';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import useLoaderStore from 'store/loaderStore';

function Toolbar({ selectedRows, setSelectedRows, filters, setFilters, rows, refreshRows }) {
  const { t } = useTranslation();
  const [openWarningPopper, setOpenWarningPopper] = useState(false);
  const [xatoTuri, setXatoTuri] = useState('Qayta hisob kitob xato');
  const [xatoMazmuni, setXatoMazmuni] = useState('Qayta hisob kitob xato');
  const [fixedSum, setFixedSum] = useState('');
  const anchorElWarning = useRef(null);
  const anchorElCancel = useRef(null);
  const [openCancelPopper, setOpenCancelPopper] = useState(false);
  const { setIsLoading } = useLoaderStore();
  const handleClickDoneButton = async () => {
    setIsLoading(true);
    try {
      const promises = selectedRows.map(async (row) => {
        const act = rows.find((r) => r.id === row);
        const date = new Date(act.createdAt);
        const period = `${date.getMonth() + 1}.${date.getFullYear()}`;
        const { data } = await api.patch(`/acts/${act.id}/check`, {
          status: 'tekshirildi',
          actPackId: act.actPackId,
          companyId: act.companyId,
          period
        });
        return data.act;
      });
      const result = await Promise.all(promises);
      await refreshRows();
      setSelectedRows([]);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmitWarning = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const promises = selectedRows.map(async (row) => {
        const act = rows.find((r) => r.id === row);
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
        return data.act;
      });
      await Promise.all(promises);
      await refreshRows();
      setOpenWarningPopper(false);
      setXatoTuri('Qayta hisob kitob xato');
      setXatoMazmuni('Qayta hisob kitob xato');
      setFixedSum('');
      setSelectedRows([]);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmitCancel = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const promises = selectedRows.map(async (row) => {
        const act = rows.find((r) => r.id === row);
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
        return data.act;
      });
      await Promise.all(promises);
      await refreshRows();
      setOpenWarningPopper(false);
      setXatoTuri('Qayta hisob kitob xato');
      setXatoMazmuni('Qayta hisob kitob xato');
      setFixedSum('');
      setSelectedRows([]);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <MuiToolbar sx={{ gap: '5px', alignItems: 'center' }}>
      <Button variant="contained" color="primary" disabled={!selectedRows.length} onClick={handleClickDoneButton}>
        <Done />
        Tekshirildi
      </Button>
      <Button
        variant="contained"
        color="warning"
        disabled={!selectedRows.length}
        ref={anchorElWarning}
        onClick={() => setOpenWarningPopper(true)}
      >
        <Warning /> Ogohlantirish
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
        disabled={!selectedRows.length}
        ref={anchorElCancel}
        onClick={() => setOpenCancelPopper(true)}
      >
        <Cancel />
        Bekor qilish
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
      <FormControl variant="standard">
        <InputLabel id="checkStatus">{t('tableHeaders.checkStatus')}</InputLabel>
        <Select
          label={t('tableHeaders.checkStatus')}
          labelId="checkStatus"
          sx={{ minWidth: '150px' }}
          value={filters.checkStatus}
          onChange={(e) => setFilters({ ...filters, checkStatus: e.target.value })}
        >
          <MenuItem value="">Hammasi</MenuItem>
          <MenuItem value="tekshirildi">Tekshirildi</MenuItem>
          <MenuItem value="ogohlantirildi">Ogohlantirildi</MenuItem>
          <MenuItem value="bekor_qilindi">Bekor qilindi</MenuItem>
          <MenuItem value="yangi">Tekshirilmagan</MenuItem>
        </Select>
      </FormControl>
      <FormControl variant="standard">
        <InputLabel id="status">{t('tableHeaders.status')}</InputLabel>
        <Select
          label={t('tableHeaders.status')}
          labelId="status"
          sx={{ minWidth: '150px' }}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          {actStatusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </MuiToolbar>
  );
}

export default Toolbar;
