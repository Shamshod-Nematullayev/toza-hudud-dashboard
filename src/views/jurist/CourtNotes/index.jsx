import { Grid } from '@mui/material';
import React from 'react';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import ToolbarCourtNotes from './ToolbarCourtNotes';
import DatatableCourtNotes from './DatatableCourtNotes';
import SidebarCourtNotes from './SidebarCourtNotes';

function CourtNote() {
  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <ToolbarCourtNotes />
        </Grid>
        <Grid item xs={12} sm={9}>
          <DatatableCourtNotes />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SidebarCourtNotes />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default CourtNote;
