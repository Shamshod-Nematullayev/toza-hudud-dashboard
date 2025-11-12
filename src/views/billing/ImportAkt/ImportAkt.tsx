import { Grid } from '@mui/material';
import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import PdfViewer from '../AbonentPetition/PDFViewer';

function ImportAkt() {
  return (
    <MainCard>
      <Grid container spacing={2}>
        {/* Creating form */}
        <Grid item xs={12} md={6}>
          Import form goes here
        </Grid>
        {/* PDF preview */}
        <Grid item xs={12} md={6}>
          <PdfViewer base64String={''} />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default ImportAkt;
