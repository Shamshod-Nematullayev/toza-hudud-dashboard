import MainCard from 'ui-component/cards/MainCard';
import FileInputDrop from './FileInputDrop';
import useStore from './useStore';
import FilesList from './FilesList';
import FindedDataTable from './FindedDataTable';
import CancelDialog from './CancelDialog';
import { useState } from 'react';
import DisplayFile from './DisplayFile';

function ImportAbonentPetition() {
  const { pdfFiles, showDialog, setShowDialog } = useStore();

  return (
    <MainCard contentSX={{ height: '75vh' }}>
      {pdfFiles.length == 0 ? (
        <FileInputDrop />
      ) : (
        <div style={{ display: 'flex', height: '100%' }}>
          <FilesList />
          <DisplayFile />
          <FindedDataTable />
        </div>
      )}
      <CancelDialog showDialog={showDialog} setShowDialog={setShowDialog} />
    </MainCard>
  );
}

export default ImportAbonentPetition;
