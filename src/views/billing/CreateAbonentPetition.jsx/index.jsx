import React, { useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PrintSection from './PrintSection';
import InputForm from './InputForm';
import DHJTable from './DHJTable';
import Recalculate from '../../../ui-component/cards/RecalculatorAbonent';
import { useStore } from './useStore.ts';
import PasteImageDialog from './PasteImageDialog';
import { useLocation } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

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
  useEffect(() => {
    setInitialState();
  }, [location]);
  useEffect(() => {
    if (!showPrintSection) return setInitialState();
  }, [showPrintSection]);
  return (
    <MainCard>
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
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          <InputForm />
        </Grid>
        <Grid item xs={12} sm={4}>
          {aktType === 'dvaynik' ? (
            <DHJTable abonentData={abonentData2} title={`${'createAbonentPetitionPage.Ikkilamchi'}: ${abonentData2.accountNumber}`} />
          ) : (
            <Recalculate />
          )}
        </Grid>
        <Grid item xs={12} sm={5}>
          <DHJTable abonentData={abonentData} title={`${t('createAbonentPetitionPage.DHJ jadval')}: ${abonentData.accountNumber}`} />
        </Grid>
      </Grid>

      <PasteImageDialog open={pasteImageDialogOpen} setOpen={setPasteImageDialogOpen} />
    </MainCard>
  );
}

export default CreateAbonentPetition;
