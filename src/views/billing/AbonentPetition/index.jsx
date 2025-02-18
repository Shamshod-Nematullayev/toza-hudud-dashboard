import { Grid, List, ListItem, Tab, Tabs } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';
import useArizaStore from './useStore';
import DHJTable from './DHJTable';
import AktInfoCard from './AktInfoCard';
import AktChangerModal from './AktChangerModal';
import Recalculate from '../../../ui-component/cards/RecalculatorAbonent';
import PDFViewer from './PDFViewer';
import PasteImageDialog from '../CreateAbonentPetition.jsx/PasteImageDialog';

function AbonentPetition() {
  const { ariza_id } = useParams();
  const { setIsLoading } = useLoaderStore();
  const { setAriza, aktFileURL, setAktFileURL, showModal, setShowModal, pasteImgModalOpen, setPasteImgModalOpen } = useArizaStore();
  const [davriyHarakatlarJadvali, setDavriyHarakatlarJadvali] = useState([]);
  const [currentTab, setCurrentTab] = useState('AktInfoCard');
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
        setDavriyHarakatlarJadvali(
          davriyHarakatlarJadvali.data?.rows.map((row, i) => ({
            id: i + 1,
            hisoblandi: row.accrual,
            davr: row.period,
            tushum: row.allPaymentsSum,
            act: row.actAmount,
            saldo_oxiri: row.kSaldo
          }))
        ); // Davriy harakatlar jadvalini storega joylaymiz
      } catch (error) {
        console.log(error);
        toast.error('Xatolik kuzatildi');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const onCloseModal = async () => {
    setShowModal(false);
  };
  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        {showModal && <AktChangerModal onClose={onCloseModal} />}
        <PasteImageDialog open={pasteImgModalOpen} setOpen={setPasteImgModalOpen} />
        <Grid item xs={12} sm={4}>
          <DHJTable rows={davriyHarakatlarJadvali} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab value="AktInfoCard" label="Akt Ma'lumotlari" />
            <Tab value="CalculatorCard" label="Kalkulyator" />
          </Tabs>
          {currentTab === 'AktInfoCard' && <AktInfoCard />}
          {currentTab === 'CalculatorCard' && <Recalculate />} {/* Calculator */}
        </Grid>

        <Grid item xs={12} sm={4} sx={{ height: 'calc(100vh - 160px)' }}>
          {/* <iframe src={aktFileURL} frameBorder="0" width="100%" height="100%"></iframe> */}
          <PDFViewer base64String={aktFileURL} />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default AbonentPetition;
