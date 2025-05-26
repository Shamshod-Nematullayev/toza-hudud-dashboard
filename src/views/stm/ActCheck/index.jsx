import React, { useEffect, useState } from 'react';
import { Alert, Grid } from '@mui/material';
import PdfViewer from 'views/billing/AbonentPetition/PDFViewer';
import api from 'utils/api';
import { useParams } from 'react-router-dom';

function ActCkeck() {
  const [fileUrl, setFileUrl] = useState('');
  const [act, setAct] = useState({});
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
    }
  }, [act]);
  return (
    <Grid container spacing={1}>
      <Grid item xs={5}>
        <div style={{ height: 'calc(100vh - 210px)' }}>
          <PdfViewer base64String={fileUrl} />
        </div>
        <div></div>
      </Grid>
    </Grid>
  );
}

export default ActCkeck;
