import React, { useContext } from 'react';
import { DeleteDublicatContext } from '.';
import KeyValue from 'ui-component/KeyValue';
import { Grid } from '@mui/material';

function DisplayAbonentDetails() {
  const { realAbonent, fakeAbonent } = useContext(DeleteDublicatContext);
  return (
    <Grid container>
      <Grid item xs={6}>
        <KeyValue kalit="Licshet" value={realAbonent.accountNumber} />
        <KeyValue kalit="F. I. Sh" value={realAbonent.fullName} />
        <KeyValue kalit="Mahalla" value={realAbonent.mahallaName} />
        <KeyValue kalit="Yashovchi soni" value={realAbonent.house?.inhabitantCnt} />
        <KeyValue kalit="Jami to'lovlar" value={realAbonent.allPaymentAmount} />
      </Grid>
      <Grid item xs={6}>
        <KeyValue kalit="Licshet" value={fakeAbonent.accountNumber} />
        <KeyValue kalit="F. I. Sh" value={fakeAbonent.fullName} />
        <KeyValue kalit="Mahalla" value={fakeAbonent.mahallaName} />
        <KeyValue kalit="Yashovchi soni" value={fakeAbonent.house?.inhabitantCnt} />
        <KeyValue kalit="Jami to'lovlar" value={fakeAbonent.allPaymentAmount} />
      </Grid>
    </Grid>
  );
}

export default DisplayAbonentDetails;
