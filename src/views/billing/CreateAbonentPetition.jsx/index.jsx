import React, { useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PrintSection from './PrintSection';
import InputForm from './InputForm';
import DHJTable from './DHJTable';
import Recalculate from './Recalculate';
import CancelDialog from '../ImportAbonentPetition/CancelDialog';
import useStore from './useStore';

function CreateAbonentPetition() {
  const { aktType, abonentData, abonentData2 } = useStore();
  return (
    <MainCard>
      {/* <PrintSection /> */}
      <div style={{ display: 'flex' }}>
        <InputForm />

        <DHJTable abonentData={abonentData} title={`DHJ jadval: ${abonentData.licshet}`} />
        {aktType === 'dvaynik' ? <DHJTable abonentData={abonentData2} title={`Ikkilamchi: ${abonentData2.licshet}`} /> : <Recalculate />}
      </div>
    </MainCard>
  );
}

export default CreateAbonentPetition;
