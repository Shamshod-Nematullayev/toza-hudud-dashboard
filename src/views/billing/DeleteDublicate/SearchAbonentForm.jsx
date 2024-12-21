import { Button, FormControl, TextField } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { DeleteDublicatContext } from '.';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import api from 'utils/api';

function SearchAbonentForm() {
  const {
    realAccountNumber,
    fakeAccountNumber,
    setRealAccountNumber,
    setFakeAccountNumber,
    realAbonent,
    setRealAbonent,
    fakeAbonent,
    setFakeAbonent
  } = useContext(DeleteDublicatContext);
  useEffect(() => {
    if (realAccountNumber.length === 12) {
      api.get('/billing/get-abonent-data-by-licshet/' + realAccountNumber).then(({ data }) => {
        if (!data.ok) {
          setRealAbonent(null);
          return;
        }
        setRealAbonent(data.abonentData);
      });
    } else {
      !realAbonent.accountNumber && setRealAbonent({});
    }
  }, [realAccountNumber]);
  useEffect(() => {
    if (fakeAccountNumber.length === 12) {
      api.get('/billing/get-abonent-data-by-licshet/' + fakeAccountNumber).then(async ({ data }) => {
        if (!data.ok) {
          setFakeAbonent(null);
          return;
        }
        setFakeAbonent(data.abonentData);
        // const rows = api.get('/billing/get-abonent-dxj-by-id/' + abonentData.id).then(({ data }) => {
        //     setRowsDhjTable(
        //       data.rows.map((row, i) => ({
        //         id: i + 1,
        //         davr: row.period,
        //         saldo_n: row.nSaldo,
        //         nachis: row.accrual,
        //         saldo_k: row.kSaldo,
        //         akt: row.actAmount,
        //         yashovchilar_soni: row.inhabitantCount,
        //         allPaymentsSum: row.allPaymentsSum
        //       }))
        //     );
        //   });
      });
    } else {
      !fakeAbonent.accountNumber && setFakeAbonent({});
    }
  }, [fakeAccountNumber]);
  return (
    <FormControl>
      <AccountNumberInput label="Haqiqiy hisob raqam" setFunc={setRealAccountNumber} value={realAccountNumber} />
      <AccountNumberInput
        label="Ikkilamchi hisob raqam"
        setFunc={setFakeAccountNumber}
        value={fakeAccountNumber}
        sx={{ margin: '10px 0' }}
      />
      <Button variant="outlined" color="secondary">
        Qo'shish
      </Button>
      <Button variant="contained" color="error" sx={{ margin: '10px 0' }}>
        AKT qilish
      </Button>
    </FormControl>
  );
}

export default SearchAbonentForm;
