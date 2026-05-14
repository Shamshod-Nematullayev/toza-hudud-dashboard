import MainCard from 'ui-component/cards/MainCard';
import useStore, { PDFFile } from './hooks/useStore';
import FilesList from './FilesList';
import FindedDataTable from './FindedDataTable';
import CancelDialog from './CancelDialog';
import DisplayFile from './DisplayFile';
import { Box, Button, Chip, Grid, TextField } from '@mui/material';
import { CustomAtomLoader } from 'ui-component/loaders/CustomAtomLoader';
import { useUiStore } from './hooks/useUiStore';
import HeaderImportAbonentPetition from './HeaderImportAbonentPetition';
import FileInputDrop from 'ui-component/FileInputDrop';

function ImportAbonentPetition() {
  const { pdfFiles, showDialog, setShowDialog } = useStore();
  const { pdfFileLoading } = useUiStore();

  const handleChangeFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList).filter((file) => file.type === 'application/pdf');
    const filesWithUrl: PDFFile[] = [];
    const promises = files.map((file) => {
      return new Promise((resolve, reject) => {
        (async () => {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(pdfBlob);
            filesWithUrl.push({
              file,
              url,
              blob: pdfBlob
            });
            resolve('Successfully');
          } catch (error) {
            reject(error);
          }
        })();
      });
    });
    await Promise.all(promises);
    useStore.getState().setPdfFiles(filesWithUrl);
  };

  const isOnlyFileDrop = pdfFiles.length === 0;

  return (
    <MainCard contentSX={{ height: 'calc(100vh - 100px)', position: 'relative' }}>
      <Grid container spacing={2} height={'100%'}>
        {/* <Grid item xs={12}>
          <HeaderImportAbonentPetition />
        </Grid> */}
        {!isOnlyFileDrop && (
          <Grid item xs={1.5} height={'100%'}>
            <FilesList />
          </Grid>
        )}
        <Grid item xs={pdfFiles.length === 0 ? 12 : 4.5} height={'100%'} sx={{ position: 'relative' }}>
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
          {pdfFiles.length == 0 ? (
            <FileInputDrop clearTrigger={pdfFiles.length > 0} setFiles={handleChangeFiles} fileType="pdf" />
          ) : (
            <DisplayFile />
          )}
        </Grid>
        {!isOnlyFileDrop && (
          <Grid item xs={6}>
            <FindedDataTable />
          </Grid>
        )}
      </Grid>
      <CancelDialog showDialog={showDialog} setShowDialog={setShowDialog} />
    </MainCard>
  );
}

export default ImportAbonentPetition;
