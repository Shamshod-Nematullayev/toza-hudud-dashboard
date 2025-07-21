import MainCard from 'ui-component/cards/MainCard';
import FileInputDrop from './FileInputDrop';
import useStore from './useStore';
import FilesList from './FilesList.tsx';
import FindedDataTable from './FindedDataTable';
import CancelDialog from './CancelDialog';
import DisplayFile from './DisplayFile';
import { Grid } from '@mui/material';

function ImportAbonentPetition() {
  const { pdfFiles, showDialog, setShowDialog } = useStore();

  return (
    <MainCard contentSX={{ height: 'calc(100vh - 130px)' }}>
      <Grid container spacing={2} height={'100%'}>
        <Grid item xs={1.5} height={'100%'}>
          <FilesList />
        </Grid>
        <Grid item xs={5.5} height={'100%'}>
          {pdfFiles.length == 0 ? <FileInputDrop /> : <DisplayFile />}
        </Grid>
        <Grid item xs={5}>
          <FindedDataTable />
        </Grid>
      </Grid>
      <CancelDialog showDialog={showDialog} setShowDialog={setShowDialog} />
    </MainCard>
  );
}

export default ImportAbonentPetition;
