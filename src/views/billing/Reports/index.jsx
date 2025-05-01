import { Grid } from '@mui/material';
import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import ReportsTable from './ReportsTable';
import ToolBar from './ToolBar';

function Reports() {
  return (
    <MainCard>
      <Grid container>
        <Grid item xs={12}>
          <ToolBar />
        </Grid>
        <Grid item xs={9}>
          <ReportsTable />
        </Grid>
        <Grid item xs={3}>
          SideBar
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default Reports;
