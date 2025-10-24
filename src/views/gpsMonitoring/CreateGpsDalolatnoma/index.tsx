import { Grid } from '@mui/material';
import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PrintSection from './PrintSection';
import SideBarGpsCreateGpsDalolatnoma from './SideBarGpsCreateGpsDalolatnoma';

function CreateGpsDalolatnoma() {
  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <PrintSection />
        </Grid>
        <Grid item xs={3}>
          <SideBarGpsCreateGpsDalolatnoma />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default CreateGpsDalolatnoma;
