import { Button, Grid, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { useStore } from './useStore';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import KeyValue from 'ui-component/KeyValue';
import useLoaderStore from 'store/loaderStore';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { documentTypes } from 'store/constant';

// helpers
function generateSummary(data) {
  function formatDateToMMYYYY(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}.${year}`;
  }
  // Har bir elementni matn shaklida formatlash
  const details = data
    .map((item) => `Davr: ${formatDateToMMYYYY(item.startDate)} - ${formatDateToMMYYYY(item.endDate)}, Summa: ${item.total}`)
    .join('\n'); // Har bir elementni yangi qatorga joylash

  // Umumiy yig'indini hisoblash

  const totalSum = data.reduce((total, item) => total + item.total, 0);

  // Yakuniy matnni yaratish
  return `${details}\n\nUmumiy yig'indisi: ${totalSum}`;
}

function validateCreateAct({ aktType, inhabitantCnt }) {
  if (aktType === 'odam_soni' && (inhabitantCnt === '' || isNaN(inhabitantCnt))) {
    return toast.error(i18next.t('createAbonentPetitionPage.notEnteredInhabitantCnt'));
  }
}

function InputForm() {
  const {
    aktType,
    setAktType,
    abonentData,
    setAbonentData,
    abonentData2,
    setAbonentData2,
    recalculationPeriods,
    setShowPrintSection,
    setMahalla,
    setMahallaDublicat,
    setAriza,
    setRecalculationPeriods,
    yashovchiSoniInput,
    setYashovchiSoniInput,
    setPasteImageDialogOpen,
    images,
    muzlatiladi,
    setMuzlatiladi,
    setImages
  } = useStore();
  const { isLoading, setIsLoading } = useLoaderStore();
  const [licshet, setLicshet] = useState('');
  const [dublicateLicshet, setDublicateLicshet] = useState('');
  const [aktSumma, setAktSummaInput] = useState({ total: 0, totalWithQQS: 0, withoutQQSTotal: 0 });
  const { t } = useTranslation();

  useEffect(() => {
    if (muzlatiladi) {
      setYashovchiSoniInput(0);
    } else {
      setYashovchiSoniInput(abonentData.house?.inhabitantCnt - 1);
    }
  }, [muzlatiladi]);

  useEffect(() => {
    if (aktType === 'death') {
      setYashovchiSoniInput(abonentData?.house?.inhabitantCnt - 1);
    }
  }, [aktType, abonentData]);

  useEffect(() => {
    let total = 0;
    let totalWithQQS = 0;
    let withoutQQSTotal = 0;
    recalculationPeriods.forEach((period) => {
      total += period.total;
      totalWithQQS += period.withQQSTotal;
      withoutQQSTotal += period.withoutQQSTotal;
    });
    setAktSummaInput({
      total,
      totalWithQQS,
      withoutQQSTotal
    });
  }, [recalculationPeriods]);
  useEffect(() => {
    if (licshet.length === 12) {
      async function fetchData() {
        const { data } = await api.get('/billing/get-abonent-data-by-licshet/' + licshet);
        if (!data.ok) {
          toast.error(data.message);
          return;
        }
        setAbonentData(data.abonentData);
      }
      fetchData();
    } else {
      if (abonentData.licshet) setAbonentData({});
    }
  }, [licshet]);
  useEffect(() => {
    if (dublicateLicshet.length === 12) {
      async function fetchData() {
        const { data } = await api.get('/billing/get-abonent-data-by-licshet/' + dublicateLicshet);
        if (!data.ok) {
          toast.error(data.message);
          return;
        }
        setAbonentData2(data.abonentData);
      }
      fetchData();
    } else {
      if (abonentData2.licshet) setAbonentData2({});
    }
  }, [dublicateLicshet]);

  const handleCreateAktButtonClick = async (e) => {
    validateCreateAct({ aktType, inhabitantCnt: yashovchiSoniInput });
    setIsLoading(true);
    try {
      const newArizaData = (
        await api.post('/arizalar/create', {
          account_number: licshet,
          ikkilamchi_licshet: abonentData2.accountNumber,
          document_type: aktType,
          akt_summasi: {
            total: aktSumma.total,
            withQQSTotal: aktSumma.totalWithQQS,
            withoutQQSTotal: aktSumma.withoutQQSTotal
          },
          current_prescribed_cnt: abonentData.house.inhabitantCnt,
          next_prescribed_cnt: isNaN(yashovchiSoniInput) && aktType == 'gps' ? abonentData.house.inhabitantCnt : yashovchiSoniInput,
          comment: generateSummary(recalculationPeriods),
          photos: images.map((img) => img.document_id),
          recalculationPeriods,
          muzlatiladi
        })
      ).data;

      if (!newArizaData.ok) return toast.error(newArizaData.message);

      setAriza(newArizaData.ariza);

      const mahallaData = (await api.get('/billing/get-mfy-by-id/' + abonentData.mahallaId)).data;
      setMahalla(mahallaData);

      // agarda ikkilamchi akt bo'lsa ikkilamchi kod joylashgan mahalla ma'lumotlari ham olinadi
      if (aktType === 'dvaynik') {
        const dublicatAccountMahalla = (await api.get('/billing/get-mfy-by-id/' + abonentData2.mahallaId)).data;
        setMahallaDublicat(dublicatAccountMahalla);
      }
      setShowPrintSection(true);
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearButtonClick = (e) => {
    setLicshet('');
    setDublicateLicshet('');
    setAbonentData({});
    setAbonentData2({});
    setYashovchiSoniInput('');
    setAktSummaInput('');
    setRecalculationPeriods([]);
    setImages([]);
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={6}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Select value={aktType} onChange={(e) => setAktType(e.target.value)}>
            {documentTypes.map((item) => (
              <MenuItem key={item} value={item}>
                {t(`documentTypes.${item}`)}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label={t('createAbonentPetitionPage.inhabitantCnt')}
            sx={{ margin: '10px 0', display: aktType === 'dvaynik' || aktType === 'viza' || aktType === 'gps' ? 'none' : 'inline' }}
            value={yashovchiSoniInput}
            disabled={aktType === 'death'}
            onChange={(e) => {
              if (!isNaN(e.target.value)) {
                setYashovchiSoniInput(e.target.value);
              }
            }}
          />
          <Select
            value={muzlatiladi}
            onChange={(e) => setMuzlatiladi(e.target.value)}
            sx={{
              display: aktType === 'gps' ? 'auto' : 'none'
            }}
          >
            <MenuItem value={false}>{t('createAbonentPetitionPage.notFreeze')}</MenuItem>
            <MenuItem value={true}>{t('createAbonentPetitionPage.freeze')}</MenuItem>
          </Select>
          <TextField
            label={t('createAbonentPetitionPage.actAmount')}
            sx={{ margin: '10px 0', display: aktType === 'dvaynik' ? 'none' : 'inline' }}
            value={aktSumma.total}
            disabled
            onChange={(e) => {
              if (!isNaN(e.target.value)) {
                setAktSummaInput(e.target.value);
              }
            }}
          />
        </div>
      </Grid>
      <Grid item xs={6}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <AccountNumberInput label={t('createAbonentPetitionPage.accountNumber')} value={licshet} setFunc={setLicshet} />

          <AccountNumberInput
            label={t('createAbonentPetitionPage.dublicateAccountNumber')}
            value={dublicateLicshet}
            setFunc={setDublicateLicshet}
            sx={{ margin: '10px 0', display: aktType === 'dvaynik' ? 'inline' : 'none' }}
          />
        </div>
      </Grid>
      <Grid item xs={4}>
        <Button
          variant="contained"
          color={'primary'}
          disabled={
            !abonentData.accountNumber || (aktType == 'dvaynik' && !abonentData2.accountNumber) || (aktType == 'gps' && !images.length)
          }
          onClick={handleCreateAktButtonClick}
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
        <Grid item xs={4}>
          <Button color="success" variant="outlined" onClick={() => setPasteImageDialogOpen(true)}>
            {t('buttons.addImage')}
          </Button>{' '}
        </Grid>
      )}

      {abonentData.accountNumber && (
        <div>
          <KeyValue kalit={t('createAbonentPetitionPage.accountNumber')} value={abonentData.accountNumber} />
          <KeyValue kalit={t('tableHeaders.fullName')} value={abonentData.fullName} />
          <KeyValue kalit={t('tableHeaders.mfy')} value={abonentData.mahallaName} />
        </div>
      )}
      {abonentData2.accountNumber && (
        <div>
          <KeyValue kalit={t('createAbonentPetitionPage.dublicateAccountNumber')} value={abonentData2.accountNumber} />
          <KeyValue kalit={t('tableHeaders.fullName')} value={abonentData2.fullName} />
          <KeyValue kalit={t('tableHeaders.mfy')} value={abonentData2.mahallaName} />
        </div>
      )}
    </Grid>
  );
}

export default InputForm;
