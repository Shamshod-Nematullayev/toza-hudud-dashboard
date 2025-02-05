import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import ToolBar from './ToolBar';
import DataTableWarnings from './DataTableWarnings';
import { Grid } from '@mui/material';
import SideBarWarnings from './SideBarWarnings';

function WarningLetters() {
  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ToolBar />
        </Grid>
        <Grid item xs={12} sm="10">
          <DataTableWarnings />
        </Grid>
        <Grid xs={12} sm="2">
          <SideBarWarnings />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default WarningLetters;
