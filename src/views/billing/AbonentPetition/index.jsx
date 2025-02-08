import { Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';
import useArizaStore from './useStore';

function AbonentPetition() {
  const { ariza_id } = useParams();
  const { setIsLoading } = useLoaderStore();
  const [aktFileURL, setAktFileURL] = useState(null);
  const { setAriza } = useArizaStore();
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const ariza = (await api.get(`/arizalar/${ariza_id}`)).data.ariza;
        const base64File = (
          await api.get('/billing/get-file/', {
            params: { file_id: ariza.aktInfo.fileId }
          })
        ).data.file;
        const davriyHarakatlarJadvali = await api.get('/billing/get-abonent-dxj-by-id/' + ariza.abonentId);
        const abonentActs = await api.get('/billing/get-abonent-acts/' + ariza.abonentId);

        setAktFileURL(base64File); // Base64 ni iframe ga joylaymiz
        setAriza(ariza); // Ariza data ni storega joylaymiz
      } catch (error) {
        console.log(error);
        toast.error('Xatolik kuzatildi');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} sm={5} sx={{ height: 'calc(100vh - 160px)' }}>
          <iframe src={aktFileURL} frameBorder="0" width="100%" height="100%"></iframe>
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default AbonentPetition;
