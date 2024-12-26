import React, { useContext } from 'react';
import { DeleteDublicatContext } from '.';
import KeyValue from 'ui-component/KeyValue';

function DisplayAbonentDetails() {
  const { realAbonent, fakeAbonent } = useContext(DeleteDublicatContext);
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ margin: '0 50px', minWidth: 400 }}>
        <KeyValue kalit="Licshet" value={realAbonent.accountNumber} />
        <KeyValue kalit="F. I. Sh" value={realAbonent.fullName} />
        <KeyValue kalit="Mahalla" value={realAbonent.mahallaName} />
        <KeyValue kalit="Yashovchi soni" value={realAbonent.house?.inhabitantCnt} />
        <KeyValue kalit="Jami to'lovlar" value={realAbonent.allPaymentAmount} />
      </div>
      <div style={{ minWidth: 400 }}>
        <KeyValue kalit="Licshet" value={fakeAbonent.accountNumber} />
        <KeyValue kalit="F. I. Sh" value={fakeAbonent.fullName} />
        <KeyValue kalit="Mahalla" value={fakeAbonent.mahallaName} />
        <KeyValue kalit="Yashovchi soni" value={fakeAbonent.house?.inhabitantCnt} />
        <KeyValue kalit="Jami to'lovlar" value={fakeAbonent.allPaymentAmount} />
      </div>
    </div>
  );
}

export default DisplayAbonentDetails;
