import React, { useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PrintSection from './PrintSection';
import InputForm from './InputForm';
import DHJTable from './DHJTable';
import Recalculate from './Recalculate';
import useStore from './useStore';
import PasteImageDialog from './PasteImageDialog';
import { useLocation } from 'react-router-dom';

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
      <div style={{ display: 'flex' }}>
        <InputForm />

        <DHJTable abonentData={abonentData} title={`DHJ jadval: ${abonentData.accountNumber}`} />
        {aktType === 'dvaynik' ? (
          <DHJTable abonentData={abonentData2} title={`Ikkilamchi: ${abonentData2.accountNumber}`} />
        ) : (
          <Recalculate />
        )}
      </div>
      <PasteImageDialog />
    </MainCard>
  );
}

export default CreateAbonentPetition;
