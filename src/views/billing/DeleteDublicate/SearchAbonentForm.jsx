import { Button, FormControl, TextField } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { DeleteDublicatContext } from '.';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import api from 'utils/api';
import { toast } from 'react-toastify';

function SearchAbonentForm() {
  const {
    realAccountNumber,
    fakeAccountNumber,
    setRealAccountNumber,
    setFakeAccountNumber,
    realAbonent,
    setRealAbonent,
    fakeAbonent,
    setFakeAbonent,
    rows,
    setRows,
    pdfFile,
    setPdfFile,
    setIsLoading
  } = useContext(DeleteDublicatContext);
  useEffect(() => {
    if (realAccountNumber.length === 12) {
      setIsLoading(true);
      api.get('/billing/get-abonent-data-by-licshet/' + realAccountNumber).then(async ({ data }) => {
        if (!data.ok) {
          setRealAbonent({});
          return;
        }
        if (data.abonentData) {
          const dhj = (await api.get('/billing/get-abonent-dxj-by-id/' + data.abonentData.id)).data.rows;
          let allPaymentAmounts = 0;
          dhj.forEach((row) => {
            allPaymentAmounts += row.allPaymentsSum;
          });
          data.abonentData.allPaymentAmount = allPaymentAmounts;
          setRealAbonent(data.abonentData);
          setIsLoading(false);
        }
      });
    } else {
      realAbonent.accountNumber && setRealAbonent({});
    }
  }, [realAccountNumber]);
  useEffect(() => {
    if (fakeAccountNumber.length === 12) {
      setIsLoading(true);
      api.get('/billing/get-abonent-data-by-licshet/' + fakeAccountNumber).then(async ({ data }) => {
        if (!data.ok) {
          setFakeAbonent({});
          return;
        }
        if (data.abonentData) {
          const dhj = (await api.get('/billing/get-abonent-dxj-by-id/' + data.abonentData.id)).data.rows;
          let allPaymentAmounts = 0;
          dhj.forEach((row) => {
            allPaymentAmounts += row.allPaymentsSum;
          });
          data.abonentData.allPaymentAmount = allPaymentAmounts;
          setFakeAbonent(data.abonentData);
        }
        setIsLoading(false);
      });
    } else {
      fakeAbonent.accountNumber && setFakeAbonent({});
    }
  }, [fakeAccountNumber]);

  const handleAddClickButton = async () => {
    setRows([
      ...rows,
      {
        realAccountNumber,
        fakeAccountNumber,
        id: rows.length + 1,
        realFullName: realAbonent.fullName,
        fakeFullName: fakeAbonent.fullName,
        allPaymentAmount: fakeAbonent.allPaymentAmount
      }
    ]);
    setFakeAbonent({});
    setRealAbonent({});
    setRealAccountNumber('');
    setFakeAccountNumber('');
  };

  const handleClickPrimaryButton = async () => {
    if (rows.length === 0) {
      return;
    }
    setIsLoading(true);
    try {
      for (const row of rows) {
        const formData = new FormData();
        formData.append('realAccountNumber', row.realAccountNumber);
        formData.append('fakeAccountNumber', row.fakeAccountNumber);
        formData.append('fakeAccountIncomeAmount', row.allPaymentAmount);
        formData.append('file', pdfFile.file);
        await api.post('/billing/create-dvaynik-akt', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setIsLoading(false);
      setFakeAbonent({});
      setRealAbonent({});
      setRealAccountNumber('');
      setFakeAccountNumber('');
      alert('Акт qilindi!');
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
    }
  };

  const handleClickClearButton = () => {
    setRows([]);
    setFakeAbonent({});
    setRealAbonent({});
    setRealAccountNumber('');
    setFakeAccountNumber('');
    setPdfFile({});
  };
  const handleClickImportButton = () => {
    //
  };

  return (
    <FormControl>
      <AccountNumberInput label="Haqiqiy hisob raqam" setFunc={setRealAccountNumber} value={realAccountNumber} />
      <AccountNumberInput
        label="Ikkilamchi hisob raqam"
        setFunc={setFakeAccountNumber}
        value={fakeAccountNumber}
        sx={{ margin: '5px 0' }}
      />
      <Button
        variant="outlined"
        color="secondary"
        disabled={!realAbonent.accountNumber || !fakeAbonent.accountNumber}
        onClick={handleAddClickButton}
        sx={{ margin: '5px 0' }}
      >
        Qo'shish
      </Button>
      <Button variant="contained" color="primary" sx={{ margin: '5px 0' }} onClick={handleClickPrimaryButton} disabled={!rows.length}>
        AKT qilish
      </Button>
      <Button variant="outlined" color="success" sx={{ margin: '5px 0' }} onClick={handleClickImportButton}>
        Import
      </Button>
      <Button variant="contained" color="error" sx={{ margin: '5px 0' }} onClick={handleClickClearButton}>
        Tozalash
      </Button>
    </FormControl>
  );
}

export default SearchAbonentForm;
