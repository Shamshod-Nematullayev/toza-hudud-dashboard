import PrintOutlined from '@mui/icons-material/PrintOutlined';
import { Button, Grid, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';

function ToolbarCourtNotes() {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('sm'));
  return (
    <Grid container spacing={1}>
      <Button variant="outlined">
        <PrintOutlined /> {matchUpMd ? 'Ariza yaratish' : ''}
      </Button>
    </Grid>
  );
}

export default ToolbarCourtNotes;
