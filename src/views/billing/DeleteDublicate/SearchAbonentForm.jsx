import { Button, FormControl } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { DeleteDublicatContext } from '.';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import api from 'utils/api';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';
import { getAbonentDataByAccountnumber } from 'services/getAbonentDataByAccountnumber';
import { getAbonentDxjByResidentId } from 'services/getAbonentDHJ';

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
    setPdfFile
  } = useContext(DeleteDublicatContext);
  const { setIsLoading } = useLoaderStore();
  useEffect(() => {
    if (realAccountNumber.length === 12) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const realAbonent = await getAbonentDataByAccountnumber(realAccountNumber);
          if (!realAbonent.id) throw new Error('Abonent topilmadi');

          const dhj = await getAbonentDxjByResidentId(realAbonent.id);
          const allPaymentAmounts = dhj.reduce((acc, row) => acc + row.allPaymentsSum, 0);
          realAbonent.allPaymentAmount = allPaymentAmounts;
          setRealAbonent(realAbonent);
        } catch (error) {
          setRealAbonent({});
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      realAbonent.accountNumber && setRealAbonent({});
    }
  }, [realAccountNumber]);
  useEffect(() => {
    if (fakeAccountNumber.length === 12) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const fakeAbonent = await getAbonentDataByAccountnumber(fakeAccountNumber);
          if (!fakeAbonent.id) throw new Error('Abonent topilmadi');

          const dhj = await getAbonentDxjByResidentId(fakeAbonent.id);
          const allPaymentAmounts = dhj.reduce((acc, row) => acc + row.allPaymentsSum, 0);
          fakeAbonent.allPaymentAmount = allPaymentAmounts;
          setFakeAbonent(fakeAbonent);
        } catch (error) {
          setFakeAbonent({});
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
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
    <FormControl
      fullWidth
      sx={{
        padding: '0 10px'
      }}
    >
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
        Qo&rsquo;shish
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
