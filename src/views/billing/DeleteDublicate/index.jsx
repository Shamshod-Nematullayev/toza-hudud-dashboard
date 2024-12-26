import React, { createContext, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import SearchAbonentForm from './SearchAbonentForm';
import DisplayAbonentDetails from './DisplayAbonentDetails';
import FileInputDrop from './InputFileDrop';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import Loader from 'ui-component/Loader';

export const DeleteDublicatContext = createContext();
function DeleteDublicate() {
  const [realAccountNumber, setRealAccountNumber] = useState('');
  const [fakeAccountNumber, setFakeAccountNumber] = useState('');
  const [realAbonent, setRealAbonent] = useState({});
  const [fakeAbonent, setFakeAbonent] = useState({});
  const [rows, setRows] = useState([]);
  const [pdfFile, setPdfFile] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
        setPdfFile,
        isLoading,
        setIsLoading
      }}
    >
      <MainCard contentSX={{ height: '75vh' }}>
        {!pdfFile.url ? (
          <FileInputDrop setFunc={setPdfFile} />
        ) : (
          <div style={{ display: 'flex' }}>
            {isLoading && <Loader />}
            <SearchAbonentForm />
            <div>
              <DisplayAbonentDetails />
              <div style={{ height: 450 }}>
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
              </div>
            </div>
            <iframe src={pdfFile.url} width={600} height={700}></iframe>
          </div>
        )}
      </MainCard>
    </DeleteDublicatContext.Provider>
  );
}

export default DeleteDublicate;
