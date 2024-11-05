import MainCard from 'ui-component/cards/MainCard';
import FileInputDrop from './FileInputDrop';
import useStore from './useStore';
import { useEffect } from 'react';
import FilesList from './FilesList';
import FindedDataTable from './FindedDataTable';

function ImportPetition() {
  const { pdfFiles, currentFile } = useStore();
  useEffect(() => {
    console.log(pdfFiles, currentFile);
  }, [pdfFiles]);

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
    </MainCard>
  );
}

export default ImportPetition;
