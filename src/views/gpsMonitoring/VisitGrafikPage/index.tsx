import { Grid } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import VisitGrafik from './VisitGrafik';
import HeaderVisitGPage from './HeaderVisitGPage';

function VisitGrafikPage() {
  useEffect(() => {
    // document.title = t('menuItems.visitsGraph');
  }, []);
  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <HeaderVisitGPage />
        </Grid>
        <Grid item xs={12}>
          <VisitGrafik />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default VisitGrafikPage;
