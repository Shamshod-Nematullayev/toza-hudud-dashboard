import { Grid } from '@mui/material';
import React from 'react';
import ToolBar from './ToolBar';
import ReportsTable from './ReportsTable';
import MainCard from 'ui-component/cards/MainCard';

function NazoratchilarXatlov() {
  return (
    <MainCard contentSX={{ height: 'calc(100vh - 130px)' }}>
      <Grid container height={'100%'} spacing={2}>
        <Grid item xs={12} height={'100%'}>
          <ReportsTable />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default NazoratchilarXatlov;
