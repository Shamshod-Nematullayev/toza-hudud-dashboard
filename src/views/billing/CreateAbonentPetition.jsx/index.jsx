import React, { useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PrintSection from './PrintSection';
import InputForm from './InputForm';
import DHJTable from './DHJTable';
import Recalculate from '../../../ui-component/cards/RecalculatorAbonent';
import useStore from './useStore';
import PasteImageDialog from './PasteImageDialog';
import { useLocation } from 'react-router-dom';
import { Grid } from '@mui/material';

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
    recalculationPeriods
  } = useStore();
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
        <Grid item xs={12} sm={5}>
        <DHJTable abonentData={abonentData} title={`DHJ jadval: ${abonentData.accountNumber}`} />
        </Grid>
        <Grid item xs={12} sm={4}>
        {aktType === 'dvaynik' ? (
          <DHJTable abonentData={abonentData2} title={`Ikkilamchi: ${abonentData2.accountNumber}`} />
        ) : (
          <Recalculate />
        )}
        </Grid>
      </Grid>

      <PasteImageDialog />
    </MainCard>
  );
}

export default CreateAbonentPetition;
