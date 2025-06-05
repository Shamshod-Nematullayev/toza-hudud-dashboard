import React, { useEffect, useState } from 'react';
import { Alert, Card, Grid, Typography } from '@mui/material';
import PdfViewer from 'views/billing/AbonentPetition/PDFViewer';
import api from 'utils/api';
import { useParams } from 'react-router-dom';
import DavriyHarakatlarJadvali from './DavriyHarakatlarJadvali';
import CalculatorInput from 'ui-component/CalculatorInput';
import { DatePicker } from '@mui/x-date-pickers';
import Calculators from './Calculators';
import KeyValue from 'ui-component/KeyValue';
import MainCard from 'ui-component/cards/MainCard';
import { padding } from '@mui/system';
import useLoaderStore from 'store/loaderStore';

function ActCkeck() {
  const [fileUrl, setFileUrl] = useState('');
  const [act, setAct] = useState({});
  const [davriyHarakatlarJadvali, setDavriyHarakatlarJadvali] = useState([]);
  const { actId } = useParams();
  const { setIsLoading } = useLoaderStore();

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/acts/' + actId, { params: { companyId: 1144 } })
      .then((res) => {
        setAct(res.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [actId]);
  useEffect(() => {
    if (act.fileId) {
      api
        .get(`/acts/pdf`, {
          responseType: 'blob',
          params: {
            fileId: act.fileId.split('*').pop(),
            companyId: 1144
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
        <Card bgcolor={'background.paper'} sx={{ margin: '5px 0', padding: '0 10px' }}>
          <KeyValue kalit={'F. I. Sh'} value={act.residentFullName} />
          <KeyValue kalit={'Akt izohi'} value={act.description} />
        </Card>
      </Grid>
      <Grid item xs={7}>
        <Card bgcolor={'background.paper'} sx={{ minHeight: 'calc(100vh - 210px)', display: 'flex', padding: '5px 0' }}>
          <DavriyHarakatlarJadvali rows={davriyHarakatlarJadvali} act={act} setAct={setAct} />
          <Calculators act={act} />
        </Card>
      </Grid>
    </Grid>
  );
}

export default ActCkeck;
