import React, { useEffect, useState } from 'react';
import { Alert, Card, Grid, Typography } from '@mui/material';
import PdfViewer from 'views/billing/AbonentPetition/PDFViewer';
import api from 'utils/api';
import { useParams } from 'react-router-dom';
import DavriyHarakatlarJadvali from './DavriyHarakatlarJadvali';
import CalculatorInput from 'ui-component/CalculatorInput';
import { DatePicker } from '@mui/x-date-pickers';
import Calculators from './Calculators';

function ActCkeck() {
  const [fileUrl, setFileUrl] = useState('');
  const [act, setAct] = useState({});
  const [davriyHarakatlarJadvali, setDavriyHarakatlarJadvali] = useState([]);
  const { actId } = useParams();

  useEffect(() => {
    api.get('/acts/' + actId).then((res) => {
      setAct(res.data);
    });
  }, []);
  useEffect(() => {
    if (act.fileId) {
      api
        .get(`/acts/pdf`, {
          responseType: 'blob',
          params: {
            fileId: act.fileId.split('*').pop()
          }
        })
        .then((res) => {
          const base64 = URL.createObjectURL(res.data);
          setFileUrl(base64);
        });
      api.get('/billing/get-abonent-dxj-by-id/' + act.residentId).then(({ data }) => {
        setDavriyHarakatlarJadvali(
          data.rows.map((row, i) => ({
            id: i + 1,
            hisoblandi: row.accrual,
            davr: row.period,
            tushum: row.allPaymentsSum,
            act: row.actAmount,
            saldo_oxiri: row.kSaldo,
            yashovchilar_soni: row.inhabitantCount
          }))
        );
      });
    }
  }, [act]);
  return (
    <Grid container spacing={1}>
      <Grid item xs={5}>
        <div style={{ height: 'calc(100vh - 210px)' }}>
          <PdfViewer base64String={fileUrl} />
        </div>
        <div>Details</div>
      </Grid>
      <Grid item xs={7}>
        <Card bgcolor={'background.paper'} sx={{ height: 'calc(100vh - 210px)', display: 'flex', padding: '5px 0' }}>
          <DavriyHarakatlarJadvali rows={davriyHarakatlarJadvali} />
          <Calculators act={act} />
        </Card>
      </Grid>
    </Grid>
  );
}

export default ActCkeck;
