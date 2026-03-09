import React from 'react';
import { useParams } from 'react-router-dom';
import AbonentTools from './AbonentTools';
import { useAbonentLogic } from './useAbonentLogic';
import InfoChips from './InfoChips';
import AbonentProfileCard from './AbonentProfileCard';
import ChangePhoneDialog from './modals/ChangePhone';
import { useAbonentStore } from './abonentStore';

let demoChipData = {
  inhabitantCount: 3,
  registeredInhabitants: 5,
  payments: 100000,
  balance: -240100,
  balanceToYearEnd: -405200,
  calculated: 24000,
  tariff: 8000,
  period: '03.2026'
};

function Abonent() {
  const { openChangePhoneDialogState, setOpenChangePhoneDialog } = useAbonentStore();
  return (
    <div>
      <AbonentTools />
      <InfoChips {...demoChipData} />
      <AbonentProfileCard />

      {/* Using modals */}
      <ChangePhoneDialog open={openChangePhoneDialogState} handleClose={() => setOpenChangePhoneDialog(false)} />
    </div>
  );
}

export default Abonent;
