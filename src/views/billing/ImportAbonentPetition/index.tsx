import MainCard from 'ui-component/cards/MainCard';
import FileInputDrop from './FileInputDrop';
import useStore from './hooks/useStore';
import FilesList from './FilesList';
import FindedDataTable from './FindedDataTable';
import CancelDialog from './CancelDialog';
import DisplayFile from './DisplayFile';
import { Box, Button, Chip, Grid, TextField } from '@mui/material';
import { CustomAtomLoader } from 'ui-component/loaders/CustomAtomLoader';
import { useUiStore } from './hooks/useUiStore';
import HeaderImportAbonentPetition from './HeaderImportAbonentPetition';

function ImportAbonentPetition() {
  const { pdfFiles, showDialog, setShowDialog } = useStore();
  const { pdfFileLoading } = useUiStore();

  return (
    <MainCard contentSX={{ height: 'calc(100vh - 100px)' }}>
      <Grid container spacing={2} height={'100%'}>
        <Grid item xs={12}>
          <HeaderImportAbonentPetition />
        </Grid>
        <Grid item xs={1.5} height={'100%'}>
          <FilesList />
        </Grid>
        <Grid item xs={4.5} height={'100%'} sx={{ position: 'relative' }}>
          {pdfFileLoading && (
            <Box
              sx={{
                position: 'absolute',
                inset: -10,
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(60px)',
                borderRadius: 2
              }}
            >
              <CustomAtomLoader />
            </Box>
          )}
          {pdfFiles.length == 0 ? <FileInputDrop /> : <DisplayFile />}
        </Grid>
        <Grid item xs={6}>
          <FindedDataTable />
        </Grid>
      </Grid>
      <CancelDialog showDialog={showDialog} setShowDialog={setShowDialog} />
    </MainCard>
  );
}

export default ImportAbonentPetition;
