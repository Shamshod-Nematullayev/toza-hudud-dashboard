import { Dialog, Grid } from '@mui/material';
import React, { useState } from 'react';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import ToolbarCourtNotes from './ToolbarCourtNotes';
import DatatableCourtNotes from './DatatableCourtNotes';
import DialogCourtNote from './DialogCourtNote';
import useStore from './useStore';
import SidebarCourtNotes from './SidebarCourtNotes';

function CourtNote() {
  const { showDialog, setShowDialog, refresh } = useStore();
  const handleCloseDialog = () => {
    setShowDialog(false);
    refresh();
  };
  return (
    <MainCard>
      {showDialog && <DialogCourtNote closeFunction={handleCloseDialog} />}
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <ToolbarCourtNotes />
        </Grid>
        <Grid item xs={12} md={8}>
          <DatatableCourtNotes />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SidebarCourtNotes />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default CourtNote;
