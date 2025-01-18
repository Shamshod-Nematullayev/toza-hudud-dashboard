import { Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from 'utils/api';
import useStore from './useStore';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import KeyValue from 'ui-component/KeyValue';

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
    setMuzlatiladi
  } = useStore();
  const [licshet, setLicshet] = useState('');
  const [dublicateLicshet, setDublicateLicshet] = useState('');
  const [aktSumma, setAktSummaInput] = useState({ total: 0, totalWithQQS: 0, withoutQQSTotal: 0 });

  useEffect(() => {
    if (muzlatiladi) {
      setYashovchiSoniInput(0);
    } else {
      setYashovchiSoniInput(abonentData.house?.inhabitantCnt);
    }
  }, [muzlatiladi]);

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

  const handleCreateAktButtonClick = (e) => {
    if (aktType === 'odam_soni' && yashovchiSoniInput === '') {
      return toast.error('Yashovchi soniga qiymat kiritilmadi');
    }
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
    function testApi() {
      return new Promise((resolve) =>
        resolve({
          data: {
            ok: true,
            ariza: {
              _id: {
                $oid: '6764fbb0759b9bd6e4e47a21'
              },
              asosiy_licshet: '105120800305',
              sana: {
                $date: '2024-12-20T05:08:00.478Z'
              },
              document_type: 'gps',
              document_number: 813,
              licshet: '105120800305',
              comment: "Davr: 06.2023 - 11.2024, Summa: 283636\n\nUmumiy yig'indisi: 283636",
              aktSummasi: 283636,
              aktSummCounts: {
                total: 283636,
                totalWithQQS: 147972,
                withoutQQSTotal: 135664
              },
              current_prescribed_cnt: 4,
              next_prescribed_cnt: 0,
              status: 'yangi',
              is_canceled: false,
              photos: ['BQACAgIAAx0EXWkC5gACDMlnZPt5J7npWEdXp5s3hV6Jn7TCkQACEF0AAi7WKEu0RK4SeIpwuDYE'],
              __v: 0
            }
          }
        })
      );
    }
    api
      .post('/arizalar/create', {
        licshet,
        ikkilamchi_licshet: abonentData2.accountNumber,
        document_type: aktType,
        akt_summasi: aktSumma,
        current_prescribed_cnt: abonentData.house.inhabitantCnt,
        next_prescribed_cnt: yashovchiSoniInput,
        comment: generateSummary(recalculationPeriods),
        photos: images.map((img) => img.document_id),
        recalculationPeriods,
        muzlatiladi
      })
      // testApi()
      .then((res) => {
        if (!res.data.ok) {
          toast.error(res.data.message);
          return;
        }
        setAriza(res.data.ariza);
        api.get('/billing/get-mfy-by-id/' + abonentData.mahallaId).then(({ data }) => {
          if (!data.ok) {
            toast.error(data.message);
            return;
          }
          setMahalla(data.data);

          if (aktType === 'dvaynik') {
            api.get('/billing/get-mfy-by-id/' + abonentData2.mahallaId).then(({ data }) => {
              if (!data.ok) {
                toast.error(data.message);
                return;
              }
              setMahallaDublicat(data.data);
              setShowPrintSection(true);
            });
          } else {
            setShowPrintSection(true);
          }
        });
      });
  };

  const handleClearButtonClick = (e) => {
    setLicshet('');
    setDublicateLicshet('');
    setAbonentData({});
    setAbonentData2({});
    setYashovchiSoniInput('');
    setAktSummaInput('');
    setRecalculationPeriods([]);
  };

  return (
    <div style={{ margin: '25px', width: '25%', borderRight: '1px solid #ccc' }}>
      <div style={{ height: 200, display: 'flex' }}>
        <div style={{ margin: 'auto 20px', width: 190, display: 'flex', flexDirection: 'column' }}>
          <Select value={aktType} onChange={(e) => setAktType(e.target.value)}>
            <MenuItem value="odam_soni">Odam soni</MenuItem>
            <MenuItem value="viza">Pasport viza</MenuItem>
            <MenuItem value="death">O'lim guvohnoma</MenuItem>
            <MenuItem value="dvaynik">Ikkilamchi kod</MenuItem>
            <MenuItem value="gps">Texnika bormagan</MenuItem>
          </Select>
          <TextField
            label="Yashovchi soni"
            sx={{ margin: '10px 0', display: aktType === 'dvaynik' || aktType === 'viza' || aktType === 'gps' ? 'none' : 'inline' }}
            value={yashovchiSoniInput}
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
            <MenuItem value={false}>Endi xizmat ko'rsatadi</MenuItem>
            <MenuItem value={true}>Muzlatish</MenuItem>
          </Select>
          <TextField
            label="Aktlar summasi"
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
        <div style={{ margin: 'auto 20px', width: 190, display: 'flex', flexDirection: 'column' }}>
          <AccountNumberInput label="Hisob raqam" value={licshet} setFunc={setLicshet} />

          <AccountNumberInput
            label="Ikkilamchi kod"
            value={dublicateLicshet}
            setFunc={setDublicateLicshet}
            sx={{ margin: '10px 0', display: aktType === 'dvaynik' ? 'inline' : 'none' }}
          />
        </div>
      </div>
      <div style={{ margin: 'auto 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Button
            variant="contained"
            color={'primary'}
            sx={{ margin: '10px 20px' }}
            disabled={
              !abonentData.accountNumber || (aktType == 'dvaynik' && !abonentData2.accountNumber) || (aktType == 'gps' && !images.length)
            }
            onClick={handleCreateAktButtonClick}
          >
            Yaratish
          </Button>
          <Button color="success" sx={{ margin: '10px 20px' }} variant="outlined" onClick={() => setPasteImageDialogOpen(true)}>
            Rasm qo'shish
          </Button>
          <Button variant="outlined" color={'error'} sx={{ margin: '10px 0' }} onClick={handleClearButtonClick}>
            Tozalash
          </Button>
        </div>
      </div>
      {abonentData.accountNumber && (
        <div>
          <KeyValue kalit="Licshet" value={abonentData.accountNumber} />
          <KeyValue kalit="F. I. Sh" value={abonentData.fullName} />
          <KeyValue kalit="Mahalla" value={abonentData.mahallaName} />
          <KeyValue kalit="Yashovchi soni" value={abonentData.house.inhabitantCnt} />
        </div>
      )}
      {abonentData2.accountNumber && (
        <div>
          <KeyValue kalit="Ikkilamchi" value={abonentData2.accountNumber} />
          <KeyValue kalit="F. I. Sh" value={abonentData2.fullName} />
          <KeyValue kalit="Mahalla" value={abonentData2.mahallaName} />
          <KeyValue kalit="Yashovchi soni" value={abonentData2.house.inhabitantCnt} />
        </div>
      )}
    </div>
  );
}

export default InputForm;
