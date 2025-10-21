import React, { createContext, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import SearchAbonentForm from './SearchAbonentForm';
import DisplayAbonentDetails from './DisplayAbonentDetails';
import FileInputDrop from './InputFileDrop';
import { DataGrid } from '@mui/x-data-grid';
import { Grid, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import PdfViewer from '../AbonentPetition/PDFViewer';

export const DeleteDublicatContext = createContext();
function DeleteDublicate() {
  const [realAccountNumber, setRealAccountNumber] = useState('');
  const [fakeAccountNumber, setFakeAccountNumber] = useState('');
  const [realAbonent, setRealAbonent] = useState({});
  const [fakeAbonent, setFakeAbonent] = useState({});
  const [rows, setRows] = useState([]);
  const [pdfFile, setPdfFile] = useState({});

  return (
    <DeleteDublicatContext.Provider
      value={{
        realAccountNumber,
        setRealAccountNumber,
        fakeAccountNumber,
        setFakeAccountNumber,
        realAbonent,
        setRealAbonent,
        fakeAbonent,
        setFakeAbonent,
        rows,
        setRows,
        pdfFile,
        setPdfFile
      }}
    >
      <MainCard contentSX={{ height: '75vh' }}>
        {!pdfFile.url ? (
          <FileInputDrop setFunc={setPdfFile} />
        ) : (
          <Grid container spacing={1} height={'100%'}>
            <Grid item xs={2} height={'100%'}>
              <SearchAbonentForm />
            </Grid>
            <Grid item xs={6} height={'100%'}>
              <DisplayAbonentDetails />
              <DataGrid
                columns={[
                  { field: 'id', headerName: '№', width: 50 },
                  { field: 'realAccountNumber', headerName: 'Haqiqiy hisob raqami', width: 150 },
                  { field: 'realFullName', headerName: 'F.I.O. (Haqiqiy)', width: 200 },
                  { field: 'fakeAccountNumber', headerName: 'Ikkilamchi hisob raqami', width: 150 },
                  { field: 'fakeFullName', headerName: 'F.I.O. (Ikkilamchi)', width: 200 },
                  { field: 'allPaymentAmount', headerName: 'Ikkilamchiga tushgan pullar', width: 120 },
                  {
                    field: 'actions',
                    headerName: 'Harakatlar',
                    renderCell: (e) => {
                      return (
                        <IconButton
                          onClick={() => {
                            const newRows = [...rows];
                            newRows.splice(e.row.id - 1, 1);
                            setRows(newRows);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      );
                    }
                  }
                ]}
                rows={rows}
              />
            </Grid>
            <Grid item xs={4} height={'100%'}>
              <PdfViewer base64String={pdfFile.url} />
            </Grid>
          </Grid>
        )}
      </MainCard>
    </DeleteDublicatContext.Provider>
  );
}

export default DeleteDublicate;
