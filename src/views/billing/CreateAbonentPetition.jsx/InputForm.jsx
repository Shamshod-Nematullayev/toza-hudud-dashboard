import { Button, FormControl, MenuItem, Select, TextField, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from 'utils/api';
import useStore from './useStore';

function KeyValue({ kalit, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', margin: '20px 0', borderBottom: '1px solid #ccc' }}>
      <Typography variant="subtitle1" className="key">
        <div>{kalit} :</div>
      </Typography>
      <Typography className="value">{value}</Typography>
    </div>
  );
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
    setMahallaDublicat
  } = useStore();
  const [licshet, setLicshet] = useState('');
  const [dublicateLicshet, setDublicateLicshet] = useState('');
  const [yashovchiSoniInput, setYashovchiSoniInput] = useState('');
  const [aktSumma, setAktSummaInput] = useState({ total: 0, totalWithQQS: 0, withoutQQSTotal: 0 });
  const inputRef = React.useRef(null);
  const dublicateLicshetInput = React.useRef(null);
  const [aktSummaInputDisabled, setAktSummaInputDisabled] = useState(true);

  useEffect(() => {
    if (String(licshet).length === 12) {
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
      setAbonentData({});
    }
  }, [licshet]);

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
    if (String(dublicateLicshet).length === 12) {
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
      setAbonentData2({});
    }
  }, [dublicateLicshet]);

  const handleFocus = (e, type) => {
    if (!e.target.value) {
      const defaultValue = 105120;
      if (type === 'licshet') {
        setLicshet(defaultValue);
        // Wait until the value is set before placing the cursor at the end
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(defaultValue.toString().length, defaultValue.toString().length);
          }
        }, 0);
      }
      if (type === 'dublicat') {
        setDublicateLicshet(defaultValue);
        // Wait until the value is set before placing the cursor at the end
        setTimeout(() => {
          if (dublicateLicshetInput.current) {
            dublicateLicshetInput.current.setSelectionRange(defaultValue.toString().length, defaultValue.toString().length);
          }
        }, 0);
      }
    }
  };

  const handleChangeLicshet = (e, type) => {
    if (!isNaN(e.target.value)) {
      if (type === 'licshet') {
        setLicshet(e.target.value);
      }
      if (type === 'dublicat') {
        setDublicateLicshet(e.target.value);
      }
    }
  };

  const handleGetAktSummButtonClick = (e) => {
    if (aktType === 'odam_soni' && yashovchiSoniInput === '') {
      return toast.error('Yashovchi soniga qiymat kiritilmadi');
    }
    api.get('/billing/get-mfy-by-id/' + abonentData.mahallas_id).then(({ data }) => {
      if (!data.ok) {
        toast.error(data.message);
        return;
      }
      setMahalla(data.data);

      if (aktType === 'dvaynik') {
        api.get('/billing/get-mfy-by-id/' + abonentData2.mahallas_id).then(({ data }) => {
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
  };

  const handleClearButtonClick = (e) => {
    setLicshet('');
    setDublicateLicshet('');
    setAbonentData({});
    setAbonentData2({});
    setYashovchiSoniInput('');
    setAktSummaInput('');
  };

  return (
    <div style={{ margin: '25px', width: '25%', borderRight: '1px solid #ccc' }}>
      <div style={{ height: 200, display: 'flex' }}>
        <FormControl sx={{ margin: 'auto 20px', width: 190 }}>
          <Select value={aktType} onChange={(e) => setAktType(e.target.value)}>
            <MenuItem value="odam_soni">Odam soni</MenuItem>
            <MenuItem value="viza">Pasport viza</MenuItem>
            <MenuItem value="death">O'lim guvohnoma</MenuItem>
            <MenuItem value="dvaynik">Ikkilamchi kod</MenuItem>
          </Select>
          <TextField
            label="Yashovchi soni"
            sx={{ margin: '10px 0', display: aktType === 'dvaynik' || aktType === 'viza' ? 'none' : 'inline' }}
            value={yashovchiSoniInput}
            onChange={(e) => {
              if (!isNaN(e.target.value)) {
                setYashovchiSoniInput(e.target.value);
              }
            }}
          />
          <TextField
            label="Aktlar summasi"
            sx={{ margin: '10px 0', display: aktType === 'dvaynik' ? 'none' : 'inline' }}
            value={aktSumma.total}
            disabled={aktSummaInputDisabled}
            onChange={(e) => {
              if (!isNaN(e.target.value)) {
                setAktSummaInput(e.target.value);
              }
            }}
          />
        </FormControl>
        <FormControl sx={{ margin: 'auto 20px', width: 190 }}>
          <TextField
            label="Hisob raqam"
            inputRef={inputRef}
            type="text"
            value={licshet}
            inputProps={{ maxLength: 12 }}
            onChange={(e) => handleChangeLicshet(e, 'licshet')}
            onFocus={(e) => handleFocus(e, 'licshet')}
            onBlur={(e) => {
              if (e.target.value == 105120) {
                setLicshet('');
              }
            }}
          />
          <TextField
            label="Ikkilamchi kod"
            inputRef={dublicateLicshetInput}
            sx={{ margin: '10px 0', display: aktType === 'dvaynik' ? 'inline' : 'none' }}
            value={dublicateLicshet}
            onChange={(e) => handleChangeLicshet(e, 'dublicat')}
            onFocus={(e) => handleFocus(e, 'dublicat')}
            onBlur={(e) => {
              if (e.target.value == 105120) {
                setDublicateLicshet('');
              }
            }}
          />
        </FormControl>
      </div>
      <div style={{ margin: 'auto 20px' }}>
        <FormControl sx={{ display: 'flex', flexDirection: 'row' }}>
          <Button
            variant="contained"
            color={'primary'}
            sx={{ margin: '10px 20px' }}
            disabled={!abonentData.licshet || (aktType == 'dvaynik' && !abonentData2.licshet)}
            onClick={handleGetAktSummButtonClick}
          >
            Yaratish
          </Button>
          <Button variant="outlined" color={'error'} sx={{ margin: '10px 0' }} onClick={handleClearButtonClick}>
            Tozalash
          </Button>
        </FormControl>
      </div>
      {abonentData.licshet && (
        <div>
          <KeyValue kalit="Licshet" value={abonentData.licshet} />
          <KeyValue kalit="F. I. Sh" value={abonentData.fio} />
          <KeyValue kalit="Mahalla" value={abonentData.mahalla_name} />
          <KeyValue kalit="Yashovchi soni" value={abonentData.yashovchiSoni} />
        </div>
      )}
      {abonentData2.licshet && (
        <div>
          <KeyValue kalit="Ikkilamchi" value={abonentData2.licshet} />
          <KeyValue kalit="F. I. Sh" value={abonentData2.fio} />
          <KeyValue kalit="Mahalla" value={abonentData2.mahalla_name} />
          <KeyValue kalit="Yashovchi soni" value={abonentData2.yashovchiSoni} />
        </div>
      )}
    </div>
  );
}

export default InputForm;
