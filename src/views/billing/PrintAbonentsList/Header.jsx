import React, { useEffect } from 'react';
import useStore from './useStore';
import {
  MenuItem,
  Select,
  TextField,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  InputLabel,
  FormControl,
  Box,
  Grid,
  Paper
} from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import TelegramIcon from '@mui/icons-material/Telegram';
import DoneAll from '@mui/icons-material/DoneOutlined';
import PrintIcon from '@mui/icons-material/PrintOutlined';
import { toPng } from 'html-to-image';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import api from 'utils/api';
import { lotinga } from 'helpers/lotinKiril';
import { toast } from 'react-toastify';
import { ClearAll } from '@mui/icons-material';

function Header({ printContentRef, getAbonents, filters, setFilters }) {
  const {
    selectedMahalla,
    setSelectedMahalla,
    mahallas,
    setMahallas,
    abonents,
    mainFunctionsDisabled,
    setMainFunctionsDisabled,
    minSaldo,
    maxSaldo,
    setMinSaldo,
    setMaxSaldo,
    onlyNotIdentited,
    setOnlyNotIdentited,
    etkStatus,
    setEtkStatus
  } = useStore();
  useEffect(() => {
    if (abonents.length > 0) {
      setMainFunctionsDisabled(false);
    } else {
      setMainFunctionsDisabled(true);
    }
  }, [abonents]);

  const printFunction = useReactToPrint({
    pageStyle: `@media print {
      @page {
      margin: 5mm 5mm 5mm 5mm !important;
      size: A4;
      }
      .page {
      page-break-after: always;
      }
      * {
        color: #000
      }
  }`,
    documentTitle: abonents[0]?.mahallaName + '_' + new Date().getTime(),
    contentRef: printContentRef
  });

  const handleClickUpdate = function () {
    getAbonents();
  };

  const handleClickSendTelegramAsImg = async () => {
    if (abonents.length === 0) {
      return toast.error('Xatolik');
    }

    const rows = document.querySelectorAll('.abonent_rows');
    const maxRowsPerImage = 50; // Har bir rasmga sig'adigan maksimal qatorlar
    const tempContainer = document.createElement('div');
    const images = []; // Rasmlarni saqlash uchun array

    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px'; // Ko'rinmas joyda bo'lishi uchun
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    try {
      for (let i = 0; i < rows.length; i += maxRowsPerImage) {
        const clonedTable = printContentRef.current.querySelectorAll('table')[1].cloneNode(true);

        const tbody = clonedTable.querySelector('tbody');

        // Asosiy jadvalning kerakli qismini olish
        const rowsToRender = Array.from(rows).slice(i, i + maxRowsPerImage);
        tbody.innerHTML = ''; // Jadvalni tozalash
        rowsToRender.forEach((row) => tbody.appendChild(row.cloneNode(true)));

        // << BU YERDA BARCHA ELEMENTLARGA QORA RANG BERIB KETAMIZ
        const elements = clonedTable.querySelectorAll('*');
        elements.forEach((el) => {
          el.style.color = '#000';
        });

        // Vaqtinchalik konteynerga jadvalni qo'shish
        tempContainer.appendChild(clonedTable);

        // Rasmga aylantirish
        const dataUrl = await toPng(clonedTable);

        // Base64 formatni blobga aylantirish va arrayga qo'shish
        const blob = await (await fetch(dataUrl)).blob();
        images.push(blob);

        // Qo'shilgan jadvalni konteynerdan o'chirish
        tempContainer.innerHTML = '';
      }

      // Rasmlarni bir so'rovda yuborish
      const formData = new FormData();
      images.forEach((blob, index) => {
        formData.append(`image_${index + 1}`, blob, `abonentlar_${index + 1}.png`);
      });

      // Axios orqali yuborish
      api
        .post('/billing/send-abonents-list-to-telegram', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          params: {
            minSaldo: minSaldo,
            maxSaldo: maxSaldo,
            mahalla_name: abonents[0].mahallaName,
            onlyNotIdentited,
            electricCode: etkStatus
          }
        })
        .then(({ data }) => {
          if (!data.ok) return toast.error(data.message);

          toast.success('Barcha rasmlar muvaffaqiyatli yuborildi!');
        });
    } catch (error) {
      console.error('Rasm yuborishda xatolik:', error);
      toast.error('Rasm yuborishda xatolik yuz berdi.');
    } finally {
      // Vaqtinchalik konteynerni o'chirish
      document.body.removeChild(tempContainer);
    }
  };

  const handleClickDone = function () {
    if (abonents.length === 0) {
      return toast.error('Xatolik');
    }
    api.put('/billing/abarotka-berildi/' + abonents[0].mahallaId).then(({ data }) => {
      if (!data.ok) return toast.error(data.message);
      api.get('/inspectors').then(({ data }) => {
        const mahalllalar = data.mahallalar.map((mfy) => ({ ...mfy, name: lotinga(mfy.name) }));
        setMahallas(mahalllalar);
      });
    });
  };

  const handleClickClearAll = function () {
    if (confirm("Rostdan ham hamma mahallalar abarotka berilganligi haqidagi ma'lumotni tozalamoqchimisiz?")) {
      api.put('/billing/barchasiga-abarotka-berilmadi').then(({ data }) => {
        if (!data.ok) return toast.error(data.message);

        api.get('/inspectors').then(({ data }) => {
          const inspectors = data.rows.map((ins) => ({
            id: ins.id,
            name: ins.name,
            biriktirilgan: ins.biriktirilgan
          }));
          const mahalllalar = data.mahallalar.map((mfy) => ({ ...mfy, name: lotinga(mfy.name) }));
          setMahallas(mahalllalar);
        });
      });
    }
  };
  return (
    <Grid container spacing={2} sx={{ backgroundColor: 'background.paper', zIndex: 100, alignItems: 'center', justifyContent: 'center' }}>
      {/* Filterlar va Uskunalar */}
      <Grid container item xs={10} md={9} spacing={2}>
        {/* Identifikatsiya */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <FormControl fullWidth>
            <InputLabel id="identity">Identifikatsiya</InputLabel>
            <Select
              value={filters.identified}
              labelId="identity"
              label="Identifikatsiya"
              onChange={(e) => setFilters({ ...filters, identified: e.target.value })}
            >
              <MenuItem value="">Hammasi</MenuItem>
              <MenuItem value={'true'}>Identifikatsiyalangan</MenuItem>
              <MenuItem value={'false'}>Identifikatsiyalanmagan</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Elektr holati */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <FormControl fullWidth>
            <InputLabel id="etk-status">Elektr holati</InputLabel>
            <Select
              value={filters.elektrAccountNumberConfirmed}
              labelId="etk-status"
              label="Elektr holati"
              onChange={(e) => setFilters({ ...filters, elektrAccountNumberConfirmed: e.target.value })}
            >
              <MenuItem value="">Hammasi</MenuItem>
              <MenuItem value={'tasdiqlangan'}>Tasdiqlangan</MenuItem>
              <MenuItem value={'tasdiqlanmagan'}>Tasdiqlanmagan</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Qarzdorlik dan */}
        <Grid item xs={6} sm={6} md={4} lg={2}>
          <TextField
            label="dan"
            type="number"
            placeholder="qarzdorlik summasi"
            InputProps={{ inputProps: { step: 100000 } }}
            value={minSaldo}
            onChange={(e) => setMinSaldo(e.target.value)}
            fullWidth
          />
        </Grid>

        {/* Qarzdorlik gacha */}
        <Grid item xs={6} sm={6} md={4} lg={2}>
          <TextField
            label="gacha"
            type="number"
            placeholder="qarzdorlik summasi"
            InputProps={{ inputProps: { step: 100000 } }}
            value={maxSaldo}
            onChange={(e) => setMaxSaldo(e.target.value)}
            fullWidth
          />
        </Grid>

        {/* Mahalla tanlov */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Select value={selectedMahalla} onChange={(e) => setSelectedMahalla(e.target.value)} fullWidth displayEmpty>
            <MenuItem disabled value="0">
              Mahalla
            </MenuItem>
            {mahallas.map((mfy) => (
              <MenuItem key={mfy.id} value={mfy.id}>
                {mfy.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Yangilash tugmasi */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Button onClick={handleClickUpdate} variant="outlined" fullWidth sx={{ height: '100%' }}>
            <SyncOutlinedIcon sx={{ mr: 1 }} /> Yangilash
          </Button>
        </Grid>
      </Grid>

      {/* Telegram va Chop etish */}
      <Grid container item xs={10} md={3} spacing={1}>
        <Grid item xs={12} md={4}>
          <Button disabled={mainFunctionsDisabled} onClick={handleClickSendTelegramAsImg} variant="contained" fullWidth>
            <TelegramIcon sx={{ mr: 1 }} /> yuborish
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button disabled={mainFunctionsDisabled} onClick={printFunction} variant="contained" fullWidth sx={{ textWrap: 'nowrap' }}>
            <PrintIcon sx={{ mr: 1 }} /> Chop etish
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Header;
