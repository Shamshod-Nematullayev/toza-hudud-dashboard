import React from 'react';
import { useStore } from './useStore';
import { CompactKeyValue } from 'ui-component/CompactKeyValue';
import { t } from 'i18next';

function DisplayAbonentDetails() {
  const { abonentData, abonentData2 } = useStore();
  return (
    <div>
      {abonentData.accountNumber && (
        <CompactKeyValue
          data={[
            { key: t('createAbonentPetitionPage.accountNumber'), value: abonentData.accountNumber },
            { key: t('tableHeaders.fullName'), value: abonentData.fullName },
            { key: t('tableHeaders.mfy'), value: abonentData.mahallaName }
          ]}
          md={4}
        />
      )}
      {abonentData2.accountNumber && (
        <CompactKeyValue
          data={[
            { key: t('createAbonentPetitionPage.dublicateAccountNumber'), value: abonentData2.accountNumber },
            { key: t('tableHeaders.fullName'), value: abonentData2.fullName },
            { key: t('tableHeaders.mfy'), value: abonentData2.mahallaName }
          ]}
          md={4}
        />
      )}
    </div>
  );
}

export default DisplayAbonentDetails;
