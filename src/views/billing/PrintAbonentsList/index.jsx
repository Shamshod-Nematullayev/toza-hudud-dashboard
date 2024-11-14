import React, { useEffect, useRef, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import PrintIcon from '@mui/icons-material/PrintOutlined';
import TelegramIcon from '@mui/icons-material/Telegram';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { toPng } from 'html-to-image';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';
import { createGlobalStyle } from 'styled-components';
import { lotinga } from 'helpers/lotinKiril';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
const CustomStyle = createGlobalStyle`
table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}
.abonent_rows th,
.abonent_rows td {
  border: 1px solid #000;
  white-space: nowrap;
  overflow: hidden;
}
.abonent_rows > td:nth-child(3) {
  text-overflow: ellipsis;
  max-width: 300px;
}
.abonent_rows > td:nth-child(4) {
  text-overflow: ellipsis;
  max-width: 120px;
}
@page {
  size: portrait;
  margin: 15px 15px 10px 15px;
}
`;

function PrintAbonentsList() {
  const { customization } = useCustomizationStore();
  const [mahallas, setMahallas] = useState([]);
  const [selectedMahalla, setSelectedMahalla] = useState(0);
  const [minSaldo, setMinSaldo] = useState(null);
  const [maxSaldo, setMaxSaldo] = useState(null);
  const [inspectors, setInspectors] = useState([]);
  const [abonents, setAbonents] = useState([]);
  const [mainFunctionsDisabled, setMainFunctionsDisabled] = useState(true);
  const printContentRef = useRef(null);
  const date = new Date();

  useEffect(() => {
    api.get('/inspectors').then(({ data }) => {
      const inspectors = data.rows.map((ins) => ({
        id: ins.id,
        name: ins.name,
        biriktirilgan: ins.biriktirilgan
      }));
      setInspectors(inspectors);
      const mahalllalar = data.mahallalar.map((mfy) => ({ ...mfy, name: lotinga(mfy.name) }));
      setMahallas(mahalllalar);
    });
  }, []);

  useEffect(() => {
    if (abonents.length > 0) {
      setMainFunctionsDisabled(false);
    } else {
      setMainFunctionsDisabled(true);
    }
  }, [abonents]);

  const getAbonents = function () {
    if (selectedMahalla == 0) {
      return toast.error('Mahalla tanlanmadi');
    }
    api
      .get('/billing/get-abonents-by-mfy-id/' + selectedMahalla, {
        params: {
          minSaldo,
          maxSaldo
        }
      })
      .then(({ data }) => {
        if (!data.ok) return toast.error(data.message);
        setAbonents(data.data);
      });
  };
  const printFunction = useReactToPrint({
    pageStyle: `@media print {
        @page {
        margin: 15mm 15mm 10mm 15mm;
        size: A4;
        }
        .page {
        page-break-after: always;
        }
    }`,
    documentTitle: 'Printing',
    contentRef: printContentRef
  });

  const handleClickUpdate = function () {
    getAbonents();
  };

  const handleClickSendTelegramAsImg = function () {
    if (abonents.length === 0) {
      return toast.error('Xatolik');
    }
    toPng(printContentRef.current)
      .then((dataUrl) => {})
      .catch((error) => console.error('Error converting HTML to PNG:', error));
  };

  return (
    <MainCard sx={{ height: '85vh' }} contentSX={{ height: '92%' }}>
      <div style={{ marginBottom: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Abonentlar ro'yxatini chop etish</Typography>
        <div style={{ display: 'flex' }}>
          <Select value={selectedMahalla} onChange={(e) => setSelectedMahalla(e.target.value)} sx={{ minWidth: 150 }}>
            <MenuItem disabled value="0">
              Mahalla
            </MenuItem>
            {mahallas.map((mfy) => (
              <MenuItem value={mfy.id}>{mfy.name}</MenuItem>
            ))}
          </Select>
          <TextField
            label="dan"
            type="number"
            placeholder="qarzdorlik summasi"
            sx={{ width: 100 }}
            InputProps={{ inputProps: { step: 100000 } }}
            value={minSaldo}
            onChange={(e) => setMinSaldo(e.target.value)}
          />
          <TextField
            label="gacha"
            type="number"
            placeholder="qarzdorlik summasi"
            sx={{ width: 100 }}
            InputProps={{ inputProps: { step: 1000 } }}
            value={maxSaldo}
            onChange={(e) => setMaxSaldo(e.target.value)}
          />
          <Button onClick={handleClickUpdate}>
            <SyncOutlinedIcon /> Yangilash
          </Button>
        </div>

        <div></div>
        <div>
          <Button disabled={mainFunctionsDisabled} onClick={printFunction}>
            <PrintIcon /> Chop etish
          </Button>
          <Button disabled={mainFunctionsDisabled}>
            <TelegramIcon /> Telegramga yuborish
          </Button>
          <Button disabled={mainFunctionsDisabled}>
            <PictureAsPdfIcon /> PDF formatida yuborish
          </Button>
        </div>
        <div></div>
      </div>
      <Divider />

      <CustomStyle />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', height: '100%' }}>
        <div style={{ height: '100%' }}>
          <Typography sx={{ fontWeight: '700' }}>Topshirilishi kerak</Typography>
          <List sx={{ margin: '0 25px 0 0', height: '95%', overflow: 'auto', maxWidth: 200 }}>
            {mahallas
              .filter((mfy) => mfy.reja > 0 && !mfy.abarotka_berildi)
              .map((item) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => ''}>
                      <PrintIcon sx={{ color: customization.mode === 'dark' ? 'primary.light' : 'primary.main' }} />
                    </IconButton>
                  }
                >
                  {item.name}
                </ListItem>
              ))}
          </List>
        </div>

        <Card sx={{ boxShadow: '5', minWidth: 800, overflowY: 'auto' }}>
          <CardContent>
            <table ref={printContentRef}>
              <thead>
                <tr>
                  <td colSpan={7}>
                    <i>Oliy Ong</i>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: 16 }} colSpan={7}>
                    Сана: {date.getDate()}.{date.getMonth() + 1}.{date.getFullYear()}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: 16 }} colSpan={7}>
                    Каттақўрғон туман / "ANVARJON BIZNES INVEST" MCHJ
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: 16 }} colSpan={7}>
                    Махалла: {abonents[0]?.mahallaName}
                  </td>
                </tr>
              </thead>
              <tbody>
                {/* Asosiy abonentlar ma'lumotlari yoziladigan joy */}
                <tr className="abonent_rows" style={{ border: '1px solid black' }}>
                  <th>№</th>
                  <th>Лицавой</th>
                  <th>ФИО</th>
                  <th style={{ width: 100 }}>Кўча</th>
                  <th>Я/с</th>
                  <th>Қарздор</th>
                  <th colSpan={2}>Охирги тўлов</th>
                  <th>ЭТК</th>
                </tr>
                {abonents.map((abonent, i) => (
                  <tr className="abonent_rows" style={{ border: '1px solid black' }} key={abonent.id}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>{abonent.accountNumber}</td>
                    <td>{abonent.fullName.length < 30 ? abonent.fullName : abonent.fullName.slice(0, 30) + '..'}</td>
                    <td>{abonent.streetName}</td>
                    <td style={{ textAlign: 'center' }}>{abonent.inhabitantCnt}</td>
                    <td style={{ textAlign: 'right' }}>{Math.floor(Number(abonent.ksaldo)).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>{abonent.lastPaymentAmount}</td>
                    <td>{abonent.lastPayDate}</td>
                    <td
                      style={{
                        textDecoration: abonent.isElektrKodConfirm ? 'line-through' : 'none'
                      }}
                    >
                      {abonent.electricityAccountNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <div style={{ height: '100%' }}>
          <Typography sx={{ fontWeight: '700' }}>Ro'yxati topshirilgan</Typography>
          <List sx={{ margin: '0 25px 0 0', height: '95%', overflow: 'auto', maxWidth: 200 }}>
            {mahallas
              .filter((mfy) => mfy.reja > 0 && mfy.abarotka_berildi)
              .map((item) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => ''}>
                      <DeleteIcon sx={{ color: customization.mode === 'dark' ? 'error.light' : 'error.main' }} />
                    </IconButton>
                  }
                >
                  {item.name}
                </ListItem>
              ))}
          </List>
        </div>
      </div>
    </MainCard>
  );
}

export default PrintAbonentsList;
