import { Grid } from '@mui/material';
import React from 'react';
import MainCard from 'ui-component/cards/MainCard';

function VisitGrafikPage() {
  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <h1>HEADER COMPONENT</h1>
        </Grid>
        <Grid item xs={12}>
          <h1>CONTENT COMPONENT</h1>
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default VisitGrafikPage;
