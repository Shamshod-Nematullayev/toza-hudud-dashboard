import { useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import FileInputDrop from '../DeleteDublicate/InputFileDrop';
import { Grid } from '@mui/material';
import PdfViewer from '../AbonentPetition/PDFViewer';
import { DataGrid } from '@mui/x-data-grid';

interface IRow {
  id: number;
  accountNumber: string;
  fullName: string;
  monay: number;
  residentId: number;
  kSaldo: number;
}

function MonayTransfer() {
  const [pdfFile, setPdfFile] = useState<{ file: File; url: string }>({ file: null, url: '' });
  const [rows, setRows] = useState<IRow[]>([]);
  return (
    <MainCard contentSX={{ height: 'calc( 100vh  - 130px )' }}>
      {!pdfFile.url ? (
        <FileInputDrop setFunc={setPdfFile} />
      ) : (
        <Grid container spacing={1} height={'100%'}>
          <Grid item xs={6} height={'100%'}>
            <DataGrid
              columns={[
                { field: 'id', headerName: 'ID', width: 50 },
                { field: 'accountNumber', headerName: 'Hisob raqami', flex: 1 },
                { field: 'fullName', headerName: 'FIO', flex: 1 },
                { field: 'kSaldo', headerName: 'Saldo', flex: 1 },
                { field: 'monay', headerName: "Ko'chiriladigan summa", flex: 1 }
              ]}
              rows={rows}
            />
          </Grid>
          <Grid item xs={6} height={'100%'}>
            <PdfViewer base64String={pdfFile.url} />
          </Grid>
        </Grid>
      )}
    </MainCard>
  );
}

export default MonayTransfer;
