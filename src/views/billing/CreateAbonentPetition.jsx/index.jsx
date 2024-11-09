import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PrintSection from './PrintSection';
import InputForm from './InputForm';
import DHJTable from './DHJTable';
import Recalculate from './Recalculate';

function CreateAbonentPetition() {
  return (
    <MainCard>
      {/* <PrintSection /> */}
      <div style={{ display: 'flex' }}>
        <div style={{ minHeight: 700, display: 'flex', flexDirection: 'column' }}>
          <DHJTable />
        </div>
        <InputForm />
        <Recalculate />
      </div>
    </MainCard>
  );
}

export default CreateAbonentPetition;
