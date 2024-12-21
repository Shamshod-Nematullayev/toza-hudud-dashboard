import React, { createContext, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import InputFileDrop from './InputFileDrop';
import useStore from './useContext';
import DHJTable from './DHJTable';
import SearchAbonentForm from './SearchAbonentForm';
import DisplayAbonentDetails from './DisplayAbonentDetails';

export const DeleteDublicatContext = createContext();
function DeleteDublicate() {
  const { pdfFile } = useStore();
  const [realAccountNumber, setRealAccountNumber] = useState('');
  const [fakeAccountNumber, setFakeAccountNumber] = useState('');
  const [realAbonent, setRealAbonent] = useState({});
  const [fakeAbonent, setFakeAbonent] = useState({});

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
        setFakeAbonent
      }}
    >
      <MainCard contentSX={{ height: '75vh' }}>
        {!pdfFile ? (
          <InputFileDrop />
        ) : (
          <div style={{ display: 'flex' }}>
            <SearchAbonentForm />
            <DisplayAbonentDetails />
          </div>
        )}
      </MainCard>
    </DeleteDublicatContext.Provider>
  );
}

export default DeleteDublicate;
