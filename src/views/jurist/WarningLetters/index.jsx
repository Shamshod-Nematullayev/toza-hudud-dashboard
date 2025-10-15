import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import DataTableWarnings from './DataTableWarnings';
import { Grid } from '@mui/material';
import SideBarWarnings from './SideBarWarnings';
import ToolBar from './ToolBar';

function WarningLetters() {
  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ToolBar />
        </Grid>
        <Grid item xs={12} sm={9}>
          <DataTableWarnings />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SideBarWarnings />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default WarningLetters;
