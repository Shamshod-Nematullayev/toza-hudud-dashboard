import { Button, Card, Grid, IconButton, MenuItem, Select, Stack, TextField, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { aktType, defaultAbonentData, useStore } from './useStore';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import { useTranslation } from 'react-i18next';
import { documentTypes } from 'store/constant';
import { ScreenRotationAlt } from '@mui/icons-material';

function InputForm() {
  const {
    aktType,
    setAktType,
    abonentData,
    setAbonentData,
    abonentData2,
    setAbonentData2,
    recalculationPeriods,
    setRecalculationPeriods,
    yashovchiSoniInput,
    setYashovchiSoniInput,
    setPasteImageDialogOpen,
    images,
    muzlatiladi,
    setMuzlatiladi,
    setImages,
    aktSumma,
    setAktSumma,
    createAriza,
    updateAbonentDataByAccNum
  } = useStore();
  const [accountNumber, setAccountNumber] = useState('');
  const [accountNumber2, setAccountNumber2] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (muzlatiladi && aktType === 'gps') return setYashovchiSoniInput(0);
    if (aktType === 'death') {
      setYashovchiSoniInput(abonentData?.house?.inhabitantCnt - 1);
    } else {
      setYashovchiSoniInput(abonentData?.house?.inhabitantCnt);
    }
  }, [aktType, abonentData, muzlatiladi]);

  useEffect(() => {
    let total = 0;
    let totalWithQQS = 0;
    let withoutQQSTotal = 0;
    recalculationPeriods.forEach((period) => {
      total += period.total;
      totalWithQQS += period.withQQSTotal;
      withoutQQSTotal += period.withoutQQSTotal;
    });
    setAktSumma({
      total,
      totalWithQQS,
      withoutQQSTotal
    });
  }, [recalculationPeriods]);
  useEffect(() => {
    if (accountNumber.length === 12) {
      updateAbonentDataByAccNum(accountNumber, 'main');
    } else {
      if (abonentData.accountNumber) setAbonentData(defaultAbonentData);
    }
  }, [accountNumber]);
  useEffect(() => {
    if (accountNumber.length === 12) {
      updateAbonentDataByAccNum(accountNumber2, 'dublicate');
    } else {
      if (abonentData2.accountNumber) setAbonentData(defaultAbonentData);
    }
  }, [accountNumber2]);

  const handleClearButtonClick = () => {
    setAccountNumber('');
    setAccountNumber2('');
    setAbonentData(defaultAbonentData);
    setAbonentData2(defaultAbonentData);
    setYashovchiSoniInput('');
    setAktSumma({ total: 0, totalWithQQS: 0, withoutQQSTotal: 0 });
    setRecalculationPeriods([]);
    setImages([]);
    setAktType(null);
  };

  const handleSwapIconButtonClick = () => {
    let tempLicshet = accountNumber;
    setAccountNumber(accountNumber2);
    setAccountNumber2(tempLicshet);
  };

  return (
    <Card sx={{ boxShadow: 5, padding: 2 }}>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <Button
            variant="contained"
            color={'primary'}
            disabled={
              !abonentData.accountNumber || (aktType == 'dvaynik' && !abonentData2.accountNumber) || (aktType == 'gps' && !images.length)
            }
            onClick={createAriza}
          >
            {t('buttons.create')}
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button variant="outlined" color={'error'} onClick={handleClearButtonClick}>
            {t('buttons.clear')}
          </Button>
        </Grid>
        {aktType === 'gps' && (
          // <Grid item xs={4}>
          <Button color="success" variant="outlined" onClick={() => setPasteImageDialogOpen(true)}>
            {t('buttons.addImage')}
          </Button>
          // </Grid>
        )}
        <Grid item xs={6}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Select value={aktType} onChange={(e) => setAktType(e.target.value as aktType)}>
              {documentTypes.map((item) => (
                <MenuItem key={item} value={item}>
                  {/* @ts-ignore */}
                  {t(`documentTypes.${item}`)}
                </MenuItem>
              ))}
            </Select>
            <TextField
              label={t('createAbonentPetitionPage.inhabitantCnt')}
              sx={{ margin: '10px 0', display: aktType === 'viza' || aktType === 'gps' ? 'none' : 'inline' }}
              value={yashovchiSoniInput}
              disabled={aktType === 'death'}
              onChange={(e) => {
                if (!isNaN(Number(e.target.value))) {
                  setYashovchiSoniInput(e.target.value);
                }
              }}
            />
            <Select
              value={muzlatiladi}
              onChange={(e) => setMuzlatiladi(e.target.value === 'true')}
              sx={{
                display: aktType === 'gps' ? 'auto' : 'none'
              }}
            >
              <MenuItem value={'false'}>{t('createAbonentPetitionPage.notFreeze')}</MenuItem>
              <MenuItem value={'true'}>{t('createAbonentPetitionPage.freeze')}</MenuItem>
            </Select>
            <TextField
              label={t('createAbonentPetitionPage.actAmount')}
              sx={{ margin: '10px 0', display: aktType === 'dvaynik' ? 'none' : 'inline' }}
              value={aktSumma.total}
              disabled
            />
          </div>
        </Grid>
        <Grid item xs={6}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Stack sx={{ display: 'flex', flexDirection: 'column' }}>
              <AccountNumberInput label={t('createAbonentPetitionPage.accountNumber')} value={accountNumber} setFunc={setAccountNumber} />

              <AccountNumberInput
                label={t('createAbonentPetitionPage.dublicateAccountNumber')}
                value={accountNumber2}
                setFunc={setAccountNumber2}
                sx={{ margin: '10px 0', display: aktType === 'dvaynik' ? 'inline' : 'none' }}
              />
            </Stack>
            {aktType === 'dvaynik' && (
              <Tooltip title={t('buttons.swap')}>
                <IconButton onClick={handleSwapIconButtonClick}>
                  <ScreenRotationAlt />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </Grid>
      </Grid>
    </Card>
  );
}

export default InputForm;
