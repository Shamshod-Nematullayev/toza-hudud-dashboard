import { Grid } from '@mui/material';
import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import ReportsTable from './ReportsTable';
import ToolBar from './ToolBar';
import SideBar from './SideBar';

function Reports() {
  return (
    <MainCard contentSX={{ height: 'calc(100vh - 130px)' }}>
      <Grid container height={'100%'}>
        <Grid item xs={12}>
          <ToolBar />
        </Grid>
        <Grid item xs={9} height={'100%'}>
          <ReportsTable />
        </Grid>
        <Grid item xs={3}>
          <SideBar />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default Reports;
