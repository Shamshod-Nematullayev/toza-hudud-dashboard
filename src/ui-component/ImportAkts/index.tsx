import { Grid } from '@mui/material';
import React from 'react';
import MainCard from 'ui-component/cards/MainCard';

function ImportAkts() {
  return (
    <MainCard>
      <Grid container>
        <Grid size={{ xs: 12, md: 4 }}>
          INPUT
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          EXCEL
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          PDF
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default ImportAkts;
