import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import ToolBar from './ToolBar';
import DataTableWarnings from './DataTableWarnings';
import { Grid } from '@mui/material';
import { gridSpacing } from 'store/constant';

function WarningLetters() {
  return (
    <MainCard
      contentSX={{
        minHeight: '86vh'
      }}
    >
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <ToolBar />
        </Grid>
        <Grid item xs={12} sm="10">
          <DataTableWarnings />
        </Grid>
        <Grid></Grid>
      </Grid>
    </MainCard>
  );
}

export default WarningLetters;
