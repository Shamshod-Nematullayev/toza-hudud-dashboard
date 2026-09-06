import React from 'react';
import useStore, { PDFFile } from './hooks/useStore';
import FilesList from './FilesList';
import FindedDataTable from './FindedDataTable';
import CancelDialog from './CancelDialog';
import DisplayFile from './DisplayFile';
import { Box, Card, Grid } from '@mui/material';
import { CustomAtomLoader } from 'ui-component/loaders/CustomAtomLoader';
import { useUiStore } from './hooks/useUiStore';
import HeaderImportAbonentPetition from './HeaderImportAbonentPetition';
import FileInputDrop from 'ui-component/FileInputDrop';
import { usePageTour, getImportAbonentPetitionSteps } from 'ui-component/tour';

function ImportAbonentPetition() {
  const { pdfFiles, showDialog, setShowDialog } = useStore();
  const { pdfFileLoading } = useUiStore();

  const { startTour } = usePageTour({
    tourKey: 'import_abonent_petition',
    steps: getImportAbonentPetitionSteps,
    autoStart: true,
    delayMs: 700
  });

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
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 120px)' }}>
      {/* Header bar */}
      <HeaderImportAbonentPetition onStartTour={startTour} />

      <Card
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          minHeight: 'calc(100vh - 190px)',
          position: 'relative'
        }}
      >
        <Grid container spacing={1.5}>
          {/* 1. Fayllar ro'yxati ustuni (Kengaytirilgan: 2 ustun) */}
          {!isOnlyFileDrop && (
            <Grid size={{ xs: 12, md: 3, lg: 2.2 }}>
              <FilesList />
            </Grid>
          )}

          {/* 2. Dinamik o'lchamli PDF Ko'rsatuvchi/Drop ustun */}
          <Grid
            size={{ xs: 12, md: isOnlyFileDrop ? 12 : 4.5, lg: isOnlyFileDrop ? 12 : 4.8 }}
            sx={{ position: 'relative', minHeight: 'calc(100vh - 220px)', maxHeight: 'calc(100vh - 220px)' }}
          >
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
            {isOnlyFileDrop ? (
              <Box id="tour-import-dropzone" sx={{ height: '100%' }}>
                <FileInputDrop clearTrigger={pdfFiles.length > 0} setFiles={handleChangeFiles} fileType="pdf" />
              </Box>
            ) : (
              <DisplayFile />
            )}
          </Grid>

          {/* 3. Topilgan ma'lumotlar jadvali ustuni */}
          {!isOnlyFileDrop && (
            <Grid size={{ xs: 12, md: 4.5, lg: 5 }}>
              <FindedDataTable />
            </Grid>
          )}
        </Grid>

        <CancelDialog showDialog={showDialog} setShowDialog={setShowDialog} />
      </Card>
    </Box>
  );
}

export default ImportAbonentPetition;
