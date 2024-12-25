import React, { createContext, useContext, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import ToolBar from './ToolBar';
import DataTable from './DataTable';
import SideBar from './SideBar';
import useStore from './useStore';

const AbonentPetitionsContext = createContext()

function Recalculate() {
  const store = useStore()
  return (
    <MainCard contentSX={{ height: '85vh' }}>
      <AbonentPetitionsContext.Provider value={store}>
      <ToolBar />
      <div style={{ display: 'flex', justifyContent: 'space-between', height: '95%' }}>
        <DataTable />
        <SideBar />
      </div>
      </AbonentPetitionsContext.Provider>
    </MainCard>
  );
}

export function useLocalStore(){
  return useContext(AbonentPetitionsContext)
}

export default Recalculate;
