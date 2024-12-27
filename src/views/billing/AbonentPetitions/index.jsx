import React, { createContext, useContext, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import ToolBar from './ToolBar';
import DataTable from './DataTable';
import SideBar from './SideBar';
import useStore from './useStore';
import PrintSection from '../CreateAbonentPetition.jsx/PrintSection';

const AbonentPetitionsContext = createContext();

export function useLocalStore() {
  return useContext(AbonentPetitionsContext);
}
function Recalculate() {
  const store = useStore();
  const { showPrintSection, setShowPrintSection, currentAriza, abonentData, abonentData2, mahalla, mahallaDublicat } = useStore();
  return (
    <MainCard contentSX={{ height: '85vh' }}>
      <AbonentPetitionsContext.Provider value={store}>
        <PrintSection
          show={showPrintSection}
          setShowPrintSection={setShowPrintSection}
          aniqlanganYashovchiSoni={parseInt(currentAriza.next_prescribed_cnt)}
          documentType={currentAriza.document_type}
          ariza={currentAriza}
          muzlatiladi={currentAriza.muzlatiladi}
          recalculationPeriods={currentAriza.recalculationPeriods}
          abonentData={abonentData}
          abonentData2={abonentData2}
          mahalla={mahalla}
          mahalla2={mahallaDublicat}
        />
        <ToolBar />
        <div style={{ display: 'flex', justifyContent: 'space-between', height: '95%' }}>
          <DataTable />
          <SideBar />
        </div>
      </AbonentPetitionsContext.Provider>
    </MainCard>
  );
}

export default Recalculate;
