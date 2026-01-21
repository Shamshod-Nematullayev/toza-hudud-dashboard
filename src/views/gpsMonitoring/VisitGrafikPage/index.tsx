import { Grid } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import VisitGrafik from './VisitGrafik';

function VisitGrafikPage() {
  useEffect(() => {
    // document.title = t('menuItems.visitsGraph');
  }, []);
  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <h1>HEADER COMPONENT</h1>
        </Grid>
        <Grid item xs={12}>
          <VisitGrafik />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default VisitGrafikPage;
