import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import ToolBar from './ToolBar';
import DataTable from './DataTable';
import SideBar from './SideBar';

function Recalculate() {
  return (
    <MainCard contentSX={{ height: '85vh' }}>
      <ToolBar />
      <div style={{ display: 'flex', justifyContent: 'space-between', height: '95%' }}>
        <DataTable />
        <SideBar />
      </div>
    </MainCard>
  );
}

export default Recalculate;
