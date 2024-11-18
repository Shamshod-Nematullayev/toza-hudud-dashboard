import MainCard from 'ui-component/cards/MainCard';
import FileInputDrop from './FileInputDrop';
import useStore from './useStore';
import FilesList from './FilesList';
import FindedDataTable from './FindedDataTable';
import CancelDialog from './CancelDialog';
import { useState } from 'react';

function ImportAbonentPetition() {
  const { pdfFiles, currentFile, showDialog, setShowDialog } = useStore();

  return (
    <MainCard contentSX={{ height: '75vh' }}>
      {pdfFiles.length == 0 ? (
        <FileInputDrop />
      ) : (
        <div style={{ display: 'flex', height: '100%' }}>
          <FilesList />
          <iframe style={{ margin: 'auto 25px' }} src={currentFile?.url} width="50%" height="100%"></iframe>
          <FindedDataTable />
        </div>
      )}
      <CancelDialog showDialog={showDialog} setShowDialog={setShowDialog} />
    </MainCard>
  );
}

export default ImportAbonentPetition;
