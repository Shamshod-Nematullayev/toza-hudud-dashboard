import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import ToolBar from './ToolBar';
import DataTable from './DataTable';
import SidePanel from './SidePanel';
import { Backdrop, CircularProgress } from '@mui/material';
import odamSoniXatlovStore from './odamSoniXatlovStore';
import PrintSection from './PrintSection';

function XatlovOdamSoni() {
  const { loading } = odamSoniXatlovStore();
  return (
    <MainCard contentSX={{ position: 'relative' }}>
      <PrintSection />
      <Backdrop
        sx={{
          color: '#fff',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <ToolBar />
      <div style={{ display: 'flex' }}>
        <DataTable />
        <SidePanel />
      </div>
    </MainCard>
  );
}

export default XatlovOdamSoni;
