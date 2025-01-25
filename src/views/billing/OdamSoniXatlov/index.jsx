import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import ToolBar from './ToolBar';
import DataTable from './DataTable';
import SidePanel from './SidePanel';
import { Backdrop, CircularProgress, Grid } from '@mui/material';
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
      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <DataTable />
        </Grid>
        <Grid item xs={12} md={7}>
          <SidePanel />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default XatlovOdamSoni;
