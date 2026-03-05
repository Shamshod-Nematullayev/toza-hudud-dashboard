import React, { useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PrintSection from './PrintSection';
import InputForm from './InputForm';
import DHJTable from './DHJTable';
import Recalculate from '../../../ui-component/cards/RecalculatorAbonent';
import { useStore } from './useStore';
import PasteImageDialog from './PasteImageDialog';
import { useLocation } from 'react-router-dom';
import { Box, Card, Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CreateArizaStepperForm from './CreateArizaStepper/CreateArizaStepperForm';

function CreateAbonentPetition() {
  const {
    aktType,
    abonentData,
    abonentData2,
    showPrintSection,
    setShowPrintSection,
    mahalla,
    mahallaDublicat,
    yashovchiSoniInput,
    setInitialState,
    ariza,
    muzlatiladi,
    recalculationPeriods,
    pasteImageDialogOpen,
    setPasteImageDialogOpen
  } = useStore();
  const { t } = useTranslation();
  const location = useLocation();
  const theme = useTheme();
  useEffect(() => {
    setInitialState();
  }, [location]);
  return (
    <div>
      <PrintSection
        show={showPrintSection}
        aniqlanganYashovchiSoni={parseInt(yashovchiSoniInput)}
        abonentData={abonentData}
        abonentData2={abonentData2}
        documentType={aktType}
        mahalla={mahalla}
        mahalla2={mahallaDublicat}
        ariza={ariza}
        setShowPrintSection={setShowPrintSection}
        muzlatiladi={muzlatiladi}
        recalculationPeriods={recalculationPeriods}
      />
      <Grid container spacing={1} sx={{ height: 'calc(100vh - 170px)' }}>
        <Grid item xs={12}>
          <CreateArizaStepperForm />
        </Grid>
        {/* <Grid item xs={12} sm={3} sx={{ gap: '10px' }}>
          <InputForm />
        </Grid>
        <Grid item xs={12} sm={4} sx={{ height: '100%' }}>
          <Card sx={{ height: '100%', boxShadow: 5, borderRadius: 4, padding: 2, background: 'divider' }}>
            {aktType === 'dvaynik' ? (
              <DHJTable
                abonentData={abonentData2}
                title={`${t('createAbonentPetitionPage.dublicateAccountNumber')}: ${abonentData2.accountNumber}`}
              />
            ) : (
              <Recalculate />
            )}
          </Card>
        </Grid>
        <Grid item xs={12} sm={5} sx={{ height: '100%' }}>
          <Card sx={{ height: '100%', boxShadow: 5, borderRadius: 4, padding: 2, background: 'divider' }}>
            <DHJTable abonentData={abonentData} title={`${t('createAbonentPetitionPage.DHJ jadval')}: ${abonentData.accountNumber}`} />
          </Card>
        </Grid> */}
      </Grid>

      <PasteImageDialog open={pasteImageDialogOpen} setOpen={setPasteImageDialogOpen} />
    </div>
  );
}

export default CreateAbonentPetition;
