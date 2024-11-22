import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PrintSection from './PrintSection';
import InputForm from './InputForm';
import DHJTable from './DHJTable';
import Recalculate from './Recalculate';
import useStore from './useStore';

function CreateAbonentPetition() {
  const { aktType, abonentData, abonentData2, showPrintSection, mahalla, mahallaDublicat } = useStore();
  return (
    <MainCard>
      <PrintSection
        show={showPrintSection}
        aniqlanganYashovchiSoni={5}
        abonentData={abonentData}
        abonentData2={abonentData2}
        asoslantiruvchi="hozircha izoh"
        documentType={aktType}
        mahalla={mahalla}
        mahalla2={mahallaDublicat}
      />
      <div style={{ display: 'flex' }}>
        <InputForm />

        <DHJTable abonentData={abonentData} title={`DHJ jadval: ${abonentData.licshet}`} />
        {aktType === 'dvaynik' ? <DHJTable abonentData={abonentData2} title={`Ikkilamchi: ${abonentData2.licshet}`} /> : <Recalculate />}
      </div>
    </MainCard>
  );
}

export default CreateAbonentPetition;
