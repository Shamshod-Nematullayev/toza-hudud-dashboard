import MainCard from 'ui-component/cards/MainCard';
import FileInputDrop from './FileInputDrop';
import useStore from './useStore';
import FilesList from './FilesList';
import FindedDataTable from './FindedDataTable';
import CancelDialog from './CancelDialog';
import { useState } from 'react';
import DisplayFile from './DisplayFile';
import { Grid } from '@mui/material';

function ImportAbonentPetition() {
  const { pdfFiles, showDialog, setShowDialog } = useStore();

  return (
    <MainCard contentSX={{ height: '75vh' }}>
      {pdfFiles.length == 0 ? (
        <FileInputDrop />
      ) : (
        <Grid container spacing={2} height={'100%'}>
          <Grid item xs={1.5} height={'100%'}>
            <FilesList />
          </Grid>
          <Grid item xs={5.5} height={'100%'}>
            <DisplayFile />
          </Grid>
          <Grid item xs={5}>
            <FindedDataTable />
          </Grid>
        </Grid>
      )}
      <CancelDialog showDialog={showDialog} setShowDialog={setShowDialog} />
    </MainCard>
  );
}

export default ImportAbonentPetition;
