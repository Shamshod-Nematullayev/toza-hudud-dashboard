import { Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';

function AbonentPetition() {
  const { ariza_id } = useParams();
  const [aktFileURL, setAktFileURL] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const ariza = (await api.get('/arizalar/' + ariza_id)).data.ariza;
        const aktFile = (
          await api.get('/billing/get-file/', {
            params: {
              file_id: ariza.aktInfo.fileId
            }
          })
        ).data;
        const url = URL.createObjectURL(aktFile);
        setAktFileURL(url);
      } catch (error) {
        console.log(error);
        toast.error('Xatolik kuzatildi');
      }
    }
    fetchData();
  }, []);
  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs="12" sm="5" sx={{ height: 'calc(100vh - 160px)' }}>
          <iframe src={aktFileURL} frameborder="0" width="100%" height="100%"></iframe>
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default AbonentPetition;
